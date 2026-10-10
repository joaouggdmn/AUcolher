import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { adoptionRequestsSeed } from "../../features/adocao/data/adoptionRequestsSeed";
import { requestAnimalSource, resolveRequestAnimal } from "../../features/adocao/utils/requestAnimal";
import { animalKeys, useMyAnimals } from "../../features/animais/hooks/useAnimais";
import { getAnimal } from "../../features/animais/services/animalService";
import { useSyncAdoptedAnimals } from "../hooks/useSyncAdoptedAnimals";
import { isSameId } from "../utils/ids";
import { ADOPTION_REQUESTS_STORAGE_KEY } from "../utils/storageKeys";
import { useAuth } from "./AuthContext";
import { useAnimals } from "./AnimalContext";

const AdoptionRequestContext = createContext(null);

const NO_ANIMALS = [];

// Fora do componente: com a mesma referência, o useQueries só recombina
// quando algum resultado muda
function collectAnimals(results) {
  return results.map((result) => result.data).filter(Boolean);
}

// Cada pedido CONCLUDED guarda no máximo 1 avaliação por lado, indexada
// pelo papel de quem escreveu: reviews.adopter avalia o doador,
// reviews.owner avalia o adotante
const REVIEW_AUTHOR_ROLES = ["adopter", "owner"];

function loadInitialRequests() {
  try {
    const stored = localStorage.getItem(ADOPTION_REQUESTS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // localStorage corrompido ou indisponível — cai para o seed
  }
  return adoptionRequestsSeed;
}

export function AdoptionRequestProvider({ children }) {
  const [requests, setRequests] = useState(loadInitialRequests);
  const { user } = useAuth();
  const { animals: legacyAnimals, markAnimalAsAdopted } = useAnimals();
  const { data: myApiAnimals = NO_ANIMALS } = useMyAnimals();

  // Pedidos em que a conta logada é a adotante e o animal não é dela: busca
  // o animal na API para ter foto e dados atuais (pedidos antigos nem têm cópia)
  const animalIdsToFetch = useMemo(() => {
    if (!user) return [];
    const mine = new Set(myApiAnimals.map((animal) => String(animal.id)));
    const ids = requests
      .filter((request) => isSameId(request.adopter?.userId ?? request.adopterId, user.id))
      .filter((request) => request.animal?.source !== "legacy" && !mine.has(String(request.animalId)))
      .map((request) => String(request.animalId));
    return [...new Set(ids)];
  }, [user, requests, myApiAnimals]);

  const fetchedAnimals = useQueries({
    queries: animalIdsToFetch.map((id) => ({
      queryKey: animalKeys.detail(id),
      queryFn: () => getAnimal(id),
    })),
    combine: collectAnimals,
  });

  // O que as telas recebem: cada pedido com o animal certo em `animal` e a
  // origem dele em `animalSource`. O que vai para o localStorage continua
  // sendo só o pedido como foi gravado
  const resolvedRequests = useMemo(() => {
    const apiById = new Map([...fetchedAnimals, ...myApiAnimals].map((animal) => [String(animal.id), animal]));
    const legacyById = new Map(legacyAnimals.map((animal) => [String(animal.id), animal]));

    return requests.map((request) => {
      const apiAnimal = apiById.get(String(request.animalId));
      return {
        ...request,
        animalSource: requestAnimalSource(request, apiAnimal),
        animal: resolveRequestAnimal(request, { apiAnimal, legacyAnimal: legacyById.get(String(request.animalId)) }),
      };
    });
  }, [requests, fetchedAnimals, myApiAnimals, legacyAnimals]);

  useSyncAdoptedAnimals({ userId: user?.id, requests: resolvedRequests, myAnimals: myApiAnimals });

  // Persiste toda alteração — o localStorage funciona como um "banco de
  // dados" mockado, compartilhado entre abas do mesmo navegador
  useEffect(() => {
    localStorage.setItem(
      ADOPTION_REQUESTS_STORAGE_KEY,
      JSON.stringify(requests),
    );
  }, [requests]);

  // Sincroniza em tempo real quando OUTRA aba grava uma mudança — sem
  // isso, a aba do doador só veria o pedido novo após um F5 manual
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key !== ADOPTION_REQUESTS_STORAGE_KEY || !event.newValue)
        return;
      try {
        setRequests(JSON.parse(event.newValue));
      } catch {
        // ignora payload inválido
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // `animal` é a cópia de buildAnimalSnapshot (features/adocao/utils/requestAnimal)
  function createRequest({ animalId, ownerId, adopter, animal }) {
    const newRequest = {
      id: Date.now(),
      animalId,
      ownerId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      adopter,
      animal,
    };
    setRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  }

  function acceptRequest(requestId) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId ? { ...request, status: "ACCEPTED" } : request,
      ),
    );
  }

  function rejectRequest(requestId) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId ? { ...request, status: "REJECTED" } : request,
      ),
    );
  }

  // Passo 1 do handshake de conclusão: o doador confirma que quer entregar
  // o pet a este adotante. Trava o chat para novas mensagens, mas ainda
  // NÃO finaliza o pedido nem inativa o animal — isso só acontece quando o
  // adotante confirmar o recebimento (concludeRequest)
  function requestDeliveryConfirmation(requestId) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId && request.status === "ACCEPTED"
          ? { ...request, status: "AWAITING_DELIVERY" }
          : request,
      ),
    );
  }

  // Passo 2 do handshake: o adotante confirma o recebimento. Concluir,
  // cancelar os pedidos concorrentes e tirar o animal das buscas públicas
  // acontecem sempre juntos aqui, para nenhum chamador esquecer um deles.
  // Retorna false se o pedido não estava em AWAITING_DELIVERY
  function concludeRequest(requestId) {
    const target = requests.find((r) => r.id === requestId);
    if (!target || target.status !== "AWAITING_DELIVERY") return false;

    setRequests((prev) =>
      prev.map((request) => {
        if (request.id === requestId) {
          // concludedAt data a linha do tempo de "Meu impacto" em Minha conta
          return { ...request, status: "CONCLUDED", concludedAt: new Date().toISOString() };
        }
        // Exclusão mútua: qualquer OUTRO pedido para o MESMO animal que
        // ainda não tinha sido recusado vira CANCELLED — o animal não
        // está mais disponível, então esse pedido nunca mais avança.
        // O dono também precisa bater: ids da API e do AnimalContext se repetem
        if (
          request.animalId === target.animalId &&
          isSameId(request.ownerId, target.ownerId) &&
          request.status !== "REJECTED"
        ) {
          return { ...request, status: "CANCELLED" };
        }
        return request;
      }),
    );
    // Animal da API vira ADOPTED quando o dono entrar (useSyncAdoptedAnimals);
    // aqui só o do AnimalContext, que é o que o AUmatch mostra
    const resolved = resolvedRequests.find((request) => request.id === requestId);
    if (resolved?.animalSource === "legacy") markAnimalAsAdopted(target.animalId);
    return true;
  }

  function saveReview(requestId, authorRole, { rating, comment, author }) {
    if (!REVIEW_AUTHOR_ROLES.includes(authorRole)) return;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;

    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((request) => {
        if (request.id !== requestId || request.status !== "CONCLUDED") {
          return request;
        }
        const previous = request.reviews?.[authorRole];
        return {
          ...request,
          reviews: {
            ...request.reviews,
            [authorRole]: {
              rating,
              comment: comment?.trim() ?? "",
              authorId: author.id,
              authorName: author.name,
              authorPhotoUrl: author.photoUrl ?? null,
              authorIsOng: author.isOng,
              createdAt: previous?.createdAt ?? now,
              updatedAt: previous ? now : null,
            },
          },
        };
      }),
    );
  }

  function deleteReview(requestId, authorRole) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId && request.reviews?.[authorRole]
          ? { ...request, reviews: { ...request.reviews, [authorRole]: null } }
          : request,
      ),
    );
  }

  return (
    <AdoptionRequestContext.Provider
      value={{
        requests: resolvedRequests,
        createRequest,
        acceptRequest,
        rejectRequest,
        requestDeliveryConfirmation,
        concludeRequest,
        saveReview,
        deleteReview,
      }}
    >
      {children}
    </AdoptionRequestContext.Provider>
  );
}

export function useAdoptionRequests() {
  const context = useContext(AdoptionRequestContext);
  if (!context)
    throw new Error(
      "useAdoptionRequests deve ser usado dentro de um AdoptionRequestProvider",
    );
  return context;
}

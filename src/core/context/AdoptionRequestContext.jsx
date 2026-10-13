import { createContext, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as adocaoService from "../../features/adocao/services/adocaoService";
import { animalKeys } from "../../features/animais/hooks/useAnimais";
import { useModeration } from "../../features/admin/hooks/useModeration";
import { queryKeys } from "../services/queryKeys";
import { useAuth } from "./AuthContext";

const AdoptionRequestContext = createContext(null);

const NO_REQUESTS = [];

// Sem notificações, o dono só vê um pedido novo quando a lista recarrega:
// as duas se atualizam sozinhas de tempos em tempos (e ao voltar para a aba)
const REFRESH_INTERVAL = 30_000;

// Os pedidos da conta logada, vindos da API (docs/api-adocao.md): os que ela
// enviou e os que recebeu pelos animais dela, numa lista só — cada tela
// filtra pelo lado que interessa (adopter.userId ou ownerId). A API valida
// cada ação; aqui as funções só chamam a API e atualizam as listas
export function AdoptionRequestProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { isAccountBanned } = useModeration();

  // Admin não pede nem recebe pedidos
  const takesPart = isAuthenticated && (user?.userType === "PESSOA" || user?.userType === "ONG");

  const { data: sent = NO_REQUESTS } = useQuery({
    queryKey: queryKeys.adocao.sent(user?.id),
    queryFn: adocaoService.listSentRequests,
    enabled: takesPart,
    refetchInterval: REFRESH_INTERVAL,
  });

  const { data: received = NO_REQUESTS } = useQuery({
    queryKey: queryKeys.adocao.received(user?.id),
    queryFn: adocaoService.listReceivedRequests,
    enabled: takesPart,
    refetchInterval: REFRESH_INTERVAL,
  });

  // 🔴 A camada de moderação do mock entra aqui, e não na busca: banir ou
  // remover um anúncio (nesta aba ou em outra) atualiza as telas na hora
  const requests = useMemo(() => {
    if (!takesPart) return NO_REQUESTS;
    const byId = new Map([...received, ...sent].map((request) => [request.id, request]));
    return [...byId.values()].map((request) => adocaoService.withModeration(request, isAccountBanned));
  }, [takesPart, sent, received, isAccountBanned]);

  // Troca o pedido nas duas listas pelo que a API devolveu (a tela muda na
  // hora) e manda buscar de novo — uma conclusão também cancela outros pedidos
  function applyResult(updated) {
    for (const key of [queryKeys.adocao.sent(user?.id), queryKeys.adocao.received(user?.id)]) {
      queryClient.setQueryData(key, (list) => list?.map((request) => (request.id === updated.id ? updated : request)));
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.adocao.all });
  }

  // Rejeita com o erro da API (ex.: "Você já enviou um pedido para este animal")
  async function createRequest(animalId) {
    const created = await adocaoService.createAdoptionRequest(animalId);
    queryClient.setQueryData(queryKeys.adocao.sent(user?.id), (list) => [created, ...(list ?? [])]);
    queryClient.invalidateQueries({ queryKey: queryKeys.adocao.all });
    // O deck do AUmatch e a home deixam de mostrar o animal pedido
    queryClient.invalidateQueries({ queryKey: animalKeys.all });
    return created;
  }

  async function changeStatus(requestId, status) {
    const updated = await adocaoService.changeRequestStatus(requestId, status);
    applyResult(updated);
    // Concluir adota o animal; cancelar pode devolvê-lo ao deck de quem desistiu
    if (status === "CONCLUDED" || status === "CANCELLED") {
      queryClient.invalidateQueries({ queryKey: animalKeys.all });
    }
    return updated;
  }

  // Avaliação do lado de quem está logado (a API sabe qual é pelo pedido)
  async function saveReview(requestId, { rating, comment }) {
    const updated = await adocaoService.saveRequestReview(requestId, { rating, comment });
    applyResult(updated);
    return updated;
  }

  async function deleteReview(requestId) {
    await adocaoService.deleteRequestReview(requestId);
    queryClient.invalidateQueries({ queryKey: queryKeys.adocao.all });
  }

  return (
    <AdoptionRequestContext.Provider
      value={{
        requests,
        createRequest,
        // Dono
        acceptRequest: (requestId) => changeStatus(requestId, "ACCEPTED"),
        rejectRequest: (requestId) => changeStatus(requestId, "REJECTED"),
        requestDeliveryConfirmation: (requestId) => changeStatus(requestId, "AWAITING_DELIVERY"),
        // Adotante
        concludeRequest: (requestId) => changeStatus(requestId, "CONCLUDED"),
        // As duas partes: quem desistiu vai no motivo (a API decide pelo papel)
        cancelRequest: (requestId) => changeStatus(requestId, "CANCELLED"),
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

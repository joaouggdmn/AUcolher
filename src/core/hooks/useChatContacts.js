import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAnimals } from "../context/AnimalContext";
import { useAdoptionRequests } from "../context/AdoptionRequestContext";

export function useChatContacts() {
  const { user } = useAuth();
  const { animals } = useAnimals();
  const { requests } = useAdoptionRequests();

  const contacts = useMemo(() => {
    if (!user) return [];

    return (
      requests
        // 🆕 AWAITING_DELIVERY e CONCLUDED também aparecem — a conversa (e
        // as mensagens de sistema do handshake) continua visível depois da
        // confirmação do doador, só travada para novas mensagens
        .filter(
          (request) =>
            request.status === "ACCEPTED" ||
            request.status === "AWAITING_DELIVERY" ||
            request.status === "CONCLUDED",
        )
        .map((request) => {
          const animal = animals.find((a) => a.id === request.animalId);
          const isOwner = request.ownerId === user.id;
          const isAdopter =
            request.adopterId === user.id ||
            request.adopter?.userId === user.id;

          if (!isOwner && !isAdopter) return null;

          const base = {
            id: `request-${request.id}`,
            requestId: request.id,
            animalId: request.animalId, // 🆕 necessário para concludeAdoption
            animalName: animal?.name ?? "Animal",
            status: request.status, // 🆕 controla o estado travado do header
            isOwnerView: isOwner, // 🆕 só o doador vê o botão "Confirmar Entrega"
            reviews: request.reviews ?? {},
          };

          if (isOwner) {
            return {
              ...base,
              name: request.adopter.name,
              photoUrl: request.adopter.photoUrl,
            };
          }

          return {
            ...base,
            name: animal?.ownerName ?? animal?.organizationName ?? "Doador(a)",
            photoUrl: animal?.ownerPhotoUrl ?? null,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.requestId - a.requestId)
    );
  }, [user, animals, requests]);

  return { contacts };
}

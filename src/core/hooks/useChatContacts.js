import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAdoptionRequests } from "../context/AdoptionRequestContext";
import { isSameId } from "../utils/ids";
import { animalDisplayName } from "../../features/adocao/utils/requestAnimal";

// Conversa que já existia (pedido aceito ou aguardando entrega) e foi
// cancelada — por uma das partes, pela adoção de outro pedido, pelo anúncio
// fora do ar ou pela moderação: continua visível, travada, com o motivo
function isClosedConversation(request) {
  return (
    request.status === "CANCELLED" &&
    ["ACCEPTED", "AWAITING_DELIVERY"].includes(request.cancelledFromStatus)
  );
}

export function useChatContacts() {
  const { user } = useAuth();
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
            request.status === "CONCLUDED" ||
            isClosedConversation(request),
        )
        .map((request) => {
          const { animal } = request;
          const isOwner = isSameId(request.ownerId, user.id);
          const isAdopter = isSameId(request.adopter?.userId, user.id);

          if (!isOwner && !isAdopter) return null;

          const base = {
            id: `request-${request.id}`,
            requestId: request.id,
            animalId: request.animalId, // 🆕 necessário para concludeAdoption
            animalName: animalDisplayName(animal),
            status: request.status, // 🆕 controla o estado travado do header
            cancelReason: request.cancelReason ?? null,
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
            name: animal.ownerName || animal.organizationName || "Doador(a)",
            photoUrl: animal.ownerPhotoUrl ?? null,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.requestId - a.requestId)
    );
  }, [user, requests]);

  return { contacts };
}

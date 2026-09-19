import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAnimals } from "../context/AnimalContext";
import { useAdoptionRequests } from "../context/AdoptionRequestContext";

export function useReceivedRequests() {
  const { user } = useAuth();
  const { animals } = useAnimals();
  const { requests, acceptRequest, rejectRequest } = useAdoptionRequests();

  const receivedRequests = useMemo(() => {
    if (!user) return [];

    return requests
      .filter((request) => request.ownerId === user.id)
      .map((request) => ({
        ...request,
        animal: animals.find((animal) => animal.id === request.animalId) ?? {
          id: request.animalId,
          name: "Animal",
          photoUrl: null,
        },
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [user, animals, requests]);

  const pendingRequests = receivedRequests.filter(
    (r) => r.status === "PENDING",
  );

  // 🆕 "Em andamento": aceito (chat liberado), aguardando o adotante
  // confirmar a entrega, ou já concluído (mostrado com destaque/
  // celebração, não mais como "ação pendente")
  const inProgressRequests = receivedRequests.filter(
    (r) =>
      r.status === "ACCEPTED" ||
      r.status === "AWAITING_DELIVERY" ||
      r.status === "CONCLUDED",
  );

  // 🆕 Histórico: estados finais que não avançaram
  const historyRequests = receivedRequests.filter(
    (r) => r.status === "REJECTED" || r.status === "CANCELLED",
  );

  return {
    receivedRequests,
    pendingRequests,
    inProgressRequests,
    historyRequests,
    pendingCount: pendingRequests.length,
    acceptRequest,
    rejectRequest,
  };
}

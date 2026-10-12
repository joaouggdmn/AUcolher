import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAdoptionRequests } from "../context/AdoptionRequestContext";
import { isSameId } from "../utils/ids";

export function useReceivedRequests() {
  const { user } = useAuth();
  const { requests, acceptRequest, rejectRequest } = useAdoptionRequests();

  const receivedRequests = useMemo(() => {
    if (!user) return [];

    // `animal` já vem resolvido pelo AdoptionRequestProvider
    return requests
      .filter((request) => isSameId(request.ownerId, user.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [user, requests]);

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

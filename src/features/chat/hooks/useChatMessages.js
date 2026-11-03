import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../core/context/AuthContext";
import { queryKeys } from "../../../core/services/queryKeys";
import { CHAT_POLL_MS } from "../../../core/utils/constants";
import * as chatService from "../services/chatService";

const NO_MESSAGES = [];

// Junta as mensagens novas sem repetir e na ordem dos ids: o envio põe a
// mensagem no cache na hora, e um polling que já estava a caminho pode
// trazer a mesma de novo
function appendNew(current, incoming) {
  const known = new Set(current.map((message) => message.id));
  const fresh = incoming.filter((message) => !known.has(message.id));
  return fresh.length ? [...current, ...fresh].sort((a, b) => a.id - b.id) : current;
}

// Conversa aberta (api-chat.md §3.1): o histórico uma vez e, depois, só as
// mensagens com id maior que a última, a cada 3 s, enquanto a aba está visível
export function useChatMessages(requestId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.chat.messages(requestId);

  // Sem esperar os 30 s da lista: o campo de texto e os botões da conversa
  // dependem do status do pedido
  const refreshRequests = () => queryClient.invalidateQueries({ queryKey: queryKeys.adocao.all });

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const cached = queryClient.getQueryData(queryKey);
      const incoming = await chatService.listMessages(requestId, cached?.at(-1)?.id);
      // Aviso novo (fora do histórico da primeira carga) = o status do pedido mudou
      if (cached && incoming.some((message) => message.senderId === "system")) refreshRequests();
      // Lê o cache de novo: um envio pode ter terminado durante esta busca
      return appendNew(queryClient.getQueryData(queryKey) ?? NO_MESSAGES, incoming);
    },
    enabled: requestId != null && user != null,
    refetchInterval: CHAT_POLL_MS,
  });

  const { mutateAsync, isPending: isSending } = useMutation({
    mutationFn: (text) => chatService.sendMessage(requestId, text),
    onSuccess: (message) => {
      queryClient.setQueryData(queryKey, (current = NO_MESSAGES) => appendNew(current, [message]));
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.summary(user?.id) });
    },
    // A recusa pode ser um cancelamento em lote, que não deixa aviso na conversa
    onError: refreshRequests,
  });

  return {
    messages: query.data ?? NO_MESSAGES,
    isLoading: query.isLoading,
    // Falhou antes de ter qualquer mensagem
    loadFailed: query.isError && query.data === undefined,
    // Rejeita com o erro da API: quem chama mostra a `message`
    sendMessage: mutateAsync,
    isSending,
  };
}

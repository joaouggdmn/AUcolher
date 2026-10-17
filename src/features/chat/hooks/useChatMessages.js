import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../core/context/AuthContext";
import { queryKeys } from "../../../core/services/queryKeys";
import { CHAT_POLL_MS } from "../../../core/utils/constants";
import * as chatService from "../services/chatService";

const NO_MESSAGES = [];

// Junta as mensagens novas ao fim da lista sem repetir: o envio põe a
// mensagem no cache na hora, e um polling que já estava a caminho pode
// trazer a mesma de novo
function appendNew(current, incoming) {
  const known = new Set(current.map((message) => message.id));
  const fresh = incoming.filter((message) => !known.has(message.id));
  return fresh.length ? [...current, ...fresh] : current;
}

// Conversa aberta (api-chat.md §3.1): o histórico uma vez e, depois, só as
// mensagens com id maior que a última, a cada 3 s, enquanto a aba está
// visível. O mesmo código serve para o mock e para a API
export function useChatMessages(requestId) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.chat.messages(requestId);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const cached = queryClient.getQueryData(queryKey);
      const lastId = cached?.at(-1)?.id;
      if (lastId == null) return chatService.listMessages(requestId);
      return appendNew(cached, await chatService.listMessages(requestId, lastId));
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
  });

  return {
    messages: query.data ?? NO_MESSAGES,
    isLoading: query.isLoading,
    // Falhou antes de ter qualquer mensagem (ex.: a rota ainda não existe)
    loadFailed: query.isError && query.data === undefined,
    // Rejeita com o erro da API: quem chama mostra a `message`
    sendMessage: mutateAsync,
    isSending,
  };
}

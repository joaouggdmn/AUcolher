import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../core/context/AuthContext";
import { chatMessagesStorageKey } from "../../../core/utils/storageKeys";
import { CHAT_SYSTEM_MESSAGE_EVENT } from "../../../core/utils/chatSystemMessage";

function loadMessages(requestId) {
  if (!requestId) return [];
  try {
    const stored = localStorage.getItem(chatMessagesStorageKey(requestId));
    if (stored) return JSON.parse(stored);
  } catch {
    // payload corrompido — cai para conversa vazia
  }
  return [];
}

export function useChatMessages(requestId) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => loadMessages(requestId));

  // Sincroniza quando uma mensagem de sistema é injetada NA MESMA aba (ex:
  // o doador confirma a adoção estando já dentro desta conversa) — o
  // evento nativo 'storage' só dispara em OUTRAS abas, então esse evento
  // customizado cobre o caso "mesma aba, hook já montado"
  useEffect(() => {
    if (!requestId) return;

    function handleSystemMessage(event) {
      if (event.detail?.requestId !== requestId) return;
      setMessages(loadMessages(requestId));
    }

    window.addEventListener(CHAT_SYSTEM_MESSAGE_EVENT, handleSystemMessage);
    return () =>
      window.removeEventListener(
        CHAT_SYSTEM_MESSAGE_EVENT,
        handleSystemMessage,
      );
  }, [requestId]);  
  // Recarrega do zero sempre que o usuário troca de conversa selecionada
  useEffect(() => {
    setMessages(loadMessages(requestId));
  }, [requestId]);

  // Persiste toda alteração — cada match vira uma "tabela" isolada no localStorage
  useEffect(() => {
    if (!requestId) return;
    localStorage.setItem(
      chatMessagesStorageKey(requestId),
      JSON.stringify(messages),
    );
  }, [requestId, messages]);

  // Sincroniza em tempo real quando a OUTRA aba envia uma mensagem nesta MESMA conversa
  useEffect(() => {
    if (!requestId) return;

    function handleStorageChange(event) {
      if (event.key !== chatMessagesStorageKey(requestId) || !event.newValue)
        return;
      try {
        setMessages(JSON.parse(event.newValue));
      } catch {
        // ignora payload inválido
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [requestId]);

  const sendMessage = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed || !requestId || !user) return;

      const newMessage = {
        id: Date.now(),
        senderId: user.id,
        text: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
    },
    [requestId, user],
  );

  return { messages, sendMessage };
}

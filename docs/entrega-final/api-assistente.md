# AUcolher — Contrato da API: assistente de suporte (IA)

> Regra de negócio §15 de `regras-de-negocios.md`. **Sem migração**: a conversa não é gravada no banco.
> - ✅ **Implementado** em 24/11/2026. Back: pacote `support/` (`POST /api/support/chat`). Front: `features/assistente/` (balão `SupportWidget`, montado na raiz do router).
> - O modelo é o **Google Gemini**, chamado só pelo backend. A chave fica no `.env` do back e nunca vai para o navegador.

## 1. Regras de negócio

**O que é**
- Um balão no canto inferior direito do site. Ele responde dúvidas sobre o uso do AUcolher: como adotar, o AUmatch, os pedidos, eventos, campanhas e doações, cadastro de ONG, conta, senha e denúncias.
- **Só responde.** Não lê nem altera nada no banco: não cria pedido, não faz doação, não troca senha. Ele explica onde a pessoa faz cada coisa.
- Assuntos fora do AUcolher recebem uma recusa educada. O que ele sabe está na instrução de sistema do back (`src/main/resources/support/assistente-prompt.md`), um resumo deste documento de regras.

**Quem usa**
- Todo mundo, **visitante inclusive**: as dúvidas de quem ainda não tem conta (como adotar, como cadastrar a ONG) são as mais comuns.
- O balão some no chat (`/chat` e `/ong/painel/conversas`), no AUmatch (`/aumatch`), no painel do admin (`/admin`) e na volta do login com o Google. Nas telas de perfil, ele sobe para não cobrir a barra "alterações não salvas".

**Conversa**
- Fica só no navegador (`sessionStorage`, chave `aucolher_assistant_conversation`). Continua ao trocar de tela e some ao fechar a aba ou ao clicar em "Limpar a conversa".
- A cada pergunta, o front manda as falas anteriores junto, porque a API não guarda nada. A API usa só as **últimas 20 falas** (10 perguntas e respostas).

**Privacidade**
- O painel avisa: "Respostas automáticas geradas por IA (Gemini), que podem conter erros. Não envie dados pessoais."
- A API não manda ao Gemini nenhum dado da conta (nome, e-mail, id): só a instrução de sistema e a conversa.
- No plano gratuito da Gemini API, o Google pode usar as perguntas e respostas para melhorar os produtos (termos da Gemini API). Com faturamento ativo, não usa.

**Limite**
- **10 mensagens por minuto e 60 por dia**, por conta logada ou, para visitante, por IP. Protege a cota do Gemini.
- O limite fica em memória (reinicia junto com a API).

## 2. DTOs

```jsonc
// SupportChatRequestDTO
{
  "message": "Como adotar um animal?",          // 1 a 500 caracteres
  "history": [                                  // opcional; falas anteriores, da mais antiga à mais nova
    { "role": "user",  "text": "Oi" },          // "user" = a pessoa
    { "role": "model", "text": "Olá! Como posso ajudar?" }  // "model" = o assistente
  ]
}

// SupportReplyDTO
{ "reply": "Para adotar, ..." }
```

- Falas com outro `role`, ou sem texto, são ignoradas. Cada fala do histórico é cortada em 2000 caracteres.
- A conversa enviada ao Gemini sempre começa por uma fala da pessoa: respostas soltas no início saem.

## 3. Endpoint

| Método e rota | Quem | Resposta |
|---|---|---|
| `POST /api/support/chat` | Público (com ou sem token) | 200 `SupportReplyDTO` |

**Erros** (formato `{ status, error, message }`; o front mostra a `message`):

| Status | `message` | Quando |
|---|---|---|
| 400 | "Escreva uma pergunta." | `message` vazio ou só espaços |
| 400 | "A pergunta pode ter até 500 caracteres." | Mais de 500 caracteres |
| 429 | "Você enviou muitas mensagens em pouco tempo. Aguarde um pouco e tente de novo." | Passou do limite |
| 503 | "O assistente está indisponível no momento. Tente de novo mais tarde." | Sem `GEMINI_API_KEY`, ou o Gemini fora do ar, sem cota ou sem resposta mesmo depois das novas tentativas (§4) |

Se o Gemini responder sem texto (resposta bloqueada ou cortada), a API devolve 200 com "Não consegui responder agora. Pode reformular a pergunta?".

## 4. Notas do backend

- **Chamada:** `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`, com a chave no cabeçalho `x-goog-api-key` (nunca na URL), `systemInstruction`, `contents` e `generationConfig` (`maxOutputTokens` e `thinkingConfig.thinkingLevel`).
- **Variáveis:**

| Variável | Para quê | Padrão |
|---|---|---|
| `GEMINI_API_KEY` | Chave do Google AI Studio | — (sem ela, 503) |
| `GEMINI_MODEL` | Modelo (o leve responde em 1 a 2 s) | `gemini-3.5-flash-lite` |
| `GEMINI_FALLBACK_MODEL` | Modelo reserva, quando o principal está sobrecarregado ou não responde a tempo; vazio = sem reserva | `gemini-3.6-flash` |
| `GEMINI_THINKING_LEVEL` | Raciocínio do modelo; os tokens dele contam como saída e deixam a resposta lenta | `MINIMAL` |
| `GEMINI_MAX_OUTPUT_TOKENS` | Limite da resposta, raciocínio incluído | `1024` |

- **Novas tentativas:** quando o Google responde 503 ("high demand", sobrecarga passageira), 429 ou não responde em 20 s, a API tenta de novo o modelo principal e, se ainda falhar, o reserva. Sem resposta a tempo, ela vai direto para o reserva. Erro de configuração (400, 401, 403, 404) não é repetido.
- **Por que o modelo leve:** em 23/11/2026, o `gemini-3.6-flash` levou de 16 s a mais de 60 s por resposta, e o `gemini-3.5-flash-lite`, de 1 a 3 s.
- **Logs:** só o código HTTP e o modelo quando o Gemini falha. Nunca a chave nem o texto das mensagens.
- **Testes:** `GeminiClientTest` (servidor falso no lugar do Google), `SupportChatServiceTest`, `SupportRateLimiterTest` e `SupportChatControllerTest`.

## 5. O que muda no front

- `features/assistente/services/assistenteService.js`: `sendSupportMessage({ message, history })`.
- `features/assistente/hooks/useAssistente.js`: a conversa no `sessionStorage`, o envio pelo React Query e a mensagem de erro. Se a pergunta falhar, ela sai da conversa e volta para o campo.
- `features/assistente/components/SupportWidget.jsx`: o botão, o painel (tela cheia no celular), as perguntas sugeridas e o "digitando". `AssistantText.jsx` transforma `**negrito**` e listas em elementos do React, sem HTML.

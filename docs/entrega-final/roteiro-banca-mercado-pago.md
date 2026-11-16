# Roteiro da banca: doações por PIX (Mercado Pago)

> Para usar no dia da apresentação (26/11/2026). O fluxo foi testado com PIX real em 15 e 16/11 (doações 12, 13 e 15, de R$ 5). Detalhes técnicos: `api-mercado-pago-ongs.md` §5.1 a §5.3.

## 1. Antes (uns 30 minutos antes)

- [ ] **Internet** testada no lugar da apresentação (Wi-Fi ou roteador do celular).
- [ ] **API no ar:** `.\run-aiven.ps1` no back. **Só uma API** apontando para o Aiven, porque o plano gratuito tem poucas conexões.
- [ ] **Front no ar:** `npm run dev`.
- [ ] **Túnel no ar:** `ngrok http --domain=utopia-radial-purple.ngrok-free.dev 8080`. Ele é necessário para conectar uma ONG e para o webhook. Sem o túnel, a doação ainda confirma pela janela do PIX e pela consulta de 1 em 1 minuto.
- [ ] **`.env.aiven`** com `MP_SANDBOX=false` e `MP_TEST_TOKEN=false`.
- [ ] **ONG conectada:** a Apacri, em Painel → Campanhas, mostra o cartão verde "Conta do Mercado Pago conectada" e tem pelo menos uma campanha ativa.
- [ ] **ONG sem conta,** por exemplo a SOS Vira-lata, para mostrar o bloqueio.
- [ ] **Doador:** uma conta de pessoa logada em outra janela, com e-mail **diferente** do da conta do Mercado Pago que recebe.
- [ ] **App do banco** aberto, com saldo para R$ 5.
- [ ] **Não** clicar em **Salvar** na Configuração de webhooks do Mercado Pago, porque isso pode trocar o segredo.
- [ ] **Vídeo de reserva** gravado e aberto no computador.

## 2. Na hora (5 a 7 minutos)

1. **A ideia, em 30 segundos.** Cada ONG conecta a própria conta do Mercado Pago, e o PIX de cada doação cai direto nela. O AUcolher não guarda o dinheiro e não cobra comissão.
2. **ONG sem conta (SOS Vira-lata).** O painel de Campanhas mostra o cartão "Conecte sua conta do Mercado Pago para receber doações", com o aviso da chave Pix. Em "Criar campanha", o cartão aparece no lugar do formulário.
3. **ONG conectada (Apacri).** O cartão verde mostra "Conta do Mercado Pago conectada".
4. **Doação ao vivo.** Com a pessoa, abra uma campanha da Apacri, clique em "Fazer doação", escolha R$ 5 e mostre o QR e o "copia e cola". Pague pelo app do banco. A janela muda sozinha para "confirmada" e a barra da campanha sobe.
5. **Os dois lados.** Mostre "Meu impacto", na conta da pessoa, e "Doações recebidas", no painel da ONG.
6. **Opcional, se der tempo.** Repita fechando a janela **antes** de pagar. Depois de pagar, recarregue a campanha: a doação aparece aprovada, pelo aviso do Mercado Pago (webhook) ou, no máximo em 1 minuto, pela consulta periódica.

## 3. Perguntas prováveis

| Pergunta | Resposta curta |
|---|---|
| E se o doador fechar a página antes de pagar? | O Mercado Pago avisa a API (webhook). De reserva, a API consulta os PIX pendentes a cada minuto. A doação é aprovada do mesmo jeito |
| O AUcolher fica com o dinheiro? | Não. O PIX é criado em nome da ONG, com o token da conta dela, e o dinheiro cai lá. Sem comissão: só a tarifa do Mercado Pago, na conta da ONG |
| Alguém pode fingir um pagamento? | Não. Toda aprovação consulta a order no próprio Mercado Pago. O webhook ainda tem assinatura (HMAC) validada; aviso falso é recusado com 401 |
| Onde ficam as credenciais da ONG? | No banco, criptografadas (AES-256-GCM), e nunca vão para o navegador. O token é renovado sozinho, e a conexão usa OAuth com um `state` assinado |
| Por que não usaram sandbox? | Para PIX nesse fluxo, até a credencial de teste do Mercado Pago gera cobrança real. Testamos com PIX real de R$ 5 |
| E se a ONG desconectar ou o acesso cair? | As campanhas mostram "Doações indisponíveis no momento" e o painel pede para reconectar. Os PIX já gerados continuam valendo |
| Pagamento pode contar duas vezes? | Não. A aprovação é atômica (um `UPDATE` só muda doação pendente), e o total é somado a partir das doações aprovadas |
| Por que a conta precisa de chave Pix? | É exigência do Mercado Pago para gerar o QR |

## 4. Se algo der errado

| Problema | O que fazer |
|---|---|
| Sem internet ou Mercado Pago fora do ar | Passar o vídeo de reserva e mostrar as doações já aprovadas ("Meu impacto", "Doações recebidas") e o crédito no extrato |
| A janela não confirma depois do pagamento | Esperar até 1 minuto e recarregar (consulta periódica). Conferir se a API está no ar |
| "Esta ONG não está recebendo doações no momento." | No painel da ONG, se o cartão estiver âmbar, clicar em **Reconectar** |
| "Não foi possível gerar o PIX agora." | Ver no log da API a linha `Mercado Pago POST /v1/orders respondeu ...`. As causas conhecidas estão no README do back (seção Mercado Pago) |
| Erro de conexão com o banco ("connection slots") | Deixar só uma API ligada e reiniciá-la |

# AUcolher — Contrato da API: perfil da ONG (banner) e o telefone que saiu

> **✅ Implementado em 15/10/2026** (back e front, branches `feature/banner-ong`; migração 008 aplicada no `aucolher_db`).
> Diferenças da implementação: o banner conta na completude do perfil da ONG; o limite de 600.000 virou a constante `PhotoUrl.COVER_MAX_LENGTH` (usada também pela capa do evento); o ícone de WhatsApp da própria AUcolher saiu do rodapé.
>
> Versão 1 (13/10/2026). Duas mudanças pequenas no perfil (`users`):
> - §1: o **telefone/WhatsApp** saiu do sistema e não deve voltar;
> - §2: um **banner** no perfil público, **só para ONG**.

## 1. Telefone/WhatsApp: removido de propósito

- **Situação hoje:**
  - não existe coluna de telefone no banco: nem no `sql/schema.sql` do nosso backend, nem no do seu repositório;
  - não existe campo de telefone nos DTOs da API;
  - não existe campo de telefone nas telas do front ("Minha conta" e cadastro).
- A coluna `telefone_whatsapp` existia só no banco antigo (`adocao_db`, com tabelas em português) e no dump `bd_adocao.sql`, que foi apagado do repositório em 29/09 (commit "Reorganize backend by feature and rename to AUcolher").
- **Por que saiu:** o contato entre adotante e dono acontece pelo **chat do pedido aceito** (`api-chat.md`), dentro da plataforma. O contato público da ONG é o **e-mail institucional** + as **redes sociais** (Instagram, Facebook, X), que já existem.
- **O que fazer:**
  - não criar coluna, campo de DTO ou validação de telefone;
  - se algum banco de teste ainda veio do `adocao_db` antigo, a migração da §2.5 apaga a coluna por segurança (`DROP COLUMN IF EXISTS`). Num banco novo, ela não faz nada.

## 2. Banner da ONG

### 2.1 Regras

- **Só ONG** (`userType = NGO`) tem banner. É um diferencial do perfil institucional, ao lado de equipe, horário de visitas e redes sociais.
- É **opcional**. Sem banner, o front mostra o fundo padrão do cabeçalho.
- Aparece no topo do **perfil público** da ONG e no card da ONG na **home** (vitrine de ONGs).
- Fica guardado **como a foto de perfil hoje**: URL http(s) ou data URL da imagem comprimida no navegador, dentro do JSON. Ainda não existe upload de arquivos (decisão de 13/10: o upload fica para depois).
- Limite: até **600.000 caracteres**, o mesmo da capa do evento (`EventService.MAX_COVER_LENGTH`), porque o banner é maior que o avatar.
- Formatos: `http(s)://...` ou `data:image/(jpeg|png|webp);base64,...`. É o mesmo `PhotoUrl.FORMAT` da foto de perfil.
- **Conteúdo impróprio no banner** é denunciado como o perfil (`targetType: USER`, motivo "Conteúdo impróprio"). O admin bane a conta se for o caso. Não existe ação de "remover só o banner".

### 2.2 Formatos (DTOs)

`coverUrl` entra nos três DTOs do perfil.

**`PUT /api/users/me`** (`ProfileUpdateDTO`): campo novo, opcional.

```json
{
  "name": "Patinhas Carentes",
  "photoUrl": "data:image/jpeg;base64,...",
  "coverUrl": "data:image/jpeg;base64,...",
  "bio": "...",
  "...": "os outros campos de hoje"
}
```

**Respostas**: `UserResponseDTO` (login, cadastro e `PUT /users/me`) e `PublicProfileDTO` (`GET /api/users/{id}/public-profile`) ganham:

```json
{ "coverUrl": "https://... ou data:image/jpeg;base64,... ou null" }
```

- Para pessoa, `coverUrl` vem sempre `null`.

### 2.3 Endpoints

Nenhuma rota nova. Mudam só:

| Método | Rota | O que muda |
|---|---|---|
| PUT | `/api/users/me` | aceita `coverUrl` (ver validação) |
| GET | `/api/users/{id}/public-profile` | devolve `coverUrl` |
| POST | `/api/auth/login`, `/api/auth/register/*` | o `user` da resposta devolve `coverUrl` |

**Validação no `PUT /api/users/me`:**

| Quando | Status | `message` |
|---|---|---|
| conta `PERSON` mandou `coverUrl` não nulo | 400 | "Só ONGs podem ter banner no perfil." |
| formato inválido | 400 | "Envie o banner como imagem JPG, PNG ou WebP." |
| mais de 600.000 caracteres | 400 | "O banner é grande demais." |

- O `PUT` substitui o perfil inteiro, como já acontece com os outros campos. `coverUrl` ausente ou `null` **remove** o banner. Por isso o front sempre manda o valor atual.
- Texto em branco vira `null` (o `Sanitizer` já faz isso nos outros campos).

### 2.4 Notas de implementação (Spring Boot)

1. `User`: campo `coverUrl` (`@Column(name = "cover_url", columnDefinition = "TEXT")`).
2. `ProfileUpdateDTO`: `@Size(max = 600_000, message = "O banner é grande demais.")` e `@Pattern(regexp = PhotoUrl.FORMAT, ...)`. Vale criar uma constante `COVER_MAX_LENGTH` compartilhada com a capa do evento (hoje é `MAX_COVER_LENGTH`, privada no `EventService`).
3. `UserService.updateProfile`:
   - pessoa com `coverUrl` não nulo → `BusinessException("Só ONGs podem ter banner no perfil.")`;
   - ONG → `user.setCoverUrl(dto.coverUrl())` dentro do `updateNgoProfile`.
4. `UserResponseDTO.from(...)` e `PublicProfileDTO`: incluir `coverUrl`.
5. A constraint `chk_users_cover_only_ngo` (§2.5) garante a regra no banco mesmo se algum caminho esquecer a checagem.

### 2.5 SQL (rascunho de migração, PostgreSQL)

Número sugerido: `008_ngo_cover.sql` (ver `plano-backend-restante.md` §4).

```sql
-- ============================================================
-- Migração 008 — banner do perfil da ONG
--
-- 1. users.cover_url: banner do perfil público, só para ONG.
-- 2. Limpeza: apaga a antiga coluna telefone_whatsapp, se o banco
--    ainda veio do adocao_db (num banco novo, não faz nada).
--
--   psql -U postgres -h localhost -d aucolher_db -f sql/migrations/008_ngo_cover.sql
--
-- Roda numa transação só: se algo falhar, nada muda. Rodar de novo
-- não estraga nada.
-- ============================================================

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT;

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_cover_only_ngo;
ALTER TABLE users ADD CONSTRAINT chk_users_cover_only_ngo CHECK (cover_url IS NULL OR user_type = 'NGO');

COMMENT ON COLUMN users.cover_url IS 'Banner do perfil público — só ONG; URL ou data URL comprimida no frontend (até 600.000 caracteres)';

-- O contato acontece pelo chat do pedido e pelas redes da ONG
ALTER TABLE users DROP COLUMN IF EXISTS telefone_whatsapp;

COMMIT;
```

## 3. O que muda no front quando a API existir (lembrete)

- `OngAccountForm`: um campo de banner com o `CoverImageInput` que já existe (o mesmo das capas), com `maxLength` de 600.000.
- `authService.toFrontendUser` e o mapeamento do perfil público: passar `coverUrl` adiante. O `PublicProfileHeader.jsx` já desenha o banner quando ele existe.
- Home (`useOngShowcase` / `OngShowcaseSection`): trocar o `mockPublicProfiles` pelo perfil real da ONG. Assim o banner e o link "Ver perfil" usam o id verdadeiro: hoje o link usa os ids fictícios 1/4/5.

-- ============================================================
-- Remove os animais de teste criados pelo seed-animais-teste.sql
-- (fotos com "aucolher_seed=1" na URL). Fotos e favoritos saem junto
-- (ON DELETE CASCADE). Não desfaz a cidade colocada no usuário 1.
--
--   psql -U postgres -h localhost -d aucolher_db -f docs/remover-animais-teste.sql
-- ============================================================

\set ON_ERROR_STOP on
BEGIN;
DELETE FROM animals WHERE id IN (SELECT animal_id FROM animal_photos WHERE url LIKE '%aucolher_seed=1%');
COMMIT;

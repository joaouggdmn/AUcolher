-- ============================================================
-- Remove os pedidos (e as avaliações) dos animais de teste e
-- devolve esses animais para AVAILABLE. Atenção: apaga também
-- pedidos que você criou na mão para os animais de teste.
--
--   psql -U postgres -h localhost -d aucolher_db -f docs/remover-pedidos-teste.sql
-- ============================================================

\set ON_ERROR_STOP on
BEGIN;
DELETE FROM adoption_requests WHERE animal_id IN (SELECT animal_id FROM animal_photos WHERE url LIKE '%aucolher_seed=1%');
UPDATE animals SET status = 'AVAILABLE', updated_at = NOW()
WHERE status = 'ADOPTED' AND id IN (SELECT animal_id FROM animal_photos WHERE url LIKE '%aucolher_seed=1%');
COMMIT;

-- ============================================================
-- Pedidos de adoção de teste: 11 pedidos entre os usuários do
-- banco, em todos os status, com avaliações nos concluídos.
-- Só usa os animais de teste (seed-animais-teste.sql) — rode
-- aquele antes. Os concluídos deixam o animal como ADOPTED.
--
--   psql -U postgres -h localhost -d aucolher_db -f docs/seed-pedidos-teste.sql
--
-- Para desfazer: remover-pedidos-teste.sql (apaga os pedidos dos
-- animais de teste e devolve esses animais para AVAILABLE).
-- Rodar de novo é recusado (sem duplicar).
-- ============================================================

\set ON_ERROR_STOP on
SET client_encoding TO 'UTF8';
BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM adoption_requests r JOIN animal_photos p ON p.animal_id = r.animal_id
               WHERE p.url LIKE '%aucolher_seed=1%') THEN
        RAISE EXCEPTION 'Já existem pedidos nos animais de teste — rode o remover-pedidos-teste.sql antes';
    END IF;
END $$;

-- joaougg@teste.com pede Bolt (PENDING)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Bolt' AND o.email = 'testerealong@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'PENDING', NULL, NULL,
           NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days', NULL, NULL
    FROM users u WHERE u.email = 'joaougg@teste.com'
    RETURNING id
)
SELECT id FROM novo;

-- testejoao@gmail.com pede Bolt (PENDING)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Bolt' AND o.email = 'testerealong@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'PENDING', NULL, NULL,
           NOW() - INTERVAL '1 days', NOW() - INTERVAL '0 days', NULL, NULL
    FROM users u WHERE u.email = 'testejoao@gmail.com'
    RETURNING id
)
SELECT id FROM novo;

-- teste@t.com pede Neve (ACCEPTED)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Neve' AND o.email = 'testerealong@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'ACCEPTED', NULL, NULL,
           NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL, NULL
    FROM users u WHERE u.email = 'teste@t.com'
    RETURNING id
)
SELECT id FROM novo;

-- joaougg@teste.com pede Paçoca (AWAITING_DELIVERY)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Paçoca' AND o.email = 'ong2@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'AWAITING_DELIVERY', NULL, NULL,
           NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NULL, NULL
    FROM users u WHERE u.email = 'joaougg@teste.com'
    RETURNING id
)
SELECT id FROM novo;

-- testejoao@gmail.com pede Amora (CONCLUDED)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Amora' AND o.email = 'ong2@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'CONCLUDED', NULL, NULL,
           NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NULL
    FROM users u WHERE u.email = 'testejoao@gmail.com'
    RETURNING id
)
INSERT INTO adoption_reviews (request_id, author_role, rating, comment, created_at) VALUES ((SELECT id FROM novo), 'ADOPTER', 5, 'A equipe da SOS foi atenciosa do começo ao fim. A Amora já é a guardiã da casa!', NOW() - INTERVAL '9 days'), ((SELECT id FROM novo), 'OWNER', 4, 'Adotante muito responsável, mandou fotos da adaptação na primeira semana.', NOW() - INTERVAL '9 days');

UPDATE animals SET status = 'ADOPTED', updated_at = NOW() WHERE id = (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Amora' AND o.email = 'ong2@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%'));

-- teste@t.com pede Amora (CANCELLED)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Amora' AND o.email = 'ong2@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'CANCELLED', 'ANIMAL_ADOPTED', 'ACCEPTED',
           NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', NULL, NOW() - INTERVAL '10 days'
    FROM users u WHERE u.email = 'teste@t.com'
    RETURNING id
)
SELECT id FROM novo;

-- ong2@gmail.com pede Mingau (PENDING)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Mingau' AND o.email = 'teste@t.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'PENDING', NULL, NULL,
           NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL, NULL
    FROM users u WHERE u.email = 'ong2@gmail.com'
    RETURNING id
)
SELECT id FROM novo;

-- testerealong@gmail.com pede Dona Flor (REJECTED)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Dona Flor' AND o.email = 'testejoao@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'REJECTED', NULL, NULL,
           NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', NULL, NOW() - INTERVAL '8 days'
    FROM users u WHERE u.email = 'testerealong@gmail.com'
    RETURNING id
)
SELECT id FROM novo;

-- teste@t.com pede Brownie (CANCELLED)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Brownie' AND o.email = 'testerealong@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'CANCELLED', 'ADOPTER_WITHDREW', 'PENDING',
           NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', NULL, NOW() - INTERVAL '5 days'
    FROM users u WHERE u.email = 'teste@t.com'
    RETURNING id
)
SELECT id FROM novo;

-- joaougg@teste.com pede Max (ACCEPTED)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Max' AND o.email = 'testejoao@gmail.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'ACCEPTED', NULL, NULL,
           NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NULL, NULL
    FROM users u WHERE u.email = 'joaougg@teste.com'
    RETURNING id
)
SELECT id FROM novo;

-- testejoao@gmail.com pede Chico (CONCLUDED)
WITH novo AS (
    INSERT INTO adoption_requests (animal_id, adopter_id, status, cancel_reason, cancelled_from_status,
                                   created_at, updated_at, concluded_at, closed_at)
    SELECT (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Chico' AND o.email = 'joaougg@teste.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%')), u.id, 'CONCLUDED', NULL, NULL,
           NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NULL
    FROM users u WHERE u.email = 'testejoao@gmail.com'
    RETURNING id
)
INSERT INTO adoption_reviews (request_id, author_role, rating, comment, created_at) VALUES ((SELECT id FROM novo), 'ADOPTER', 4, 'Chico chegou bem e já se acostumou com o apartamento.', NOW() - INTERVAL '7 days');

UPDATE animals SET status = 'ADOPTED', updated_at = NOW() WHERE id = (SELECT a.id FROM animals a JOIN users o ON o.id = a.owner_id WHERE a.name = 'Chico' AND o.email = 'joaougg@teste.com' AND EXISTS (SELECT 1 FROM animal_photos p WHERE p.animal_id = a.id AND p.url LIKE '%aucolher_seed=1%'));

-- Confere: 11 pedidos (se faltar um usuário ou animal, a transação é desfeita)
DO $$
DECLARE total INTEGER;
BEGIN
    SELECT count(*) INTO total FROM adoption_requests r JOIN animal_photos p ON p.animal_id = r.animal_id
    WHERE p.url LIKE '%aucolher_seed=1%';
    IF total <> 11 THEN
        RAISE EXCEPTION 'Esperava 11 pedidos de teste, foram criados %. Falta algum usuário ou animal de teste', total;
    END IF;
END $$;

COMMIT;

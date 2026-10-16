-- ============================================================
-- Animais de teste: 25 anúncios variados, 5 por usuário não-admin.
-- Cobrem todos os critérios do AUmatch (espécie, porte, idade, energia,
-- independência, temperamento, convivência, apartamento e saúde).
--
--   psql -U postgres -h localhost -d aucolher_db -f docs/seed-animais-teste.sql
--
-- As fotos levam o marcador "aucolher_seed=1" na URL: é por ele que o
-- remover-animais-teste.sql encontra estes animais. Os donos são
-- buscados pelo e-mail; rodar de novo é recusado (sem duplicar).
-- ============================================================

\set ON_ERROR_STOP on
SET client_encoding TO 'UTF8';
BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM animal_photos WHERE url LIKE '%aucolher_seed=1%') THEN
        RAISE EXCEPTION 'Os animais de teste já existem — rode o remover-animais-teste.sql antes';
    END IF;
END $$;

-- O anúncio usa a cidade do dono: o usuário 1 ainda não tinha uma
UPDATE users SET city = 'Criciúma', state = 'SC' WHERE email = 'joaougg@teste.com' AND city IS NULL;

-- Pingo (DOG, joaougg@teste.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Pingo', 'DOG', 'Yorkshire', 'MALE', 4, 'MONTHS', 'PUPPY', 'SMALL',
           TRUE, FALSE, TRUE, FALSE,
           'HIGH', 'PLAYFUL', 'LOW', 'HIGH',
           TRUE, TRUE, TRUE, TRUE,
           'Filhote de yorkshire elétrico, adora brincar de bolinha e dormir no colo.',
           'Pingo foi deixado numa caixa na porta de uma clínica. Hoje está saudável, já tomou as primeiras vacinas e procura uma família que tenha tempo para gastar a energia dele.',
           'AVAILABLE', NOW() - INTERVAL '1 hours', NOW() - INTERVAL '1 hours'
    FROM users WHERE email = 'joaougg@teste.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Jade (CAT, joaougg@teste.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Jade', 'CAT', 'SRD', 'FEMALE', 1, 'YEARS', 'ADULT', 'SMALL',
           TRUE, TRUE, TRUE, FALSE,
           'HIGH', 'PLAYFUL', 'MODERATE', 'MODERATE',
           TRUE, TRUE, TRUE, TRUE,
           'Gatinha curiosa de olhos verdes, sobe em tudo e convive bem com outros bichos.',
           'Jade nasceu numa colônia de rua e foi socializada desde cedo. Usa a caixa de areia direitinho e adora brinquedos de varinha.',
           'AVAILABLE', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'
    FROM users WHERE email = 'joaougg@teste.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Chico (DOG, joaougg@teste.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Chico', 'DOG', 'Buldogue francês', 'MALE', 5, 'YEARS', 'ADULT', 'SMALL',
           TRUE, TRUE, TRUE, FALSE,
           'LOW', 'AFFECTIONATE', 'MODERATE', 'LOW',
           TRUE, TRUE, FALSE, TRUE,
           'Buldogue francês tranquilo e grudento, perfeito para apartamento.',
           'Chico viveu com uma senhora que precisou se mudar para um lugar sem pets. É calmo, ronca um pouco e não se dá bem com gatos.',
           'AVAILABLE', NOW() - INTERVAL '15 hours', NOW() - INTERVAL '15 hours'
    FROM users WHERE email = 'joaougg@teste.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Tico (OTHER, joaougg@teste.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Tico', 'OTHER', 'Hamster sírio', 'MALE', 6, 'MONTHS', 'PUPPY', 'SMALL',
           FALSE, FALSE, FALSE, FALSE,
           'MODERATE', 'INDEPENDENT', 'HIGH', 'LOW',
           TRUE, FALSE, FALSE, TRUE,
           'Hamster sírio dócil, ideal para quem quer um primeiro pet pequeno.',
           'Tico veio de uma ninhada não planejada. Vai com a gaiola, a roda e o estoque de ração. Fica melhor longe de cães e gatos.',
           'AVAILABLE', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '22 hours'
    FROM users WHERE email = 'joaougg@teste.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Belinha (DOG, joaougg@teste.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Belinha', 'DOG', 'Cocker spaniel', 'FEMALE', 11, 'YEARS', 'SENIOR', 'MEDIUM',
           TRUE, TRUE, TRUE, TRUE,
           'LOW', 'CALM', 'LOW', 'LOW',
           TRUE, TRUE, TRUE, TRUE,
           'Idosa doce que enxerga pouco por causa da catarata e só quer um sofá e carinho.',
           'Belinha tem catarata nos dois olhos e se orienta bem em casa. Precisa de colírio duas vezes ao dia. É a companhia mais tranquila que alguém pode ter.',
           'AVAILABLE', NOW() - INTERVAL '29 hours', NOW() - INTERVAL '29 hours'
    FROM users WHERE email = 'joaougg@teste.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Bolt (DOG, testerealong@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Bolt', 'DOG', 'Border collie', 'MALE', 2, 'YEARS', 'ADULT', 'MEDIUM',
           TRUE, TRUE, TRUE, FALSE,
           'HIGH', 'PLAYFUL', 'MODERATE', 'MODERATE',
           TRUE, TRUE, FALSE, FALSE,
           'Border collie cheio de energia, aprende truques rápido e ama correr.',
           'Bolt foi resgatado de um sítio onde ficava preso. Precisa de exercício todos os dias e de espaço — ideal para quem corre ou faz trilhas.',
           'AVAILABLE', NOW() - INTERVAL '36 hours', NOW() - INTERVAL '36 hours'
    FROM users WHERE email = 'testerealong@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Fumaça (CAT, testerealong@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Fumaça', 'CAT', 'British shorthair', 'MALE', 5, 'YEARS', 'ADULT', 'MEDIUM',
           TRUE, TRUE, TRUE, FALSE,
           'LOW', 'INDEPENDENT', 'HIGH', 'LOW',
           FALSE, FALSE, TRUE, TRUE,
           'Gato cinza independente, fica bem sozinho e curte observar a janela.',
           'Fumaça foi devolvido porque a família teve um bebê. É tranquilo, mas prefere casa sem crianças pequenas e sem cachorros.',
           'AVAILABLE', NOW() - INTERVAL '43 hours', NOW() - INTERVAL '43 hours'
    FROM users WHERE email = 'testerealong@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Neve (DOG, testerealong@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Neve', 'DOG', 'Samoieda', 'FEMALE', 2, 'YEARS', 'ADULT', 'LARGE',
           TRUE, TRUE, TRUE, FALSE,
           'HIGH', 'AFFECTIONATE', 'LOW', 'MODERATE',
           TRUE, TRUE, TRUE, FALSE,
           'Samoieda sorridente e carinhosa, adora gente e precisa de companhia.',
           'Neve foi resgatada de um canil irregular. Sofre quando fica muito tempo sozinha, então combina com quem trabalha em casa.',
           'AVAILABLE', NOW() - INTERVAL '50 hours', NOW() - INTERVAL '50 hours'
    FROM users WHERE email = 'testerealong@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Duquesa (CAT, testerealong@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Duquesa', 'CAT', 'Persa', 'FEMALE', 10, 'YEARS', 'SENIOR', 'MEDIUM',
           TRUE, TRUE, TRUE, TRUE,
           'LOW', 'CALM', 'HIGH', 'LOW',
           FALSE, FALSE, FALSE, TRUE,
           'Persa idosa e serena, com dieta especial para os rins.',
           'Duquesa tem insuficiência renal leve controlada com ração especial. É elegante, silenciosa e prefere ser o único pet da casa.',
           'AVAILABLE', NOW() - INTERVAL '57 hours', NOW() - INTERVAL '57 hours'
    FROM users WHERE email = 'testerealong@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Brownie (DOG, testerealong@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Brownie', 'DOG', 'Labrador', 'MALE', 7, 'YEARS', 'ADULT', 'LARGE',
           TRUE, TRUE, TRUE, FALSE,
           'MODERATE', 'CALM', 'MODERATE', 'LOW',
           TRUE, TRUE, TRUE, FALSE,
           'Labrador chocolate maduro e calmo, ótimo com crianças.',
           'Brownie viveu a vida toda com uma família que se mudou para o exterior. Passeia bem na guia, é paciente com crianças e convive com gatos.',
           'AVAILABLE', NOW() - INTERVAL '64 hours', NOW() - INTERVAL '64 hours'
    FROM users WHERE email = 'testerealong@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Dona Flor (DOG, testejoao@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Dona Flor', 'DOG', 'Cavalier King Charles', 'FEMALE', 9, 'YEARS', 'SENIOR', 'SMALL',
           TRUE, TRUE, TRUE, FALSE,
           'LOW', 'CALM', 'LOW', 'LOW',
           TRUE, TRUE, TRUE, TRUE,
           'Senhorinha pequena e calma que adora colo e cochilos ao sol.',
           'Dona Flor ficou sozinha quando a tutora faleceu. Se adapta bem a apartamento e gosta de ter alguém por perto a maior parte do dia.',
           'AVAILABLE', NOW() - INTERVAL '71 hours', NOW() - INTERVAL '71 hours'
    FROM users WHERE email = 'testejoao@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Mia (CAT, testejoao@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Mia', 'CAT', 'SRD', 'FEMALE', 3, 'MONTHS', 'PUPPY', 'SMALL',
           TRUE, FALSE, TRUE, FALSE,
           'HIGH', 'PLAYFUL', 'LOW', 'MODERATE',
           TRUE, TRUE, TRUE, TRUE,
           'Filhote de gata brincalhona, já usa a caixinha e ama bolinhas de papel.',
           'Mia foi encontrada num estacionamento com os irmãos. Está vermifugada, com a primeira dose da vacina, e precisa ser castrada na idade certa.',
           'AVAILABLE', NOW() - INTERVAL '78 hours', NOW() - INTERVAL '78 hours'
    FROM users WHERE email = 'testejoao@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Caramelo (DOG, testejoao@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Caramelo', 'DOG', 'SRD', 'MALE', 1, 'YEARS', 'ADULT', 'MEDIUM',
           TRUE, TRUE, TRUE, FALSE,
           'HIGH', 'PLAYFUL', 'MODERATE', 'MODERATE',
           TRUE, TRUE, FALSE, FALSE,
           'Vira-lata caramelo jovem, ama praia, bola e água.',
           'Caramelo apareceu na praia e não quis mais ir embora. É sociável com pessoas e cães, mas corre atrás de gatos — melhor numa casa com quintal.',
           'AVAILABLE', NOW() - INTERVAL '85 hours', NOW() - INTERVAL '85 hours'
    FROM users WHERE email = 'testejoao@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Sushi (CAT, testejoao@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Sushi', 'CAT', 'SRD', 'MALE', 2, 'YEARS', 'ADULT', 'MEDIUM',
           TRUE, TRUE, TRUE, FALSE,
           'MODERATE', 'INDEPENDENT', 'HIGH', 'LOW',
           TRUE, TRUE, TRUE, TRUE,
           'Gato frajola tranquilo, se vira bem sozinho durante o dia.',
           'Sushi morava num restaurante e ganhou o nome dos funcionários. É independente, mas aparece para um carinho no fim do dia.',
           'AVAILABLE', NOW() - INTERVAL '92 hours', NOW() - INTERVAL '92 hours'
    FROM users WHERE email = 'testejoao@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Max (DOG, testejoao@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Max', 'DOG', 'Labrador', 'MALE', 3, 'YEARS', 'ADULT', 'LARGE',
           TRUE, TRUE, TRUE, FALSE,
           'HIGH', 'PLAYFUL', 'MODERATE', 'MODERATE',
           TRUE, TRUE, TRUE, FALSE,
           'Labrador amarelo brincalhão, ótimo parceiro de corrida.',
           'Max cresceu num apartamento pequeno demais para ele. Precisa de quintal e de pelo menos dois passeios por dia.',
           'AVAILABLE', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
    FROM users WHERE email = 'testejoao@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1592754862816-1a21a4ea2281?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Amora (DOG, ong2@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Amora', 'DOG', 'SRD', 'FEMALE', 4, 'YEARS', 'ADULT', 'LARGE',
           TRUE, TRUE, TRUE, FALSE,
           'MODERATE', 'PROTECTIVE', 'HIGH', 'HIGH',
           FALSE, TRUE, FALSE, FALSE,
           'Grandona protetora e leal, ideal para casa com quintal.',
           'Amora vigiava uma obra antes do resgate. É fiel à família, desconfiada com estranhos e precisa de adultos com experiência com cães grandes.',
           'AVAILABLE', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours'
    FROM users WHERE email = 'ong2@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1534351450181-ea9f78427fe8?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Paçoca (DOG, ong2@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Paçoca', 'DOG', 'Golden retriever', 'MALE', 6, 'YEARS', 'ADULT', 'LARGE',
           TRUE, TRUE, TRUE, FALSE,
           'MODERATE', 'AFFECTIONATE', 'MODERATE', 'LOW',
           TRUE, TRUE, TRUE, FALSE,
           'Golden dócil que ama crianças e qualquer pessoa que faça carinho.',
           'Paçoca foi resgatado de um tutor que não podia mais cuidar dele. É o cão-terapia da ONG nas visitas a escolas.',
           'AVAILABLE', NOW() - INTERVAL '16 hours', NOW() - INTERVAL '16 hours'
    FROM users WHERE email = 'ong2@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Salsicha (DOG, ong2@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Salsicha', 'DOG', 'Dachshund', 'FEMALE', 8, 'YEARS', 'SENIOR', 'SMALL',
           TRUE, TRUE, TRUE, FALSE,
           'LOW', 'INDEPENDENT', 'MODERATE', 'HIGH',
           FALSE, TRUE, TRUE, TRUE,
           'Salsichinha experiente e mandona, late para avisar quem chega.',
           'Salsicha passou anos num canil de criação. Agora quer uma vida tranquila, sem crianças pequenas, e se dá bem com outros pets.',
           'AVAILABLE', NOW() - INTERVAL '23 hours', NOW() - INTERVAL '23 hours'
    FROM users WHERE email = 'ong2@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1520087619250-584c0cbd35e8?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Tigrinha (CAT, ong2@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Tigrinha', 'CAT', 'SRD', 'FEMALE', 6, 'YEARS', 'ADULT', 'SMALL',
           TRUE, TRUE, TRUE, FALSE,
           'LOW', 'INDEPENDENT', 'HIGH', 'LOW',
           TRUE, FALSE, TRUE, TRUE,
           'Gata tigrada discreta, perfeita para quem passa o dia fora.',
           'Tigrinha foi resgatada de um telhado depois de uma chuva forte. É independente, carinhosa no próprio ritmo, e não gosta de cachorros.',
           'AVAILABLE', NOW() - INTERVAL '30 hours', NOW() - INTERVAL '30 hours'
    FROM users WHERE email = 'ong2@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1491485880348-85d48a9e5312?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Nala (DOG, ong2@gmail.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Nala', 'DOG', 'SRD', 'FEMALE', 4, 'YEARS', 'ADULT', 'MEDIUM',
           TRUE, TRUE, TRUE, FALSE,
           'MODERATE', 'PROTECTIVE', 'MODERATE', 'MODERATE',
           TRUE, TRUE, TRUE, TRUE,
           'Vira-lata malhada protetora com a família e tranquila em casa.',
           'Nala foi resgatada com os filhotes, que já foram adotados. Agora é a vez dela: guarda bem a casa e é muito carinhosa com quem conhece.',
           'AVAILABLE', NOW() - INTERVAL '37 hours', NOW() - INTERVAL '37 hours'
    FROM users WHERE email = 'ong2@gmail.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Bidu (DOG, teste@t.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Bidu', 'DOG', 'Jack Russell terrier', 'MALE', 3, 'YEARS', 'ADULT', 'SMALL',
           TRUE, TRUE, TRUE, FALSE,
           'HIGH', 'PLAYFUL', 'MODERATE', 'HIGH',
           TRUE, FALSE, FALSE, TRUE,
           'Terrier pequeno e incansável, precisa de muita brincadeira.',
           'Bidu foi devolvido duas vezes por excesso de energia. Com passeios longos e brinquedos, vira outro cão. Prefere ser o único pet da casa.',
           'AVAILABLE', NOW() - INTERVAL '44 hours', NOW() - INTERVAL '44 hours'
    FROM users WHERE email = 'teste@t.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Mingau (CAT, teste@t.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Mingau', 'CAT', 'SRD', 'MALE', 3, 'YEARS', 'ADULT', 'MEDIUM',
           TRUE, TRUE, TRUE, FALSE,
           'LOW', 'CALM', 'HIGH', 'LOW',
           TRUE, FALSE, TRUE, TRUE,
           'Gato laranja preguiçoso, o rei do sofá.',
           'Mingau foi encontrado dormindo dentro de uma caixa de papelão no mercado. É calmo, convive com outros gatos e não liga de ficar sozinho.',
           'AVAILABLE', NOW() - INTERVAL '51 hours', NOW() - INTERVAL '51 hours'
    FROM users WHERE email = 'teste@t.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Bob (DOG, teste@t.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Bob', 'DOG', 'Corgi', 'MALE', 5, 'MONTHS', 'PUPPY', 'SMALL',
           TRUE, FALSE, TRUE, FALSE,
           'HIGH', 'PLAYFUL', 'LOW', 'HIGH',
           TRUE, TRUE, TRUE, TRUE,
           'Filhote de corgi orelhudo que quer ser amigo de todo mundo.',
           'Bob foi entregue por uma família que não conseguiu cuidar da ninhada. Está aprendendo os comandos básicos e precisa de companhia.',
           'AVAILABLE', NOW() - INTERVAL '58 hours', NOW() - INTERVAL '58 hours'
    FROM users WHERE email = 'teste@t.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Simba (CAT, teste@t.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Simba', 'CAT', 'SRD', 'MALE', 8, 'MONTHS', 'PUPPY', 'MEDIUM',
           TRUE, TRUE, TRUE, FALSE,
           'HIGH', 'AFFECTIONATE', 'LOW', 'HIGH',
           TRUE, TRUE, TRUE, TRUE,
           'Gato jovem e falante, segue a gente pela casa pedindo carinho.',
           'Simba foi resgatado ainda bebê com uma pata machucada, que já sarou. Mia bastante para conversar e não gosta de ficar sozinho.',
           'AVAILABLE', NOW() - INTERVAL '65 hours', NOW() - INTERVAL '65 hours'
    FROM users WHERE email = 'teste@t.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Floquinho (OTHER, teste@t.com)
WITH novo AS (
    INSERT INTO animals (owner_id, name, species, breed, sex, age_value, age_unit, age_group, size,
                         vaccinated, neutered, dewormed, special_needs,
                         energy_level, temperament, independence_level, vocalization,
                         good_with_children, good_with_dogs, good_with_cats, apartment_friendly,
                         summary, story, status, created_at, updated_at)
    SELECT id, 'Floquinho', 'OTHER', 'Coelho', 'MALE', 1, 'YEARS', 'ADULT', 'SMALL',
           TRUE, TRUE, TRUE, FALSE,
           'LOW', 'CALM', 'MODERATE', 'LOW',
           TRUE, FALSE, FALSE, TRUE,
           'Coelho branco manso, gosta de feno fresco e de cafuné atrás das orelhas.',
           'Floquinho foi abandonado num parque depois da Páscoa. É castrado, usa caixa de areia e precisa de um cantinho seguro, longe de cães e gatos.',
           'AVAILABLE', NOW() - INTERVAL '72 hours', NOW() - INTERVAL '72 hours'
    FROM users WHERE email = 'teste@t.com'
    RETURNING id
)
INSERT INTO animal_photos (animal_id, sort_order, url) SELECT id, 0, 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=1200&q=80&aucolher_seed=1' FROM novo;

-- Confere: 25 animais, 5 por dono (se faltar um e-mail, a transação é desfeita)
DO $$
DECLARE total INTEGER;
BEGIN
    SELECT count(*) INTO total FROM animal_photos WHERE url LIKE '%aucolher_seed=1%';
    IF total <> 25 THEN
        RAISE EXCEPTION 'Esperava 25 animais de teste, foram criados %. Algum dono não existe neste banco', total;
    END IF;
END $$;

COMMIT;

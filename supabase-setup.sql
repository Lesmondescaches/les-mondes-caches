-- À copier-coller intégralement dans l'éditeur SQL de Supabase (SQL Editor > New query), puis "Run".
-- Si tu avais déjà exécuté une version précédente, exécute celle-ci par-dessus sans crainte :
-- elle recrée juste les règles de sécurité (policies), sans toucher à tes données existantes.

-- ============================================================
-- 1) Table config + villes/créneaux
--    Lecture publique (nécessaire pour que les visiteurs voient les créneaux),
--    mais désormais ECRITURE reservée aux personnes connectées (toi uniquement).
-- ============================================================
create table if not exists kv_store (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default now()
);

alter table kv_store enable row level security;

drop policy if exists "Lecture publique" on kv_store;
create policy "Lecture publique" on kv_store
  for select using (true);

drop policy if exists "Ecriture publique" on kv_store;
drop policy if exists "Ecriture authentifiee" on kv_store;
create policy "Ecriture authentifiee" on kv_store
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Mise a jour publique" on kv_store;
drop policy if exists "Mise a jour authentifiee" on kv_store;
create policy "Mise a jour authentifiee" on kv_store
  for update using (auth.role() = 'authenticated');

-- ============================================================
-- 2) Table réservations
--    N'importe qui peut AJOUTER une réservation (formulaire public),
--    mais seule une personne connectée (toi) peut LIRE la liste.
-- ============================================================
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  ville_id text,
  ville_nom text,
  session_id text,
  date text,
  heure text,
  nom text,
  email text,
  tel text,
  nb_enfants integer,
  en_attente boolean default false,
  cree_le timestamptz default now()
);

alter table reservations enable row level security;

drop policy if exists "Insertion publique reservations" on reservations;
create policy "Insertion publique reservations" on reservations
  for insert with check (true);

drop policy if exists "Lecture authentifiee reservations" on reservations;
create policy "Lecture authentifiee reservations" on reservations
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- 3) Ton compte administrateur
--    Va dans le menu "Authentication" > "Users" > "Add user" (en haut à droite).
--    Renseigne ton email et un mot de passe. Décoche/ignore la case de
--    confirmation par email si elle bloque (ou coche "Auto Confirm User").
--    C'est ce couple email + mot de passe que tu utiliseras pour te connecter
--    sur le site, via le bouton ⚙️.
-- ============================================================

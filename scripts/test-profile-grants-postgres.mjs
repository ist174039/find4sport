import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { assertDisposablePostgresTarget } from "./lib/disposable-postgres-target.mjs";

const databaseUrl = process.env.PUBLIC_DISCOVERY_TEST_DATABASE_URL;
const parsedUrl = assertDisposablePostgresTarget(
  databaseUrl,
  process.env.PUBLIC_DISCOVERY_TEST_ALLOW_DESTRUCTIVE,
);

const databaseName = `f4s_profile_grants_${randomUUID().replaceAll("-", "")}`;
const admin = new Client({ connectionString: databaseUrl });
let isolated;
let databaseCreated = false;
let advisoryLockHeld = false;
const createdRoles = [];

const schemaSql = `
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true),'')::uuid
$$;

CREATE TYPE public.review_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.platform_users(
  id uuid primary key,
  account_status text,
  suspended_until timestamptz
);
CREATE TABLE public.admins(auth_user_id uuid primary key);
CREATE TABLE public.professionals(
  id uuid primary key,
  user_id uuid,
  full_name text,
  professional_name text,
  bio text,
  avatar_url text,
  phone text,
  whatsapp text,
  email text,
  nif text,
  address text,
  latitude double precision,
  longitude double precision,
  service_radius_km numeric,
  status text,
  public_slug text,
  contact_methods jsonb,
  rating_avg numeric,
  review_count integer,
  views_count integer,
  website text,
  social_links jsonb,
  is_verified boolean,
  is_premium boolean,
  gallery_urls jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  cover_url text,
  private_gallery_urls jsonb,
  stripe_account_id text
);
CREATE TABLE public.sport_spaces(
  id uuid primary key,
  name text,
  slug text,
  description text,
  address text,
  latitude double precision,
  longitude double precision,
  phone text,
  email text,
  website text,
  opening_hours jsonb,
  amenities jsonb,
  google_places_id text,
  status text,
  is_verified boolean,
  rating_avg numeric,
  review_count integer,
  views_count integer,
  gallery_urls jsonb,
  created_by uuid,
  owner_user_id uuid,
  claimed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  cover_url text,
  private_gallery_urls jsonb,
  logo_url text,
  stripe_account_id text
);
CREATE TABLE public.professional_availability(id uuid primary key, professional_id uuid);
CREATE TABLE public.professional_categories(professional_id uuid, category_id uuid);
CREATE TABLE public.professional_unavailability(id uuid primary key, professional_id uuid);
CREATE TABLE public.qualifications(id uuid primary key, professional_id uuid);
CREATE TABLE public.reservations(id uuid primary key, user_id uuid, professional_id uuid, space_id uuid);
CREATE TABLE public.events(id uuid primary key, created_by uuid);
CREATE TABLE public.reviews(id uuid primary key, status public.review_status, user_id uuid, professional_id uuid, space_id uuid, event_id uuid);
CREATE TABLE public.service_package_purchases(id uuid primary key, user_id uuid, professional_id uuid);
CREATE TABLE public.services(id uuid primary key, professional_id uuid);
CREATE TABLE public.space_categories(space_id uuid, category_id uuid);
CREATE TABLE public.space_professionals(id uuid primary key, professional_id uuid, space_id uuid, status text);
CREATE TABLE public.space_rooms(id uuid primary key, space_id uuid);
CREATE TABLE public.space_room_availability(id uuid primary key, room_id uuid);

CREATE FUNCTION public.discover_professionals(
  double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer
) RETURNS TABLE(item jsonb,total_count bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public
AS $$ SELECT '{}'::jsonb, 0::bigint $$;

CREATE FUNCTION public.discover_spaces(
  double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer
) RETURNS TABLE(item jsonb,total_count bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public
AS $$ SELECT '{}'::jsonb, 0::bigint $$;

GRANT EXECUTE ON FUNCTION public.discover_professionals(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.discover_spaces(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) TO anon, authenticated;
GRANT SELECT ON public.professionals, public.sport_spaces TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY professionals_test_select ON public.professionals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY spaces_test_select ON public.sport_spaces FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.professionals(
  id,user_id,full_name,status,public_slug,nif,email,phone,whatsapp,stripe_account_id,private_gallery_urls
) VALUES (
  '20000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'Synthetic Pro','active','synthetic-pro','999999990','test@example.invalid','000000000','000000000','acct_test','[]'
);
INSERT INTO public.sport_spaces(
  id,name,slug,status,owner_user_id,created_by,email,phone,stripe_account_id,private_gallery_urls
) VALUES (
  '10000000-0000-4000-8000-000000000001',
  'Synthetic Space','synthetic-space','active',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'space@example.invalid','000000000','acct_test','[]'
);
`;

try {
  await admin.connect();
  await admin.query("SELECT pg_advisory_lock(7146872533912202)");
  advisoryLockHeld = true;

  for (const role of ["anon", "authenticated", "service_role"]) {
    const { rowCount } = await admin.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [role]);
    if (!rowCount) {
      await admin.query(`CREATE ROLE ${role} NOLOGIN${role === "service_role" ? " BYPASSRLS" : ""}`);
      createdRoles.push(role);
    }
  }

  await admin.query(`CREATE DATABASE "${databaseName}"`);
  databaseCreated = true;
  const isolatedUrl = new URL(parsedUrl.toString());
  isolatedUrl.pathname = `/${databaseName}`;
  isolated = new Client({ connectionString: isolatedUrl.toString() });
  await isolated.connect();
  await isolated.query(schemaSql);

  const migration = await readFile(
    new URL("../supabase/migrations/20261025221000_restrict_profile_table_select_columns.sql", import.meta.url),
    "utf8",
  );
  await isolated.query(migration);

  const { rows: aclRows } = await isolated.query(`
    SELECT
      has_table_privilege('anon','public.professionals','SELECT') AS anon_prof_table_select,
      has_table_privilege('authenticated','public.sport_spaces','SELECT') AS auth_space_table_select,
      has_column_privilege('anon','public.professionals','id','SELECT') AS anon_prof_id,
      has_column_privilege('anon','public.professionals','nif','SELECT') AS anon_prof_nif,
      has_column_privilege('anon','public.professionals','phone','SELECT') AS anon_prof_phone,
      has_column_privilege('anon','public.professionals','whatsapp','SELECT') AS anon_prof_whatsapp,
      has_column_privilege('authenticated','public.professionals','user_id','SELECT') AS auth_prof_user_id,
      has_column_privilege('authenticated','public.sport_spaces','owner_user_id','SELECT') AS auth_space_owner,
      has_column_privilege('authenticated','public.sport_spaces','name','SELECT') AS auth_space_name,
      has_column_privilege('authenticated','public.sport_spaces','stripe_account_id','SELECT') AS auth_space_stripe,
      has_function_privilege('authenticated','app_private.owns_professional(uuid)','EXECUTE') AS auth_owner_helper,
      has_function_privilege('anon','app_private.owns_professional(uuid)','EXECUTE') AS anon_owner_helper
  `);
  assert.deepEqual(aclRows[0], {
    anon_prof_table_select: false,
    auth_space_table_select: false,
    anon_prof_id: true,
    anon_prof_nif: false,
    anon_prof_phone: false,
    anon_prof_whatsapp: false,
    auth_prof_user_id: false,
    auth_space_owner: false,
    auth_space_name: true,
    auth_space_stripe: false,
    auth_owner_helper: true,
    anon_owner_helper: false,
  });

  const { rows: functionRows } = await isolated.query(`
    SELECT proname, prosecdef
    FROM pg_proc
    WHERE oid IN (
      'public.discover_professionals(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer)'::regprocedure,
      'public.discover_spaces(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer)'::regprocedure
    )
    ORDER BY proname
  `);
  assert.deepEqual(functionRows, [
    { proname: "discover_professionals", prosecdef: true },
    { proname: "discover_spaces", prosecdef: true },
  ]);

  await isolated.query("SET ROLE anon");
  const { rows: publicRows } = await isolated.query("SELECT id,full_name,public_slug FROM public.professionals");
  assert.equal(publicRows.length, 1);
  await assert.rejects(
    isolated.query("SELECT nif FROM public.professionals"),
    (error) => error.code === "42501",
  );
  await isolated.query("RESET ROLE");

  await isolated.query("SET ROLE authenticated");
  await isolated.query("SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false)");
  const { rows: helperRows } = await isolated.query(
    "SELECT app_private.owns_professional('20000000-0000-4000-8000-000000000001') AS owns_professional, app_private.owns_space('10000000-0000-4000-8000-000000000001') AS owns_space"
  );
  assert.deepEqual(helperRows[0], { owns_professional: true, owns_space: true });
  await assert.rejects(
    isolated.query("SELECT owner_user_id FROM public.sport_spaces"),
    (error) => error.code === "42501",
  );
  await isolated.query("RESET ROLE");

  const { rows: policies } = await isolated.query(`
    SELECT policyname, coalesce(qual,'') || ' ' || coalesce(with_check,'') AS expression
    FROM pg_policies
    WHERE schemaname='public'
      AND policyname IN (
        'reservations_participant_read',
        'space_professionals_authenticated_read',
        'Service owners can read own services'
      )
    ORDER BY policyname
  `);
  assert.equal(policies.length, 3);
  for (const row of policies) assert.match(row.expression, /app_private\.(owns_professional|owns_space)/);

  console.log("Profile table least-privilege PostgreSQL contract passed: sensitive/internal columns are denied while explicit public fields and server-side ownership helpers remain available.");
} finally {
  if (isolated) await isolated.end().catch(() => {});
  if (admin.readyForQuery) {
    if (databaseCreated) await admin.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`).catch(() => {});
    for (const role of createdRoles.reverse()) await admin.query(`DROP ROLE IF EXISTS ${role}`).catch(() => {});
    if (advisoryLockHeld) await admin.query("SELECT pg_advisory_unlock(7146872533912202)").catch(() => {});
    await admin.end().catch(() => {});
  }
}

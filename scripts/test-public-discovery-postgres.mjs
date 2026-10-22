import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { assertDisposablePostgresTarget } from "./lib/disposable-postgres-target.mjs";
import { setTimeout as delay } from "node:timers/promises";

const databaseUrl = process.env.PUBLIC_DISCOVERY_TEST_DATABASE_URL;
const parsedUrl = assertDisposablePostgresTarget(
  databaseUrl,
  process.env.PUBLIC_DISCOVERY_TEST_ALLOW_DESTRUCTIVE,
);

const databaseName = `f4s_public_discovery_${randomUUID().replaceAll("-", "")}`;
const admin = new Client({ connectionString: databaseUrl });
let isolated;
let databaseCreated = false;
let advisoryLockHeld = false;
const createdRoles = [];

const baselineSql = `
CREATE TABLE public.platform_users(id uuid primary key, account_status text, suspended_until timestamptz);
CREATE TABLE public.professionals(id uuid primary key, user_id uuid, full_name text, professional_name text, bio text, avatar_url text, address text, latitude double precision, longitude double precision, status text, public_slug text, rating_avg numeric, review_count integer, views_count integer, is_verified boolean, is_premium boolean, gallery_urls jsonb, created_at timestamptz, tax_id text, stripe_account_id text, email text, private_gallery_urls jsonb);
CREATE TABLE public.reservations(id uuid primary key, professional_id uuid, date date not null, start_time time not null, end_time time not null, status text not null);
CREATE TABLE public.services(id uuid primary key, professional_id uuid, price numeric, is_active boolean);
CREATE TABLE public.categories(id uuid primary key, name text, slug text, parent_id uuid, icon_key text, is_active boolean);
CREATE TABLE public.professional_categories(professional_id uuid, category_id uuid);
CREATE TABLE public.sport_spaces(id uuid primary key, name text, slug text, description text, address text, latitude double precision, longitude double precision, status text, is_verified boolean, rating_avg numeric, review_count integer, gallery_urls jsonb, cover_url text, created_at timestamptz, owner_user_id uuid, stripe_account_id text, email text, tax_id text, private_gallery_urls jsonb);
CREATE TABLE public.space_rooms(id uuid primary key, space_id uuid, price_per_hour numeric, is_active boolean);
CREATE TABLE public.space_categories(space_id uuid, category_id uuid);
CREATE FUNCTION public.search_professionals_by_radius(double precision,double precision,double precision) RETURNS integer LANGUAGE sql AS $$ SELECT 1 $$;
CREATE FUNCTION public.search_spaces_by_radius(double precision,double precision,double precision) RETURNS integer LANGUAGE sql AS $$ SELECT 1 $$;
GRANT SELECT ON public.professionals, public.sport_spaces TO anon, authenticated;
GRANT SELECT ON public.platform_users, public.services, public.categories, public.professional_categories, public.space_rooms, public.space_categories TO anon, authenticated;
ALTER TABLE public.platform_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY platform_users_public_select ON public.platform_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY platform_users_restricted_select ON public.platform_users AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (account_status = 'active' OR (account_status = 'suspended' AND suspended_until <= now()));
`;

const fixtureSql = `
INSERT INTO public.platform_users VALUES
 ('00000000-0000-4000-8000-000000000001','active',NULL),
 ('00000000-0000-4000-8000-000000000002','suspended',now()-interval '1 day'),
 ('00000000-0000-4000-8000-000000000003','suspended',now()+interval '1 day'),
 ('00000000-0000-4000-8000-000000000004','blocked',NULL);
INSERT INTO public.sport_spaces(id,name,slug,status,is_verified,rating_avg,review_count,gallery_urls,created_at,owner_user_id) VALUES
 ('10000000-0000-4000-8000-000000000001','Active','active','active',true,4.5,2,'[]',now(),'00000000-0000-4000-8000-000000000001'),
 ('10000000-0000-4000-8000-000000000002','Expired suspension','expired','active',true,4.0,1,'[]',now(),'00000000-0000-4000-8000-000000000002'),
 ('10000000-0000-4000-8000-000000000003','Current suspension','current','active',true,5.0,8,'[]',now(),'00000000-0000-4000-8000-000000000003'),
 ('10000000-0000-4000-8000-000000000004','Blocked owner','blocked','active',true,5.0,8,'[]',now(),'00000000-0000-4000-8000-000000000004'),
 ('10000000-0000-4000-8000-000000000005','No owner','ownerless','active',true,5.0,8,'[]',now(),NULL);
INSERT INTO public.professionals(id,user_id,full_name,status,rating_avg,review_count,views_count,is_verified,is_premium,gallery_urls,created_at) VALUES
 ('20000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','Active pro','active',4.5,2,10,true,false,'[]',now()),
 ('20000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000002','Expired suspension pro','active',4.0,1,3,true,false,'[]',now()),
 ('20000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','Current suspension pro','active',5.0,8,20,true,false,'[]',now()),
 ('20000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004','Blocked pro','active',5.0,8,20,true,false,'[]',now());
`;

try {
  await admin.connect();
  await admin.query("SELECT pg_advisory_lock(7146872533912201)");
  advisoryLockHeld = true;
  for (const role of ["anon", "authenticated", "service_role"]) {
    const { rowCount } = await admin.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [role],
    );
    if (!rowCount) {
      await admin.query(
        `CREATE ROLE ${role} NOLOGIN${role === "service_role" ? " BYPASSRLS" : ""}`,
      );
      createdRoles.push(role);
    }
  }

  await admin.query(`CREATE DATABASE "${databaseName}"`);
  databaseCreated = true;
  const isolatedUrl = new URL(parsedUrl.toString());
  isolatedUrl.pathname = `/${databaseName}`;
  isolated = new Client({ connectionString: isolatedUrl.toString() });
  await isolated.connect();
  await isolated.query(baselineSql);

  for (const filename of [
    "20261022101506_revoke_legacy_public_radius_search.sql",
    "20261022003244_secure_public_discovery_allowlist.sql",
  ]) {
    await isolated.query(
      await readFile(
        new URL(`../supabase/migrations/${filename}`, import.meta.url),
        "utf8",
      ),
    );
  }
  await isolated.query(fixtureSql);

  const { rows: aclRows } = await isolated.query(`
    SELECT
      has_function_privilege('anon','public.search_professionals_by_radius(double precision,double precision,double precision)','EXECUTE') AS anon_legacy_professionals,
      has_function_privilege('authenticated','public.search_spaces_by_radius(double precision,double precision,double precision)','EXECUTE') AS authenticated_legacy_spaces,
      has_function_privilege('service_role','public.search_spaces_by_radius(double precision,double precision,double precision)','EXECUTE') AS service_legacy_spaces,
      has_function_privilege('anon','public.discover_spaces(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer)','EXECUTE') AS anon_discovery,
      has_table_privilege('anon','public.sport_spaces','SELECT') AS anon_direct_space_select,
      has_column_privilege('anon','public.professionals','tax_id','SELECT') AS anon_direct_professional_tax_id_select,
      has_column_privilege('authenticated','public.sport_spaces','stripe_account_id','SELECT') AS authenticated_direct_space_stripe_select
  `);
  assert.deepEqual(aclRows[0], {
    anon_legacy_professionals: false,
    authenticated_legacy_spaces: false,
    service_legacy_spaces: true,
    anon_discovery: true,
    anon_direct_space_select: true,
    anon_direct_professional_tax_id_select: true,
    authenticated_direct_space_stripe_select: true,
  });

  await isolated.query("SET ROLE anon");
  const { rows: spaceRows } = await isolated.query(`
    SELECT string_agg(item->>'slug', ',' ORDER BY item->>'slug') AS slugs,
           max(total_count) AS total_count,
           bool_or(item ? 'owner_user_id' OR item ? 'user_id' OR item ? 'stripe_account_id' OR item ? 'email') AS exposes_private_fields
    FROM public.discover_spaces(p_limit => 100)
  `);
  const { rows: professionalRows } = await isolated.query(`
    SELECT string_agg(item->>'full_name', ',' ORDER BY item->>'full_name') AS names,
           max(total_count) AS total_count,
           bool_or(item ? 'user_id' OR item ? 'owner_user_id') AS exposes_internal_owner_id
    FROM public.discover_professionals(p_limit => 100)
  `);
  await isolated.query("RESET ROLE");

  assert.equal(spaceRows[0].slugs, "active,expired");
  assert.equal(Number(spaceRows[0].total_count), 2);
  assert.equal(spaceRows[0].exposes_private_fields, false);
  assert.equal(professionalRows[0].names, "Active pro,Expired suspension pro");
  assert.equal(Number(professionalRows[0].total_count), 2);
  assert.equal(professionalRows[0].exposes_internal_owner_id, false);

  const eligibilitySql = await readFile(
    new URL("../supabase/migration-proposals/20261022_enforce_professional_booking_eligibility.sql", import.meta.url),
    "utf8",
  );
  await isolated.query(eligibilitySql);

  const reservationSql = `INSERT INTO public.reservations(id,professional_id,date,start_time,end_time,status)
    VALUES ($1,$2,'2030-01-01','10:00','11:00','confirmed')`;
  const reservationId = () => randomUUID();
  const activeProfessional = "20000000-0000-4000-8000-000000000001";
  const expiredSuspensionProfessional = "20000000-0000-4000-8000-000000000002";
  const suspendedProfessional = "20000000-0000-4000-8000-000000000003";
  const blockedProfessional = "20000000-0000-4000-8000-000000000004";

  await isolated.query(reservationSql, [reservationId(), activeProfessional]);
  await isolated.query(reservationSql, [reservationId(), expiredSuspensionProfessional]);
  for (const professionalId of [suspendedProfessional, blockedProfessional]) {
    await assert.rejects(
      isolated.query(reservationSql, [reservationId(), professionalId]),
      (error) => error.code === "23514" && error.message.includes("professional_booking_owner_ineligible"),
    );
  }
  await isolated.query("UPDATE public.professionals SET status='inactive' WHERE id=$1", [activeProfessional]);
  await assert.rejects(
    isolated.query(reservationSql, [reservationId(), activeProfessional]),
    (error) => error.code === "23514" && error.message.includes("professional_booking_owner_ineligible"),
  );
  await isolated.query("UPDATE public.professionals SET status='active' WHERE id=$1", [activeProfessional]);

  await isolated.query("GRANT INSERT ON public.reservations TO authenticated");
  await isolated.query("SET ROLE authenticated");
  try {
    await isolated.query(reservationSql, [reservationId(), expiredSuspensionProfessional]);
  } finally {
    await isolated.query("RESET ROLE");
  }

  const isolatedUrlForClient = new URL(parsedUrl.toString());
  isolatedUrlForClient.pathname = `/${databaseName}`;
  const bookingClient = new Client({ connectionString: isolatedUrlForClient.toString(), application_name: "f4s_booking_lock_test" });
  const moderationClient = new Client({ connectionString: isolatedUrlForClient.toString(), application_name: "f4s_moderation_lock_test" });
  try {
    await Promise.all([bookingClient.connect(), moderationClient.connect()]);
    await bookingClient.query("SET statement_timeout = '15s'");
    await moderationClient.query("SET statement_timeout = '15s'");
    await bookingClient.query("BEGIN");
    await bookingClient.query(reservationSql, [reservationId(), activeProfessional]);
    let moderationUpdateError;
    const moderationUpdate = moderationClient
      .query("UPDATE public.platform_users SET account_status='blocked' WHERE id='00000000-0000-4000-8000-000000000001'")
      .catch((error) => { moderationUpdateError = error; });

    let moderationIsBlocked = false;
    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const { rows } = await admin.query(
        `SELECT 1 FROM pg_stat_activity WHERE datname=$1 AND application_name='f4s_moderation_lock_test' AND wait_event_type='Lock' AND cardinality(pg_blocking_pids(pid)) > 0`,
        [databaseName],
      );
      if (rows.length) {
        moderationIsBlocked = true;
        break;
      }
      await delay(10);
    }
    assert.equal(moderationIsBlocked, true, "moderation update should wait until the booking transaction commits; lock wait was not observed within 10 seconds");
    await bookingClient.query("COMMIT");
    await moderationUpdate;
    assert.equal(moderationUpdateError, undefined, moderationUpdateError?.message);
    assert.equal((await moderationClient.query("SELECT account_status FROM public.platform_users WHERE id='00000000-0000-4000-8000-000000000001'")).rows[0].account_status, "blocked");

    await moderationClient.query("BEGIN");
    await moderationClient.query("UPDATE public.platform_users SET account_status='active' WHERE id='00000000-0000-4000-8000-000000000001'");
    let bookingError;
    const bookingAttempt = bookingClient
      .query(reservationSql, [reservationId(), activeProfessional])
      .catch((error) => { bookingError = error; });
    let bookingIsBlocked = false;
    for (let attempt = 0; attempt < 1000; attempt += 1) {
      const { rows } = await admin.query(
        `SELECT 1 FROM pg_stat_activity WHERE datname=$1 AND application_name='f4s_booking_lock_test' AND wait_event_type='Lock' AND cardinality(pg_blocking_pids(pid)) > 0`,
        [databaseName],
      );
      if (rows.length) {
        bookingIsBlocked = true;
        break;
      }
      await delay(10);
    }
    assert.equal(bookingIsBlocked, true, "booking should wait for a moderation update holding the owner row");
    await moderationClient.query("UPDATE public.platform_users SET account_status='blocked' WHERE id='00000000-0000-4000-8000-000000000001'");
    await moderationClient.query("COMMIT");
    await bookingAttempt;
    assert.equal(bookingError?.code, "23514", "booking should re-read the committed blocked state after waiting for moderation");
  } finally {
    await bookingClient.query("ROLLBACK").catch(() => {});
    await moderationClient.query("ROLLBACK").catch(() => {});
    await Promise.all([bookingClient.end(), moderationClient.end()]);
  }

  await assert.rejects(
    isolated.query(reservationSql, [reservationId(), activeProfessional]),
    (error) => error.code === "23514" && error.message.includes("professional_booking_owner_ineligible"),
  );
  console.log(
    "Public discovery and professional booking PostgreSQL contracts passed. Booking eligibility is serialized with account moderation in the tested proposal. Legacy direct table/column SELECT grants remain present and are NOT remediated by these migrations.",
  );
} finally {
  if (isolated) await isolated.end().catch(() => {});
  if (admin.readyForQuery) {
    if (databaseCreated)
      await admin
        .query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`)
        .catch(() => {});
    for (const role of createdRoles.reverse())
      await admin.query(`DROP ROLE IF EXISTS ${role}`).catch(() => {});
    if (advisoryLockHeld)
      await admin.query("SELECT pg_advisory_unlock(7146872533912201)").catch(() => {});
    await admin.end().catch(() => {});
  }
}

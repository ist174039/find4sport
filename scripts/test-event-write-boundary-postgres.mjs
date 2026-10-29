import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { assertDisposablePostgresTarget } from "./lib/disposable-postgres-target.mjs";

const databaseUrl = process.env.PUBLIC_DISCOVERY_TEST_DATABASE_URL;
const parsedUrl = assertDisposablePostgresTarget(databaseUrl, process.env.PUBLIC_DISCOVERY_TEST_ALLOW_DESTRUCTIVE);
const databaseName = `f4s_event_write_${randomUUID().replaceAll("-", "")}`;
const admin = new Client({ connectionString: databaseUrl });
let isolated;
let databaseCreated = false;
let advisoryLockHeld = false;
const createdRoles = [];

try {
  await admin.connect();
  await admin.query("SELECT pg_advisory_lock(7146872533912203)");
  advisoryLockHeld = true;
  for (const role of ["anon", "authenticated", "service_role"]) {
    const { rowCount } = await admin.query("SELECT 1 FROM pg_roles WHERE rolname=$1", [role]);
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

  await isolated.query(`
    CREATE TABLE public.events(id uuid primary key, created_by uuid, title text);
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    GRANT SELECT,INSERT,UPDATE,DELETE ON public.events TO anon,authenticated;
    GRANT ALL ON public.events TO service_role;
    CREATE POLICY "Authenticated users can create events"
      ON public.events FOR INSERT TO authenticated
      WITH CHECK (true);
  `);

  const before = await isolated.query(`
    SELECT
      has_table_privilege('authenticated','public.events','INSERT') AS auth_insert,
      has_table_privilege('anon','public.events','INSERT') AS anon_insert,
      has_table_privilege('service_role','public.events','INSERT') AS service_insert
  `);
  assert.deepEqual(before.rows[0], { auth_insert: true, anon_insert: true, service_insert: true });

  const migration = await readFile(
    new URL("../supabase/migrations/20261029091404_20261025224500_revoke_browser_event_insert.sql", import.meta.url),
    "utf8",
  );
  await isolated.query(migration);

  const after = await isolated.query(`
    SELECT
      has_table_privilege('authenticated','public.events','INSERT') AS auth_insert,
      has_table_privilege('anon','public.events','INSERT') AS anon_insert,
      has_table_privilege('service_role','public.events','INSERT') AS service_insert
  `);
  assert.deepEqual(after.rows[0], { auth_insert: false, anon_insert: false, service_insert: true });

  const policies = await isolated.query(`
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='public'
      AND tablename='events'
      AND cmd='INSERT'
  `);
  assert.equal(policies.rows.length, 0);

  await isolated.query("SET ROLE authenticated");
  await assert.rejects(
    isolated.query("INSERT INTO public.events(id,created_by,title) VALUES (gen_random_uuid(),gen_random_uuid(),'blocked')"),
    (error) => error.code === "42501",
  );
  await isolated.query("RESET ROLE");

  await isolated.query("SET ROLE service_role");
  await isolated.query("INSERT INTO public.events(id,created_by,title) VALUES (gen_random_uuid(),gen_random_uuid(),'server')");
  await isolated.query("RESET ROLE");

  console.log("Event write boundary contract passed: generic browser roles cannot INSERT events while the server/service role remains able to write.");
} finally {
  if (isolated) await isolated.end().catch(() => {});
  if (admin.readyForQuery) {
    if (databaseCreated) await admin.query(`DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`).catch(() => {});
    for (const role of createdRoles.reverse()) await admin.query(`DROP ROLE IF EXISTS ${role}`).catch(() => {});
    if (advisoryLockHeld) await admin.query("SELECT pg_advisory_unlock(7146872533912203)").catch(() => {});
    await admin.end().catch(() => {});
  }
}

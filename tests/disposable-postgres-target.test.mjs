import assert from "node:assert/strict";
import test from "node:test";
import { assertDisposablePostgresTarget } from "../scripts/lib/disposable-postgres-target.mjs";

test("accepts an explicitly opted-in loopback postgres maintenance URL", () => {
  const parsed = assertDisposablePostgresTarget(
    "postgres://postgres:test@127.0.0.1:55432/postgres",
    "1",
  );
  assert.equal(parsed.hostname, "127.0.0.1");
});

test("rejects remote PostgreSQL hosts even with the destructive opt-in", () => {
  assert.throws(
    () =>
      assertDisposablePostgresTarget(
        "postgres://postgres:test@db.example.com:5432/postgres",
        "1",
      ),
    /non-loopback PostgreSQL host/,
  );
});

test("requires destructive opt-in before parsing or connecting", () => {
  assert.throws(
    () =>
      assertDisposablePostgresTarget(
        "postgres://postgres:test@localhost:5432/postgres",
        undefined,
      ),
    /creates\/drops a database and temporary roles/,
  );
});

test("rejects non-maintenance database targets", () => {
  assert.throws(
    () =>
      assertDisposablePostgresTarget(
        "postgres://postgres:test@localhost:5432/production",
        "1",
      ),
    /maintenance database/,
  );
});

const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const ALLOWED_PROTOCOLS = new Set(["postgres:", "postgresql:"]);

export function assertDisposablePostgresTarget(databaseUrl, destructiveOptIn) {
  if (destructiveOptIn !== "1") {
    throw new Error(
      "This contract test creates/drops a database and temporary roles. Set PUBLIC_DISCOVERY_TEST_ALLOW_DESTRUCTIVE=1 only for a disposable local/CI PostgreSQL server.",
    );
  }

  if (!databaseUrl) {
    throw new Error(
      "Set PUBLIC_DISCOVERY_TEST_DATABASE_URL to a disposable local PostgreSQL admin database.",
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error(
      "PUBLIC_DISCOVERY_TEST_DATABASE_URL must be a valid PostgreSQL URL.",
    );
  }

  if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error("The discovery contract test requires a PostgreSQL URL.");
  }
  if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    throw new Error(
      "Refusing a non-loopback PostgreSQL host; remote databases are not supported.",
    );
  }
  if (parsedUrl.username !== "postgres" || parsedUrl.pathname !== "/postgres") {
    throw new Error(
      "Use the postgres role and postgres maintenance database of a disposable local server.",
    );
  }

  return parsedUrl;
}

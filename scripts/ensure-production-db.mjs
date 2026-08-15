import { spawnSync } from "node:child_process";

const rawDatabaseUrl = process.env.DATABASE_URL?.trim();

if (!rawDatabaseUrl) {
  console.error(
    "DATABASE_URL is missing from the application service. Add a PostgreSQL connection variable before deploying.",
  );
  process.exit(1);
}

let databaseUrl;

try {
  databaseUrl = new URL(rawDatabaseUrl);
} catch {
  console.error(
    "DATABASE_URL is not a valid PostgreSQL URL. Expected a value starting with postgres:// or postgresql://.",
  );
  process.exit(1);
}

if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
  console.error(
    `DATABASE_URL has unsupported protocol "${databaseUrl.protocol}". Expected postgres:// or postgresql://.`,
  );
  process.exit(1);
}

console.log(
  `Preparing PostgreSQL schema at ${databaseUrl.hostname}:${databaseUrl.port || "5432"} (credentials hidden).`,
);

const commands = [
  {
    label: "schema migration",
    args: ["--filter", "@workspace/db", "run", "push-force"],
  },
  {
    label: "catalog seed",
    args: ["--filter", "@workspace/db", "run", "seed"],
  },
];

for (const command of commands) {
  console.log(`Starting ${command.label}...`);
  const result = spawnSync("pnpm", command.args, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(`Unable to start ${command.label}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(
      `${command.label} failed with exit code ${result.status ?? "unknown"}.`,
    );
    process.exit(result.status ?? 1);
  }
}

console.log("PostgreSQL schema and catalog are ready.");
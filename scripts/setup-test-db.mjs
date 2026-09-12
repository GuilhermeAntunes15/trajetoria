import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function readEnvFile(file) {
  try {
    const content = readFileSync(file, "utf8");
    const values = {};
    for (const line of content.split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (match) values[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
    return values;
  } catch {
    return {};
  }
}

const fileEnv = { ...readEnvFile(".env"), ...readEnvFile(".env.test") };
const databaseUrl = process.env.TEST_DATABASE_URL || fileEnv.TEST_DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "TEST_DATABASE_URL não definida. Crie um arquivo .env.test com:\n" +
      'TEST_DATABASE_URL="postgresql://trajetoria:trajetoria@localhost:5434/trajetoria_test"',
  );
  process.exit(1);
}

const parsed = new URL(databaseUrl);
const databaseName = parsed.pathname.replace(/^\//, "");
const adminUrl = new URL(databaseUrl);
adminUrl.pathname = "/postgres";

const prismaCli = "node_modules/prisma/build/index.js";

const created = spawnSync(
  process.execPath,
  [prismaCli, "db", "execute", "--url", adminUrl.toString(), "--stdin"],
  { input: `CREATE DATABASE "${databaseName}";`, encoding: "utf8" },
);

const alreadyExists = `${created.stdout ?? ""}${created.stderr ?? ""}`.includes("already exists");

if (created.status !== 0 && !alreadyExists) {
  console.error(created.stdout ?? "");
  console.error(created.stderr ?? "");
  process.exit(created.status ?? 1);
}

console.log(alreadyExists ? `Banco ${databaseName} já existe.` : `Banco ${databaseName} criado.`);

const migrated = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: databaseUrl },
});

process.exit(migrated.status ?? 1);

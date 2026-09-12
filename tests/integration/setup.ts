import { readFileSync } from "node:fs";
import path from "node:path";

function readEnvFile(file: string): Record<string, string> {
  try {
    const content = readFileSync(path.join(process.cwd(), file), "utf8");
    const values: Record<string, string> = {};

    for (const line of content.split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      values[key!] = rawValue!.trim().replace(/^["']|["']$/g, "");
    }

    return values;
  } catch {
    return {};
  }
}

const fileEnv = { ...readEnvFile(".env"), ...readEnvFile(".env.test") };

const testDatabaseUrl = process.env.TEST_DATABASE_URL || fileEnv.TEST_DATABASE_URL;

if (testDatabaseUrl) {
  process.env.TEST_DATABASE_URL = testDatabaseUrl;
  process.env.DATABASE_URL = testDatabaseUrl;
}

process.env.AUTH_SECRET ||= "integration-tests-secret-value";
process.env.APP_URL ||= "http://localhost:3000";
process.env.STORAGE_PROVIDER ||= "local";

import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória."),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET deve ter pelo menos 16 caracteres."),
  APP_URL: z.string().url().default("http://localhost:3000"),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  APP_URL: process.env.APP_URL,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Variáveis de ambiente inválidas:\n${details}`);
}

export const env = parsed.data;

if (env.NODE_ENV === "production" && env.STORAGE_PROVIDER === "local") {
  console.warn(
    "[env] STORAGE_PROVIDER=local em produção: arquivos podem ser perdidos em deploys. Use s3.",
  );
}

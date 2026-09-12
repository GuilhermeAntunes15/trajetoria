import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import type { PutParams, PutResult, StorageProvider } from "@/lib/storage/types";

function requireConfig(): {
  bucket: string;
  publicUrl: string;
  client: S3Client;
} {
  const { S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL } =
    env;

  if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_PUBLIC_URL) {
    throw new Error(
      "STORAGE_PROVIDER=s3 exige S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY e S3_PUBLIC_URL.",
    );
  }

  const client = new S3Client({
    region: S3_REGION ?? "auto",
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
  });

  return { bucket: S3_BUCKET, publicUrl: S3_PUBLIC_URL.replace(/\/+$/, ""), client };
}

export function createS3Storage(): StorageProvider {
  const { bucket, publicUrl, client } = requireConfig();

  return {
    async put({ key, body, contentType }: PutParams): Promise<PutResult> {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      return { key, url: this.publicUrl(key) };
    },

    async delete(key: string): Promise<void> {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },

    publicUrl(key: string): string {
      return `${publicUrl}/${key}`;
    },
  };
}

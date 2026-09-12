import { env } from "@/lib/env";
import { createLocalStorage } from "@/lib/storage/local";
import { createS3Storage } from "@/lib/storage/s3";
import type { StorageProvider } from "@/lib/storage/types";

const globalForStorage = globalThis as unknown as { storageProvider?: StorageProvider };

export function getStorage(): StorageProvider {
  if (!globalForStorage.storageProvider) {
    globalForStorage.storageProvider =
      env.STORAGE_PROVIDER === "s3" ? createS3Storage() : createLocalStorage();
  }
  return globalForStorage.storageProvider;
}

export type { PutResult, StorageProvider } from "@/lib/storage/types";

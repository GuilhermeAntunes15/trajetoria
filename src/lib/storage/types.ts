export type PutResult = { url: string; key: string };

export type PutParams = {
  key: string;
  body: Buffer;
  contentType: string;
};

export interface StorageProvider {
  put(params: PutParams): Promise<PutResult>;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
}

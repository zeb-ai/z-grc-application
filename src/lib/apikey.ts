import * as zlib from "node:zlib";

export interface ApiKeyData {
  uid: string;
  host: string; // governance URL
  otel: string;
  gid: string; // group_id
}

export function encode(data: ApiKeyData): string {
  const jsonBytes = Buffer.from(JSON.stringify(data), "utf-8");
  const compressed = zlib.deflateSync(jsonBytes, { level: 9 });
  const encoded = compressed.toString("base64url");
  return `grc_${encoded}`;
}

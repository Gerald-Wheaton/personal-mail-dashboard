import crypto from "crypto";
import { env } from "@/lib/env";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = env.APP_ENC_KEY;
  if (raw.length >= 32) {
    return crypto.createHash("sha256").update(raw).digest();
  }
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptString(value: string) {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  };
}

export function decryptString(payload: { iv: string; tag: string; data: string }) {
  const key = getKey();
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const data = Buffer.from(payload.data, "base64");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

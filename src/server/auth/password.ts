import "server-only";
import { pbkdf2, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(pbkdf2);
const ITERATIONS = 310_000;
const KEY_LENGTH = 32;

export async function hashPassword(password: string): Promise<{ password_hash: string; password_salt: string }> {
  const password_salt = randomBytes(16).toString("hex");
  const hash = await deriveKey(password, password_salt, ITERATIONS, KEY_LENGTH, "sha256");
  return { password_hash: hash.toString("hex"), password_salt };
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  if (!/^[a-f0-9]{32}$/i.test(salt) || !/^[a-f0-9]{64}$/i.test(expectedHash)) return false;
  const actualHash = await deriveKey(password, salt, ITERATIONS, KEY_LENGTH, "sha256");
  return timingSafeEqual(actualHash, Buffer.from(expectedHash, "hex"));
}

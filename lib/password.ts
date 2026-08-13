import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;

function encode(parts: (string | Buffer)[]): string {
  return Buffer.from(parts.join(":")).toString("base64");
}

function decode(stored: string): {
  salt: Buffer;
  hash: Buffer;
} {
  const [salt, hash] = Buffer.from(stored, "base64")
    .toString()
    .split(":")
    .map((part) => Buffer.from(part, "hex"));

  return { salt, hash };
}

export async function hashPassword(
  password: string
): Promise<string> {
  const salt = randomBytes(16);

  const hash = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return encode([
    salt.toString("hex"),
    hash.toString("hex"),
  ]);
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const { salt, hash } = decode(stored);

  const candidate = (await scrypt(
    password,
    salt,
    KEY_LENGTH
  )) as Buffer;

  return (
    hash.length === candidate.length &&
    timingSafeEqual(hash, candidate)
  );
}
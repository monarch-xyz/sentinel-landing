import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const FORMAT_VERSION = 'v1';

const parseEncryptionKey = () => {
  const configured = process.env.SENTINEL_PROFILE_ENCRYPTION_KEY;
  if (!configured) {
    throw new Error('Missing SENTINEL_PROFILE_ENCRYPTION_KEY');
  }

  const fromBase64 = Buffer.from(configured, 'base64');
  if (fromBase64.length === 32) {
    return fromBase64;
  }

  const fromHex = Buffer.from(configured, 'hex');
  if (fromHex.length === 32) {
    return fromHex;
  }

  const fromUtf8 = Buffer.from(configured, 'utf8');
  if (fromUtf8.length === 32) {
    return fromUtf8;
  }

  throw new Error('SENTINEL_PROFILE_ENCRYPTION_KEY must decode to 32 bytes');
};

const getEncryptionKey = () => parseEncryptionKey();

export const encryptSecret = (plaintext: string): string => {
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${FORMAT_VERSION}:${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`;
};

export const decryptSecret = (ciphertext: string): string => {
  const [version, encodedIv, encodedTag, encodedPayload] = ciphertext.split(':');
  if (version !== FORMAT_VERSION || !encodedIv || !encodedTag || !encodedPayload) {
    throw new Error('Invalid encrypted secret format');
  }

  const iv = Buffer.from(encodedIv, 'base64url');
  const authTag = Buffer.from(encodedTag, 'base64url');
  const payload = Buffer.from(encodedPayload, 'base64url');

  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);
  return decrypted.toString('utf8');
};

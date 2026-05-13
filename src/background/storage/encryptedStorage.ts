import { STORAGE_KEYS } from '@shared/constants';

interface EncryptedPayload {
  iv: string;
  ct: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getOrCreateKey(): Promise<CryptoKey> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.VAULT_KEY);
  if (stored[STORAGE_KEYS.VAULT_KEY]) {
    const jwk = stored[STORAGE_KEYS.VAULT_KEY] as JsonWebKey;
    return crypto.subtle.importKey('jwk', jwk, { name: 'AES-GCM' }, true, [
      'encrypt',
      'decrypt',
    ]);
  }

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const exported = await crypto.subtle.exportKey('jwk', key);
  await chrome.storage.local.set({ [STORAGE_KEYS.VAULT_KEY]: exported });
  return key;
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const payload: EncryptedPayload = {
    iv: arrayBufferToBase64(iv.buffer),
    ct: arrayBufferToBase64(ciphertext),
  };
  return JSON.stringify(payload);
}

export async function decrypt(encrypted: string): Promise<string> {
  const key = await getOrCreateKey();
  const payload: EncryptedPayload = JSON.parse(encrypted);
  const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
  const ciphertext = base64ToArrayBuffer(payload.ct);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

export async function setEncrypted(key: string, value: string): Promise<void> {
  const encrypted = await encrypt(value);
  await chrome.storage.local.set({ [key]: encrypted });
}

export async function getEncrypted(key: string): Promise<string | null> {
  const stored = await chrome.storage.local.get(key);
  const value = stored[key] as string | undefined;
  if (!value) return null;
  try {
    return await decrypt(value);
  } catch {
    return null;
  }
}

export async function removeEncrypted(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
}

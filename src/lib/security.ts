import crypto from "crypto";

const SDK_ENCRYPTION_SECRET = process.env.SDK_ENCRYPTION_SECRET || "Hyper Auth_sdk_secret_aes_handshake_key";

const RSA_KEY_SIZE = 2048;

let serverKeyPair: { publicKey: string; privateKey: string } | null = null;

function getServerKeyPair(): { publicKey: string; privateKey: string } {
  if (!serverKeyPair) {
    serverKeyPair = crypto.generateKeyPairSync("rsa", {
      modulusLength: RSA_KEY_SIZE,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });
  }
  return serverKeyPair;
}

export function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: RSA_KEY_SIZE,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
}

export function encryptRSA(data: string, publicKey: string): string {
  return crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(data)
  ).toString("base64");
}

export function decryptRSA(encryptedData: string, privateKey: string): string {
  return crypto.privateDecrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(encryptedData, "base64")
  ).toString("utf8");
}

export function encryptAES(text: string, secretKey: string = SDK_ENCRYPTION_SECRET): string {
  try {
    const key = crypto.createHash("sha256").update(secretKey).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const tag = cipher.getAuthTag().toString("hex");
    
    return `${iv.toString("hex")}:${encrypted}:${tag}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Encryption failed");
  }
}

export function decryptAES(cipherText: string, secretKey: string = SDK_ENCRYPTION_SECRET): string {
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid cipher text format");
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = Buffer.from(parts[1], "hex");
    const tag = Buffer.from(parts[2], "hex");
    
    const key = crypto.createHash("sha256").update(secretKey).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted as unknown as string, "hex" as unknown as undefined, "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed");
  }
}

export function calculateSignature(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function verifySignature(data: string, secret: string, signature: string): boolean {
  const calculated = calculateSignature(data, secret);
  return crypto.timingSafeEqual(Buffer.from(calculated, "hex"), Buffer.from(signature, "hex"));
}

export function generateSecureKey(): string {
  const bytes = crypto.randomBytes(32);
  const parts = bytes.toString("hex").toUpperCase().match(/.{1,4}/g) || [];
  return parts.slice(0, 4).join("-");
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashDeviceFingerprint(fingerprint: string): string {
  return crypto.createHash("sha256").update(fingerprint).digest("hex");
}

export function verifyRequestIntegrity(payload: any, signature: string, secret: string): boolean {
  const payloadString = JSON.stringify(payload);
  return verifySignature(payloadString, secret, signature);
}

export function calculateIntegrityChecksum(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

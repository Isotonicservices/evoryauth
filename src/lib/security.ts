import crypto from "crypto";

const SDK_ENCRYPTION_SECRET = process.env.SDK_ENCRYPTION_SECRET || "Evory Auth_sdk_secret_aes_handshake_key";

/**
 * Standard AES-256-GCM encryption helper
 */
export function encryptAES(text: string, secretKey: string = SDK_ENCRYPTION_SECRET): string {
  try {
    // Ensure key is exactly 32 bytes (256 bits)
    const key = crypto.createHash("sha256").update(secretKey).digest();
    const iv = crypto.randomBytes(12); // 12-byte IV for GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const tag = cipher.getAuthTag().toString("hex");
    
    // Format: iv:encrypted_text:tag
    return `${iv.toString("hex")}:${encrypted}:${tag}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Standard AES-256-GCM decryption helper
 */
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

/**
 * Calculates SHA256 signature for requests to ensure integrity
 */
export function calculateSignature(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Verify if the request signature is authentic
 */
export function verifySignature(data: string, secret: string, signature: string): boolean {
  const calculated = calculateSignature(data, secret);
  return crypto.timingSafeEqual(Buffer.from(calculated, "hex"), Buffer.from(signature, "hex"));
}

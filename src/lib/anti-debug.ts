import crypto from "crypto";

export function generateAntiDebugChecksum(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString("hex");
  const combined = `${timestamp}:${random}`;
  return crypto.createHash("sha256").update(combined).digest("hex");
}

export function verifyAntiDebugChecksum(checksum: string, maxAgeMs: number = 5000): boolean {
  try {
    const parts = checksum.split(":");
    if (parts.length !== 2) return false;
    
    const timestamp = parseInt(parts[0]);
    const age = Date.now() - timestamp;
    
    if (age > maxAgeMs) return false;
    
    const random = parts[1];
    const combined = `${timestamp}:${random}`;
    const calculated = crypto.createHash("sha256").update(combined).digest("hex");
    
    return calculated === checksum;
  } catch {
    return false;
  }
}

export function generateDeviceFingerprint(data: {
  userAgent?: string;
  language?: string;
  platform?: string;
  screenResolution?: string;
  timezone?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
}): string {
  const fingerprintString = JSON.stringify({
    ...data,
    timestamp: Date.now(),
    salt: crypto.randomBytes(8).toString("hex")
  });
  return crypto.createHash("sha256").update(fingerprintString).digest("hex");
}

export function calculateIntegrityChecksum(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function generateChallengeToken(): { token: string; answer: string } {
  const a = Math.floor(Math.random() * 10000);
  const b = Math.floor(Math.random() * 10000);
  const answer = (a + b).toString();
  const token = Buffer.from(`${a}:${b}:${Date.now()}`).toString("base64");
  return { token, answer };
}

export function verifyChallengeToken(token: string, answer: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    
    const a = parseInt(parts[0]);
    const b = parseInt(parts[1]);
    const timestamp = parseInt(parts[2]);
    
    const expectedAnswer = (a + b).toString();
    const age = Date.now() - timestamp;
    
    return expectedAnswer === answer && age < 10000;
  } catch {
    return false;
  }
}

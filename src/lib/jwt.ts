import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "TfgIC1qJjWoGRLtQABuOham76kM8l4USDpcEdinNzxPevXY3yb2r9sHZ0VK5Fw";

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  plan: string;
}

export function signToken(payload: JWTPayload, expiresIn: string = "7d"): string {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

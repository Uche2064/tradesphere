import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN);
const JWT_REFRESH_EXPIRES_IN = Number(process.env.JWT_REFRESH_EXPIRES_IN);

export interface JWTPayload {
  userId: string;
  email: string;
  companyId: string | null;
  roleId: string;
  roleName: string;
}

/**
 * Génère un token JWT d'accès
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  } as SignOptions);
}

/**
 * Génère un token JWT de rafraîchissement
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET!, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    algorithm: "HS256",
  } as SignOptions);
}

/**
 * Vérifie et décode un token JWT d'accès
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET!, { algorithms: ["HS256"] }) as JWTPayload;
  } catch {
    throw Error("Token invalide ou expiré");
  }
}

/**
 * Vérifie et décode un token JWT de rafraîchissement
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET!, { algorithms: ["HS256"] }) as JWTPayload;
  } catch {
    throw Error("Token de rafraîchissement invalide ou expiré");
  }
}

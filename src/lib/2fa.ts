import speakeasy from "speakeasy";
import qrcode from "qrcode";

const APP_NAME = process.env.TWO_FACTOR_APP_NAME || "TradeSphere";

/**
 * Génère un secret 2FA pour l'utilisateur
 */
export function generate2FASecret(userEmail: string) {
  const secret = speakeasy.generateSecret({
    name: `${APP_NAME} (${userEmail})`,
    issuer: APP_NAME,
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

/**
 * Génère un QR code pour l'application d'authentification
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    throw new Error("Impossible de générer le QR code");
  }
}

/**
 * Vérifie un code TOTP (Time-based One-Time Password)
 */
export function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // Accepte les codes ±2 intervalles (60 secondes)
  });
}

/**
 * Génère un code de backup (pour récupération en cas de perte du téléphone)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = speakeasy.generateSecret({ length: 10 }).base32.substring(0, 8);
    codes.push(code);
  }
  return codes;
}

/**
 * Génère un code OTP temporaire pour 2FA par email/SMS
 */
export function generateTemporaryOTP(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Valide la durée de vie d'un OTP
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

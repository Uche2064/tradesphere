import QRCode from "qrcode";
import crypto from "crypto";
import speakeasy from "speakeasy";

const DEFAULT_ISSUER = "TradeSphere";

export function generateTOTPSecret(
  email: string,
  issuer: string = DEFAULT_ISSUER
): { secret: string; otpauthUrl: string } {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `${issuer}:${email}`,
    issuer,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || "",
  };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    throw error;
  }
}

export async function verifyTOTP(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1, // légère tolérance de décalage
    });
  } catch (error) {
    console.error("Erreur lors de la vérification TOTP:", error);
    return false;
  }
}

export async function setupTOTPForUser(
  email: string,
  issuer: string = DEFAULT_ISSUER
): Promise<{
  secret: string;
  qrCode: string;
  otpauthUrl: string;
}> {
  const { secret, otpauthUrl } = generateTOTPSecret(email, issuer);
  const qrCode = await generateQRCode(otpauthUrl);

  return {
    secret,
    qrCode,
    otpauthUrl,
  };
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(code);
  }

  return codes;
}

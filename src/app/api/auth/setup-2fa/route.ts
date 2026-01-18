import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import prisma from "../../../../../lib/prisma";
import { generateQRCode, generateTOTPSecret } from "@/lib/otp";

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    const {secret, otpauthUrl} = generateTOTPSecret(email);
    const user = await prisma.user.findUnique({ 
        where: { email: email },
        include: { role: true },
    });
    if (!user) {
        return NextResponse.json("User not found", { status: 400 });
    }
    if(user && user.isTwoFactor) {
        return NextResponse.json("2FA already enabled", { status: 400 });
    }

    if(otpauthUrl) {
       const qrCode = await generateQRCode(otpauthUrl);
       return NextResponse.json({ message: "QR Code généré", qrCode }, { status: 200 });
    }
}

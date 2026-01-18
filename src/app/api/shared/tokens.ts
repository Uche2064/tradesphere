import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { User } from "../../../../generated/prisma/client";

const generateTokens = async (user: User, roleName: string) => {
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    companyId: user.companyId ?? null,
    roleId: user.roleId,
    roleName: roleName,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    companyId: user.companyId ?? null,
    roleId: user.roleId,
    roleName: roleName,
  });

  return { accessToken, refreshToken };
};

export default generateTokens;

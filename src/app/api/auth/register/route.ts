import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/register
 * TODO: Implement user registration
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Registration not yet implemented" },
    { status: 501 }
  );
}

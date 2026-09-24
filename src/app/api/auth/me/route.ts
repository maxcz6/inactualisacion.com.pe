import { NextRequest, NextResponse } from "next/server";
import { verificarToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const usuario = await verificarToken(token);
  if (!usuario) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: usuario });
}

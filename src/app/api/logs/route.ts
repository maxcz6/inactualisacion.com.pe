import { NextResponse } from "next/server";
import { getLogs } from "@/server/repositories/log.repository";
import { verificarToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }
    
    const usuario = await verificarToken(token);
    if (!usuario || usuario.rol !== "superadmin") {
      return NextResponse.json({ success: false, error: "No autorizado. Requiere rol superadmin." }, { status: 403 });
    }

    const logs = await getLogs(100);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

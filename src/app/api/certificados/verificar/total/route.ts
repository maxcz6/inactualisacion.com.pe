import { NextResponse } from "next/server";
import { supabase } from "@/server/database/supabase";

/**
 * GET /api/certificados/verificar/total
 * Retorna el total de participantes registrados.
 */
export async function GET() {
  try {
    const db = supabase();
    const { count, error } = await db
      .from("participantes")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return NextResponse.json({ total: count ?? 0 });
  } catch (err) {
    console.error("[/api/certificados/verificar/total]", err);
    return NextResponse.json({ total: 0 });
  }
}

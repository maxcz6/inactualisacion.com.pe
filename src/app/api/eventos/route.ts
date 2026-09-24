import { NextRequest, NextResponse } from "next/server";
import * as eventoRepo from "@/server/repositories/evento.repository";
import { eventoSchema } from "@/server/validators/evento.schema";

export async function GET() {
  try {
    const eventos = await eventoRepo.findAll();
    return NextResponse.json({ success: true, data: eventos });
  } catch (err) {
    console.error("[GET /api/eventos]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = eventoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const nuevo = await eventoRepo.create(parsed.data);
    return NextResponse.json({ success: true, data: nuevo }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

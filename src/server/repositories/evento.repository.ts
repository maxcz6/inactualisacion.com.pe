import "server-only";
import { supabase } from "@/server/database/supabase";
import type { Evento } from "@/types/evento";

export async function findAll(): Promise<Evento[]> {
  const db = supabase();
  const { data, error } = await db
    .from("eventos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Evento[];
}

export async function findById(id: string): Promise<Evento | null> {
  const db = supabase();
  const { data, error } = await db
    .from("eventos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Evento | null;
}

export async function create(input: Omit<Evento, "id" | "created_at">): Promise<Evento> {
  const db = supabase();
  const { data, error } = await db
    .from("eventos")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Evento;
}

export async function update(
  id: string,
  input: Partial<Omit<Evento, "id" | "created_at">>
): Promise<Evento> {
  const db = supabase();
  const { data, error } = await db
    .from("eventos")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Evento;
}

export async function remove(id: string): Promise<void> {
  const db = supabase();
  const { error } = await db.from("eventos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

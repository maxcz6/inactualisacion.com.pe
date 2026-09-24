import "server-only";
import { supabase } from "@/server/database/supabase";
import type { Perfil } from "@/types/perfil";

export async function findByEmail(email: string): Promise<Perfil | null> {
  const db = supabase();
  const { data, error } = await db
    .from("perfiles")
    .select("*")
    .eq("email", email)
    .eq("activo", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Perfil | null;
}

export async function findById(id: string): Promise<Perfil | null> {
  const db = supabase();
  const { data, error } = await db
    .from("perfiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Perfil | null;
}

export async function findAll(): Promise<Perfil[]> {
  const db = supabase();
  const { data, error } = await db
    .from("perfiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Perfil[];
}

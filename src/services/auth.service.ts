import type { LoginInput } from "@/server/validators/auth.schema";

export async function login(
  credenciales: LoginInput
): Promise<{ success: boolean; token?: string; error?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  });
  return res.json();
}

export async function logout(): Promise<{ success: boolean }> {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });
  return res.json();
}

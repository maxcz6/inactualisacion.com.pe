import "server-only";

type SheetAction = "list" | "insert" | "insertMany" | "update" | "delete" | "deleteMany";

interface SheetResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function sheetRequest<T>(
  action: SheetAction,
  payload: Record<string, unknown>
): Promise<T> {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!url || !secret) {
    throw new Error("Faltan APPS_SCRIPT_URL o APPS_SCRIPT_SECRET en las variables de entorno");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, action, secret }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Apps Script respondió con HTTP ${response.status}`);
  }

  const result = (await response.json()) as SheetResponse<T>;
  if (!result.success || result.data === undefined) {
    throw new Error(result.error || "Respuesta inválida de Apps Script");
  }
  return result.data;
}

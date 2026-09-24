import { SignJWT, jwtVerify } from "jose";

/**
 * Módulo criptográfico JWT con la librería "jose".
 * Compatible con Node.js y Next.js Edge Runtime / Middleware.
 */

const getJwtSecretKey = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    // Si no está configurado, usar clave de respaldo para desarrollo
    return new TextEncoder().encode("clave_secreta_jwt_idexsam_2026_super_segura_32_bytes");
  }
  return new TextEncoder().encode(secret);
};

export interface UsuarioTokenPayload {
  id: string;
  email: string;
  rol: "admin" | "superadmin";
  nombre?: string | null;
}

/**
 * Crea y firma criptográficamente un token JWT con algoritmo HS256.
 * Expira en 7 días.
 */
export async function firmarToken(payload: UsuarioTokenPayload): Promise<string> {
  const secretKey = getJwtSecretKey();

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(payload.id)
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Valida la firma criptográfica y la expiración del token JWT con "jose".
 * Retorna el payload del usuario o null si es inválido o ha expirado.
 */
export async function verificarToken(token: string): Promise<UsuarioTokenPayload | null> {
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    return {
      id: (payload.sub as string) || (payload.id as string),
      email: payload.email as string,
      rol: payload.rol as "admin" | "superadmin",
      nombre: (payload.nombre as string) || null,
    };
  } catch (error) {
    // Token alterado, expirado o firma inválida
    return null;
  }
}

# Validador de Certificados — IDEX SAM

Sistema oficial de validación y gestión de certificados del **IESTP Santiago Antúnez de Mayolo** · PE Diseño y Programación Web.

---

## Arquitectura

```
USUARIO
   │ HTTPS
   ▼
┌─────────────────────────────────────┐
│  FRONTEND (Navegador)               │
│  src/app/(frontend)/                │
│  src/components/                    │
│  • Página pública de verificación   │
│  • Panel admin (login/dashboard)    │
│  ❌ No conoce Supabase              │
└──────────────┬──────────────────────┘
               │ fetch() REST/JSON
               ▼
┌─────────────────────────────────────┐
│  API  — Next.js Route Handlers      │
│  src/app/api/                       │
│  GET  /api/certificados/verificar   │
│  GET  /api/certificados             │
│  POST /api/certificados             │
│  PUT  /api/certificados/[id]        │
│  DELETE /api/certificados/[id]      │
│  GET  /api/eventos                  │
│  GET  /api/participantes            │
│  POST /api/auth/login               │
└──────────────┬──────────────────────┘
               │ server-only
               ▼
┌─────────────────────────────────────┐
│  BACKEND                            │
│  src/server/services/               │
│  src/server/repositories/           │
│  src/server/validators/  (Zod)      │
│  ✅ Lógica de negocio               │
│  ✅ Acceso a Supabase               │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│  SUPABASE (PostgreSQL)              │
│  eventos / participantes / perfiles │
└─────────────────────────────────────┘
```

### Regla principal

```
Frontend  ──X──▶  Supabase     ← PROHIBIDO
Frontend  ──▶  /api/...  ──▶  Backend  ──▶  Supabase   ← CORRECTO
```

---

## Estructura de carpetas

```
src/
├── app/
│   ├── (frontend)/              ← páginas públicas y admin
│   │   ├── page.tsx             ← verificador público
│   │   ├── verificar/
│   │   └── admin/
│   │       ├── login/
│   │       ├── dashboard/
│   │       ├── certificados/
│   │       ├── participantes/
│   │       └── eventos/
│   │
│   └── api/                     ← Route Handlers (backend)
│       ├── certificados/
│       │   ├── route.ts         GET lista / POST crear
│       │   ├── [id]/route.ts    GET / PUT / DELETE
│       │   └── verificar/
│       │       └── route.ts     GET público por DNI
│       ├── participantes/
│       ├── eventos/
│       ├── usuarios/
│       └── auth/
│           ├── login/
│           └── logout/
│
├── components/
│   ├── certificados/
│   │   ├── FormularioBusqueda.tsx
│   │   └── ResultadoCertificado.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── WatermarkBg.tsx
│
├── server/                      ← SOLO SERVIDOR (server-only)
│   ├── database/supabase.ts
│   ├── repositories/
│   │   ├── participante.repository.ts
│   │   ├── evento.repository.ts
│   │   └── usuario.repository.ts
│   └── validators/
│       ├── participante.schema.ts
│       ├── evento.schema.ts
│       └── auth.schema.ts
│
├── services/                    ← clientes HTTP del frontend
│   ├── certificado.service.ts
│   └── auth.service.ts
│
└── types/
    ├── participante.ts
    ├── evento.ts
    └── perfil.ts
```

---

## Base de datos (Supabase / PostgreSQL)

```sql
-- Eventos (seminarios, talleres, etc.)
CREATE TABLE public.eventos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_base VARCHAR NOT NULL UNIQUE,
  nombre      VARCHAR NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Participantes = certificados emitidos
CREATE TABLE public.participantes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id  UUID REFERENCES public.eventos(id),
  dni        VARCHAR NOT NULL,
  nombre     VARCHAR NOT NULL,
  condicion  VARCHAR NOT NULL CHECK (condicion IN ('Asistente','Ponente','Organizador')),
  codigo     VARCHAR NOT NULL UNIQUE,
  verificado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_participantes_dni    ON participantes(dni);
CREATE INDEX idx_participantes_codigo ON participantes(codigo);

-- Perfiles de administrador (vinculados a Supabase Auth)
CREATE TABLE public.perfiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id),
  email      VARCHAR NOT NULL,
  nombre     VARCHAR,
  rol        VARCHAR NOT NULL CHECK (rol IN ('admin','superadmin')),
  activo     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Stack tecnológico

| Capa       | Tecnología                        |
|------------|-----------------------------------|
| Framework  | Next.js 15 (App Router)           |
| Frontend   | React 18 + TypeScript             |
| Estilos    | Tailwind CSS v4                   |
| API        | Next.js Route Handlers (REST)     |
| Validación | Zod                               |
| Seguridad  | JWT (jose HS256) + Middleware     |
| Backend    | Services + Repositories           |
| Base datos | Supabase (PostgreSQL)             |
| Hosting    | Vercel                            |

---

## Variables de entorno

Copie `.env.example` como `.env.local` y rellene:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Solo servidor — nunca NEXT_PUBLIC_
SUPABASE_ANON_KEY=eyJ...
AUTH_SECRET=<hex aleatorio 64 chars>
NEXTAUTH_URL=http://localhost:3000
```

> ⚠️ **Nunca** usar `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`. La SERVICE_ROLE_KEY solo vive en el servidor.

---

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables
cp .env.example .env.local
# Editar .env.local con sus credenciales Supabase

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Despliegue en Vercel

```
GitHub
  └── validador-certificados
          │
          ▼
       Vercel
       ├── Frontend  (SSR)
       └── API REST  (Edge/Node)
                │
                ▼
           Supabase
           PostgreSQL
```

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Agregar variables de entorno en **Settings → Environment Variables**
3. Vercel detecta Next.js automáticamente → `npm run build`

---

## Flujo de verificación pública

```
Usuario escribe DNI
       ↓
FormularioBusqueda.tsx  (Client Component)
       ↓ fetch()
GET /api/certificados/verificar?dni=12345678
       ↓
route.ts → valida con Zod
       ↓
participante.repository.ts
       ↓ supabase.from("participantes").select(...)
Supabase PostgreSQL
       ↓
JSON: { success: true, data: [...] }
       ↓
ResultadoCertificado.tsx  → muestra tarjetas
```

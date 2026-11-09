# Validador de Certificados — IDEX SAM

Aplicación Next.js para administrar eventos y participantes, y verificar certificados. Los datos se guardan en Google Sheets; el acceso se realiza desde el backend de Next.js hacia una Web App de Google Apps Script. El navegador nunca recibe la URL ni el secreto de Apps Script.

## Pestañas y encabezados

Pega estos encabezados en la fila 1 de cada pestaña, respetando el orden y los nombres. El método `setupSheets()` del script también puede crear las pestañas y encabezados automáticamente.

| Pestaña | Encabezados |
|---|---|
| `eventos` | `id`, `codigo_base`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `created_at` |
| `participantes` | `id`, `evento_id`, `dni`, `nombre`, `condicion`, `codigo`, `verificado`, `created_at` |
| `perfiles` | `id`, `email`, `nombre`, `rol`, `activo`, `created_at`, `updated_at` |
| `credenciales` | `id`, `email`, `password_hash`, `password_salt`, `created_at`, `updated_at` |
| `logs` | `id`, `usuario_email`, `accion`, `detalle`, `created_at` |

`perfiles` conserva los datos y roles de administrador. Las credenciales van aparte: nunca se guarda la contraseña en texto plano; la aplicación guarda un hash PBKDF2 y una sal aleatoria en `credenciales`. Los valores `id` de `perfiles` y `credenciales` deben coincidir.

## Configurar Apps Script

1. Crea una hoja de cálculo y abre **Extensiones → Apps Script**.
2. Copia el contenido de [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) en `Code.gs`.
3. En **Configuración del proyecto → Propiedades de secuencia de comandos**, agrega:
   - `SPREADSHEET_ID`: el ID entre `/d/` y `/edit` en la URL de tu hoja.
   - `API_SECRET`: una clave aleatoria larga. Usa el mismo valor en `APPS_SCRIPT_SECRET` de Next.js.
4. Ejecuta `setupSheets()` una vez desde el editor y acepta los permisos solicitados.
5. Ve a **Implementar → Nueva implementación → Aplicación web**. Selecciona **Ejecutar como: yo** y permite el acceso de **Cualquier persona** para que el servidor de Next.js pueda invocarla. El secreto `API_SECRET` protege las operaciones. Copia la URL terminada en `/exec`.

El secreto se valida en cada petición. No publiques la hoja ni incluyas `API_SECRET` en variables `NEXT_PUBLIC_*`.

## Configurar la aplicación

Copia `.env.example` a `.env.local` y configura:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/ID_DE_IMPLEMENTACION/exec
APPS_SCRIPT_SECRET=el_mismo_API_SECRET_del_script
AUTH_SECRET=un_secreto_aleatorio_de_al_menos_32_caracteres
BOOTSTRAP_ADMIN_SECRET=un_secreto_temporal_para_crear_el_primer_superadmin
```

Inicia el proyecto y crea el primer administrador. En PowerShell:

```powershell
$body = @{
  secret = "el_valor_de_BOOTSTRAP_ADMIN_SECRET"
  email = "admin@institucion.edu.pe"
  nombre = "Administrador"
  password = "una_contrasena_de_al_menos_8_caracteres"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/bootstrap" `
  -Method Post -ContentType "application/json" -Body $body
```

El alta inicial solo está disponible mientras `perfiles` no tenga registros. Después de crear el superadmin, elimina `BOOTSTRAP_ADMIN_SECRET` de `.env.local` y de las variables de producción. Los administradores adicionales se crean desde el panel y reciben una contraseña nueva; el ingreso normal es por el formulario de correo y contraseña.

Las contraseñas de Supabase Auth no se pueden recuperar ni copiar a este formato. Para migrar los datos existentes:

1. Crea las pestañas y encabezados, y registra el superadmin inicial.
2. Copia las filas de `eventos` y luego `participantes`, conservando los IDs y los valores de `evento_id`. Mantén `dni`, `codigo` e IDs como texto para evitar que Sheets cambie su formato.
3. Crea los demás perfiles desde el panel para que cada uno tenga una contraseña nueva y segura. No copies contraseñas ni hashes de Supabase Auth.
4. Copia las filas de `logs` si necesitas conservar el historial.

## Desarrollo y despliegue

```bash
npm install
npm run dev
```

En Vercel, configura `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET` y `AUTH_SECRET`. `BOOTSTRAP_ADMIN_SECRET` solo se necesita temporalmente para el primer superadmin. No uses la base de datos de Google Sheets para cargas de alta concurrencia: tiene cuotas y no ofrece las transacciones de una base de datos relacional.

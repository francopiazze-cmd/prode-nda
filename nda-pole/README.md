# NDA Pole — sitio de reservas

Web **mobile-first** para que una profe de pole dance publique su disponibilidad
y sus alumnas reserven clases. Pensada para colgar en el Linktree del Instagram.

> ⚠️ Este proyecto está adentro de la carpeta `nda-pole/` del repo `prode-nda`
> sólo por una limitación temporal. Es **100% autocontenido**: podés moverlo a su
> propio repositorio cuando quieras (copiando la carpeta o con `git mv`), no
> depende de nada de afuera.

## Qué hace

- Landing con un botón grande **"Programá tu clase"**.
- Botones modernos de modalidad: **Presencial** y **Virtual** (calendarios separados).
- Cada uno abre la **disponibilidad real** (elegís día y horario).
- Reserva con datos básicos (**nombre, teléfono, email**) que se **autocompletan**
  en el celular de la alumna (se recuerdan en su navegador).
- Al confirmar, la alumna agrega la clase a su calendario con un toque
  (**Google Calendar** o **.ics** para Apple/otros).
- La dueña recibe la reserva en su calendario mediante un **feed suscribible**
  que se actualiza solo, y opcionalmente un **email de aviso** por cada reserva.
- Panel privado en **`/admin`** para cargar/editar horarios y ver reservas.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres).
Sin OAuth ni integraciones pesadas.

## Modo demo (para previsualizar ya)

Si **no** configurás Supabase, el sitio arranca igual con turnos de ejemplo en
memoria (se reinician al reiniciar el server). Sirve para ver el diseño y el flujo.
Para datos reales que persistan, configurá Supabase (abajo).

## Puesta en marcha

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
   Para modo demo podés dejar Supabase vacío. Configurá al menos
   `ADMIN_PASSWORD` y `OWNER_FEED_TOKEN`.
3. Correr local:
   ```bash
   npm run dev
   ```
   - Sitio público: http://localhost:3000
   - Panel de la dueña: http://localhost:3000/admin

## Configurar Supabase (datos reales)

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, pegar y correr `supabase/schema.sql`.
3. En **Project Settings → API**, copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (¡secreta! sólo en el server)
4. Reiniciar el server. Listo: las reservas ahora persisten.

## Calendario de la dueña (se actualiza solo)

La dueña se suscribe **una sola vez** a un calendario que va sumando las reservas:

```
webcal://TU-DOMINIO/api/calendar/feed?token=EL_OWNER_FEED_TOKEN
```

- **iPhone:** Ajustes → Calendario → Cuentas → Añadir cuenta → Otra →
  Añadir calendario suscrito → pegar la URL.
- **Google Calendar:** "Otros calendarios" → "Desde URL" → pegar la URL
  (usá `https://` en vez de `webcal://`).

El celular lo refresca periódicamente y van apareciendo las reservas nuevas con
el nombre y contacto de cada alumna.

## Avisos por email (opcional)

Si cargás `RESEND_API_KEY` y `OWNER_EMAIL` (cuenta gratis en
[resend.com](https://resend.com)), la dueña recibe un mail por cada reserva.
Si lo dejás vacío, no pasa nada: la reserva igual se guarda.

## Deploy en Vercel

1. Subir el repo a GitHub.
2. Importar en [vercel.com](https://vercel.com). Si el proyecto vive en
   `nda-pole/`, setear **Root Directory = `nda-pole`**.
3. Cargar las variables de entorno (las de `.env.example`).
4. Deploy. Apuntar el dominio y pegar el link en el Linktree.

## Personalizar

- Nombre, Instagram, textos, zona horaria, duración por defecto:
  editar `src/lib/config.ts`.
- Foto principal: `public/fotos/hero.jpg` (ver `public/fotos/README.md`).
- Colores: `tailwind.config.ts` (paleta pastel ya cargada).

# Candela Pole — sitio de reservas

Web **mobile-first** para que Candela (profe de pole dance) publique su
disponibilidad y sus alumnas reserven clases. Pensada para colgar en el Linktree
del Instagram.

> ⚠️ Por ahora esta carpeta (`candela-pole-web/`) vive dentro del repo `prode-nda`
> sólo por una limitación temporal. Es **100% autocontenida**: podés moverla a su
> propio repositorio cuando quieras, no depende de nada de afuera. Ver
> "Sacar a su propio repo" más abajo.

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
2. Importar en [vercel.com](https://vercel.com). Si todavía está dentro de
   `prode-nda`, setear **Root Directory = `candela-pole-web`**.
3. Cargar las variables de entorno (las de `.env.example`).
4. Deploy. Apuntar el dominio y pegar el link en el Linktree.

## Sacar a su propio repo

Esta carpeta es independiente. Para que viva en su propio repositorio
`candela-pole-web` (recomendado), desde la raíz del repo `prode-nda`:

```bash
# 1. Copiá la carpeta a un lugar nuevo, fuera de prode-nda
cp -r candela-pole-web ~/candela-pole-web
cd ~/candela-pole-web

# 2. Arrancá un repo git limpio
git init
git add .
git commit -m "Candela Pole — sitio de reservas"

# 3. Creá un repo vacío en GitHub llamado candela-pole-web y conectalo
git remote add origin https://github.com/TU-USUARIO/candela-pole-web.git
git branch -M main
git push -u origin main
```

Listo: a partir de ahí trabajás desde el repo nuevo, sin nada de `prode-nda`.

## Personalizar

- Nombre, Instagram, textos, zona horaria, duración por defecto:
  editar `src/lib/config.ts`.
- Foto principal: `public/fotos/hero.jpg` (ver `public/fotos/README.md`).
- Colores: `tailwind.config.ts` (paleta pastel ya cargada).

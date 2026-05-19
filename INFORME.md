# PRODE NDA — Informe completo del proyecto

> **Mundial 2026 · Prode oficial de NDA Asesores de Seguros**
> Documentación operativa para Franco Piazze
> Última actualización: 19 de mayo 2026

---

## Marca

**Paleta oficial (brandbook NDA 15/08/2023):**

| Color | Hex | Uso |
|---|---|---|
| Azul corporativo | `#182aa4` | Botones principales, links, acentos |
| Cyan | `#4aeaea` | Curvas del logo, highlights "en vivo" |
| Verde menta | `#00ffa1` | Acento secundario, ✓ de completado |
| Azul oscuro | `#0a1452` | Texto principal, fondos hero |
| Off-white | `#F5F7FB` | Fondos suaves, separadores |

**Tipografía:** Inter (sistema fallback)

---

## 1. ¿Qué es el proyecto?

Es una web donde la gente entra, se registra y elige el resultado de cada partido del Mundial 2026. Cuanto más le pegan a los resultados reales, más puntos suman. El que termina arriba en el ranking al final del Mundial se lleva una Smart TV, segundo lugar una cafetera Nespresso, tercero una cena en Kansas y hay sorteos semanales de pelotas oficiales.

**El objetivo de negocio** es generar engagement con clientes actuales y captar leads de gente que todavía no es cliente de NDA. Los datos que recopilamos (mail, teléfono, provincia, qué seguros tiene) sirven para acciones comerciales después del Mundial.

**Fechas clave:**
- 11 de junio 2026 → arranca el Mundial
- 19 de julio 2026 → final
- Los pronósticos cierran 5 minutos antes de cada partido

---

## 2. Servicios y cuentas (todos los links que necesitás)

### 🟢 Supabase — base de datos + autenticación

**Link al dashboard:** https://supabase.com/dashboard/project/zzjbvqhhrmrophysfntb

**Login:** entrá con la cuenta de Google que usaste para crearlo (francopiazze@gmail.com).

**Qué hace:** guarda todos los usuarios, sus pronósticos, los resultados de los partidos y calcula el ranking.

**Secciones que vas a usar:**
- **Authentication → Users:** ver todos los usuarios registrados → https://supabase.com/dashboard/project/zzjbvqhhrmrophysfntb/auth/users
- **Table Editor → profiles:** ver los perfiles completos → https://supabase.com/dashboard/project/zzjbvqhhrmrophysfntb/editor
- **SQL Editor:** para hacer consultas custom → https://supabase.com/dashboard/project/zzjbvqhhrmrophysfntb/sql/new
- **URL Configuration:** dominio autorizado → https://supabase.com/dashboard/project/zzjbvqhhrmrophysfntb/auth/url-configuration

**Configuración importante:**
- Site URL: `https://prode.ndasesores.com.ar`
- Redirect URLs: `https://prode.ndasesores.com.ar/**`
- Email confirmation: **DESACTIVADO** (si lo activás, los registros se rompen)

---

### 🟣 Vercel — hosting de la web

**Link al dashboard:** https://vercel.com/francopiazze-s-projects/prode-nda

**Login:** con Google (francopiazze@gmail.com)

**Qué hace:** la web está alojada acá. Cada vez que pusheás un cambio a GitHub, Vercel lo deploya automáticamente.

**Secciones que vas a usar:**
- **Deployments:** ver cada deploy (verde = OK, rojo = error) → https://vercel.com/francopiazze-s-projects/prode-nda/deployments
- **Settings → Environment Variables:** las claves secretas (Supabase, Resend, etc.) → https://vercel.com/francopiazze-s-projects/prode-nda/settings/environment-variables
- **Settings → Domains:** dominios conectados → https://vercel.com/francopiazze-s-projects/prode-nda/settings/domains
- **Settings → Cron Jobs:** los procesos automáticos → https://vercel.com/francopiazze-s-projects/prode-nda/settings/cron-jobs

**Plan actual:** Hobby (gratis). **Limitación:** los cron jobs corren UNA vez por día. Si querés que se actualicen los resultados en tiempo real, hay que pasar a Pro (~USD 20/mes).

---

### ⚫ GitHub — código fuente

**Link al repo:** https://github.com/francopiazze-cmd/prode-nda

**Login:** con tu cuenta GitHub (francopiazze-cmd)

**Qué hace:** acá vive el código. Cuando se modifica algo, los cambios se suben acá y Vercel los toma para hacer el deploy.

---

### 🟠 Cloudflare — DNS del dominio

**Link:** https://dash.cloudflare.com → seleccionar `ndasesores.com.ar`

**Qué hace:** maneja a qué servidor apunta `prode.ndasesores.com.ar`.

**Configuración:**
- Tipo: `CNAME`
- Nombre: `prode`
- Valor: `9d1a2f6d5ff2e23f.vercel-dns-017.com`
- Modo: **DNS only** (no proxied)

No tendrías que volver a tocarlo a menos que cambies de hosting.

---

### 🔵 Resend — envío de emails

**Link:** https://resend.com

**Login:** con la cuenta que creaste

**Qué hace:** manda los mails de bienvenida cuando alguien se registra.

**API Key:** ya está cargada en Vercel como variable de entorno.

**Dominio verificado:** `ndasesores.com.ar` → desde ahí se mandan los mails (`prode@ndasesores.com.ar`)

---

### ⚽ football-data.org — resultados del Mundial

**Link:** https://www.football-data.org/

**Qué hace:** API que nos da los fixtures (partidos programados) y los resultados reales del Mundial. La consultamos con cron jobs automáticos.

**API Key:** ya está cargada en Vercel.

**Plan actual:** gratis (limitado, pero suficiente para el Mundial)

---

### 🔴 Google Cloud Console — OAuth (no se usa actualmente)

**Link:** https://console.cloud.google.com

Lo configuramos para Login con Google, pero después decidimos sacarlo y dejar solo mail + contraseña. Las credenciales quedaron creadas pero no se usan. No hace falta tocar nada.

---

## 3. Variables de entorno (las claves secretas)

Están todas cargadas en Vercel. Para qué sirve cada una:

| Variable | Para qué sirve |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública para que el navegador hable con Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave **secreta** para operaciones administrativas (crear perfiles, validar clientes) |
| `FOOTBALL_DATA_API_KEY` | Clave de football-data.org para traer fixtures y resultados |
| `FOOTBALL_DATA_COMPETITION` | Código del torneo: `WC` (World Cup) |
| `RESEND_API_KEY` | Clave para mandar mails con Resend |
| `RESEND_FROM_EMAIL` | Dirección que figura como remitente: `prode@ndasesores.com.ar` |
| `CRON_SECRET` | Clave que Vercel usa para llamar a los cron jobs (evita que alguien externo los dispare) |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app: `https://prode.ndasesores.com.ar` |

---

## 4. Estructura de la web (qué hay en cada página)

| URL | Quién accede | Para qué sirve |
|---|---|---|
| `/` | Cualquiera | Landing page con copy, premios, CTA para registrarse |
| `/registro` | No logueados | Formulario para crear cuenta |
| `/registro?ref=ABC123` | No logueados | Mismo formulario, pero con referido cargado |
| `/login` | No logueados | Ingreso con mail + contraseña |
| `/jugar` | Logueados | Carga de pronósticos por grupo y eliminatorias |
| `/perfil` | Logueados | Editar datos personales, cerrar sesión |
| `/ranking` | Logueados | Tabla de posiciones (top 200) |
| `/r/[code]` | Cualquiera | Link de referido → redirige a `/registro?ref=...` |
| `/admin` | Solo vos | Validar clientes NDA → +20 puntos |
| `/legal/privacidad` | Cualquiera | Política de privacidad |
| `/legal/bases` | Cualquiera | Bases y condiciones |

---

## 5. Cómo funciona cada flujo

### Registro de un usuario nuevo

1. Persona entra a `prode.ndasesores.com.ar/registro`
2. Completa: nombre, mail, contraseña, WhatsApp, provincia, seguros que tiene, si es cliente NDA
3. Acepta políticas → click en "Crear cuenta"
4. Internamente:
   - Se crea el usuario en Supabase Auth (mail + contraseña encriptada)
   - Se crea el perfil completo en la tabla `profiles`
   - Se genera un código de referido único (6 caracteres)
   - Si vino con `?ref=XYZ`, se vincula con el referidor
   - Resend manda un mail de bienvenida con las reglas, premios y link de referido propio
5. Lo redirigimos a `/jugar` y ya puede empezar a cargar pronósticos

### Cómo se cargan los pronósticos

1. Usuario logueado entra a `/jugar`
2. Por defecto, ve la **etapa actual del Mundial** (fase de grupos al inicio, eliminatorias después)
3. Elige el grupo (A, B, C...) o la fase (Octavos, Cuartos...)
4. Para cada partido escribe el resultado que cree que va a salir
5. Click en "Guardar" → queda guardado
6. Puede modificar el pronóstico hasta 5 minutos antes del kickoff
7. Cuando empieza el partido, se bloquea

### Cómo se calculan los puntos

| Acierto | Puntos |
|---|---|
| Resultado exacto en fase de grupos | 5 pts |
| Acertar ganador en fase de grupos | 2 pts |
| Resultado exacto en octavos/cuartos | 7 pts |
| Resultado exacto en semis | 10 pts |
| Resultado exacto en final/tercer puesto | 15 pts |
| Acertar partido con Argentina | +2 bonus |
| Ser cliente NDA validado | +20 al total |
| Cada amigo que invitás y se registra | +2 (hasta 10 amigos = 20 pts max) |
| Más de 10 referidos | Premio Embajador (no acumula al ranking) |

### Cómo se actualizan los resultados

Hay dos procesos automáticos (cron jobs) en Vercel:

1. **sync-fixtures** — corre todos los días a las 5am ARG
   - Pide a football-data.org la lista de partidos del Mundial
   - Los carga/actualiza en la base de datos
   - Si la FIFA cambia un horario o agrega un partido (eliminatorias), lo refleja

2. **score-matches** — corre todos los días a las 6am ARG
   - Pide a football-data.org los resultados reales
   - Para cada partido que terminó, calcula los puntos de cada pronóstico
   - Actualiza la tabla de posiciones (leaderboard)

**Limitación del plan Hobby:** corren UNA vez por día. Los resultados de los partidos del día se ven recién a la mañana siguiente. Si querés tiempo real (cada 5 min), upgrade a Vercel Pro.

### Cómo validás un cliente NDA (+20 puntos)

1. Entrás a `https://prode.ndasesores.com.ar/admin` (logueado con `francopiazze@gmail.com`)
2. Ves la lista de personas que marcaron "Soy cliente NDA" con su patente
3. Verificás contra tu sistema interno que efectivamente tiene póliza
4. Click en **"Validar ✓"** → se le suman 20 puntos al ranking automáticamente

Si entra cualquier otro usuario a `/admin`, lo redirige a `/jugar` sin mostrar nada.

---

## 6. Premios

1. 🥇 **Smart TV 50" 4K** — para el primer puesto del ranking
2. 🥈 **Cafetera Nespresso** — segundo puesto
3. 🥉 **Cena para 2 personas en Kansas** — tercer puesto
4. ⭐ **Premio Embajador** (auriculares premium o similar) — al que más amigos invita (>10)
5. ⚽ **Pelota oficial del Mundial** — sorteo semanal entre los top 10 (vía Instagram Stories, sin sistema técnico)

---

## 7. Tareas operativas durante el Mundial

### Diariamente (5 minutos)

- [ ] Entrar a `/admin` y validar nuevos clientes NDA que se hayan registrado
- [ ] Revisar el ranking general para detectar trampas (puntajes raros, mismos resultados sospechosos)

### Semanalmente

- [ ] Captura del top 10 → sorteo de pelota por Instagram Stories
- [ ] Anunciar ganador semanal en stories
- [ ] Hacer un post de novedades (mejor pronosticador, partido más acertado, etc.)

### Si algo se rompe

1. Mirar Vercel → Deployments → ¿hay alguno en rojo?
2. Mirar Supabase → ¿está activo el proyecto? (free tier se pausa por inactividad)
3. Mirar el dominio → `prode.ndasesores.com.ar` carga OK?

---

## 8. Cómo hacer cambios típicos

> Cualquier cambio en el código se hace por chat conmigo (Claude). Le pedís lo que querés y yo lo pusheo. Vercel deploya solo.

### Cambiar un texto del home

Decís: "cambiar el texto X por Y en la página principal" y listo.

### Agregar un país nuevo al mapa de banderas

Cuando aparezca una bandera blanca 🏳️ en algún partido, copiame el nombre exacto que ves en pantalla. Lo agrego al mapa en `MatchCard.tsx` en 30 segundos.

### Cambiar un premio

Decís cuál premio cambiar y por qué. Lo edito en `src/app/page.tsx` (la landing).

### Cambiar las reglas del puntaje

Las reglas viven en `src/lib/scoring.ts`. Decime cómo quedarían y las actualizo.

### Cambiar el mail de admin

Decís "que ahora el admin sea XXX@YYY.com" y lo cambio en dos archivos.

---

## 9. Problemas conocidos y troubleshooting

### "Invalid API key" al registrarse

→ Las variables de entorno de Supabase no están bien cargadas en Vercel.
→ Solución: ir a Vercel → Settings → Environment Variables y verificar que estén todas.

### Loop infinito al loguearse con Google

→ No aplica más, ya removimos Google OAuth.

### El registro se cuelga después de "Crear cuenta"

→ Posible causa: "Confirm email" activado en Supabase.
→ Solución: ir a Supabase → Authentication → Providers → Email → desactivar "Confirm email".

### Aparece una bandera blanca en lugar de la del país

→ El nombre del equipo que viene de football-data.org no está en nuestro mapa.
→ Solución: avisarme el nombre exacto y lo agrego.

### La extensión SSL del navegador rompe Supabase

→ En navegadores con muchas extensiones a veces da `ERR_SSL_BAD_RECORD_MAC_ALERT`.
→ Solución: probar en modo incógnito.

---

## 10. Estructura técnica (para Claude / desarrolladores)

**Stack:**
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend: API Routes de Next.js
- Base de datos: Supabase (Postgres)
- Auth: Supabase Auth (mail + contraseña)
- Hosting: Vercel
- Emails: Resend
- Datos del torneo: football-data.org

**Carpetas clave:**
```
src/
├── app/                    → Páginas de la web
│   ├── page.tsx            → Landing
│   ├── registro/           → Formulario de registro
│   ├── login/              → Login
│   ├── jugar/              → Carga de pronósticos
│   ├── perfil/             → Editar datos
│   ├── ranking/            → Tabla de posiciones
│   ├── admin/              → Panel para validar clientes NDA
│   ├── api/                → Endpoints internos
│   │   ├── create-profile/ → Crear perfil al registrarse
│   │   ├── send-welcome/   → Mandar mail de bienvenida
│   │   ├── admin/          → Endpoints del admin
│   │   └── cron/           → Procesos automáticos
│   └── auth/callback/      → (legacy, era para Google)
├── components/             → Piezas reutilizables (MatchCard, Header, etc.)
├── lib/                    → Lógica compartida
│   ├── supabase/           → Clientes de Supabase
│   ├── scoring.ts          → Cálculo de puntos
│   ├── football-api.ts     → Cliente de football-data.org
│   └── mail.ts             → Helpers de Resend
└── middleware.ts           → Control de acceso a rutas

supabase/
└── schema.sql              → Esquema completo de la DB

vercel.json                 → Configuración de Vercel (cron jobs)
```

**Tablas principales en Supabase:**

- `profiles` → datos de cada usuario (nombre, mail, teléfono, etc.)
- `teams` → selecciones del Mundial (Argentina, Brasil, etc.)
- `matches` → cada partido (cuándo, dónde, qué fase, resultado)
- `predictions` → pronósticos de cada usuario para cada partido
- `leaderboard` (view) → ranking calculado en tiempo real

---

## 11. Decisiones que tomamos y por qué

| Decisión | Motivo |
|---|---|
| Solo registro con mail + contraseña (sin Google) | Más simple, sin loops de OAuth, garantizamos teléfono obligatorio |
| Confirmación de email desactivada | UX más fluida, registro instantáneo |
| Ranking público solo dentro de la app (login requerido) | Privacidad de los usuarios |
| Cron jobs diarios (no en tiempo real) | Limitación del plan gratis de Vercel |
| Pato (mascota) en hero y premios | Identidad visual única, transmite cercanía |
| Validación manual de clientes NDA | Control humano, evita falsos positivos |
| Email del admin hardcodeado | Más simple que sistema de roles |

---

## 12. Próximos pasos / pendientes

- [ ] Confirmar modelos exactos de premios (TV, cafetera)
- [ ] Revisar bases y condiciones con abogado (legal)
- [ ] Subir el dominio del mail (Resend) verificación DNS
- [ ] Difusión: Instagram, mail a clientes, WhatsApp
- [ ] Pruebas con socios antes del 11 de junio
- [ ] Definir si se hace upgrade a Vercel Pro para resultados en tiempo real

---

## 13. Contacto y soporte

**Dueño del proyecto:** Franco Piazze · piazze@estudio-pyp.com.ar / francopiazze@gmail.com
**Empresa:** NDA Asesores de Seguros
**Dominio:** prode.ndasesores.com.ar

Para cualquier cambio técnico, abrir una conversación con Claude indicando qué se quiere modificar. Este documento se actualiza con cada cambio importante.

---

*Generado el 19/05/2026 — Mundial 2026 a 23 días del inicio*

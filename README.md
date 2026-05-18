# NDA Prode — Mundial 2026

Webapp de prode (predicción de resultados) del Mundial 2026 para NDA Asesores.

## Para qué es esto

Lead-gen + brand awareness para NDA Asesores (broker de seguros). Los usuarios juegan al prode, invitan amigos (referidos suman puntos), y el ganador se lleva una Smart TV. Mientras juegan, NDA captura datos de contacto, tipo de seguros que tienen contratados y consentimiento de marketing.

## Visión del producto

- Mobile-first (la mayoría va a entrar desde WhatsApp)
- Registro corto (mail + nombre + teléfono + provincia + qué seguros tiene)
- Cargar pronóstico de cada partido del Mundial
- Tabla de posiciones en vivo
- Link único de referidos por usuario
- Comunicación por mail durante el torneo
- Premio al ganador (TV) + premios menores opcionales

## Reglas del prode

- **Acertar ganador o empate:** 1 punto
- **Acertar ganador + diferencia de goles:** 3 puntos
- **Acertar resultado exacto:** 5 puntos
- **Bonus eliminatorias** (octavos en adelante): puntos x2
- **Referido confirmado** (se registra y juega al menos 1 partido): +2 puntos al referidor, hasta un máximo de 10 referidos (20 pts al ranking principal). Los referidos por encima de ese tope cuentan para el premio Embajador.
- **Bonus asegurado NDA** (única vez, al validar la póliza): +20 puntos al asegurado

### Bonus asegurado NDA

Al registrarse, el participante puede declararse cliente de NDA Seguros e ingresar la patente del vehículo asegurado (o número de póliza). El equipo de NDA valida manualmente contra el sistema interno; una vez confirmada, se setea el flag `nda_client_verified` en su profile y el leaderboard suma automáticamente +20 puntos a esa cuenta. El usuario no puede setear ese flag desde el cliente (trigger en el schema lo protege).

### Premios

- **1° puesto:** Smart TV 55" (modelo a definir).
- **2° puesto:** Cafetera Nespresso.
- **3° puesto:** Gift card cena en Kansas Nordelta.
- **Premio Embajador:** participante con mayor cantidad de referidos confirmados (sin tope). Premio a definir.

### Desempate (importante: por habilidad, no por azar)

1. Mayor cantidad de aciertos exactos
2. Mayor cantidad de aciertos en partidos de Argentina
3. Orden de registro (el que se anotó primero gana)

### Cierre de pronósticos

5 minutos antes del kickoff de cada partido. Después de eso no se puede cargar ni modificar.

## Stack técnico

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** para estilos
- **Supabase** (Postgres + Auth + Realtime)
- **Vercel** para hosting
- **football-data.org** para fixtures y resultados del Mundial 2026
- **Resend** para mails transaccionales

## Estructura del repo

```
nda-prode/
├── DEPLOY.md              # Instrucciones de deploy paso a paso
├── supabase/
│   └── schema.sql         # Schema de la base de datos (correr una vez)
├── src/
│   ├── app/               # Páginas (App Router de Next.js)
│   ├── components/        # Componentes React reutilizables
│   ├── lib/               # Lógica core (scoring, API de fútbol, Supabase clients)
│   └── middleware.ts      # Auth middleware
├── .env.example           # Variables de entorno requeridas
└── package.json
```

## Cómo arranca

Ver [DEPLOY.md](DEPLOY.md) para instrucciones completas.

Resumen rápido:
1. Crear cuentas en Supabase, Vercel, Resend, football-data.org
2. Correr `supabase/schema.sql` en el SQL Editor de Supabase
3. Configurar variables de entorno (`.env.local`)
4. `npm install && npm run dev` para correr local
5. Deploy a Vercel
6. Apuntar `prode.ndasesores.com.ar` a Vercel
7. Correr el endpoint `/api/cron/sync-fixtures` una vez para cargar el fixture del Mundial

## Cron jobs (Vercel Cron)

- `/api/cron/sync-fixtures` — corre cada 6h, sincroniza fixtures con football-data.org
- `/api/cron/score-matches` — corre cada 5 minutos durante partidos, calcula puntos de pronósticos cuando termina cada match

## Cumplimiento legal (Argentina)

- **Ley 25.326 (Datos Personales):** consentimiento explícito al registrarse, política de privacidad pública, opción de baja en cada mail. NDA debe estar inscripto como responsable de base de datos en la AAIP (gratis, online).
- **Concursos con premios:** este prode es de habilidad (acertar resultados), no de azar. El desempate es por habilidad también (no se sortea). Igualmente conviene una consulta legal antes de comunicar el premio.

# Informe — Proyecto Prode NDA Mundial 2026

**Fecha:** 12 de mayo de 2026
**Responsable:** Franco Piazze (NDA Asesores)
**Estado:** Diseño completo + código base entregado · Pendiente deploy y definiciones de negocio

---

## 1. Qué es

Webapp mobile de prode (predicción de resultados) del Mundial 2026 para NDA Asesores, broker de seguros. Los usuarios juegan, invitan amigos, y el ganador se lleva una Smart TV. La idea es que se aloje en `prode.ndasesores.com.ar`.

## 2. Por qué lo hacemos (objetivo de negocio)

Doble objetivo:

1. **Lead-generation:** capturar datos de contacto (nombre, email, WhatsApp, provincia) y, sobre todo, qué seguros tiene contratado cada usuario (auto, hogar, vida, ART, comercio, salud, ninguno). Esto arma una base segmentada para venta cruzada.
2. **Brand awareness:** que NDA quede asociado a algo divertido y se viralice por boca a boca. La mecánica de "+2 puntos por amigo referido (con tope) + premio Embajador para el que más invita" es el motor viral.
3. **Fidelización de clientes actuales:** el bonus de +20 puntos para asegurados de NDA que validan su póliza al registrarse es un guiño a la cartera vigente y un motivo para que la base activa también juegue.

El premio (TV) es el incentivo de entrada — el verdadero KPI son los **leads cualificados** y la **viralidad de los referidos**.

## 3. Mecánica del juego

- **Acertar ganador o empate:** 1 punto
- **Acertar ganador + diferencia de goles:** 3 puntos
- **Acertar resultado exacto:** 5 puntos
- **Multiplicador en eliminatorias** (octavos en adelante): x2
- **Referido confirmado** (se registra y juega al menos 1 partido): +2 puntos al referidor, hasta 10 referidos (máx. 20 pts al ranking principal). Los referidos por encima cuentan para el premio Embajador.
- **Bonus asegurado NDA** (única vez, al validar la póliza): +20 puntos al asegurado
- **Cierre de pronósticos:** 5 min antes del kickoff de cada partido

### Bonus asegurado NDA — flujo

1. Al registrarse, el usuario responde "¿Ya sos asegurado de NDA Seguros?" Sí/No.
2. Si dice "Sí", se le pide la patente del auto asegurado (o matrícula / número de póliza si no tiene auto).
3. El equipo de NDA entra a Supabase Studio → vista `nda_pending_validation`, cruza la patente contra el sistema interno y marca `nda_client_verified = true` en el profile.
4. El leaderboard suma automáticamente +20 puntos a esa cuenta.

Importante: el campo `nda_client_verified` está protegido por un trigger — solo se puede modificar con el rol `service_role` (es decir, desde Supabase Studio o desde un endpoint del backend que use la `service_role_key`). Un usuario no puede auto-marcarse como verificado.

### Premios definidos

| Puesto | Premio |
|---|---|
| 1° del ranking general | Smart TV 55" (modelo a confirmar antes del lanzamiento) |
| 2° del ranking general | Cafetera Nespresso (modelo a confirmar) |
| 3° del ranking general | Gift card para una cena en Kansas Nordelta |
| Embajador (más referidos sin tope) | A definir |

**Por qué el cap y el premio Embajador:** sin tope, alguien con muchos contactos sumaba 200+ puntos solo refiriendo y dominaba el ranking principal sin haber acertado un partido — eso choca con el principio legal de "concurso de habilidad". Con cap de 10 referidos al ranking principal (máximo 20 pts por este concepto), el referidor activo igual recibe un boost, pero el premio principal queda decidido por habilidad. El premio Embajador captura el incentivo viral sin contaminar la TV.

**Desempate (clave por tema legal — todo por habilidad, sin azar):**
1. Más resultados exactos
2. Más aciertos en partidos de la Selección Argentina
3. Orden de registro (el primero gana)

## 4. Stack técnico definido

| Componente | Elegido | Por qué |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind | Estándar profesional, deploy gratis en Vercel |
| Base de datos + auth | Supabase | Tier gratis aguanta 10k usuarios |
| Hosting | Vercel | Gratis, deploy automático desde GitHub |
| API de fútbol | football-data.org | Tier gratis cubre el Mundial |
| Mails | Resend | 3.000 mails/mes gratis |
| Subdominio | `prode.ndasesores.com.ar` | Hay que configurar CNAME en Hostinger (donde está el dominio) |

**Costo de operación al inicio:** $0/mes. Si pasa los 50.000 usuarios, ~USD 25-50/mes.

## 5. Estado del código

**Ubicación:** `/Users/francopiazze/Documents/CLAUDIO/PRODE NDA/`

**39 archivos** entregados, organizados en:

- `README.md` y `DEPLOY.md` — documentación para el programador
- `supabase/schema.sql` — base de datos completa: tablas, vista materializada del leaderboard, función de scoring, triggers de referidos, RLS
- `src/lib/` — lógica core (scoring, cliente football-data, Supabase clients, mails)
- `src/app/` — páginas (landing, registro, login, jugar, ranking, perfil, callback de auth, link de referidos, bases legales placeholder)
- `src/components/` — Header, MatchCard, Leaderboard, ReferralBox
- `src/app/api/` — endpoints server-side (predictions, cron de sync de fixtures, cron de cálculo de puntos)
- `preview.html` — versión visual standalone para mostrar el front sin necesitar backend (se abre con doble click)

## 6. Qué falta antes de poder lanzar

### Decisiones de negocio (de Franco)

- [ ] **Definir modelo y marca exactos de la Smart TV 55"** (1° puesto)
- [ ] **Definir modelo de la cafetera Nespresso** (2° puesto)
- [ ] **Confirmar gift card de Kansas Nordelta** — monto y vigencia (3° puesto)
- [ ] **Definir premio Embajador** (más referidos sin tope) — ej. gift card cafetería, merch NDA, caja de regalo
- [ ] **Conseguir logo en alta resolución** y guía de colores de NDA
- [ ] **Texto definitivo** del mail de bienvenida y de las bases legales
- [ ] **Definir el proceso interno de validación de patentes**: quién del equipo entra a Supabase, con qué frecuencia, y cómo se cruza contra el sistema de pólizas (idealmente revisar al menos 1 vez por día durante las 2 semanas pico)

### Setup técnico (del programador)

- [ ] Crear cuentas en GitHub, Vercel, Supabase, Resend, football-data.org
- [ ] Correr `supabase/schema.sql` en Supabase
- [ ] Configurar variables de entorno (`.env.local` con keys de cada servicio)
- [ ] Verificar dominio `ndasesores.com.ar` en Resend (registros DNS)
- [ ] Configurar subdominio `prode.ndasesores.com.ar` apuntando a Vercel
- [ ] Deploy a Vercel
- [ ] Correr `/api/cron/sync-fixtures` una vez para cargar los partidos del Mundial
- [ ] Verificar que los Vercel Crons disparen cada 5 min durante partidos (puede requerir plan Pro de Vercel, USD 20/mes)

### Cumplimiento legal (no es opcional)

- [ ] **Consulta legal corta** con un abogado para revisar las bases del concurso y la política de privacidad (presupuesto: ARS 50-150k)
- [ ] **Inscripción de NDA como responsable de base de datos en la AAIP** (gratis, online — obligatorio si vamos a hacer marketing con los datos)

## 7. Cronograma sugerido

Mundial 2026: **11 jun → 19 jul**. Estamos a 5 semanas del inicio.

| Semana | Actividad |
|---|---|
| 12-18 may | Decisiones de negocio + setup técnico inicial (cuentas, schema) + consulta legal |
| 19-25 may | Programador deploya backend y conecta API de fútbol |
| 26 may - 1 jun | Testing con 5-10 usuarios reales (familia, equipo de NDA) |
| 2-8 jun | Bases legales finales + textos + ajustes de UX según testing |
| 9-10 jun | Lanzamiento soft: WhatsApp a base actual de clientes NDA + redes |
| **11 jun** | Arranca el Mundial. El prode ya está vivo. |

## 8. Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| Tema legal de premios y sorteos | Concurso es de habilidad (no azar). Desempate también por habilidad. Consulta con abogado antes de comunicar. |
| Ley 25.326 (datos personales) | Inscripción en AAIP, checkbox de consentimiento explícito, política de privacidad pública, opción de baja en cada mail. |
| No llegar al 11 de junio | El Mundial dura hasta el 19 de julio. Si lanzamos unos días tarde, igual capturamos el grueso del torneo. |
| Que no se viralice | Plan B: WhatsApp directo a los ~X mil clientes actuales de NDA para sembrar la base inicial. |
| Vercel Cron en plan gratis es limitado | Alternativa: cron externo gratis (cron-job.org) que pega a los endpoints con un secret. |

## 9. Métricas a medir post-lanzamiento

- Cantidad de registros totales
- Tasa de conversión (visitas → registros)
- Promedio de referidos confirmados por usuario
- Tasa de retención (% de usuarios que cargan pronósticos en >50% de los partidos)
- Distribución de tipo de seguros marcados (para priorizar venta cruzada después)
- Costo por lead

## 10. Próximos pasos inmediatos (esta semana)

1. **Franco** — definir premio principal y conseguir presupuesto
2. **Franco** — hacer consulta con abogado
3. **Franco** — pasar este informe + carpeta del proyecto al programador
4. **Programador** — crear cuentas y empezar el setup según `DEPLOY.md`
5. **Próxima sesión de Claude** — afinar UX según feedback, ajustar copy, agregar features que falten

---

*Documento generado el 12 de mayo de 2026. Última versión del código entregada en `/Users/francopiazze/Documents/CLAUDIO/PRODE NDA/`.*

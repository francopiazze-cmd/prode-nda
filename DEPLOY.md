# Guía de Deploy — NDA Prode

Esta guía es para el programador que va a poner la app online. Pasos en orden.

## 1. Cuentas que hay que crear

Todas tienen tier gratis suficiente para arrancar.

| Servicio | Para qué | Link |
|---|---|---|
| GitHub | Hostear el código | https://github.com |
| Vercel | Deployar la app | https://vercel.com |
| Supabase | Base de datos + auth | https://supabase.com |
| Resend | Mails transaccionales | https://resend.com |
| football-data.org | Fixtures y resultados del Mundial | https://www.football-data.org |

### Notas

- **Supabase:** crear un proyecto nuevo. Anotar la URL y las API keys (anon + service_role).
- **football-data.org:** registrarse al plan **Free Tier** y pedir acceso a la competición "FIFA World Cup". El Mundial 2026 tiene `competition_code = WC` (verificar en su API una vez logueado). Hay un límite de 10 requests/min en el plan gratis; nuestro cron está armado para respetarlo.
- **Resend:** verificar el dominio `ndasesores.com.ar` para enviar mails desde `prode@ndasesores.com.ar`. Esto requiere agregar registros DNS (TXT, MX, CNAME) en el panel del dominio.

## 2. Schema de la base de datos

1. En Supabase, ir a **SQL Editor**.
2. Pegar el contenido completo de `supabase/schema.sql` y correr.
3. Verificar que aparezcan las tablas: `profiles`, `teams`, `matches`, `predictions`, `referrals`.

## 3. Variables de entorno

Copiar `.env.example` a `.env.local` para desarrollo, y configurar las mismas variables en Vercel para producción.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# football-data.org
FOOTBALL_DATA_API_KEY=xxxxxx
FOOTBALL_DATA_COMPETITION=WC

# Resend
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=prode@ndasesores.com.ar

# Cron secret (cualquier string larga aleatoria)
CRON_SECRET=generar_con_openssl_rand_hex_32

# URL pública
NEXT_PUBLIC_APP_URL=https://prode.ndasesores.com.ar
```

## 4. Correr local

```bash
cd nda-prode
npm install
npm run dev
```

Abrir http://localhost:3000

## 5. Deploy a Vercel

1. Subir el repo a GitHub.
2. En Vercel: **New Project** → importar el repo.
3. Configurar todas las variables de entorno de la sección 3.
4. **Deploy**.

## 6. Subdominio prode.ndasesores.com.ar

El dominio `ndasesores.com.ar` está gestionado en **Hostinger**.

1. En Vercel: **Settings → Domains** del proyecto → agregar `prode.ndasesores.com.ar`. Vercel va a mostrar un registro CNAME (algo como `cname.vercel-dns.com`).
2. En Hostinger: **Panel del dominio → Avanzado → DNS / Zona DNS** → agregar el CNAME:
   - Tipo: **CNAME**
   - Nombre: **prode**
   - Apunta a: el valor que dio Vercel (ej. `cname.vercel-dns.com`)
   - TTL: 3600 (o el default)
3. Esperar propagación (5-30 minutos). Vercel emite el certificado SSL automáticamente.

## 7. Cargar el fixture del Mundial

Una sola vez después de deployar:

```bash
curl -X POST https://prode.ndasesores.com.ar/api/cron/sync-fixtures \
  -H "Authorization: Bearer $CRON_SECRET"
```

Esto carga los 104 partidos del Mundial 2026 desde football-data.org. Debería verse en Supabase la tabla `matches` poblada.

## 8. Configurar Vercel Cron

En el archivo `vercel.json` ya están configurados los crons. Vercel los detecta automáticamente al deployar.

- `sync-fixtures` corre cada 6h
- `score-matches` corre cada 5 minutos

Cron de Vercel funciona a partir del plan **Hobby** (gratis) con limitaciones; si esperás +50.000 usuarios conviene pasarse a **Pro** ($20/mes).

## 9. Antes de lanzar al público

- [ ] Probar registro con un mail real
- [ ] Probar el flujo de "Sí, soy asegurado de NDA" + carga de patente
- [ ] Probar cargar un pronóstico
- [ ] Probar que el link de referidos funcione
- [ ] Probar que llegue el mail de bienvenida
- [ ] Texto de la política de privacidad (revisado por Franco/abogado)
- [ ] Texto de los términos del concurso (revisado por Franco/abogado)
- [ ] Logo de NDA en `src/app/layout.tsx` y favicon
- [ ] Confirmar modelos definitivos: Smart TV 55" (1°), cafetera Nespresso (2°), gift card Kansas Nordelta (3°), premio Embajador
- [ ] Si vamos a publicar el ranking de Embajadores en la app, agregar la página `/embajadores` (queda como tarea pendiente)
- [ ] Configurar Google Analytics o Plausible (opcional pero recomendado para medir conversión)

## 9.bis Validación manual de asegurados NDA (rutina del equipo)

Los usuarios que se declaran asegurados quedan con `is_nda_client = true` y `nda_client_verified = false` hasta que el equipo los valide. Para procesarlos:

1. Entrar a Supabase Studio → **SQL Editor**.
2. Correr: `select * from public.nda_pending_validation;` — lista a todos los pendientes ordenados por antigüedad.
3. Para cada uno, cruzar la `nda_license_plate` contra el sistema interno de pólizas de NDA.
4. **Si la póliza está confirmada**, marcarlo verificado con:
   ```sql
   update public.profiles
   set nda_client_verified = true, nda_client_verified_at = now()
   where id = '<UUID DEL USUARIO>';
   ```
5. **Si no está confirmado** (patente errónea, póliza vencida, no es cliente), avisarle por mail y dejar el flag en false. Los 20 puntos no se otorgan.
6. Después de marcar verificados, correr `select public.refresh_leaderboard();` para que el ranking se actualice (también lo hace el cron solo, cada 5 min).

Frecuencia recomendada: una pasada por día durante las primeras 2 semanas pos-lanzamiento, después cuando haga falta. **Importante:** el flag `nda_client_verified` está protegido por un trigger — solo se puede modificar conectado a Supabase con el rol admin/owner del proyecto. Un usuario común no puede auto-validarse.

## 10. Soporte y monitoreo

- **Errores en runtime:** Vercel los muestra en el dashboard del proyecto.
- **Logs de Supabase:** panel → Logs.
- **Mails enviados/rebotados:** dashboard de Resend.
- **Uso de la API de football-data:** dashboard de football-data.org (cuidado con rate limits).

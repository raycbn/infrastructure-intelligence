# Infrastructure Intelligence — Fase 0

MVP local para discovery público y autorizado. Nunca inicia un discovery hasta que el dominio esté verificado por DNS TXT o mediante `/.well-known/`.

## Ejecutar localmente

1. Copia `.env.example` a `.env` y configura un `SESSION_SECRET` aleatorio de al menos 32 caracteres.
2. Inicia PostgreSQL: `docker compose up -d postgres`.
3. Instala paquetes: `pnpm install`.
4. Genera y aplica migraciones: `pnpm db:generate` y `pnpm db:migrate`.
5. En terminales separadas ejecuta `pnpm dev` y `pnpm worker`.

Registra una cuenta con `POST /api/auth/register`, crea un scope por `POST /api/scopes`, publica el token indicado, llama a `POST /api/scopes/{id}/verify`, y solo después llama a `POST /api/discovery` con el `scopeId` verificado.

El worker limita las ejecuciones a 100 hosts y realiza DNS, CT y peticiones HTTP(S) pequeñas. Bloquea destinos no públicos. No hay escaneo de puertos, crawling ni explotación.

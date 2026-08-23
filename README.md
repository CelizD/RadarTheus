# RadarTheus ⚡🇲🇽

Bot de Telegram para detectar oportunidades de reventa de electrónica en México.

## Objetivo

RadarTheus ayuda a revendedores a descubrir qué productos electrónicos están creciendo, dónde conseguirlos y qué margen potencial tienen.

## MVP v0.1

- Usuarios FREE / PRO.
- `/hoy`
- `/tendencias`
- `/buscar <producto>`
- `/proveedores <producto>` (PRO)
- `/invertir <presupuesto>` (demo PRO)
- `/pro`
- `/mi_plan`
- PostgreSQL + Prisma.
- Telegram Stars con suscripción de 30 días.
- Webhook preparado para Railway.
- Healthcheck `/health`.

> Los precios y proveedores iniciales son datos de demostración. No deben mostrarse como información verificada en producción.

## Stack

- Node.js + TypeScript
- grammY
- Express
- PostgreSQL
- Prisma
- Railway
- Telegram Stars

## Arquitectura inicial

```text
Telegram
   |
   v
Railway service
   |- Express / webhook
   |- grammY bot
   |- lógica FREE/PRO
   |
   v
PostgreSQL
   |- Users
   |- Subscriptions
   |- Products
   |- TrendSnapshots
   |- Suppliers
   |- SupplierOffers
   |- Watchlist
```

En una fase posterior se separará un worker/cron para actualizar tendencias y proveedores.

## Railway

Variables mínimas:

```env
NODE_ENV=production
TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=...
TELEGRAM_WEBHOOK_PATH=/telegram/webhook
PUBLIC_BASE_URL=https://TU-SERVICIO.up.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
PRO_PRICE_STARS=15
PRO_PERIOD_SECONDS=2592000
```

## Roadmap inmediato

1. Motor de tendencias reales.
2. Integración con fuentes de precios/competencia.
3. Directorio nacional de proveedores.
4. ElectroScore calculado automáticamente.
5. Histórico de precios y tendencias.
6. Watchlist + alertas.
7. Preferencias por ciudad/categoría.
8. Telegram Mini App.
9. Panel admin.
10. Referidos.

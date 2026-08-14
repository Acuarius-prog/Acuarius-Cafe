# Acuarius — Web (Next.js + Supabase)

Proyecto inicial del sitio de Acuarius. La página de inicio lee tu menú
directamente desde la tabla `menu_items` de Supabase.

## Requisitos
- Node.js LTS (nodejs.org)
- Tu proyecto de Supabase ya creado y con el script SQL ejecutado

## Cómo correrlo (5 minutos)

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Crea el archivo de llaves. Copia el ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```
   Abre `.env.local` y pega tu `Project URL` y tu `anon public key`
   (Supabase → Project Settings → API).

3. Arranca en modo desarrollo:
   ```bash
   npm run dev
   ```
   Abre http://localhost:3000 — deberías ver tu menú de Fontibón
   saliendo de Supabase. 🎉

## Publicar en Cloudflare
Sigue la guía `acuarius-despliegue-cloudflare.md`. En resumen:
```bash
npx wrangler login
npm run deploy
```

## Estructura
- `src/app/page.tsx` — página de inicio (hero + menú)
- `src/components/Menu.tsx` — lee y muestra el menú desde Supabase
- `src/lib/supabase/server.ts` — cliente de Supabase para el servidor
- `src/app/globals.css` — estilos con la identidad de la marca

## Siguientes pasos sugeridos
- Página `/menu` con filtros por categoría
- Carrito y checkout con Wompi
- Panel `/admin` protegido para editar el menú
- Login de clientes (Supabase Auth)

Pídele a Claude Code cualquiera de estos pasos y los va construyendo sobre esta base.

Universo interactivo para móvil. Vite + React + TypeScript + Tailwind.

## Local

```bash
npm install
npm run dev
```

Abre la URL en el iPhone (misma red) o en las DevTools con viewport móvil.

## Fotos y audios

Deja los archivos en:

- `public/media/photos/`
- `public/media/audio/`

Luego apunta las rutas en `src/content/story.ts`, `src/content/archive.ts` y `src/content/plans.ts`.

La fecha de desbloqueo semanal está en `UNLOCK_START` (`src/content/plans.ts`). Hoy: 21 sept 2026.

## Deploy

Cada push a `main` construye y publica en GitHub Pages:

`https://diego-avz.github.io/v/`

La primera vez, en el repo: **Settings → Pages → Source → GitHub Actions**.

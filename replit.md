# Semprot Zone

Platform streaming film dan serial gratis dengan iklan untuk penonton umum.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/semprot-zone` — aplikasi web utama dan seluruh pengalaman penonton
- `artifacts/api-server/src/routes/catalog.ts` — data katalog demo dan endpoint publik
- `lib/api-spec/openapi.yaml` — kontrak API sebagai sumber kebenaran
- `artifacts/semprot-zone/src/index.css` — tema visual Semprot Zone

## Architecture decisions

- Video dirancang untuk dilayani dari penyimpanan video/CDN terpisah, bukan dari server aplikasi.
- Watchlist versi awal menggunakan penyimpanan lokal agar pengalaman bisa dipakai sebelum autentikasi dan database pengguna ditambahkan.
- Katalog publik memakai OpenAPI dan hook React Query hasil codegen agar frontend dan API tetap sinkron.

## Product

Semprot Zone adalah layanan streaming film dan serial milik sendiri dengan model gratis berbasis iklan. Versi awal menyediakan beranda kurasi, katalog dengan pencarian dan filter, detail judul, episode serial, watchlist, dan halaman menonton dengan perlakuan iklan.

## User preferences

- Target deployment yang direncanakan: Railway, dengan source code disimpan di GitHub.
- Setiap perubahan kode yang selesai harus dipush ke repository GitHub.
- Arah visual: gelap dan sinematik.
- Nama produk: Semprot Zone.

## Gotchas

- File video asli belum diunggah ke aplikasi; URL video demo perlu diganti saat aset produksi tersedia.
- Sebelum mengganti kontrak API, jalankan codegen dari `lib/api-spec/openapi.yaml`.
- Railway menjalankan frontend dan API sebagai satu service; API server melayani hasil build SPA dari `artifacts/semprot-zone/dist/public`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

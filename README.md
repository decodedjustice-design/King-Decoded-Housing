# Decoded Housing

Decoded Housing is a trauma-informed housing navigation, homelessness prevention, and housing intelligence platform focused first on King County and Washington State.

This starter includes:

- A Next.js product surface with Decoded Housing visual direction.
- Guided triage scoring logic.
- Anchor workbook-backed housing search intelligence.
- Anchor workbook-backed resource map and triage indexes.
- Barrier resolution and prevention workflows.
- Navigator dashboard shell.
- Prisma schema for resources, properties, clients, referrals, applications, notes, and documents.
- Import normalization scaffolding for CSV/Excel housing and resource datasets.
- OpenAI assistant route for Washington housing navigation guidance.

## Anchor Workbook Import

The app treats `Anchor v3 Unified with Maps.xlsx` as the source database for property cards, map resources, search filters, and triage intelligence.

Run the importer after the workbook changes:

```bash
python scripts/import_anchor_workbook.py
```

If the workbook lives somewhere else, set `ANCHOR_WORKBOOK_PATH` before running it. The importer writes:

- `data/anchor-import.json`: full normalized import with raw audit fields.
- `data/anchor-app-data.json`: slimmer app-facing data used by the UI and seed script.

Workbook-backed endpoints:

- `/api/search/properties?q=bellevue&voucher=true&family=true`
- `/api/search/resources?q=shelter&sameDay=true&lowBarrier=true`
- `/api/search?q=vehicle%20safe%20parking`
- `/api/search/semantic?q=voucher%20family%20with%20old%20eviction`
- `/api/map?category=shelter&city=Seattle`
- `/api/match` for triage-to-resource/property matching
- `/api/triage` for intake scoring with Anchor-backed leads

Dynamic platform pages:

- `/housing`
- `/map`
- `/triage`
- `/resources`
- `/properties/[id]`
- `/barriers`

See `docs/UNIFIED_DATA_ARCHITECTURE.md` and `docs/database-postgis-vector.sql` for the production data architecture.

## Getting Started

1. Install dependencies.
2. Copy `.env.example` to `.env.local` and fill in database, Supabase, Mapbox, OpenAI, and Clerk values.
3. Run Prisma migrations.
4. Start the Next.js development server.

```bash
npm install
npm run prisma:migrate
npm run db:seed
npm run dev
```

## Product Principles

Every screen should answer: what should I do next?

The platform is intentionally honest about barriers, wait times, screening risks, and dead-end referrals. It prioritizes prevention, realistic next actions, and dignity-preserving support.

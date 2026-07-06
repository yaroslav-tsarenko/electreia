# electreia

Precision-engineered electronics e-commerce store.

Built by **LORDCARE LIMITED** (Company No. 15982435), Academy House,
11 Dunraven Place, Bridgend, Mid Glamorgan, United Kingdom, CF31 1JF.

Contact: `info@electreia.co.uk` · `+44 7463 590620`.

## Stack

- Next.js 16 (App Router) · React 19
- TypeScript · Tailwind CSS v4 (CSS-first config)
- Prisma · PostgreSQL
- next-intl (i18n)
- Framer Motion, lucide-react, tailwind-merge

## Development

```bash
npm install
npm run dev            # starts on http://localhost:3000
npm run build          # prisma generate + next build
npm run lint
```

## Design system

All colours, spacing, radii, and typography live as design tokens in
`src/styles/variables.css` and are exposed to Tailwind through the `@theme`
block in `src/styles/globals.css`. Do not hardcode hex values in components —
reach for the tokens (`bg-primary`, `text-ink`, `border-line`,
`font-display`, `font-mono`, ...).

The aesthetic is **cool precision tech**: dark-first, high-contrast, tight
steel neutrals with an electric-azure accent (`#2E7DFF`) and a vivid violet
secondary (`#7C5CFF`).

# SUPERSEDED — see `src/lib/providers/` for the real adapters

This folder was written before I had read your existing schema. It assumed a
user-scoped, enum-based provider model that doesn't match Got Mail's actual
architecture (workspace-scoped, free-form `providerKind` strings, existing
`Suppression` / `Bounce` / `Complaint` / `Unsubscribe` / `EmailSend` /
`WarmupSchedule` models).

The proper integration has now been done in-place:

- 5 new adapters in `src/lib/providers/` matching the existing `ProviderModule` interface:
  `mailersend.ts`, `smtp2go.ts`, `elasticemail.ts`, `mailtrap.ts`, `zeptomail.ts`
- Registered in `src/lib/providers/index.ts`
- Added to `PROVIDER_KINDS` in `src/lib/providers/types.ts`
- Dropdown updated in `src/app/provider-setup/page.tsx` (now grouped Free / Pay-as-go / Self-hosted)
- New env vars in `.env.example` and `.env`
- `UNSUBSCRIBE_SECRET` added for the existing unsubscribe flow at `/unsubscribe/[token]`

**No Prisma migration is needed** — `providerKind` is already a free-form string
and your schema already has every model the new adapters need. Run
`npx prisma generate && npm run dev` and the new providers appear in the dropdown.

Files in this `extended/` directory (`types.ts`, `providers.ts`, `routing.ts`,
`suppression.ts`, `list-unsubscribe.ts`, `warming.ts`, `webhooks.ts`,
`schema.extension.prisma`) can be safely deleted. They are kept only so the
ideas in `FREE_STACK_GENIUS_PLAN.md` and `PROVIDER_PLAYBOOK.md` (in
`AI-Business-Projects/business-tools/emailer/docs/`) stay readable as reference.

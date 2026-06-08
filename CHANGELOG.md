# Changelog

All notable changes to CarbonLens are tracked here. The format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added — Session 1 (Foundation)
- Lovable Cloud enabled with auth (email + Google via managed OAuth broker).
- Database schema: `profiles`, `user_roles`, `activity_factors`, `activities`,
  `challenges`, `user_challenges`, `coach_messages`, `rate_limits`.
- RLS policies + explicit GRANTs on every public-schema table.
- `has_role()` security-definer helper for safe role checks inside RLS.
- Auto-provision `profiles` row on signup via trigger.
- Cold-grey dark design system (oklch tokens in `src/styles.css`).
- Public landing page (`/`) with SEO meta + OpenGraph.
- Auth page (`/auth`) — email/password + Continue with Google.
- Protected `_authenticated/` layout (managed `ssr: false` gate).
- Dashboard skeleton (`/dashboard`).
- Documentation: `context.md`, `README.md`, `ARCHITECTURE.md`, `SECURITY.md`,
  `TESTING.md`, `ACCESSIBILITY.md`, `LICENSE` (MIT).
- GitHub Actions CI: lint, typecheck, build on every push.

# 22 — Stage 2 Handoff

## Stage
Stage 2 — Design System & Application Shells

## Objective completed
The Stage 2 Evidence Folio design system and application shells are complete, fully corrected following technical code review, and have passed the formal Stage-2 quality gate.

Stage 2 established the reusable visual language, typography foundation, signature editorial primitives, and responsive public/admin application shells for the Marie Medere Medical Writing publication without implementing out-of-scope backend, authentication, or product content.

Key commit record:
- **Authorization commit:** `18dc2c65aed7ae76b5905b5a02add28babfbec0a` (`docs: authorize stage 2 design system`)
- **Implementation commit:** `69844dab57380959abdb4ff43779035be6498446` (`feat: establish evidence folio design system`)
- **Correction commit:** `c5e89f0617c9b2b56f6f75418ab62eed750c7a3d` (`fix: refine stage 2 shell semantics`)
- **Canonical Stage-1 main base:** `4da2ff7adb0f7d46d3f5f1ff249f69cfb996f717`

## Delivered scope

### 1. Design Tokens & Typography Foundation
- **Evidence Folio Semantic Palette:** Implemented CSS variables in `src/app/globals.css` with `@theme inline` mappings:
  - Parchment background (`#F6F1E8`), Reading paper surface (`#FFFDF9`), Primary ink (`#242321`), Muted ink (`#5E5953`), Brand oxide (`#7B3F35`), Deep sage (`#3F5E52`), Inline link (`#704037`), Subtle field (`#E8E2D7`), Subtle divider (`#D2C9BC`), Control boundary (`#918579`), Focus slate ring (`#265D7A`).
- **Typography:** Integrated `Newsreader` (editorial serif for display headings, masthead, folio markers) and `Source_Sans_3` (sans-serif for body, UI, metadata, navigation, admin) via `next/font/google` in `src/app/layout.tsx`.
- **Dark Mode Policy:** No dark mode implemented; dark mode styles removed in adherence to V1 scope freeze (`D007`).

### 2. Evidence Folio Signature Components (`src/components/evidence/`)
- `EvidenceRail`: Restrained vertical structural rail on desktop that collapses to a compact horizontal folio rule on mobile viewports.
- `FolioMarker`: Editorial section index numbers (`01`, `02`, `03`) in Newsreader serif with `aria-hidden` support when decorative.
- `SplitRule`: Oxide accent rule segment transitioning into a neutral hairline across the container.
- `TopicImprint`: Restrained typographic category/topic imprint supporting links and semantic variants (`default`, `oxide`, `sage`, `muted`).
- `ReferenceLedger`: Semantic ordered-list (`<ol>`) presentation of sources and evidence citations with unique instance ID wiring via `React.useId()`.

### 3. Application Shells
- **Public Shell (`src/components/site/`):**
  - `PublicShell`: Top-level wrapper with accessible skip link (`#main-content`), `SiteHeader`, responsive container (`max-w-[1248px]`), and `SiteFooter`.
  - `SiteHeader`: Publication header with brand wordmark, desktop navigation (`Home`, `Articles`, `Portfolio`, `About`, `Contact`), and CTA styled link.
  - `MobileNav`: Accessible client drawer with hamburger trigger for mobile viewports.
  - `SiteFooter`: Publication footer with identity, navigation links, medical disclaimer link, and copyright notice.
- **Admin Shell (`src/components/admin/`):**
  - `AdminShell`: Utilitarian, calm single-writer workspace with sidebar navigation (`Dashboard`, `Articles`, `Drafts`, `Categories`, `Media`, `Portfolio`, `Comments`, `Messages`, `Settings`) and sticky top bar.
  - `AdminMobileNav`: Responsive mobile drawer with comfortable 44px touch target.

### 4. Base UI Primitives (`src/components/ui/`)
- `Button`: Evidence Folio button primitive (`default`, `secondary`, `outline`, `subtle`, `ghost`, `link`, `destructive`).
- `Separator`: Accessible divider primitive.
- `Sheet`: Accessible drawer primitive with backdrop overlay, focus trapping, Escape dismissal, and reduced-motion support.

### 5. Dependencies Added & Justifications (under D020)
- `@base-ui/react@^1.7.0`: Unstyled accessible headless dialog/drawer foundation for `Sheet` (`base-nova` baseline).
- `class-variance-authority@^0.7.1`: Type-safe CSS variant composition for Evidence Folio primitives.
- `lucide-react@^1.34.0`: Permitted icon library for mobile drawer toggles and admin module navigation.

## Code review corrections (commit `c5e89f0617c9b2b56f6f75418ab62eed750c7a3d`)
Formal technical review identified and corrected the following items prior to closeout:
- **Button/Link Semantics:** Removed unused `asChild` prop from `ButtonProps`; preserved `Button` as a native `<button>` element; applied `buttonVariants` directly to Next.js `<Link>` elements.
- **Truthful CTAs:** Replaced misleading "Download CV" action with a direct "Contact" link to `/contact`.
- **Content Governance:** Removed unverified marketing claims, fake clinical credentials, and internal system labels (`"Evidence Folio Editorial System"`) from public shells and metadata.
- **Validation Fixture:** Replaced pseudo-medical reference titles in `src/app/page.tsx` with clearly synthetic layout placeholders (`Layout Reference A/B`).
- **Heading IDs:** Wired `React.useId()` in `ReferenceLedger` to ensure unique heading IDs across multiple instances.
- **Drawer Link Composition:** Removed `SheetClose` wrappers around interactive `<Link>` elements, managing drawer closure directly via `onClick={() => setOpen(false)}`.
- **Reduced Motion:** Added `motion-reduce:transition-none` and transform neutralizers to `SheetBackdrop` and `SheetContent` with a restrained 200ms default transition.
- **Touch Target:** Increased admin mobile trigger size to `size-11` (44px) to satisfy touch target guidelines.
- **Admin Roles:** Replaced credential-like role labels with neutral functional wording (`"Writer / Admin"`, `"Workspace"`).

## Verification performed

### Quality Gate Results
- `npm ci`: **PASS** (375 packages added, 376 audited, 0 vulnerabilities).
- `npm run typecheck`: **PASS** (`tsc --noEmit` exited 0).
- `npm run lint`: **PASS** (`eslint .` exited 0).
- `npm run format:check`: **PASS** (`prettier . --check` verified all 25 files).
- `npm run build`: **PASS** (Turbopack static production build succeeded).
- `git diff --check`: **PASS** (zero whitespace or conflict defects).

### Production Build Route Summary
```text
Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

### Visual & Manual Review Record
- **Desktop Public Shell (1440px):** Verified 12-column grid structure, `1248px` max container, 48px outer gutters, header layout, and asymmetric editorial hierarchy.
- **Tablet Public Shell (834px):** Verified 32px outer gutters and responsive element reflow.
- **Mobile Public Shell (390px):** Verified 20px outer gutters, compact header, comfortable touch targets, full-width `ReferenceLedger`, and collapsed `EvidenceRail`.
- **Admin Shell:** Verified calm single-writer workspace in Source Sans 3 with fixed sidebar navigation.
- **Evidence Folio No-Drift Verification:** Confirmed full customization to Evidence Folio tokens with no default shadcn appearance or generic template drift.
- **Accessibility Verification:** Verified semantic landmark structure (`<header>`, `<nav>`, `<main id="main-content">`, `<aside>`, `<footer>`), skip link functionality, visible `#265D7A` focus slate rings, ARIA dialog modal semantics, and reduced-motion overrides.

## Windows npm ci regression note
During implementation, an initial `npm ci` execution returned a Windows `EPERM` error because background Next.js development processes were holding open the native binary `node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node`.

After stopping the background Node processes, a subsequent `npm ci` completed cleanly with 0 errors and 0 vulnerabilities. This was an OS file-lock occurrence rather than a lockfile, package, or architecture defect.

**Regression guidance:** Before running `npm ci` on Windows, ensure all project development servers and background Node processes are stopped.

## Known limitations & deferred scope
Stage 2 is strictly a design-system and application-shell stage and intentionally does NOT provide:
- Supabase schema migrations, RLS, grants, and Auth integration foundation (deferred to Stage 3);
- Marie/admin sign-in, protected admin routing, logout, and session handling (deferred to Stage 4);
- Full public static/identity pages for homepage, About, Portfolio shell, Contact shell, and Disclaimer (deferred to Stage 5);
- Article reading and discovery: blog listing, article route, category route, search, and references renderer (deferred to Stage 6);
- Writer dashboard, Tiptap rich-text editor, media insertion, SEO fields, and draft saving (deferred to Stage 7);
- End-to-end publishing workflow, preview, archive, and slug handling (deferred to Stage 8);
- Moderated comments, contact inbox, settings, and portfolio featuring controls (deferred to Stage 9);
- SEO, social previews, structured article data, and analytics (deferred to Stage 10);
- Quality, security, and production hardening (deferred to Stage 11);
- Real client content, verified credentials, CV asset, and launch acceptance (deferred to Stage 12).

The root page (`/`) serves as a neutral Stage-2 design-system validation fixture.

## Next stage readiness
- **Stage 2:** COMPLETE / PASS / AWAITING OWNER MERGE APPROVAL.
- **Stage 3:** NOT AUTHORIZED.

Before Stage 3 may begin:
1. Stage-2 closeout must be approved by the project owner;
2. `stage/02-design-system` must be merged into `main` under `docs/14-BRANCH-STRATEGY.md`;
3. `main` must be synchronized with `origin/main`;
4. ChatGPT live-context freshness must be verified against current accepted `main` under D021;
5. the project owner must explicitly authorize Stage 3.

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# Project-specific guidance: Dotbugi

## Project Overview

Dotbugi (돋부기) is a Chrome Extension (Manifest V3) for Hansung University students that aggregates VOD lectures, assignments, and quizzes from the university LMS (`https://learn.hansung.ac.kr/`) into a single dashboard.

## Build & Development Commands

```bash
npm run dev           # Vite dev server (crx plugin excluded; no HTML entry, so nothing renders standalone)
npm run build         # TypeScript check + Vite production build (store upload)
npm run build:mock    # Dev build via .env.mock: fetch real LMS data for VITE_MOCK_COURSES, skip date filter (LMS login still required)
npm run build:local   # Local test build: manifest `key` → same extension ID as store, DEV icon/name (never upload)
npm run lint          # ESLint
npm run test          # Vitest (test:watch for watch mode)
npm run format        # Prettier write
npm run preview       # vite preview (extension build has no HTML entry; not useful in practice)
npm run docs:dev      # VitePress docs dev server (docs:build / docs:preview)
```

Prefix `RELEASE_CHANNEL=beta` for beta-channel builds. Full command reference: `CONTRIBUTING.md` §2.

To test the extension, load `dist/` as an unpacked extension in Chrome (`chrome://extensions`).

## Code Formatting & Commits

- Prettier: single quotes, semicolons, 120 char width, 2-space tabs, ES5 trailing commas
- Commit tooling (husky): `pre-commit` runs lint-staged (Prettier + ESLint `--fix` on staged files); `commit-msg` enforces Conventional Commits via commitlint. Hooks install on `npm install`.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `ci:` …); Korean subjects are allowed.

## Architecture

**Two entry points:**

1. **Content Script** (`src/popover/index.tsx`) — Injects the dashboard, video player, course toggles, and course-status badges (`injectCourseStatus`) into the LMS pages using Shadow DOM for style isolation.
2. **Background Service Worker** (`src/background.ts`) — Brokers Google OAuth tokens via `chrome.identity` (message passing) and opens the docs site on install / toolbar-icon click.

**Data flow:** The extension scrapes raw HTML from LMS pages using DOMParser (not an API), via the shared package [`@dotbugi/lms-parser`](https://github.com/hs-shell/dotbugi-lms-parser) (parsers, LMS keywords, links — shared with dotbugi-mcp). `src/lib/fetchCourseData.ts` injects the browser `fetchHtml` (`src/lib/fetchHtml.ts`: `fetch(credentials: 'include')` + DOMParser, with retry) and the logger into the package's `scrapeCourseData`. Parser fixes go to the package repo. Results are stored in `chrome.storage.local`; refresh uses a 1-hour TTL (`src/lib/cache.ts`, last-request time kept in page `localStorage`). The main data hook is `src/hooks/useCourseData.tsx`.

**Key patterns:**

- Shadow DOM isolation for content script UI (context via `src/popover/lib/ShadowRootContext.tsx`)
- Chrome message passing between content script and background worker for OAuth token retrieval
- Deduplication via key generators in `src/lib/generateKey.ts` (`makeVodKey`, `makeItemKey` for assignments/quizzes, `makeVodGroupKey`)
- Path alias: `@/` maps to `./src`

**Stack:** React 18 + TypeScript + Vite + @crxjs/vite-plugin. UI built with shadcn/ui (Radix primitives) + Tailwind CSS. Animations via Motion (`motion/react`).

## Contributing flow

- Every change needs an **issue first**. PRs must reference it (`Closes #123`) — `pr-checks.yml` fails otherwise.
- New issues are scanned for duplicates by `issue-dedup.yml` (GitHub Models) and may get a similar-issue comment plus the `possible-duplicate` label.
- PRs get automated review from **CodeRabbit** (free on public repos) plus `verify` (prettier/lint/build/manifest-key check/test). `main` is protected: required checks are `verify`, `issue-link`, `CodeRabbit` + 1 approval (`validate` PR-title check also runs).

## CI/CD

Workflows live in `.github/workflows/`:

- **`pr-checks.yml`** — on PRs: issue-reference guard (`issue-link`, skipped for Release PRs and Dependabot) + `verify` (Prettier/ESLint/build/`check-release-manifest.mjs`/test).
- **`pr-title.yml`** — PR title must be Conventional Commits (`validate`); the squash title drives release-please.
- **`release-please.yml`** — trunk-based releases via [release-please](https://github.com/googleapis/release-please). Merging PRs to `main` only updates a maintained **Release PR** (version + CHANGELOG, derived from Conventional Commits); merging that Release PR creates the tag + GitHub Release, then a `publish` job builds, checks the manifest has no `key`, and attaches the zip (sha256 recorded); a separate `store` job (behind `vars.ENABLE_STORE_PUBLISH` + `stable` environment approval) verifies the hash and uploads/submits to the Chrome Web Store via GCP Workload Identity Federation (no long-lived secrets). Version derives from commit types — no `🔖` labels. Config: `release-please-config.json` + `.release-please-manifest.json`. Uses a **GitHub App** token (`APP_ID`/`APP_PRIVATE_KEY` repo secrets) so the Release PR triggers CI; App needs Contents + Pull requests write.
- **`release-beta.yml`** — manual `workflow_dispatch`; publishes a `vX.Y.Z-beta.N` prerelease from `main` (no separate beta branch). A `store` job (behind `vars.ENABLE_STORE_PUBLISH` + `beta` environment approval) uploads the same zip to the separate beta Web Store item (`BETA_EXTENSION_ID`) via GCP WIF.
- **`cws-check.yml`** — manual, read-only Web Store auth check (`fetchStatus`) for stable/beta; waits for environment approval.
- **`deploy-docs.yml`** — builds VitePress docs and deploys to GitHub Pages on `docs/**` changes.
- **`discord-notify.yml`** — issue opened / PR opened·merged / CI failure → Discord (`DISCORD_WEBHOOK_URL`). CI-failure alerts cover the `PR 검사` workflow only; set `vars.DISCORD_ENABLED=false` to mute. Release notifications are sent inline from `release-please.yml` (yellow = awaiting store approval, green = released, red = failed) and `release-beta.yml` (yellow/red); `store` jobs send a separate result message.
- **`issue-dedup.yml`** — similar-issue detection on new issues via GitHub Models (`models: read`, no API key).
- **`pr-autolabel.yml`** — labels PRs from the Conventional Commits title prefix (`feat:`→`feat`, `fix:`→`bug`, `docs`/`refactor`/`perf`/`test`/`chore`/`ci`/`style` → same-name label; `build`/`revert` unlabeled).

## Extension Manifest

Defined in `manifest.config.ts` (not `manifest.json`). Permissions: storage, identity. OAuth2 configured for Google Calendar API integration. Beta builds (`RELEASE_CHANNEL=beta`) use the `extNameBeta` name, `icon-beta-*` icons and `BETA_CLIENT_ID`, and publish to a separate Web Store item. `build:local` (`--mode localtest`) adds the store public `key` (same extension ID as the store item, for local OAuth testing) with the `(Dev)` name and `icon-dev-*` icons; release/PR builds fail if `key` is present.

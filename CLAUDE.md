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
npm run dev       # Vite dev server
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run test      # Vitest
npm run format    # Prettier write
npm run preview   # Preview production build
```

To test the extension, load `dist/` as an unpacked extension in Chrome (`chrome://extensions`).

## Code Formatting & Commits

- Prettier: single quotes, semicolons, 120 char width, 2-space tabs, ES5 trailing commas
- Commit tooling (husky): `pre-commit` runs lint-staged (Prettier + ESLint `--fix` on staged files); `commit-msg` enforces Conventional Commits via commitlint. Hooks install on `npm install`.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `ci:` …); Korean subjects are allowed.

## Architecture

**Three entry points:**

1. **Content Script** (`src/content/index.tsx`) — Injects a popover dashboard and video player into the LMS pages using Shadow DOM for style isolation.
2. **Background Service Worker** (`src/background.ts`) — Handles Chrome alarm scheduling and notification creation via message passing.
3. **Options Page** (`src/option/index.tsx`, served from `option.html`) — HashRouter SPA with dashboard, VOD/assignment/quiz list pages, and color customization settings.

**Data flow:** The extension scrapes raw HTML from LMS pages using DOMParser (not an API), orchestrated by `src/lib/fetchCourseData.ts` and individual fetch modules (`fetchVodAttendance.ts`, `fetchIndexPage.ts`, `fetchAssign.ts`, `fetchQuiz.ts`). Results are cached in Chrome storage with a 24-hour TTL. The main data hook is `src/hooks/useCourseData.tsx`.

**Key patterns:**

- Shadow DOM isolation for content script UI (context via `src/lib/ShadowRootContext.tsx`)
- Chrome message passing between content scripts and background worker for alarm scheduling
- Deduplication via key generators (`makeVodKey`, `makeAssignKey`, `makeQuizKey`)
- Path alias: `@/` maps to `./src`

**Stack:** React 18 + TypeScript + Vite + @crxjs/vite-plugin. UI built with shadcn/ui (Radix primitives) + Tailwind CSS. Animations via framer-motion.

## Contributing flow

- Every change needs an **issue first**. PRs must reference it (`Closes #123`) — `pr-checks.yml` fails otherwise.
- New issues are scanned for duplicates by `issue-dedup.yml` (GitHub Models) and may get a `👀 possible-duplicate` comment.
- PRs get automated review from **CodeRabbit** (free on public repos) plus `verify` (lint/prettier/build/test). `main` is protected: these checks + 1 approval are required to merge.

## CI/CD

Workflows live in `.github/workflows/`:

- **`pr-checks.yml`** — on PRs: issue-reference guard + Prettier/ESLint/build/test.
- **`release-please.yml`** — trunk-based releases via [release-please](https://github.com/googleapis/release-please). Merging PRs to `main` only updates a maintained **Release PR** (version + CHANGELOG, derived from Conventional Commits); merging that Release PR creates the tag + GitHub Release, then a `publish` job builds, attaches the zip, and (behind `vars.ENABLE_STORE_PUBLISH`) uploads to the Chrome Web Store. Version derives from commit types — no `🔖` labels. Config: `release-please-config.json` + `.release-please-manifest.json`. Uses a **GitHub App** token (`APP_ID`/`APP_PRIVATE_KEY` repo secrets) so the Release PR triggers CI; App needs Contents + Pull requests write.
- **`release-beta.yml`** — manual `workflow_dispatch`; publishes a `vX.Y.Z-beta.N` prerelease from `main` (no separate beta branch). Beta Chrome Web Store upload (separate item, `BETA_EXTENSION_ID`) is stubbed behind `vars.ENABLE_STORE_PUBLISH`.
- **`discord-notify.yml`** — issue opened / PR opened·merged / CI failure → Discord (`DISCORD_WEBHOOK_URL`). Release notifications are sent inline from `release.yaml` (beta=yellow, stable=green).
- **`issue-dedup.yml`** — similar-issue detection on new issues via GitHub Models (`models: read`, no API key).
- **`pr-autolabel.yml`** — labels PRs from the Conventional Commits title prefix (`feat:`→`✨ feat`, `fix:`→`🐛 bug`, `docs:`→`📝 docs`, `refactor`/`perf`/`test`/`chore`/`ci`/`style` → matching label).

## Extension Manifest

Defined in `manifest.config.ts` (not `manifest.json`). Permissions: storage, identity. OAuth2 configured for Google Calendar API integration. Beta builds (`RELEASE_CHANNEL=beta`) suffix the extension name with `(Beta)` — groundwork for a separate beta Web Store listing.

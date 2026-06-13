# Merge Board Drag Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make drag the only way to move or merge board pieces while preserving generator tap production.

**Architecture:** Add a pure drop-intent classifier beside `moveOrMerge`, then use Pointer Events in `App.tsx` to track transient drag source and hover target. Board state changes only once on pointer release through the existing merge resolver.

**Tech Stack:** React 18, TypeScript, Pointer Events, Vitest, Testing Library, Vite

---

### Task 1: Define The Drag Contract

**Files:**
- Modify: `src/game/mergeLogic.ts`
- Test: `src/game/mergeLogic.test.ts`

- [ ] Write failing tests showing empty targets are moves, matching mergeable targets are merges, and incompatible targets are invalid.
- [ ] Run `npm test -- src/game/mergeLogic.test.ts` and confirm the missing drop-intent API fails.
- [ ] Export `getDropIntent(state, fromIndex, toIndex)` with `move`, `merge`, and `invalid` results.
- [ ] Run `npm test -- src/game/mergeLogic.test.ts` and confirm it passes.

### Task 2: Replace Tap-To-Move With Pointer Drag

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

- [ ] Write failing component tests proving two clicks do not move a piece, pointer drag merges identical pieces, and generator tap still produces.
- [ ] Run `npm test -- src/App.test.tsx` and confirm the old click interaction fails.
- [ ] Add transient pointer drag state, cell hit detection, one-shot drop resolution, and click suppression after a drag.
- [ ] Add lifted-source, move-target, merge-target, and invalid-target styling.
- [ ] Run `npm test -- src/App.test.tsx` and confirm it passes.

### Task 3: Verify The Complete Interaction

**Files:**
- Verify: `src/App.tsx`
- Verify: `src/styles.css`
- Verify: `src/game/mergeLogic.ts`

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
- [ ] In the in-app browser, drag a station ticket onto its match, drag a day pass to an empty cell, test an invalid drop, tap a generator, and check console/layout health.
- [ ] Commit the verified interaction change.

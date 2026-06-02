# Travel Merge2 Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable portrait-first Travel Merge2 web prototype with board-resident generators, Merge2 item upgrading, order fulfillment, energy consumption, city progress, a visible cat/cast layer, and data hooks for shopping and food.

**Architecture:** Use a small Vite + React + TypeScript app. Keep pure game mechanics in `src/game/` with Vitest coverage, keep content definitions in data files, and keep React components focused on rendering and interaction. The first screen is the playable prototype.

**Tech Stack:** Vite, React, TypeScript, Vitest, lucide-react, CSS.

---

## File Structure

- Create `package.json`: project scripts and dependencies.
- Create `index.html`: Vite mount point.
- Create `tsconfig.json`: TypeScript config for app and tests.
- Create `vite.config.ts`: Vite React and Vitest setup.
- Create `src/main.tsx`: React entry point.
- Create `src/App.tsx`: playable game screen and interaction wiring.
- Create `src/styles.css`: portrait-first layout, board cells, HUD, orders, feedback.
- Create `src/game/types.ts`: shared domain types.
- Create `src/game/content.ts`: item chains, generator definitions, order definitions, city configuration, expansion categories.
- Create `src/game/createInitialState.ts`: deterministic first playable board state.
- Create `src/game/mergeLogic.ts`: pure board mechanics, generator emission, move and merge behavior, order fulfillment.
- Create `src/game/content.test.ts`: verifies content structure and expansion hooks.
- Create `src/game/mergeLogic.test.ts`: verifies core mechanics.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create package manifest**

Create `package.json`:

```json
{
  "name": "travel-merge2-prototype",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/react": "^16.1.0",
    "@vitejs/plugin-react": "^4.3.4",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "jsdom": "^25.0.1",
    "typescript": "^5.6.3",
    "vite": "^6.0.0",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 2: Create Vite HTML entry**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Travel Merge2 Prototype</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: Create Vite and Vitest config**

Create `vite.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true
  }
});
```

- [ ] **Step 5: Create temporary React entry files**

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="prototype-card">
        <h1>Travel Merge2 Prototype</h1>
        <p>The playable board will replace this scaffold after the domain logic is implemented.</p>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #eef3f8;
  color: #132033;
}

button {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.prototype-card {
  width: min(420px, 100%);
  padding: 24px;
  border: 1px solid #b9c8d8;
  border-radius: 8px;
  background: #ffffff;
}
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 7: Verify scaffold builds**

Run:

```bash
npm run build
```

Expected: command exits with code 0 and Vite creates `dist/`.

- [ ] **Step 8: Commit scaffold**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts src/main.tsx src/App.tsx src/styles.css
git commit -m "feat: scaffold travel merge2 prototype"
```

---

### Task 2: Content Data And Initial State

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/content.ts`
- Create: `src/game/createInitialState.ts`
- Test: `src/game/content.test.ts`

- [ ] **Step 1: Write content tests**

Create `src/game/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cityChapters, expansionCategories, generatorDefs, itemDefs, orderDefs } from "./content";
import { createInitialState } from "./createInitialState";

describe("travel merge content", () => {
  it("keeps shopping and food as reserved expansion categories", () => {
    expect(expansionCategories).toContain("shopping");
    expect(expansionCategories).toContain("food");
  });

  it("defines one current-city generator for Tokyo Day 1", () => {
    const city = cityChapters.tokyoDay1;
    expect(city.cityName).toBe("Tokyo");
    expect(city.cityGeneratorIds).toEqual(["tokyo-convenience-bag-1"]);
    expect(generatorDefs["tokyo-convenience-bag-1"].cityLimited).toBe(true);
  });

  it("defines orders that mix persistent and city items", () => {
    const departure = orderDefs["departure-prep"];
    const cityErrand = orderDefs["tokyo-morning-errand"];
    expect(departure.requirements.map((requirement) => itemDefs[requirement.itemId].scope)).toEqual([
      "persistent",
      "persistent"
    ]);
    expect(cityErrand.requirements.map((requirement) => itemDefs[requirement.itemId].scope)).toContain("city");
  });

  it("creates a board with resident generators already occupying cells", () => {
    const state = createInitialState();
    const generatorCells = state.board.filter((piece) => piece?.kind === "generator");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("suitcase-1");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("tokyo-convenience-bag-1");
  });
});
```

- [ ] **Step 2: Run content tests to verify they fail**

Run:

```bash
npm test -- src/game/content.test.ts
```

Expected: FAIL because `src/game/content.ts` and `src/game/createInitialState.ts` do not exist.

- [ ] **Step 3: Create domain types**

Create `src/game/types.ts`:

```ts
export type ItemScope = "persistent" | "city";
export type ItemCategory =
  | "travel"
  | "toiletry"
  | "medicine"
  | "general-food"
  | "local-food"
  | "souvenir"
  | "transit"
  | "shopping"
  | "food";

export type PieceKind = "item" | "generator" | "locked";

export interface ItemDef {
  id: string;
  chainId: string;
  label: string;
  shortLabel: string;
  emoji: string;
  level: number;
  scope: ItemScope;
  category: ItemCategory;
  nextId?: string;
}

export interface WeightedOutput {
  itemId: string;
  weight: number;
}

export interface GeneratorDef {
  id: string;
  chainId: string;
  label: string;
  shortLabel: string;
  emoji: string;
  level: number;
  energyCost: number;
  outputs: WeightedOutput[];
  cityLimited: boolean;
  nextId?: string;
}

export interface OrderRequirement {
  itemId: string;
  count: number;
}

export interface OrderDef {
  id: string;
  requester: string;
  title: string;
  flavor: string;
  requirements: OrderRequirement[];
  rewardStars: number;
  rewardCityProgress: number;
  rewardCatMood?: number;
}

export interface CityChapter {
  id: string;
  cityName: string;
  dayLabel: string;
  sceneTitle: string;
  sceneSubtitle: string;
  cityGeneratorIds: string[];
  orderIds: string[];
}

export interface BoardPiece {
  uid: string;
  kind: PieceKind;
  defId: string;
}

export interface GameState {
  board: Array<BoardPiece | null>;
  boardCols: number;
  energy: number;
  stars: number;
  cityProgress: number;
  catMood: number;
  selectedIndex: number | null;
  activeOrderIds: string[];
  completedOrderIds: string[];
  message: string;
  nextUid: number;
  cityChapterId: string;
}
```

- [ ] **Step 4: Create content definitions**

Create `src/game/content.ts`:

```ts
import type { CityChapter, GeneratorDef, ItemCategory, ItemDef, OrderDef } from "./types";

export const expansionCategories: ItemCategory[] = ["shopping", "food"];

export const itemDefs: Record<string, ItemDef> = {
  "small-pouch": {
    id: "small-pouch",
    chainId: "travel-prep",
    label: "Small Pouch",
    shortLabel: "Pouch",
    emoji: "👝",
    level: 1,
    scope: "persistent",
    category: "travel",
    nextId: "day-bag"
  },
  "day-bag": {
    id: "day-bag",
    chainId: "travel-prep",
    label: "Day Bag",
    shortLabel: "Bag",
    emoji: "👜",
    level: 2,
    scope: "persistent",
    category: "travel",
    nextId: "backpack"
  },
  backpack: {
    id: "backpack",
    chainId: "travel-prep",
    label: "Backpack",
    shortLabel: "Pack",
    emoji: "🎒",
    level: 3,
    scope: "persistent",
    category: "travel",
    nextId: "organized-luggage"
  },
  "organized-luggage": {
    id: "organized-luggage",
    chainId: "travel-prep",
    label: "Organized Luggage",
    shortLabel: "Luggage",
    emoji: "🧳",
    level: 4,
    scope: "persistent",
    category: "travel"
  },
  "cleanser-sample": {
    id: "cleanser-sample",
    chainId: "toiletry",
    label: "Cleanser Sample",
    shortLabel: "Cleanser",
    emoji: "🧴",
    level: 1,
    scope: "persistent",
    category: "toiletry",
    nextId: "cleanser-bottle"
  },
  "cleanser-bottle": {
    id: "cleanser-bottle",
    chainId: "toiletry",
    label: "Cleanser Bottle",
    shortLabel: "Bottle",
    emoji: "🧴",
    level: 2,
    scope: "persistent",
    category: "toiletry",
    nextId: "skincare-set"
  },
  "skincare-set": {
    id: "skincare-set",
    chainId: "toiletry",
    label: "Skincare Set",
    shortLabel: "Skincare",
    emoji: "🧼",
    level: 3,
    scope: "persistent",
    category: "toiletry"
  },
  pill: {
    id: "pill",
    chainId: "medicine",
    label: "Pill",
    shortLabel: "Pill",
    emoji: "💊",
    level: 1,
    scope: "persistent",
    category: "medicine",
    nextId: "medicine-strip"
  },
  "medicine-strip": {
    id: "medicine-strip",
    chainId: "medicine",
    label: "Medicine Strip",
    shortLabel: "Strip",
    emoji: "💊",
    level: 2,
    scope: "persistent",
    category: "medicine",
    nextId: "travel-medicine-box"
  },
  "travel-medicine-box": {
    id: "travel-medicine-box",
    chainId: "medicine",
    label: "Travel Medicine Box",
    shortLabel: "Med Box",
    emoji: "🩹",
    level: 3,
    scope: "persistent",
    category: "medicine"
  },
  "instant-noodles": {
    id: "instant-noodles",
    chainId: "general-snack",
    label: "Instant Noodles",
    shortLabel: "Noodles",
    emoji: "🍜",
    level: 1,
    scope: "persistent",
    category: "general-food",
    nextId: "travel-meal-kit"
  },
  "travel-meal-kit": {
    id: "travel-meal-kit",
    chainId: "general-snack",
    label: "Travel Meal Kit",
    shortLabel: "Meal Kit",
    emoji: "🍱",
    level: 2,
    scope: "persistent",
    category: "general-food"
  },
  "rice-ball": {
    id: "rice-ball",
    chainId: "tokyo-local-food",
    label: "Rice Ball",
    shortLabel: "Onigiri",
    emoji: "🍙",
    level: 1,
    scope: "city",
    category: "local-food",
    nextId: "bento"
  },
  bento: {
    id: "bento",
    chainId: "tokyo-local-food",
    label: "Bento",
    shortLabel: "Bento",
    emoji: "🍱",
    level: 2,
    scope: "city",
    category: "local-food",
    nextId: "ramen-ticket"
  },
  "ramen-ticket": {
    id: "ramen-ticket",
    chainId: "tokyo-local-food",
    label: "Ramen Ticket",
    shortLabel: "Ramen",
    emoji: "🎟️",
    level: 3,
    scope: "city",
    category: "local-food"
  },
  charm: {
    id: "charm",
    chainId: "tokyo-souvenir",
    label: "Charm",
    shortLabel: "Charm",
    emoji: "🔖",
    level: 1,
    scope: "city",
    category: "souvenir",
    nextId: "wind-chime"
  },
  "wind-chime": {
    id: "wind-chime",
    chainId: "tokyo-souvenir",
    label: "Wind Chime",
    shortLabel: "Chime",
    emoji: "🎐",
    level: 2,
    scope: "city",
    category: "souvenir",
    nextId: "stamp-booklet"
  },
  "stamp-booklet": {
    id: "stamp-booklet",
    chainId: "tokyo-souvenir",
    label: "Stamp Booklet",
    shortLabel: "Booklet",
    emoji: "📒",
    level: 3,
    scope: "city",
    category: "souvenir"
  },
  "station-ticket": {
    id: "station-ticket",
    chainId: "tokyo-transit",
    label: "Station Ticket",
    shortLabel: "Ticket",
    emoji: "🎫",
    level: 1,
    scope: "city",
    category: "transit",
    nextId: "day-pass"
  },
  "day-pass": {
    id: "day-pass",
    chainId: "tokyo-transit",
    label: "Day Pass",
    shortLabel: "Pass",
    emoji: "🚇",
    level: 2,
    scope: "city",
    category: "transit"
  }
};

export const generatorDefs: Record<string, GeneratorDef> = {
  "suitcase-1": {
    id: "suitcase-1",
    chainId: "suitcase",
    label: "Suitcase",
    shortLabel: "Case",
    emoji: "🧳",
    level: 1,
    energyCost: 1,
    cityLimited: false,
    nextId: "suitcase-2",
    outputs: [
      { itemId: "small-pouch", weight: 70 },
      { itemId: "day-bag", weight: 30 }
    ]
  },
  "suitcase-2": {
    id: "suitcase-2",
    chainId: "suitcase",
    label: "Organized Suitcase",
    shortLabel: "Case+",
    emoji: "🧳",
    level: 2,
    energyCost: 1,
    cityLimited: false,
    outputs: [
      { itemId: "small-pouch", weight: 35 },
      { itemId: "day-bag", weight: 45 },
      { itemId: "backpack", weight: 20 }
    ]
  },
  "toiletry-kit-1": {
    id: "toiletry-kit-1",
    chainId: "toiletry-kit",
    label: "Toiletry Kit",
    shortLabel: "Wash",
    emoji: "🧼",
    level: 1,
    energyCost: 1,
    cityLimited: false,
    outputs: [
      { itemId: "cleanser-sample", weight: 80 },
      { itemId: "cleanser-bottle", weight: 20 }
    ]
  },
  "medicine-pouch-1": {
    id: "medicine-pouch-1",
    chainId: "medicine-pouch",
    label: "Medicine Pouch",
    shortLabel: "Meds",
    emoji: "🩹",
    level: 1,
    energyCost: 1,
    cityLimited: false,
    outputs: [
      { itemId: "pill", weight: 75 },
      { itemId: "medicine-strip", weight: 25 }
    ]
  },
  "snack-source-1": {
    id: "snack-source-1",
    chainId: "snack-source",
    label: "Snack Source",
    shortLabel: "Snack",
    emoji: "🍜",
    level: 1,
    energyCost: 1,
    cityLimited: false,
    outputs: [{ itemId: "instant-noodles", weight: 100 }]
  },
  "tokyo-convenience-bag-1": {
    id: "tokyo-convenience-bag-1",
    chainId: "tokyo-convenience-bag",
    label: "Tokyo Convenience Bag",
    shortLabel: "Tokyo",
    emoji: "🏪",
    level: 1,
    energyCost: 1,
    cityLimited: true,
    outputs: [
      { itemId: "rice-ball", weight: 42 },
      { itemId: "charm", weight: 28 },
      { itemId: "station-ticket", weight: 30 }
    ]
  }
};

export const orderDefs: Record<string, OrderDef> = {
  "departure-prep": {
    id: "departure-prep",
    requester: "Avery",
    title: "Departure Prep",
    flavor: "Pack the daily basics before the group leaves the hotel.",
    requirements: [
      { itemId: "travel-medicine-box", count: 1 },
      { itemId: "cleanser-bottle", count: 1 }
    ],
    rewardStars: 1,
    rewardCityProgress: 1
  },
  "tokyo-morning-errand": {
    id: "tokyo-morning-errand",
    requester: "Mina",
    title: "Tokyo Morning Errand",
    flavor: "Grab a bite and get everyone to the first station.",
    requirements: [
      { itemId: "rice-ball", count: 1 },
      { itemId: "station-ticket", count: 1 }
    ],
    rewardStars: 1,
    rewardCityProgress: 1
  },
  "cat-preference": {
    id: "cat-preference",
    requester: "Mochi",
    title: "Cat Preference",
    flavor: "Mochi wants a tiny lucky charm tucked into the day bag.",
    requirements: [
      { itemId: "day-bag", count: 1 },
      { itemId: "charm", count: 1 }
    ],
    rewardStars: 1,
    rewardCityProgress: 1,
    rewardCatMood: 1
  },
  "cast-request": {
    id: "cast-request",
    requester: "Theo",
    title: "Late Train Backup",
    flavor: "Theo insists on emergency food before the group misses dinner.",
    requirements: [{ itemId: "travel-meal-kit", count: 1 }],
    rewardStars: 1,
    rewardCityProgress: 1
  }
};

export const cityChapters: Record<string, CityChapter> = {
  tokyoDay1: {
    id: "tokyoDay1",
    cityName: "Tokyo",
    dayLabel: "Day 1",
    sceneTitle: "Tokyo Morning Street",
    sceneSubtitle: "The long-term travel board continues while Tokyo adds temporary local orders.",
    cityGeneratorIds: ["tokyo-convenience-bag-1"],
    orderIds: ["departure-prep", "tokyo-morning-errand", "cat-preference", "cast-request"]
  }
};
```

- [ ] **Step 5: Create deterministic initial state**

Create `src/game/createInitialState.ts`:

```ts
import type { BoardPiece, GameState } from "./types";

function piece(uid: number, kind: BoardPiece["kind"], defId: string): BoardPiece {
  return { uid: `piece-${uid}`, kind, defId };
}

export function createInitialState(): GameState {
  return {
    boardCols: 6,
    energy: 72,
    stars: 0,
    cityProgress: 0,
    catMood: 0,
    selectedIndex: null,
    activeOrderIds: ["departure-prep", "tokyo-morning-errand", "cat-preference"],
    completedOrderIds: [],
    message: "Tap an on-board generator to produce travel items.",
    nextUid: 28,
    cityChapterId: "tokyoDay1",
    board: [
      piece(1, "generator", "suitcase-1"),
      piece(2, "item", "pill"),
      piece(3, "item", "pill"),
      null,
      piece(4, "locked", "wrapped-parcel"),
      null,
      piece(5, "item", "small-pouch"),
      piece(6, "item", "small-pouch"),
      null,
      piece(7, "generator", "tokyo-convenience-bag-1"),
      piece(8, "item", "rice-ball"),
      null,
      null,
      piece(9, "item", "cleanser-sample"),
      piece(10, "item", "cleanser-sample"),
      null,
      piece(11, "item", "charm"),
      piece(12, "item", "charm"),
      piece(13, "locked", "dusty-cell"),
      null,
      piece(14, "generator", "toiletry-kit-1"),
      null,
      null,
      piece(15, "locked", "wrapped-parcel"),
      null,
      piece(16, "item", "instant-noodles"),
      piece(17, "item", "instant-noodles"),
      null,
      piece(18, "item", "station-ticket"),
      piece(19, "item", "station-ticket"),
      piece(20, "locked", "old-luggage"),
      null,
      piece(21, "generator", "medicine-pouch-1"),
      null,
      piece(22, "generator", "snack-source-1"),
      null
    ]
  };
}
```

- [ ] **Step 6: Run content tests**

Run:

```bash
npm test -- src/game/content.test.ts
```

Expected: PASS with 4 tests.

- [ ] **Step 7: Commit content data**

Run:

```bash
git add src/game/types.ts src/game/content.ts src/game/createInitialState.ts src/game/content.test.ts
git commit -m "feat: add travel merge content data"
```

---

### Task 3: Board Mechanics

**Files:**
- Create: `src/game/mergeLogic.test.ts`
- Create: `src/game/mergeLogic.ts`

- [ ] **Step 1: Write mechanics tests**

Create `src/game/mergeLogic.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialState } from "./createInitialState";
import { emitFromGenerator, fulfillOrder, moveOrMerge } from "./mergeLogic";
import type { GameState } from "./types";

function findPieceIndex(state: GameState, defId: string): number {
  const index = state.board.findIndex((piece) => piece?.defId === defId);
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
}

describe("merge board mechanics", () => {
  it("emits from a board-resident persistent generator and consumes energy", () => {
    const state = createInitialState();
    const suitcaseIndex = findPieceIndex(state, "suitcase-1");
    const next = emitFromGenerator(state, suitcaseIndex, 0.1);
    expect(next.energy).toBe(state.energy - 1);
    expect(next.board.some((piece) => piece?.kind === "item" && piece.defId === "small-pouch")).toBe(true);
    expect(next.message).toContain("Suitcase produced Small Pouch");
  });

  it("emits only configured city content from the Tokyo generator", () => {
    const state = createInitialState();
    const tokyoIndex = findPieceIndex(state, "tokyo-convenience-bag-1");
    const next = emitFromGenerator(state, tokyoIndex, 0.95);
    const itemIds = next.board.filter((piece) => piece?.kind === "item").map((piece) => piece?.defId);
    expect(itemIds).toContain("station-ticket");
    expect(next.message).toContain("Tokyo Convenience Bag");
  });

  it("merges two identical items into the next tier", () => {
    const state = createInitialState();
    const firstPill = state.board.findIndex((piece) => piece?.defId === "pill");
    const secondPill = state.board.findIndex((piece, index) => index > firstPill && piece?.defId === "pill");
    const next = moveOrMerge(state, firstPill, secondPill);
    expect(next.board[firstPill]).toBeNull();
    expect(next.board[secondPill]?.defId).toBe("medicine-strip");
    expect(next.message).toContain("Merged Pill");
  });

  it("moves a normal item into an empty cell", () => {
    const state = createInitialState();
    const itemIndex = findPieceIndex(state, "rice-ball");
    const emptyIndex = state.board.findIndex((piece) => piece === null);
    const next = moveOrMerge(state, itemIndex, emptyIndex);
    expect(next.board[itemIndex]).toBeNull();
    expect(next.board[emptyIndex]?.defId).toBe("rice-ball");
  });

  it("merges two identical generators into an upgraded generator", () => {
    const state = createInitialState();
    const suitcaseIndex = findPieceIndex(state, "suitcase-1");
    const emptyIndex = state.board.findIndex((piece) => piece === null);
    const withDuplicate = {
      ...state,
      board: state.board.map((piece, index) =>
        index === emptyIndex ? { uid: "duplicate-suitcase", kind: "generator" as const, defId: "suitcase-1" } : piece
      )
    };
    const next = moveOrMerge(withDuplicate, suitcaseIndex, emptyIndex);
    expect(next.board[suitcaseIndex]).toBeNull();
    expect(next.board[emptyIndex]?.defId).toBe("suitcase-2");
    expect(next.message).toContain("Upgraded Suitcase");
  });

  it("rejects generator emission when the board has no empty cells", () => {
    const state = createInitialState();
    const filled = {
      ...state,
      board: state.board.map((piece, index) =>
        piece ? piece : { uid: `filler-${index}`, kind: "locked" as const, defId: "packed-cell" }
      )
    };
    const suitcaseIndex = findPieceIndex(filled, "suitcase-1");
    const next = emitFromGenerator(filled, suitcaseIndex, 0.1);
    expect(next.energy).toBe(filled.energy);
    expect(next.message).toContain("No empty space");
  });

  it("fulfills an order, consumes required items, and grants progress", () => {
    const state = createInitialState();
    const withMedicineStrip = moveOrMerge(state, findPieceIndex(state, "pill"), 2);
    const withMedBox = {
      ...withMedicineStrip,
      board: withMedicineStrip.board.map((piece, index) =>
        index === 2 ? { ...piece!, defId: "travel-medicine-box" } : piece
      )
    };
    const withCleanser = moveOrMerge(withMedBox, findPieceIndex(withMedBox, "cleanser-sample"), 14);
    const ready = {
      ...withCleanser,
      board: withCleanser.board.map((piece, index) =>
        index === 14 ? { ...piece!, defId: "cleanser-bottle" } : piece
      )
    };
    const next = fulfillOrder(ready, "departure-prep");
    expect(next.stars).toBe(ready.stars + 1);
    expect(next.cityProgress).toBe(ready.cityProgress + 1);
    expect(next.completedOrderIds).toContain("departure-prep");
    expect(next.board.some((piece) => piece?.defId === "travel-medicine-box")).toBe(false);
  });
});
```

- [ ] **Step 2: Run mechanics tests to verify they fail**

Run:

```bash
npm test -- src/game/mergeLogic.test.ts
```

Expected: FAIL because `emitFromGenerator`, `moveOrMerge`, and `fulfillOrder` do not exist.

- [ ] **Step 3: Implement board mechanics**

Create `src/game/mergeLogic.ts`:

```ts
import { generatorDefs, itemDefs, orderDefs } from "./content";
import type { BoardPiece, GameState, WeightedOutput } from "./types";

function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: [...state.board],
    activeOrderIds: [...state.activeOrderIds],
    completedOrderIds: [...state.completedOrderIds]
  };
}

function nextUid(state: GameState): [string, number] {
  return [`piece-${state.nextUid}`, state.nextUid + 1];
}

function adjacentIndexes(index: number, cols: number, boardLength: number): number[] {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const candidates = [
    [row - 1, col],
    [row, col + 1],
    [row + 1, col],
    [row, col - 1]
  ];
  return candidates
    .filter(([candidateRow, candidateCol]) => candidateRow >= 0 && candidateCol >= 0 && candidateCol < cols)
    .map(([candidateRow, candidateCol]) => candidateRow * cols + candidateCol)
    .filter((candidateIndex) => candidateIndex >= 0 && candidateIndex < boardLength);
}

function findEmptySlot(state: GameState, sourceIndex: number): number {
  const adjacentEmpty = adjacentIndexes(sourceIndex, state.boardCols, state.board.length).find(
    (candidateIndex) => state.board[candidateIndex] === null
  );
  if (adjacentEmpty !== undefined) {
    return adjacentEmpty;
  }
  return state.board.findIndex((piece) => piece === null);
}

function pickOutput(outputs: WeightedOutput[], roll: number): string {
  const totalWeight = outputs.reduce((sum, output) => sum + output.weight, 0);
  const target = Math.max(0, Math.min(roll, 0.999999)) * totalWeight;
  let running = 0;
  for (const output of outputs) {
    running += output.weight;
    if (target < running) {
      return output.itemId;
    }
  }
  return outputs[outputs.length - 1].itemId;
}

export function emitFromGenerator(state: GameState, generatorIndex: number, roll = Math.random()): GameState {
  const sourcePiece = state.board[generatorIndex];
  if (!sourcePiece || sourcePiece.kind !== "generator") {
    return { ...state, selectedIndex: null, message: "Select a generator on the board first." };
  }

  const generator = generatorDefs[sourcePiece.defId];
  if (!generator) {
    return { ...state, selectedIndex: null, message: "This generator is not configured." };
  }

  if (state.energy < generator.energyCost) {
    return { ...state, selectedIndex: null, message: "Not enough energy to produce an item." };
  }

  const emptySlot = findEmptySlot(state, generatorIndex);
  if (emptySlot < 0) {
    return { ...state, selectedIndex: null, message: "No empty space on the board." };
  }

  const outputId = pickOutput(generator.outputs, roll);
  const outputDef = itemDefs[outputId];
  const [uid, nextUidValue] = nextUid(state);
  const next = cloneState(state);
  next.board[emptySlot] = { uid, kind: "item", defId: outputId };
  next.energy -= generator.energyCost;
  next.nextUid = nextUidValue;
  next.selectedIndex = emptySlot;
  next.message = `${generator.label} produced ${outputDef.label}.`;
  return next;
}

export function moveOrMerge(state: GameState, fromIndex: number, toIndex: number): GameState {
  const sourcePiece = state.board[fromIndex];
  const targetPiece = state.board[toIndex];
  if (!sourcePiece) {
    return { ...state, selectedIndex: null, message: "Select an item or generator first." };
  }
  if (fromIndex === toIndex) {
    return { ...state, selectedIndex: fromIndex, message: "Selected." };
  }
  if (sourcePiece.kind === "locked") {
    return { ...state, selectedIndex: null, message: "This space is still locked." };
  }

  const next = cloneState(state);
  if (!targetPiece) {
    next.board[toIndex] = sourcePiece;
    next.board[fromIndex] = null;
    next.selectedIndex = toIndex;
    next.message = "Moved.";
    return next;
  }

  if (targetPiece.kind !== sourcePiece.kind || targetPiece.defId !== sourcePiece.defId) {
    return { ...state, selectedIndex: null, message: "Only identical pieces can merge." };
  }

  if (sourcePiece.kind === "item") {
    const itemDef = itemDefs[sourcePiece.defId];
    if (!itemDef.nextId) {
      return { ...state, selectedIndex: null, message: `${itemDef.label} is already at the top tier.` };
    }
    next.board[toIndex] = { ...targetPiece, defId: itemDef.nextId };
    next.board[fromIndex] = null;
    next.selectedIndex = toIndex;
    next.message = `Merged ${itemDef.label} into ${itemDefs[itemDef.nextId].label}.`;
    return next;
  }

  if (sourcePiece.kind === "generator") {
    const generatorDef = generatorDefs[sourcePiece.defId];
    if (!generatorDef.nextId) {
      return { ...state, selectedIndex: null, message: `${generatorDef.label} cannot upgrade in this prototype.` };
    }
    next.board[toIndex] = { ...targetPiece, defId: generatorDef.nextId };
    next.board[fromIndex] = null;
    next.selectedIndex = toIndex;
    next.message = `Upgraded ${generatorDef.label}.`;
    return next;
  }

  return { ...state, selectedIndex: null, message: "This piece cannot merge." };
}

function consumeRequiredItems(board: Array<BoardPiece | null>, itemId: string, count: number): boolean {
  const indexes = board
    .map((piece, index) => ({ piece, index }))
    .filter(({ piece }) => piece?.kind === "item" && piece.defId === itemId)
    .slice(0, count)
    .map(({ index }) => index);

  if (indexes.length < count) {
    return false;
  }

  for (const index of indexes) {
    board[index] = null;
  }
  return true;
}

export function fulfillOrder(state: GameState, orderId: string): GameState {
  const order = orderDefs[orderId];
  if (!order || !state.activeOrderIds.includes(orderId)) {
    return { ...state, selectedIndex: null, message: "This order is not active." };
  }

  const hasRequirements = order.requirements.every((requirement) => {
    const owned = state.board.filter((piece) => piece?.kind === "item" && piece.defId === requirement.itemId).length;
    return owned >= requirement.count;
  });

  if (!hasRequirements) {
    return { ...state, selectedIndex: null, message: "Required items are missing." };
  }

  const next = cloneState(state);
  for (const requirement of order.requirements) {
    consumeRequiredItems(next.board, requirement.itemId, requirement.count);
  }
  next.activeOrderIds = next.activeOrderIds.filter((activeOrderId) => activeOrderId !== orderId);
  next.completedOrderIds = [...next.completedOrderIds, orderId];
  next.stars += order.rewardStars;
  next.cityProgress += order.rewardCityProgress;
  next.catMood += order.rewardCatMood === undefined ? 0 : order.rewardCatMood;
  next.selectedIndex = null;
  next.message = `${order.requester} completed "${order.title}".`;
  return next;
}
```

- [ ] **Step 4: Run mechanics tests**

Run:

```bash
npm test -- src/game/mergeLogic.test.ts
```

Expected: PASS with 7 tests.

- [ ] **Step 5: Run all tests**

Run:

```bash
npm test
```

Expected: PASS for content and mechanics tests.

- [ ] **Step 6: Commit mechanics**

Run:

```bash
git add src/game/mergeLogic.ts src/game/mergeLogic.test.ts
git commit -m "feat: implement merge board mechanics"
```

---

### Task 4: Playable React UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Replace scaffold with playable app**

Modify `src/App.tsx`:

```tsx
import { RotateCcw, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { cityChapters, generatorDefs, itemDefs, orderDefs } from "./game/content";
import { createInitialState } from "./game/createInitialState";
import { emitFromGenerator, fulfillOrder, moveOrMerge } from "./game/mergeLogic";
import type { BoardPiece, GameState } from "./game/types";

function getPieceLabel(piece: BoardPiece | null): { emoji: string; shortLabel: string; label: string; className: string } {
  if (!piece) {
    return { emoji: "", shortLabel: "", label: "Empty", className: "empty" };
  }
  if (piece.kind === "locked") {
    return { emoji: "📦", shortLabel: "Locked", label: "Locked travel space", className: "locked" };
  }
  if (piece.kind === "generator") {
    const generator = generatorDefs[piece.defId];
    return {
      emoji: generator.emoji,
      shortLabel: generator.shortLabel,
      label: generator.label,
      className: generator.cityLimited ? "generator city-generator" : "generator persistent-generator"
    };
  }
  const item = itemDefs[piece.defId];
  return {
    emoji: item.emoji,
    shortLabel: item.shortLabel,
    label: item.label,
    className: item.scope === "city" ? "item city-item" : "item persistent-item"
  };
}

function canFulfillOrder(state: GameState, orderId: string): boolean {
  const order = orderDefs[orderId];
  return order.requirements.every((requirement) => {
    const owned = state.board.filter((piece) => piece?.kind === "item" && piece.defId === requirement.itemId).length;
    return owned >= requirement.count;
  });
}

export default function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState());
  const chapter = cityChapters[game.cityChapterId];
  const selectedPiece = game.selectedIndex === null ? null : game.board[game.selectedIndex];

  const selectedLabel = useMemo(() => getPieceLabel(selectedPiece), [selectedPiece]);

  function handleCellClick(index: number) {
    const piece = game.board[index];
    if (game.selectedIndex === null) {
      if (!piece) {
        setGame({ ...game, message: "Select a piece first." });
        return;
      }
      if (piece.kind === "generator") {
        setGame(emitFromGenerator(game, index));
        return;
      }
      setGame({ ...game, selectedIndex: index, message: `${getPieceLabel(piece).label} selected.` });
      return;
    }

    if (game.selectedIndex === index && piece?.kind === "generator") {
      setGame(emitFromGenerator(game, index));
      return;
    }

    setGame(moveOrMerge(game, game.selectedIndex, index));
  }

  function handleOrderClick(orderId: string) {
    setGame(fulfillOrder(game, orderId));
  }

  function resetPrototype() {
    setGame(createInitialState());
  }

  return (
    <main className="game-shell">
      <section className="phone-frame" aria-label="Travel Merge2 prototype">
        <header className="hud">
          <div className="hud-pill">
            <Zap size={16} aria-hidden="true" />
            <span>{game.energy}</span>
          </div>
          <div className="hud-pill">
            <Sparkles size={16} aria-hidden="true" />
            <span>{game.stars}</span>
          </div>
          <div className="hud-progress">
            {chapter.cityName} {chapter.dayLabel}
            <strong>{game.cityProgress}/4</strong>
          </div>
          <button className="icon-button" type="button" onClick={resetPrototype} aria-label="Reset prototype">
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </header>

        <section className="scene-strip">
          <div>
            <p className="eyebrow">Current City Layer</p>
            <h1>{chapter.sceneTitle}</h1>
            <p>{chapter.sceneSubtitle}</p>
          </div>
          <div className="cast-strip" aria-label="Travel cast">
            <span>Avery</span>
            <span>Mina</span>
            <span>Theo</span>
            <span className="cat">Mochi 🐈</span>
          </div>
        </section>

        <section className="board" style={{ gridTemplateColumns: `repeat(${game.boardCols}, minmax(0, 1fr))` }}>
          {game.board.map((piece, index) => {
            const label = getPieceLabel(piece);
            const selected = game.selectedIndex === index;
            return (
              <button
                className={`cell ${label.className} ${selected ? "selected" : ""}`}
                type="button"
                key={piece ? piece.uid : `empty-${index}`}
                onClick={() => handleCellClick(index)}
                aria-label={`${label.label} cell ${index + 1}`}
              >
                <span className="cell-emoji">{label.emoji}</span>
                <span className="cell-label">{label.shortLabel}</span>
              </button>
            );
          })}
        </section>

        <section className="feedback-panel">
          <div>
            <p className="eyebrow">Selected</p>
            <strong>{selectedPiece ? selectedLabel.label : "None"}</strong>
          </div>
          <p>{game.message}</p>
        </section>

        <section className="orders-panel" aria-label="Active orders">
          <div className="orders-header">
            <div>
              <p className="eyebrow">Orders</p>
              <h2>Travel Timeline</h2>
            </div>
            <span>Cat mood {game.catMood}</span>
          </div>
          <div className="orders-list">
            {game.activeOrderIds.map((orderId) => {
              const order = orderDefs[orderId];
              const ready = canFulfillOrder(game, orderId);
              return (
                <article className={`order-card ${ready ? "ready" : ""}`} key={order.id}>
                  <div>
                    <span className="requester">{order.requester}</span>
                    <h3>{order.title}</h3>
                    <p>{order.flavor}</p>
                    <ul>
                      {order.requirements.map((requirement) => (
                        <li key={requirement.itemId}>
                          {itemDefs[requirement.itemId].emoji} {itemDefs[requirement.itemId].label} x{requirement.count}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button type="button" disabled={!ready} onClick={() => handleOrderClick(order.id)}>
                    Deliver
                  </button>
                </article>
              );
            })}
            {game.activeOrderIds.length === 0 ? (
              <article className="order-card ready">
                <div>
                  <span className="requester">Chapter Hook</span>
                  <h3>Recover City Generator</h3>
                  <p>Tokyo limited content can be recovered into collection rewards before the next city opens.</p>
                </div>
                <button type="button" onClick={() => setGame({ ...game, message: "Recovery hook reserved for the next slice." })}>
                  Preview
                </button>
              </article>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Replace scaffold styles with portrait game layout**

Modify `src/styles.css`:

```css
* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #dfeaf3;
  color: #132033;
}

button {
  font: inherit;
}

.game-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 16px;
}

.phone-frame {
  width: min(430px, 100%);
  min-height: min(900px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #91a7bc;
  border-radius: 8px;
  background: #f8fbff;
  box-shadow: 0 18px 48px rgba(21, 44, 67, 0.18);
  padding: 12px;
}

.hud {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 8px;
  align-items: center;
}

.hud-pill,
.hud-progress,
.icon-button {
  min-height: 36px;
  border: 1px solid #9fb4c9;
  border-radius: 8px;
  background: #ffffff;
  color: #102033;
}

.hud-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  font-weight: 800;
}

.hud-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 10px;
  font-size: 13px;
}

.hud-progress strong {
  color: #0d5d87;
}

.icon-button {
  width: 38px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.scene-strip {
  min-height: 104px;
  display: grid;
  gap: 10px;
  border: 1px solid #c49b5c;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffedc9 0%, #d7edf9 100%);
  padding: 12px;
}

.scene-strip h1,
.orders-header h2,
.order-card h3 {
  margin: 0;
  letter-spacing: 0;
}

.scene-strip h1 {
  font-size: 22px;
}

.scene-strip p,
.order-card p,
.feedback-panel p {
  margin: 0;
  color: #203047;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #34506b;
}

.cast-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cast-strip span {
  border: 1px solid #8ea7bd;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
}

.cast-strip .cat {
  border-color: #bc8a3d;
  background: #fff5dc;
}

.board {
  display: grid;
  gap: 5px;
}

.cell {
  aspect-ratio: 1;
  min-width: 0;
  border: 1px solid #9caec1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: #edf3f8;
  color: #102033;
  cursor: pointer;
  padding: 2px;
}

.cell.selected {
  outline: 3px solid #116d9d;
  outline-offset: 1px;
}

.cell.empty {
  background: #e8eef4;
}

.cell.locked {
  background: #d4d9df;
  color: #334255;
}

.cell.generator {
  background: #ffd88b;
  border-color: #a86f1c;
}

.cell.city-generator {
  background: #bdefff;
  border-color: #31829c;
}

.cell.persistent-item {
  background: #d6f1d3;
  border-color: #679961;
}

.cell.city-item {
  background: #efd6ff;
  border-color: #8753a4;
}

.cell-emoji {
  font-size: clamp(18px, 5vw, 24px);
  line-height: 1;
}

.cell-label {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(9px, 2.4vw, 11px);
  font-weight: 800;
}

.feedback-panel,
.orders-panel {
  border: 1px solid #b5c5d4;
  border-radius: 8px;
  background: #ffffff;
  padding: 10px;
}

.feedback-panel {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  align-items: center;
}

.orders-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.orders-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.orders-header h2 {
  font-size: 18px;
}

.orders-header span {
  font-weight: 800;
  color: #7a4c13;
}

.orders-list {
  display: grid;
  gap: 8px;
}

.order-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  border: 1px solid #b7c8d6;
  border-radius: 8px;
  background: #f7f9fc;
  padding: 10px;
}

.order-card.ready {
  border-color: #4f9f63;
  background: #eefaf0;
}

.requester {
  display: inline-flex;
  margin-bottom: 4px;
  color: #0d5d87;
  font-size: 12px;
  font-weight: 900;
}

.order-card h3 {
  font-size: 15px;
}

.order-card p,
.order-card li {
  font-size: 12px;
}

.order-card ul {
  margin: 6px 0 0;
  padding-left: 16px;
}

.order-card button {
  min-height: 38px;
  border: 1px solid #22668b;
  border-radius: 8px;
  background: #126d9d;
  color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  padding: 0 10px;
}

.order-card button:disabled {
  border-color: #9aa8b3;
  background: #c8d1d8;
  color: #667480;
  cursor: not-allowed;
}

@media (max-width: 390px) {
  .game-shell {
    padding: 8px;
  }

  .phone-frame {
    min-height: calc(100vh - 16px);
    padding: 8px;
  }

  .hud {
    grid-template-columns: auto auto 1fr auto;
    gap: 6px;
  }

  .hud-progress {
    font-size: 11px;
    padding: 0 7px;
  }

  .feedback-panel {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Build the UI**

Run:

```bash
npm run build
```

Expected: command exits with code 0.

- [ ] **Step 4: Run all tests**

Run:

```bash
npm test
```

Expected: all content and mechanics tests pass.

- [ ] **Step 5: Commit playable UI**

Run:

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: add playable travel merge UI"
```

---

### Task 5: Browser Verification And Handoff

**Files:**
- Modify only if verification finds a concrete bug in files from previous tasks.

- [ ] **Step 1: Start local dev server**

Run:

```bash
npm run dev -- --port 5173
```

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 2: Open the prototype in the browser**

Open:

```text
http://127.0.0.1:5173/
```

Expected: the first screen is the playable merge board, not a landing page.

- [ ] **Step 3: Manual playtest checklist**

Perform these interactions:

```text
1. Tap the Suitcase generator.
2. Confirm energy decreases by 1 and a travel item appears in an empty cell.
3. Tap the Tokyo Convenience Bag generator.
4. Confirm the produced item is rice ball, charm, or station ticket.
5. Select two identical pills and merge them into Medicine Strip.
6. Select two identical cleanser samples and merge them into Cleanser Bottle.
7. Select two identical station tickets and merge them into Day Pass.
8. Complete Tokyo Morning Errand once its required items are visible.
9. Confirm stars and city progress increase.
10. Fill or nearly fill the board through emissions and confirm full-board feedback is readable.
```

Expected: no console errors, no overlapping text, and no off-board random generation buttons.

- [ ] **Step 4: Check portrait responsiveness**

Use a browser viewport near:

```text
390 x 844
```

Expected: board cells remain square, labels fit inside cells, orders remain readable, and the reset icon button does not overlap HUD text.

- [ ] **Step 5: Fix concrete verification issues**

If a verification issue appears, change only the responsible file. Example for a cell label overflow issue in `src/styles.css`:

```css
.cell-label {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(9px, 2.4vw, 11px);
  font-weight: 800;
}
```

Run:

```bash
npm run build
npm test
```

Expected: build succeeds and tests pass after the concrete fix.

- [ ] **Step 6: Commit verification fixes if files changed**

Run only if Step 5 changed files:

```bash
git add src/App.tsx src/styles.css src/game
git commit -m "fix: polish travel merge prototype verification"
```

- [ ] **Step 7: Final handoff**

Report:

```text
Playable URL: http://127.0.0.1:5173/
Implemented rules: board-resident generators, Merge2 item upgrading, energy-gated emission, persistent and current-city item chains, order delivery, stars, city progress, cat mood, chapter recovery hook.
Verified: build, tests, manual generator emission, item merge, order completion, portrait layout.
Tuning knobs: generator output weights, order requirements, initial board composition, energy cost, reward values, active order list.
```

---

## Self-Review

Spec coverage:

- Board-resident generators are covered by Tasks 2, 3, and 4.
- Generator upgrading is covered by the `suitcase-1` to `suitcase-2` merge test in Task 3.
- Persistent main board timeline is covered by `createInitialState`, persistent item scopes, and UI copy in Task 4.
- Current-city content package is covered by `cityChapters`, `tokyo-convenience-bag-1`, and city item scopes.
- Shopping and food expansion hooks are covered by `expansionCategories` and content categories.
- Orders, stars, city progress, and cat mood are covered by Tasks 2, 3, and 4.
- Chapter-end generator recovery is represented as the active-order-complete hook in Task 4.
- Testing and browser verification are covered by Tasks 3 and 5.

Placeholder scan:

- The plan contains concrete files, commands, and code snippets for every implementation task.
- No unresolved placeholder markers are present.

Type consistency:

- `GameState`, `BoardPiece`, `ItemDef`, `GeneratorDef`, `OrderDef`, and `CityChapter` are defined in Task 2 and reused consistently in Tasks 3 and 4.
- Function names are consistent: `createInitialState`, `emitFromGenerator`, `moveOrMerge`, and `fulfillOrder`.

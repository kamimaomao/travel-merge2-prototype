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
    const firstPill = findPieceIndex(state, "pill");
    const secondPill = state.board.findIndex((piece, index) => index > firstPill && piece?.defId === "pill");
    expect(secondPill).toBeGreaterThanOrEqual(0);
    const next = moveOrMerge(state, firstPill, secondPill);
    expect(next.board[firstPill]).toBeNull();
    expect(next.board[secondPill]?.defId).toBe("medicine-strip");
    expect(next.message).toContain("Merged Pill");
  });

  it("reveals adjacent sealed spaces after an item merge", () => {
    const state = createInitialState();
    const firstPouch = findPieceIndex(state, "small-pouch");
    const secondPouch = state.board.findIndex((piece, index) => index > firstPouch && piece?.defId === "small-pouch");
    expect(secondPouch).toBeGreaterThanOrEqual(0);
    expect(state.board[9]?.kind).toBe("hidden");
    const next = moveOrMerge(state, firstPouch, secondPouch);
    expect(next.board[secondPouch]?.defId).toBe("day-bag");
    expect(next.board[9]).toBeNull();
    expect(next.message).toContain("Opened 1 sealed space");
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

  it("does not treat hidden cells as playable empty board space", () => {
    const state = createInitialState();
    const hiddenIndex = state.board.findIndex((piece) => piece?.kind === "hidden");
    const itemIndex = findPieceIndex(state, "rice-ball");
    const next = moveOrMerge(state, itemIndex, hiddenIndex);
    expect(next.board[itemIndex]?.defId).toBe("rice-ball");
    expect(next.board[hiddenIndex]?.kind).toBe("hidden");
    expect(next.message).toContain("sealed");
  });

  it("fulfills an order, consumes required items, and grants progress", () => {
    const state = createInitialState();
    const ready = {
      ...state,
      board: state.board.map((piece, index) =>
        index === 1
          ? { uid: "ready-medicine-box", kind: "item" as const, defId: "travel-medicine-box" }
          : index === 2
            ? { uid: "ready-cleanser-bottle", kind: "item" as const, defId: "cleanser-bottle" }
            : piece
      )
    };
    const next = fulfillOrder(ready, "departure-prep");
    expect(next.stars).toBe(ready.stars + 1);
    expect(next.cityProgress).toBe(ready.cityProgress + 1);
    expect(next.completedOrderIds).toContain("departure-prep");
    expect(next.board.some((piece) => piece?.defId === "travel-medicine-box")).toBe(false);
  });

  it("refills the active order strip from the chapter order cycle", () => {
    const state = createInitialState();
    const afterTokyo = fulfillOrder(state, "tokyo-morning-errand");
    expect(afterTokyo.activeOrderIds).toHaveLength(3);
    expect(afterTokyo.activeOrderIds).toContain("cast-request");

    const readyForTheo = {
      ...afterTokyo,
      board: afterTokyo.board.map((piece, index) =>
        index === 6 ? { uid: "ready-travel-meal-kit", kind: "item" as const, defId: "travel-meal-kit" } : piece
      )
    };
    const afterTheo = fulfillOrder(readyForTheo, "cast-request");
    expect(afterTheo.activeOrderIds).toHaveLength(3);
    expect(afterTheo.activeOrderIds).toContain("tokyo-morning-errand");
  });
});

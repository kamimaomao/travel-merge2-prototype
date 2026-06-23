import { describe, expect, it } from "vitest";
import { createInitialState } from "./createInitialState";
import { emitFromGenerator, fulfillOrder, getDropIntent, moveOrMerge } from "./mergeLogic";
import type { GameState } from "./types";

function findPieceIndex(state: GameState, defId: string): number {
  const index = state.board.findIndex((piece) => piece?.defId === defId);
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
}

describe("merge board mechanics", () => {
  it("classifies drag targets before resolving a drop", () => {
    const state = createInitialState();
    const firstPouch = findPieceIndex(state, "small-pouch");
    const secondPouch = state.board.findIndex((piece, index) => index > firstPouch && piece?.defId === "small-pouch");
    const emptyIndex = state.board.findIndex((piece) => piece === null);
    const hiddenIndex = state.board.findIndex((piece) => piece?.kind === "hidden");
    const riceBallIndex = findPieceIndex(state, "rice-ball");

    expect(getDropIntent(state, firstPouch, emptyIndex)).toBe("move");
    expect(getDropIntent(state, firstPouch, secondPouch)).toBe("merge");
    expect(getDropIntent(state, firstPouch, riceBallIndex)).toBe("invalid");
    expect(getDropIntent(state, firstPouch, hiddenIndex)).toBe("invalid");
  });

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
    const firstPouch = findPieceIndex(state, "small-pouch");
    const secondPouch = state.board.findIndex((piece, index) => index > firstPouch && piece?.defId === "small-pouch");
    expect(secondPouch).toBeGreaterThanOrEqual(0);
    const next = moveOrMerge(state, firstPouch, secondPouch);
    expect(next.board[firstPouch]).toBeNull();
    expect(next.board[secondPouch]?.defId).toBe("day-bag");
    expect(next.message).toContain("Merged Small Pouch");
  });

  it("unlocks a sealed source after the first travel-bag merge", () => {
    const state = createInitialState();
    const firstPouch = findPieceIndex(state, "small-pouch");
    const secondPouch = state.board.findIndex((piece, index) => index > firstPouch && piece?.defId === "small-pouch");
    expect(secondPouch).toBeGreaterThanOrEqual(0);
    expect(state.board[9]?.kind).toBe("locked");
    expect(state.board[9]?.defId).toBe("sealed-map-cache");
    const next = moveOrMerge(state, firstPouch, secondPouch);
    expect(next.board[secondPouch]?.defId).toBe("day-bag");
    expect(next.board[9]?.kind).toBe("generator");
    expect(next.board[9]?.defId).toBe("sealed-map-cache");
    expect(next.message).toContain("Opened 1 sealed source");
  });

  it("spends charges from a cooldown-style source before it needs refresh", () => {
    const state = createInitialState();
    const cameraIndex = findPieceIndex(state, "camera-kit-1");

    const first = emitFromGenerator(state, cameraIndex, 0.1);
    expect(first.board[cameraIndex]?.remainingTaps).toBe(1);
    expect(first.energy).toBe(state.energy - 1);

    const second = emitFromGenerator(first, cameraIndex, 0.1);
    expect(second.board[cameraIndex]?.remainingTaps).toBe(0);
    expect(second.energy).toBe(state.energy - 2);

    const third = emitFromGenerator(second, cameraIndex, 0.1);
    expect(third.board[cameraIndex]?.remainingTaps).toBe(0);
    expect(third.energy).toBe(second.energy);
    expect(third.message).toContain("needs a refresh");
  });

  it("consumes a finite activity-style source after its last use", () => {
    const state = createInitialState();
    const voucherIndex = findPieceIndex(state, "festival-voucher-1");

    const first = emitFromGenerator(state, voucherIndex, 0.1);
    expect(first.board[voucherIndex]?.remainingTaps).toBe(2);

    const second = emitFromGenerator(first, voucherIndex, 0.1);
    expect(second.board[voucherIndex]?.remainingTaps).toBe(1);

    const third = emitFromGenerator(second, voucherIndex, 0.1);
    expect(third.board[voucherIndex]).toBeNull();
    expect(third.energy).toBe(state.energy - 3);
    expect(third.message).toContain("Festival Voucher was used up");
  });

  it("opens a one-time container source into currencies without needing empty board space", () => {
    const state = createInitialState();
    const chestIndex = findPieceIndex(state, "souvenir-gift-box");
    const next = emitFromGenerator(state, chestIndex);

    expect(next.board[chestIndex]).toBeNull();
    expect(next.energy).toBe(state.energy);
    expect(next.coins).toBeGreaterThan(state.coins);
    expect(next.gems).toBeGreaterThan(state.gems);
    expect(next.message).toContain("Souvenir Gift Box opened");
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
          ? { uid: "ready-day-bag", kind: "item" as const, defId: "day-bag" }
          : index === 2
            ? { uid: "ready-day-pass", kind: "item" as const, defId: "day-pass" }
            : piece
      )
    };
    const next = fulfillOrder(ready, "departure-prep");
    expect(next.stars).toBe(ready.stars + 1);
    expect(next.activityEnergy).toBe(ready.activityEnergy + 2);
    expect(next.cityProgress).toBe(ready.cityProgress + 1);
    expect(next.completedOrderIds).toContain("departure-prep");
    expect(next.board.some((piece) => piece?.defId === "day-bag")).toBe(false);
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

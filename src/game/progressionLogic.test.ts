import { describe, expect, it } from "vitest";
import { createInitialState } from "./createInitialState";
import { emitFromGenerator, fulfillOrder, moveOrMerge } from "./mergeLogic";
import { unlockMapSpot } from "./progressionLogic";
import type { BoardPiece, GameState } from "./types";

function findPieceIndex(state: GameState, predicate: (piece: BoardPiece) => boolean): number {
  const index = state.board.findIndex((piece) => piece !== null && predicate(piece));
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
}

describe("first-session progression loop", () => {
  it("turns the first order star into a new bridge board beat", () => {
    const state = createInitialState();
    const afterOrder = fulfillOrder(state, "tokyo-morning-errand");

    const afterBridge = unlockMapSpot(afterOrder, "canal-bridge");

    expect(afterBridge.stars).toBe(0);
    expect(afterBridge.unlockedMapSpotIds).toContain("canal-bridge");
    expect(afterBridge.activeOrderIds).toContain("cast-request");
    expect(afterBridge.focusedOrderId).toBe("cast-request");
    expect(afterBridge.board.some((piece) => piece?.kind === "generator" && piece.defId === "snack-source-1")).toBe(
      true
    );
    expect(afterBridge.board.some((piece) => piece?.kind === "locked" && piece.defId === "instant-noodles")).toBe(
      true
    );
    expect(afterBridge.message).toContain("Canal Bridge opened");
  });

  it("lets the bridge unlock produce and merge the next order item", () => {
    const state = createInitialState();
    const afterOrder = fulfillOrder(state, "tokyo-morning-errand");
    const afterBridge = unlockMapSpot(afterOrder, "canal-bridge");
    const snackSourceIndex = findPieceIndex(
      afterBridge,
      (piece) => piece.kind === "generator" && piece.defId === "snack-source-1"
    );

    const afterEmit = emitFromGenerator(afterBridge, snackSourceIndex, 0.1);
    const noodlesIndex = findPieceIndex(
      afterEmit,
      (piece) => piece.kind === "item" && piece.defId === "instant-noodles"
    );
    const lockedNoodlesIndex = findPieceIndex(
      afterEmit,
      (piece) => piece.kind === "locked" && piece.defId === "instant-noodles"
    );

    const afterMerge = moveOrMerge(afterEmit, noodlesIndex, lockedNoodlesIndex);
    expect(afterMerge.board[lockedNoodlesIndex]?.defId).toBe("travel-meal-kit");

    const afterCastOrder = fulfillOrder(afterMerge, "cast-request");
    expect(afterCastOrder.completedOrderIds).toContain("cast-request");
    expect(afterCastOrder.stars).toBe(afterMerge.stars + 1);
  });
});

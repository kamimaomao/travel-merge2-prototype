import { describe, expect, it } from "vitest";
import { createInitialState } from "./createInitialState";
import { emitFromActivityGenerator, getActivityDropIntent, moveOrMergeActivity, openActivityReward } from "./activityLogic";
import type { GameState } from "./types";

function findActivityPieceIndex(state: GameState, defId: string): number {
  const index = state.activityBoard.findIndex((piece) => piece?.defId === defId);
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
}

describe("activity board mechanics", () => {
  it("spends activity tickets through finite-use generators with deterministic output", () => {
    const state = createInitialState();
    const generatorIndex = findActivityPieceIndex(state, "fair-voucher-roll-1");

    const next = emitFromActivityGenerator(state, generatorIndex);

    expect(next.activityEnergy).toBe(state.activityEnergy - 1);
    expect(next.activityBoard[generatorIndex]?.remainingTaps).toBe(3);
    expect(next.activityBoard.some((piece) => piece?.kind === "item" && piece.defId === "fair-stamp-1")).toBe(true);
  });

  it("removes a finite activity generator after its last tap", () => {
    const state = { ...createInitialState(), activityEnergy: 4 };
    const generatorIndex = findActivityPieceIndex(state, "fair-voucher-roll-1");

    const first = emitFromActivityGenerator(state, generatorIndex);
    const second = emitFromActivityGenerator(first, generatorIndex);
    const third = emitFromActivityGenerator(second, generatorIndex);
    const fourth = emitFromActivityGenerator(third, generatorIndex);

    expect(fourth.activityEnergy).toBe(0);
    expect(fourth.activityBoard[generatorIndex]).toBeNull();
    expect(fourth.message).toContain("was used up");
  });

  it("merges activity items into a reward box and opens it into activity currency", () => {
    const state = createInitialState();
    const firstStamp = findActivityPieceIndex(state, "fair-stamp-1");
    const secondStamp = state.activityBoard.findIndex(
      (piece, index) => index > firstStamp && piece?.defId === "fair-stamp-1"
    );
    expect(secondStamp).toBeGreaterThanOrEqual(0);
    expect(getActivityDropIntent(state, firstStamp, secondStamp)).toBe("merge");

    const mergedPair = moveOrMergeActivity(state, firstStamp, secondStamp);
    expect(mergedPair.activityBoard[secondStamp]?.defId).toBe("fair-stamp-2");

    const lockedPair = mergedPair.activityBoard.findIndex(
      (piece) => piece?.kind === "locked" && piece.defId === "fair-stamp-2"
    );
    expect(lockedPair).toBeGreaterThanOrEqual(0);
    expect(getActivityDropIntent(mergedPair, secondStamp, lockedPair)).toBe("merge");
    const rewardReady = moveOrMergeActivity(mergedPair, secondStamp, lockedPair);
    expect(rewardReady.activityBoard[lockedPair]?.defId).toBe("fair-reward-box");

    const opened = openActivityReward(rewardReady, lockedPair);
    expect(opened.activityBoard[lockedPair]).toBeNull();
    expect(opened.activityCurrency).toBe(12);
  });
});

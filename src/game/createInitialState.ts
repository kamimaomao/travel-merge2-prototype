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

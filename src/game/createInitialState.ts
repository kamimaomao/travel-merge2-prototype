import type { BoardPiece, GameState } from "./types";

function piece(uid: number, kind: BoardPiece["kind"], defId: string): BoardPiece {
  return { uid: `piece-${uid}`, kind, defId };
}

export function createInitialState(): GameState {
  const hidden = (uid: number) => piece(uid, "hidden", "sealed-space");

  return {
    boardCols: 6,
    energy: 72,
    stars: 0,
    coins: 1280,
    gems: 36,
    cityProgress: 0,
    catMood: 0,
    selectedIndex: null,
    activeOrderIds: ["departure-prep", "tokyo-morning-errand", "cat-preference"],
    completedOrderIds: [],
    message: "Tap an on-board generator to produce travel items.",
    nextUid: 36,
    cityChapterId: "tokyoDay1",
    board: [
      piece(1, "generator", "suitcase-1"),
      piece(2, "item", "pill"),
      piece(3, "item", "pill"),
      hidden(9),
      hidden(10),
      hidden(11),
      null,
      piece(4, "item", "small-pouch"),
      piece(5, "item", "small-pouch"),
      hidden(12),
      hidden(13),
      hidden(14),
      piece(6, "generator", "tokyo-convenience-bag-1"),
      piece(7, "item", "rice-ball"),
      piece(8, "item", "station-ticket"),
      hidden(15),
      hidden(16),
      hidden(17),
      hidden(18),
      hidden(19),
      hidden(20),
      hidden(21),
      hidden(22),
      hidden(23),
      hidden(24),
      hidden(25),
      hidden(26),
      hidden(27),
      hidden(28),
      hidden(29),
      hidden(30),
      hidden(31),
      hidden(32),
      hidden(33),
      hidden(34),
      hidden(35)
    ]
  };
}

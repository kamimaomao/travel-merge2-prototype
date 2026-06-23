import type { BoardPiece, GameState } from "./types";
import { initialUnlockedMapSpotIds } from "./mapContent";

function piece(uid: number, kind: BoardPiece["kind"], defId: string): BoardPiece {
  return { uid: `piece-${uid}`, kind, defId };
}

function activityPiece(uid: number, kind: BoardPiece["kind"], defId: string, remainingTaps?: number): BoardPiece {
  return { uid: `activity-piece-${uid}`, kind, defId, remainingTaps };
}

export function createInitialState(): GameState {
  const hidden = (uid: number) => piece(uid, "hidden", "sealed-space");
  const activityHidden = (uid: number) => activityPiece(uid, "hidden", "activity-sealed-space");
  const board: Array<BoardPiece | null> = [
    piece(1, "generator", "suitcase-1"),
    piece(2, "generator", "travel-guidebook-1"),
    piece(3, "generator", "travel-guidebook-1"),
    piece(9, "generator", "camera-kit-1"),
    piece(10, "generator", "festival-voucher-1"),
    piece(11, "generator", "souvenir-gift-box"),
    null,
    piece(4, "item", "small-pouch"),
    piece(5, "item", "small-pouch"),
    piece(12, "locked", "sealed-map-cache"),
    null,
    null,
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
  ];

  while (board.length < 63) {
    board.push(hidden(board.length));
  }

  return {
    boardCols: 7,
    boardRows: 9,
    energy: 72,
    stars: 0,
    coins: 1280,
    gems: 36,
    cityProgress: 0,
    catMood: 0,
    selectedIndex: null,
    activityEnergy: 3,
    activityCurrency: 0,
    activityBoardCols: 5,
    activitySelectedIndex: null,
    activityNextUid: 25,
    activeOrderIds: ["departure-prep", "tokyo-morning-errand", "cat-preference"],
    completedOrderIds: [],
    unlockedMapSpotIds: initialUnlockedMapSpotIds,
    message: "Tap an on-board generator to produce travel items.",
    nextUid: 63,
    cityChapterId: "tokyoDay1",
    board,
    activityBoard: [
      activityPiece(1, "generator", "fair-voucher-roll-1", 4),
      activityPiece(2, "generator", "fair-voucher-roll-1", 4),
      null,
      activityPiece(3, "item", "fair-stamp-1"),
      null,
      null,
      activityPiece(4, "item", "fair-stamp-1"),
      null,
      activityHidden(8),
      activityHidden(9),
      null,
      null,
      activityPiece(5, "locked", "fair-stamp-2"),
      activityHidden(13),
      activityHidden(14),
      activityHidden(15),
      activityHidden(16),
      activityHidden(17),
      activityHidden(18),
      activityHidden(19),
      activityHidden(20),
      activityHidden(21),
      activityHidden(22),
      activityHidden(23),
      activityHidden(24)
    ]
  };
}

import { mapSpotDefs } from "./mapContent";
import type { BoardPiece, GameState, MapSpotDef, MapSpotStatus } from "./types";

function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: [...state.board],
    activeOrderIds: [...state.activeOrderIds],
    completedOrderIds: [...state.completedOrderIds],
    unlockedMapSpotIds: [...state.unlockedMapSpotIds]
  };
}

function addPieceToFirstEmpty(state: GameState, kind: BoardPiece["kind"], defId: string): boolean {
  const emptyIndex = state.board.findIndex((piece) => piece === null);
  if (emptyIndex < 0) {
    return false;
  }
  state.board[emptyIndex] = { uid: `piece-${state.nextUid}`, kind, defId };
  state.nextUid += 1;
  return true;
}

function applyMapSpotBoardUnlock(state: GameState, spotId: string): string | null {
  if (spotId !== "canal-bridge") {
    return null;
  }
  const hasSnackSource = state.board.some((piece) => piece?.defId === "snack-source-1");
  if (hasSnackSource) {
    return null;
  }

  const addedSource = addPieceToFirstEmpty(state, "generator", "snack-source-1");
  const addedLockedFood = addPieceToFirstEmpty(state, "locked", "instant-noodles");
  if (addedSource && addedLockedFood) {
    return " A snack source and a wrapped food piece moved onto the board.";
  }
  if (addedSource) {
    return " A snack source moved onto the board.";
  }
  return " The bridge is open, but the board needs space before new travel food can arrive.";
}

export function getMapSpotStatus(state: GameState, spot: MapSpotDef): MapSpotStatus {
  if (spot.category !== "scenic") {
    return "reserved";
  }
  if (state.unlockedMapSpotIds.includes(spot.id)) {
    return "unlocked";
  }
  const nextScenicSpot = mapSpotDefs.find(
    (candidate) => candidate.category === "scenic" && !state.unlockedMapSpotIds.includes(candidate.id)
  );
  return nextScenicSpot?.id === spot.id ? "available" : "locked";
}

export function unlockMapSpot(state: GameState, spotId: string): GameState {
  const spot = mapSpotDefs.find((candidate) => candidate.id === spotId);
  if (!spot) {
    return { ...state, selectedIndex: null, message: "This map spot is not configured." };
  }

  const status = getMapSpotStatus(state, spot);
  if (status === "reserved") {
    return { ...state, selectedIndex: null, message: `${spot.title} is a reserved ${spot.category} branch.` };
  }
  if (status === "unlocked") {
    return { ...state, selectedIndex: null, message: `${spot.title} is already part of the postcard.` };
  }
  if (status === "locked") {
    return { ...state, selectedIndex: null, message: `${spot.title} stays in the fog until the scenic route reaches it.` };
  }
  if (state.stars < spot.starCost) {
    return {
      ...state,
      selectedIndex: null,
      message: `${spot.title} needs ${spot.starCost} star${spot.starCost === 1 ? "" : "s"}.`
    };
  }

  const next = cloneState(state);
  next.stars -= spot.starCost;
  next.unlockedMapSpotIds.push(spot.id);
  next.selectedIndex = null;
  const boardUnlockMessage = applyMapSpotBoardUnlock(next, spot.id) ?? "";
  if (spot.id === "canal-bridge" && next.activeOrderIds.includes("cast-request")) {
    next.focusedOrderId = "cast-request";
  }
  next.message = `${spot.title} opened on the city postcard.${boardUnlockMessage}`;
  return next;
}

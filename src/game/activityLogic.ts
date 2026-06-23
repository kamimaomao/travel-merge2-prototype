import { activityGeneratorDefs, activityItemDefs } from "./activityContent";
import type { BoardPiece, GameState } from "./types";

export type ActivityDropIntent = "move" | "merge" | "invalid";

function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: [...state.board],
    activityBoard: [...state.activityBoard],
    activeOrderIds: [...state.activeOrderIds],
    completedOrderIds: [...state.completedOrderIds],
    unlockedMapSpotIds: [...state.unlockedMapSpotIds]
  };
}

function nextActivityUid(state: GameState): [string, number] {
  return [`activity-piece-${state.activityNextUid}`, state.activityNextUid + 1];
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

function findEmptyActivitySlot(state: GameState, sourceIndex: number): number {
  const adjacentEmpty = adjacentIndexes(sourceIndex, state.activityBoardCols, state.activityBoard.length).find(
    (candidateIndex) => state.activityBoard[candidateIndex] === null
  );
  if (adjacentEmpty !== undefined) {
    return adjacentEmpty;
  }
  return state.activityBoard.findIndex((piece) => piece === null);
}

function openAdjacentActivityCells(board: Array<BoardPiece | null>, index: number, cols: number): number {
  let opened = 0;
  for (const adjacentIndex of adjacentIndexes(index, cols, board.length)) {
    if (board[adjacentIndex]?.kind === "hidden") {
      board[adjacentIndex] = null;
      opened += 1;
    }
  }
  return opened;
}

function canActivityPieceMove(piece: BoardPiece | null): piece is BoardPiece {
  return Boolean(piece) && piece?.kind !== "locked" && piece?.kind !== "hidden";
}

export function getActivityDropIntent(state: GameState, fromIndex: number, toIndex: number): ActivityDropIntent | null {
  const sourcePiece = state.activityBoard[fromIndex];
  const targetPiece = state.activityBoard[toIndex];
  if (!canActivityPieceMove(sourcePiece) || fromIndex === toIndex) {
    return null;
  }
  if (!targetPiece) {
    return "move";
  }
  if (targetPiece.kind === "hidden") {
    return "invalid";
  }
  if (targetPiece.kind === "locked") {
    return sourcePiece.kind === "item" &&
      sourcePiece.defId === targetPiece.defId &&
      Boolean(activityItemDefs[sourcePiece.defId]?.nextId)
      ? "merge"
      : "invalid";
  }
  if (targetPiece.kind !== sourcePiece.kind || targetPiece.defId !== sourcePiece.defId) {
    return "invalid";
  }
  if (sourcePiece.kind === "item") {
    return activityItemDefs[sourcePiece.defId]?.nextId ? "merge" : "invalid";
  }
  if (sourcePiece.kind === "generator") {
    return activityGeneratorDefs[sourcePiece.defId]?.nextId ? "merge" : "invalid";
  }
  return "invalid";
}

export function emitFromActivityGenerator(state: GameState, generatorIndex: number): GameState {
  const sourcePiece = state.activityBoard[generatorIndex];
  if (!sourcePiece || sourcePiece.kind !== "generator") {
    return { ...state, activitySelectedIndex: null, message: "Select an activity generator first." };
  }
  const generator = activityGeneratorDefs[sourcePiece.defId];
  if (!generator) {
    return { ...state, activitySelectedIndex: null, message: "This activity generator is not configured." };
  }
  if (state.activityEnergy < generator.energyCost) {
    return { ...state, activitySelectedIndex: generatorIndex, message: "No activity tickets available." };
  }
  const remainingTaps = sourcePiece.remainingTaps ?? generator.maxTaps;
  if (remainingTaps <= 0) {
    return { ...state, activitySelectedIndex: generatorIndex, message: `${generator.label} is empty.` };
  }
  const emptySlot = findEmptyActivitySlot(state, generatorIndex);
  if (emptySlot < 0) {
    return { ...state, activitySelectedIndex: null, message: "No empty space on the activity board." };
  }
  const sequenceIndex = sourcePiece.sequenceIndex ?? 0;
  const outputId = generator.sequenceOutputs[sequenceIndex % generator.sequenceOutputs.length];
  const outputDef = activityItemDefs[outputId];
  const [uid, nextUidValue] = nextActivityUid(state);
  const next = cloneState(state);
  next.activityBoard[emptySlot] = { uid, kind: "item", defId: outputId };
  next.activityEnergy -= generator.energyCost;
  next.activityNextUid = nextUidValue;
  next.activitySelectedIndex = emptySlot;
  const nextRemainingTaps = remainingTaps - 1;
  if (nextRemainingTaps <= 0) {
    next.activityBoard[generatorIndex] = null;
    next.message = `${generator.label} produced ${outputDef.label} and was used up.`;
    return next;
  }
  next.activityBoard[generatorIndex] = {
    ...sourcePiece,
    remainingTaps: nextRemainingTaps,
    sequenceIndex: sequenceIndex + 1
  };
  next.message = `${generator.label} produced ${outputDef.label}.`;
  return next;
}

export function moveOrMergeActivity(state: GameState, fromIndex: number, toIndex: number): GameState {
  const sourcePiece = state.activityBoard[fromIndex];
  const targetPiece = state.activityBoard[toIndex];
  if (!canActivityPieceMove(sourcePiece)) {
    return { ...state, activitySelectedIndex: null, message: "Select an activity piece first." };
  }
  if (fromIndex === toIndex) {
    return { ...state, activitySelectedIndex: fromIndex, message: "Selected." };
  }
  const next = cloneState(state);
  if (!targetPiece) {
    next.activityBoard[toIndex] = sourcePiece;
    next.activityBoard[fromIndex] = null;
    next.activitySelectedIndex = toIndex;
    next.message = "Moved on the activity board.";
    return next;
  }
  if (targetPiece.kind === "hidden") {
    return { ...state, activitySelectedIndex: null, message: "This activity space is still sealed." };
  }
  if (targetPiece.kind === "locked") {
    if (sourcePiece.kind !== "item" || sourcePiece.defId !== targetPiece.defId) {
      return { ...state, activitySelectedIndex: null, message: "This activity space is still locked." };
    }
    const itemDef = activityItemDefs[sourcePiece.defId];
    if (!itemDef.nextId) {
      return { ...state, activitySelectedIndex: null, message: `${itemDef.label} is already at the activity top tier.` };
    }
    next.activityBoard[toIndex] = { ...targetPiece, kind: "item", defId: itemDef.nextId };
    next.activityBoard[fromIndex] = null;
    next.activitySelectedIndex = toIndex;
    const opened = openAdjacentActivityCells(next.activityBoard, toIndex, state.activityBoardCols);
    next.message = `Merged ${itemDef.label} into ${activityItemDefs[itemDef.nextId].label}.${opened ? ` Opened ${opened} sealed spaces.` : ""}`;
    return next;
  }
  if (targetPiece.kind !== sourcePiece.kind || targetPiece.defId !== sourcePiece.defId) {
    return { ...state, activitySelectedIndex: null, message: "Only identical activity pieces can merge." };
  }
  if (sourcePiece.kind === "item") {
    const itemDef = activityItemDefs[sourcePiece.defId];
    if (!itemDef.nextId) {
      return { ...state, activitySelectedIndex: null, message: `${itemDef.label} is ready to open.` };
    }
    next.activityBoard[toIndex] = { ...targetPiece, defId: itemDef.nextId };
    next.activityBoard[fromIndex] = null;
    next.activitySelectedIndex = toIndex;
    const opened = openAdjacentActivityCells(next.activityBoard, toIndex, state.activityBoardCols);
    next.message = `Merged ${itemDef.label} into ${activityItemDefs[itemDef.nextId].label}.${opened ? ` Opened ${opened} sealed spaces.` : ""}`;
    return next;
  }
  if (sourcePiece.kind === "generator") {
    const generatorDef = activityGeneratorDefs[sourcePiece.defId];
    if (!generatorDef.nextId) {
      return { ...state, activitySelectedIndex: null, message: `${generatorDef.label} cannot upgrade.` };
    }
    const nextGenerator = activityGeneratorDefs[generatorDef.nextId];
    next.activityBoard[toIndex] = {
      uid: targetPiece.uid,
      kind: "generator",
      defId: generatorDef.nextId,
      remainingTaps: nextGenerator.maxTaps
    };
    next.activityBoard[fromIndex] = null;
    next.activitySelectedIndex = toIndex;
    next.message = `Upgraded ${generatorDef.label}.`;
    return next;
  }
  return { ...state, activitySelectedIndex: null, message: "This activity piece cannot merge." };
}

export function openActivityReward(state: GameState, index: number): GameState {
  const piece = state.activityBoard[index];
  if (!piece || piece.kind !== "item") {
    return { ...state, activitySelectedIndex: null, message: "Select a completed activity item first." };
  }
  const itemDef = activityItemDefs[piece.defId];
  const rewardCurrency = itemDef?.rewardCurrency ?? 0;
  if (rewardCurrency <= 0) {
    return { ...state, activitySelectedIndex: index, message: `${itemDef.label} can still be merged.` };
  }
  const next = cloneState(state);
  next.activityBoard[index] = null;
  next.activityCurrency += rewardCurrency;
  next.activitySelectedIndex = null;
  next.message = `${itemDef.label} opened: +${rewardCurrency} fair coins.`;
  return next;
}

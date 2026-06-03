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

function revealAdjacentHidden(board: Array<BoardPiece | null>, index: number, cols: number): number {
  let revealCount = 0;
  for (const adjacentIndex of adjacentIndexes(index, cols, board.length)) {
    if (board[adjacentIndex]?.kind === "hidden") {
      board[adjacentIndex] = null;
      revealCount += 1;
    }
  }
  return revealCount;
}

function mergeMessage(message: string, revealCount: number): string {
  if (revealCount <= 0) {
    return message;
  }
  return `${message} Opened ${revealCount} sealed space${revealCount === 1 ? "" : "s"}.`;
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
  if (sourcePiece.kind === "hidden") {
    return { ...state, selectedIndex: null, message: "This part of the board is still sealed." };
  }

  const next = cloneState(state);
  if (!targetPiece) {
    next.board[toIndex] = sourcePiece;
    next.board[fromIndex] = null;
    next.selectedIndex = toIndex;
    next.message = "Moved.";
    return next;
  }

  if (targetPiece.kind === "hidden") {
    return { ...state, selectedIndex: null, message: "This part of the board is still sealed." };
  }

  if (targetPiece.kind === "locked") {
    if (sourcePiece.kind !== "item" || sourcePiece.defId !== targetPiece.defId) {
      return { ...state, selectedIndex: null, message: "This space is still locked." };
    }

    const itemDef = itemDefs[sourcePiece.defId];
    if (!itemDef.nextId) {
      return { ...state, selectedIndex: null, message: `${itemDef.label} is already at the top tier.` };
    }

    next.board[toIndex] = { ...targetPiece, kind: "item", defId: itemDef.nextId };
    next.board[fromIndex] = null;
    next.selectedIndex = toIndex;
    const revealCount = revealAdjacentHidden(next.board, toIndex, state.boardCols);
    next.message = mergeMessage(`Merged ${itemDef.label} into ${itemDefs[itemDef.nextId].label}.`, revealCount);
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
    const revealCount = revealAdjacentHidden(next.board, toIndex, state.boardCols);
    next.message = mergeMessage(`Merged ${itemDef.label} into ${itemDefs[itemDef.nextId].label}.`, revealCount);
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

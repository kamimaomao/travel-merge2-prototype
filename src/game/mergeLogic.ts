import { cityChapters, generatorDefs, itemDefs, orderDefs } from "./content";
import type { BoardPiece, GameState, WeightedOutput } from "./types";

export type DropIntent = "move" | "merge" | "invalid";

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

function openAdjacentSealedCells(
  board: Array<BoardPiece | null>,
  index: number,
  cols: number
): { spaces: number; sources: number } {
  let spaces = 0;
  let sources = 0;
  for (const adjacentIndex of adjacentIndexes(index, cols, board.length)) {
    const adjacentPiece = board[adjacentIndex];
    if (adjacentPiece?.kind === "hidden") {
      const generatorDef = generatorDefs[adjacentPiece.defId];
      const itemDef = itemDefs[adjacentPiece.defId];
      if (generatorDef) {
        board[adjacentIndex] = { ...adjacentPiece, kind: "generator" };
        sources += 1;
        continue;
      }
      if (itemDef) {
        board[adjacentIndex] = { ...adjacentPiece, kind: "item" };
        spaces += 1;
        continue;
      }
      board[adjacentIndex] = null;
      spaces += 1;
      continue;
    }
    if (
      adjacentPiece?.kind === "locked" &&
      generatorDefs[adjacentPiece.defId]?.sourceType === "sealed"
    ) {
      board[adjacentIndex] = { ...adjacentPiece, kind: "generator" };
      sources += 1;
    }
  }
  return { spaces, sources };
}

function mergeMessage(message: string, opened: { spaces: number; sources: number }): string {
  const fragments: string[] = [];
  if (opened.spaces > 0) {
    fragments.push(`Opened ${opened.spaces} sealed space${opened.spaces === 1 ? "" : "s"}.`);
  }
  if (opened.sources > 0) {
    fragments.push(`Opened ${opened.sources} sealed source${opened.sources === 1 ? "" : "s"}.`);
  }
  if (fragments.length === 0) {
    return message;
  }
  return `${message} ${fragments.join(" ")}`;
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

function pickGeneratorOutput(generatorId: string, sourcePiece: BoardPiece, roll: number): string | null {
  const generator = generatorDefs[generatorId];
  const sequenceOutputs = generator.sequenceOutputs ?? [];
  if (sequenceOutputs.length > 0) {
    const sequenceIndex = sourcePiece.sequenceIndex ?? 0;
    return sequenceOutputs[sequenceIndex % sequenceOutputs.length];
  }
  if (generator.outputs.length === 0) {
    return null;
  }
  return pickOutput(generator.outputs, roll);
}

function formatRewards(coins: number, gems: number, stars: number): string {
  const rewards = [
    coins > 0 ? `+${coins} coins` : null,
    gems > 0 ? `+${gems} gems` : null,
    stars > 0 ? `+${stars} stars` : null
  ].filter(Boolean);
  return rewards.length > 0 ? rewards.join(", ") : "stored rewards";
}

export function getDropIntent(state: GameState, fromIndex: number, toIndex: number): DropIntent | null {
  const sourcePiece = state.board[fromIndex];
  const targetPiece = state.board[toIndex];
  if (!sourcePiece || sourcePiece.kind === "locked" || sourcePiece.kind === "hidden" || fromIndex === toIndex) {
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
      Boolean(itemDefs[sourcePiece.defId]?.nextId)
      ? "merge"
      : "invalid";
  }
  if (targetPiece.kind !== sourcePiece.kind || targetPiece.defId !== sourcePiece.defId) {
    return "invalid";
  }
  if (sourcePiece.kind === "item") {
    return itemDefs[sourcePiece.defId]?.nextId ? "merge" : "invalid";
  }
  if (sourcePiece.kind === "generator") {
    return generatorDefs[sourcePiece.defId]?.nextId ? "merge" : "invalid";
  }
  return "invalid";
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

  if (generator.sourceType === "container") {
    const next = cloneState(state);
    const rewardCoins = generator.rewardCoins ?? 0;
    const rewardGems = generator.rewardGems ?? 0;
    const rewardStars = generator.rewardStars ?? 0;
    next.board[generatorIndex] = null;
    next.coins += rewardCoins;
    next.gems += rewardGems;
    next.stars += rewardStars;
    next.selectedIndex = null;
    next.message = `${generator.label} opened: ${formatRewards(rewardCoins, rewardGems, rewardStars)}.`;
    return next;
  }

  if (state.energy < generator.energyCost) {
    return { ...state, selectedIndex: null, message: "Not enough energy to produce an item." };
  }

  const isLimitedSource = generator.sourceType === "charge" || generator.sourceType === "finite";
  const remainingTaps = sourcePiece.remainingTaps ?? generator.maxTaps ?? 0;
  if (isLimitedSource && remainingTaps <= 0) {
    return {
      ...state,
      selectedIndex: generatorIndex,
      message: `${generator.label} needs a refresh before it can produce again.`
    };
  }

  const emptySlot = findEmptySlot(state, generatorIndex);
  if (emptySlot < 0) {
    return { ...state, selectedIndex: null, message: "No empty space on the board." };
  }

  const outputId = pickGeneratorOutput(sourcePiece.defId, sourcePiece, roll);
  if (!outputId) {
    return { ...state, selectedIndex: null, message: `${generator.label} has no configured output.` };
  }
  const outputDef = itemDefs[outputId];
  const [uid, nextUidValue] = nextUid(state);
  const next = cloneState(state);
  next.board[emptySlot] = { uid, kind: "item", defId: outputId };
  next.energy -= generator.energyCost;
  next.nextUid = nextUidValue;
  next.selectedIndex = emptySlot;
  const nextSequenceIndex = (sourcePiece.sequenceIndex ?? 0) + 1;
  if (isLimitedSource) {
    const nextRemainingTaps = remainingTaps - 1;
    if (generator.sourceType === "finite" && nextRemainingTaps <= 0) {
      next.board[generatorIndex] = null;
      next.message = `${generator.label} produced ${outputDef.label}. ${generator.label} was used up.`;
      return next;
    }
    next.board[generatorIndex] = {
      ...sourcePiece,
      remainingTaps: nextRemainingTaps,
      sequenceIndex: nextSequenceIndex
    };
    next.message =
      nextRemainingTaps > 0
        ? `${generator.label} produced ${outputDef.label}.`
        : `${generator.label} produced ${outputDef.label}. It needs a refresh.`;
    return next;
  }
  if (generator.sequenceOutputs?.length) {
    next.board[generatorIndex] = { ...sourcePiece, sequenceIndex: nextSequenceIndex };
  }
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
    const opened = openAdjacentSealedCells(next.board, toIndex, state.boardCols);
    next.message = mergeMessage(`Merged ${itemDef.label} into ${itemDefs[itemDef.nextId].label}.`, opened);
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
    const opened = openAdjacentSealedCells(next.board, toIndex, state.boardCols);
    next.message = mergeMessage(`Merged ${itemDef.label} into ${itemDefs[itemDef.nextId].label}.`, opened);
    return next;
  }

  if (sourcePiece.kind === "generator") {
    const generatorDef = generatorDefs[sourcePiece.defId];
    if (!generatorDef.nextId) {
      return { ...state, selectedIndex: null, message: `${generatorDef.label} cannot upgrade in this prototype.` };
    }
    next.board[toIndex] = { uid: targetPiece.uid, kind: "generator", defId: generatorDef.nextId };
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

function findReplacementOrderId(state: GameState, completedOrderId: string, activeOrderIds: string[]): string | null {
  const orderCycle = cityChapters[state.cityChapterId]?.orderIds ?? Object.keys(orderDefs);
  const completedIndex = orderCycle.indexOf(completedOrderId);
  for (let offset = 1; offset <= orderCycle.length; offset += 1) {
    const candidate = orderCycle[(completedIndex + offset + orderCycle.length) % orderCycle.length];
    if (!activeOrderIds.includes(candidate)) {
      return candidate;
    }
  }
  return null;
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
  const replacementOrderId = findReplacementOrderId(state, orderId, next.activeOrderIds);
  if (replacementOrderId) {
    next.activeOrderIds.push(replacementOrderId);
  }
  next.completedOrderIds = [...next.completedOrderIds, orderId];
  next.stars += order.rewardStars;
  next.activityEnergy += order.rewardActivityEnergy;
  next.cityProgress += order.rewardCityProgress;
  next.catMood += order.rewardCatMood === undefined ? 0 : order.rewardCatMood;
  next.selectedIndex = null;
  next.message = `${order.requester} completed "${order.title}". +${order.rewardActivityEnergy} event tickets.`;
  return next;
}

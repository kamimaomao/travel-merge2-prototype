import {
  ArrowLeft,
  Backpack,
  Coins,
  Gem,
  Images,
  Map as MapIcon,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Utensils,
  Zap
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import backpackAsset from "./assets/merge2/board-pieces/borderless/backpack.png";
import bentoAsset from "./assets/merge2/board-pieces/borderless/bento.png";
import cameraKitAsset from "./assets/merge2/board-pieces/borderless/camera-kit.png";
import charmAsset from "./assets/merge2/board-pieces/borderless/charm.png";
import dayBagAsset from "./assets/merge2/board-pieces/borderless/day-bag.png";
import dayPassAsset from "./assets/merge2/board-pieces/borderless/day-pass.png";
import fairStamp1Asset from "./assets/merge2/board-pieces/fair-stamp-1.png";
import fairStamp2Asset from "./assets/merge2/board-pieces/fair-stamp-2.png";
import fairVoucherRoll1Asset from "./assets/merge2/board-pieces/fair-voucher-roll-1.png";
import fairVoucherRoll2Asset from "./assets/merge2/board-pieces/fair-voucher-roll-2.png";
import festivalVoucherAsset from "./assets/merge2/board-pieces/borderless/festival-voucher.png";
import guidebookGeneratorAsset from "./assets/merge2/board-pieces/borderless/guidebook-generator-1.png";
import hiddenSealedCellAsset from "./assets/merge2/board-pieces/borderless/hidden-sealed-cell.png";
import instantNoodlesAsset from "./assets/merge2/board-pieces/borderless/instant-noodles.png";
import lockedCellAsset from "./assets/merge2/board-pieces/borderless/locked-cell.png";
import onigiriAsset from "./assets/merge2/board-pieces/borderless/onigiri.png";
import organizedLuggageAsset from "./assets/merge2/board-pieces/borderless/organized-luggage.png";
import ramenTicketAsset from "./assets/merge2/board-pieces/borderless/ramen-ticket.png";
import sealedMapCacheAsset from "./assets/merge2/board-pieces/borderless/sealed-map-cache.png";
import smallPouchAsset from "./assets/merge2/board-pieces/borderless/small-pouch.png";
import snackSourceAsset from "./assets/merge2/board-pieces/borderless/snack-source.png";
import souvenirGiftBoxAsset from "./assets/merge2/board-pieces/borderless/souvenir-gift-box.png";
import stationTicketAsset from "./assets/merge2/board-pieces/borderless/station-ticket.png";
import stampBookletAsset from "./assets/merge2/board-pieces/borderless/stamp-booklet.png";
import suitcaseGeneratorAsset from "./assets/merge2/board-pieces/borderless/suitcase-generator-1.png";
import suitcaseGenerator2Asset from "./assets/merge2/board-pieces/borderless/suitcase-generator-2.png";
import tokyoConvenienceBagAsset from "./assets/merge2/board-pieces/borderless/tokyo-convenience-bag.png";
import travelMealKitAsset from "./assets/merge2/board-pieces/borderless/travel-meal-kit.png";
import windChimeAsset from "./assets/merge2/board-pieces/borderless/wind-chime.png";
import { activeActivity, activityGeneratorDefs, activityItemDefs } from "./game/activityContent";
import { emitFromActivityGenerator, getActivityDropIntent, moveOrMergeActivity, openActivityReward } from "./game/activityLogic";
import { cityChapters, generatorDefs, itemDefs, orderDefs } from "./game/content";
import { createInitialState } from "./game/createInitialState";
import { mapSpotDefs } from "./game/mapContent";
import { emitFromGenerator, fulfillOrder, getDropIntent, moveOrMerge } from "./game/mergeLogic";
import { getMapSpotStatus, unlockMapSpot } from "./game/progressionLogic";
import type {
  BoardPiece,
  GameState,
  GeneratorSourceType,
  MapSpotCategory,
  MapSpotDef,
} from "./game/types";

type AppView = "merge" | "map" | "activity";
type PiecePresentation = {
  emoji: string;
  shortLabel: string;
  label: string;
  className: string;
  assetSrc?: string;
};
type DragState = {
  fromIndex: number;
  overIndex: number | null;
  hasMoved: boolean;
  startX: number;
  startY: number;
  clientX: number;
  clientY: number;
};

const boardPieceAssets: Record<string, string> = {
  "small-pouch": smallPouchAsset,
  "day-bag": dayBagAsset,
  backpack: backpackAsset,
  "organized-luggage": organizedLuggageAsset,
  "instant-noodles": instantNoodlesAsset,
  "travel-meal-kit": travelMealKitAsset,
  bento: bentoAsset,
  "ramen-ticket": ramenTicketAsset,
  charm: charmAsset,
  "wind-chime": windChimeAsset,
  "stamp-booklet": stampBookletAsset,
  "suitcase-1": suitcaseGeneratorAsset,
  "suitcase-2": suitcaseGenerator2Asset,
  "travel-guidebook-1": guidebookGeneratorAsset,
  "travel-guidebook-2": guidebookGeneratorAsset,
  "camera-kit-1": cameraKitAsset,
  "festival-voucher-1": festivalVoucherAsset,
  "sealed-map-cache": sealedMapCacheAsset,
  "snack-source-1": snackSourceAsset,
  "tokyo-convenience-bag-1": tokyoConvenienceBagAsset,
  "rice-ball": onigiriAsset,
  "station-ticket": stationTicketAsset,
  "day-pass": dayPassAsset,
  "souvenir-gift-box": souvenirGiftBoxAsset,
  "fair-stamp-1": fairStamp1Asset,
  "fair-stamp-2": fairStamp2Asset,
  "fair-voucher-roll-1": fairVoucherRoll1Asset,
  "fair-voucher-roll-2": fairVoucherRoll2Asset,
  "fair-reward-box": souvenirGiftBoxAsset
};

function getPieceAsset(piece: BoardPiece | null): string | undefined {
  if (!piece) {
    return undefined;
  }
  if (piece.kind === "hidden") {
    return hiddenSealedCellAsset;
  }
  if (piece.kind === "locked") {
    return lockedCellAsset;
  }
  return boardPieceAssets[piece.defId];
}

function renderPieceVisual(label: PiecePresentation) {
  if (label.assetSrc) {
    return <img className="cell-asset" src={label.assetSrc} alt="" draggable={false} />;
  }
  return (
    <>
      <span className="cell-emoji">{label.emoji}</span>
      <span className="cell-label">{label.shortLabel}</span>
    </>
  );
}

function getPieceLabel(piece: BoardPiece | null): PiecePresentation {
  if (!piece) {
    return { emoji: "", shortLabel: "", label: "Empty", className: "empty", assetSrc: getPieceAsset(piece) };
  }
  if (piece.kind === "hidden") {
    return {
      emoji: "◇",
      shortLabel: "Sealed",
      label: "Sealed travel space",
      className: "hidden",
      assetSrc: getPieceAsset(piece)
    };
  }
  if (piece.kind === "locked") {
    const generator = generatorDefs[piece.defId];
    if (generator) {
      return {
        emoji: generator.emoji,
        shortLabel: generator.shortLabel,
        label: `Locked ${generator.label}`,
        className: "locked locked-generator",
        assetSrc: getPieceAsset(piece)
      };
    }
    const item = itemDefs[piece.defId];
    if (item) {
      return {
        emoji: item.emoji,
        shortLabel: item.shortLabel,
        label: `Locked ${item.label}`,
        className: `locked locked-item ${item.scope === "city" ? "city-item" : "persistent-item"}`,
        assetSrc: getPieceAsset(piece)
      };
    }
    return {
      emoji: "📦",
      shortLabel: "Locked",
      label: "Locked travel space",
      className: "locked",
      assetSrc: getPieceAsset(piece)
    };
  }
  if (piece.kind === "generator") {
    const generator = generatorDefs[piece.defId];
    return {
      emoji: generator.emoji,
      shortLabel: generator.shortLabel,
      label: generator.label,
      className: `${generator.cityLimited ? "generator city-generator" : "generator persistent-generator"} source-${
        generator.sourceType
      }`,
      assetSrc: getPieceAsset(piece)
    };
  }
  const item = itemDefs[piece.defId];
  return {
    emoji: item.emoji,
    shortLabel: item.shortLabel,
    label: item.label,
    className: item.scope === "city" ? "item city-item" : "item persistent-item",
    assetSrc: getPieceAsset(piece)
  };
}

function getActivityPieceLabel(piece: BoardPiece | null): PiecePresentation {
  if (!piece) {
    return { emoji: "", shortLabel: "", label: "Empty", className: "empty", assetSrc: getPieceAsset(piece) };
  }
  if (piece.kind === "hidden") {
    return {
      emoji: "◇",
      shortLabel: "Sealed",
      label: "Sealed activity space",
      className: "hidden",
      assetSrc: getPieceAsset(piece)
    };
  }
  if (piece.kind === "locked") {
    const item = activityItemDefs[piece.defId];
    return {
      emoji: item?.emoji ?? "▣",
      shortLabel: item?.shortLabel ?? "Lock",
      label: item ? `Locked ${item.label}` : "Locked activity space",
      className: "locked locked-item activity-item",
      assetSrc: getPieceAsset(piece)
    };
  }
  if (piece.kind === "generator") {
    const generator = activityGeneratorDefs[piece.defId];
    return {
      emoji: generator.emoji,
      shortLabel: generator.shortLabel,
      label: generator.label,
      className: "generator activity-generator source-finite",
      assetSrc: getPieceAsset(piece)
    };
  }
  const item = activityItemDefs[piece.defId];
  return {
    emoji: item.emoji,
    shortLabel: item.shortLabel,
    label: item.label,
    className: "item activity-item",
    assetSrc: getPieceAsset(piece)
  };
}

function getSourceType(piece: BoardPiece | null): GeneratorSourceType | null {
  if (!piece || (piece.kind !== "generator" && piece.kind !== "locked")) {
    return null;
  }
  return generatorDefs[piece.defId]?.sourceType ?? null;
}

function getSourceBadge(piece: BoardPiece | null): string | null {
  const sourceType = getSourceType(piece);
  if (!piece || !sourceType) {
    return null;
  }
  const generator = generatorDefs[piece.defId];
  if (sourceType === "charge" || sourceType === "finite") {
    return `${piece.remainingTaps ?? generator.maxTaps ?? 0}`;
  }
  const labels: Record<GeneratorSourceType, string> = {
    permanent: "Main",
    upgradeable: "Merge",
    charge: "0",
    finite: "0",
    container: "Open",
    sealed: piece.kind === "locked" ? "Lock" : "Gate"
  };
  return labels[sourceType];
}

function canFulfillOrder(state: GameState, orderId: string): boolean {
  const order = orderDefs[orderId];
  return order.requirements.every((requirement) => {
    const owned = state.board.filter((piece) => piece?.kind === "item" && piece.defId === requirement.itemId).length;
    return owned >= requirement.count;
  });
}

function getOwnedItemCount(state: GameState, itemId: string): number {
  return state.board.filter((piece) => piece?.kind === "item" && piece.defId === itemId).length;
}

function getFocusedOrderId(state: GameState, chapterOrderIds: string[]): string | null {
  if (state.focusedOrderId && state.activeOrderIds.includes(state.focusedOrderId)) {
    return state.focusedOrderId;
  }
  return chapterOrderIds.find((orderId) => state.activeOrderIds.includes(orderId)) ?? state.activeOrderIds[0] ?? null;
}

function pieceMatchesRoute(piece: BoardPiece | null, focusedRequirementChainIds: Set<string>): boolean {
  if (!piece || focusedRequirementChainIds.size === 0 || piece.kind === "hidden") {
    return false;
  }
  const item = itemDefs[piece.defId];
  if (item) {
    return focusedRequirementChainIds.has(item.chainId);
  }
  if (piece.kind !== "generator" && piece.kind !== "locked") {
    return false;
  }
  const generator = generatorDefs[piece.defId];
  if (!generator) {
    return false;
  }
  const outputIds = [...(generator.sequenceOutputs ?? []), ...generator.outputs.map((output) => output.itemId)];
  return outputIds.some((itemId) => {
    const outputItem = itemDefs[itemId];
    return outputItem ? focusedRequirementChainIds.has(outputItem.chainId) : false;
  });
}

function getRequesterAvatar(requester: string): string {
  const avatars: Record<string, string> = {
    Avery: "A",
    Mina: "M",
    Mochi: "M",
    Theo: "T"
  };
  return avatars[requester] ?? requester.slice(0, 1);
}

function getRequesterClass(requester: string): string {
  return requester.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function formatHudValue(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return `${value}`;
}

function getMapCategoryIcon(category: MapSpotCategory) {
  if (category === "food") {
    return <Utensils size={14} aria-hidden="true" />;
  }
  if (category === "shopping") {
    return <ShoppingBag size={14} aria-hidden="true" />;
  }
  if (category === "culture") {
    return <Images size={14} aria-hidden="true" />;
  }
  return <Sparkles size={14} aria-hidden="true" />;
}

export default function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState());
  const [view, setView] = useState<AppView>("merge");
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressNextClickRef = useRef(false);
  const chapter = cityChapters[game.cityChapterId];
  const selectedPiece = game.selectedIndex === null ? null : game.board[game.selectedIndex];
  const selectedActivityPiece =
    game.activitySelectedIndex === null ? null : game.activityBoard[game.activitySelectedIndex];
  const draggedLabel = drag ? getPieceLabel(game.board[drag.fromIndex]) : null;
  const draggedActivityLabel = drag ? getActivityPieceLabel(game.activityBoard[drag.fromIndex]) : null;
  const focusedOrderId = getFocusedOrderId(game, chapter.orderIds);
  const focusedOrder = focusedOrderId ? orderDefs[focusedOrderId] : null;

  const selectedLabel = useMemo(() => getPieceLabel(selectedPiece), [selectedPiece]);
  const selectedActivityLabel = useMemo(() => getActivityPieceLabel(selectedActivityPiece), [selectedActivityPiece]);
  const focusedRequirementChainIds = useMemo(
    () => new Set(focusedOrder?.requirements.map((requirement) => itemDefs[requirement.itemId].chainId) ?? []),
    [focusedOrder]
  );

  function handleCellClick(index: number) {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    const piece = game.board[index];
    if (!piece) {
      setGame({ ...game, selectedIndex: null, message: "Drag a board piece here to move it." });
      return;
    }
    if (piece.kind === "hidden") {
      setGame({ ...game, selectedIndex: null, message: "This part of the board is still sealed." });
      return;
    }
    if (piece.kind === "locked") {
      setGame({ ...game, selectedIndex: null, message: "This space is still locked." });
      return;
    }
    if (piece.kind === "generator") {
      setGame(emitFromGenerator(game, index));
      return;
    }
    setGame({ ...game, selectedIndex: index, message: `${getPieceLabel(piece).label} selected. Drag it to move or merge.` });
  }

  function handleActivityCellClick(index: number) {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    const piece = game.activityBoard[index];
    if (!piece) {
      setGame({ ...game, activitySelectedIndex: null, message: "Drag an activity piece here to move it." });
      return;
    }
    if (piece.kind === "hidden") {
      setGame({ ...game, activitySelectedIndex: null, message: "This activity space is still sealed." });
      return;
    }
    if (piece.kind === "locked") {
      setGame({ ...game, activitySelectedIndex: null, message: "This activity space is still locked." });
      return;
    }
    if (piece.kind === "generator") {
      setGame(emitFromActivityGenerator(game, index));
      return;
    }
    const item = activityItemDefs[piece.defId];
    if (item.rewardCurrency) {
      setGame(openActivityReward(game, index));
      return;
    }
    setGame({
      ...game,
      activitySelectedIndex: index,
      message: `${getActivityPieceLabel(piece).label} selected. Drag it to move or merge.`
    });
  }

  function setDragTarget(overIndex: number | null, clientX?: number, clientY?: number) {
    const currentDrag = dragRef.current;
    if (!currentDrag) {
      return;
    }
    const nextClientX = clientX ?? currentDrag.clientX;
    const nextClientY = clientY ?? currentDrag.clientY;
    const movedDistance = Math.hypot(nextClientX - currentDrag.startX, nextClientY - currentDrag.startY);
    const nextDrag = {
      ...currentDrag,
      overIndex,
      hasMoved: currentDrag.hasMoved || currentDrag.overIndex !== overIndex || movedDistance >= 4,
      clientX: nextClientX,
      clientY: nextClientY
    };
    if (
      currentDrag.overIndex === nextDrag.overIndex &&
      currentDrag.hasMoved === nextDrag.hasMoved &&
      currentDrag.clientX === nextDrag.clientX &&
      currentDrag.clientY === nextDrag.clientY
    ) {
      return;
    }
    dragRef.current = nextDrag;
    setDrag(nextDrag);
  }

  function handleCellPointerDown(event: ReactPointerEvent<HTMLButtonElement>, index: number) {
    const piece = game.board[index];
    if (!piece || piece.kind === "hidden" || piece.kind === "locked") {
      return;
    }
    const nextDrag = {
      fromIndex: index,
      overIndex: index,
      hasMoved: false,
      startX: event.clientX,
      startY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY
    };
    dragRef.current = nextDrag;
    setDrag(nextDrag);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleActivityCellPointerDown(event: ReactPointerEvent<HTMLButtonElement>, index: number) {
    const piece = game.activityBoard[index];
    if (!piece || piece.kind === "hidden" || piece.kind === "locked") {
      return;
    }
    const nextDrag = {
      fromIndex: index,
      overIndex: index,
      hasMoved: false,
      startX: event.clientX,
      startY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY
    };
    dragRef.current = nextDrag;
    setDrag(nextDrag);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleCellPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragRef.current) {
      return;
    }
    event.preventDefault();
    const target = document.elementFromPoint?.(event.clientX, event.clientY)?.closest<HTMLElement>("[data-cell-index]");
    const targetIndex = target?.dataset.cellIndex === undefined ? null : Number(target.dataset.cellIndex);
    setDragTarget(Number.isInteger(targetIndex) ? targetIndex : null, event.clientX, event.clientY);
  }

  function releaseCellPointer(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function finishCellDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const currentDrag = dragRef.current;
    if (!currentDrag) {
      return;
    }

    const droppedOnAnotherCell = currentDrag.overIndex !== null && currentDrag.overIndex !== currentDrag.fromIndex;
    if (currentDrag.hasMoved) {
      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }
    if (droppedOnAnotherCell) {
      setGame((currentGame) => moveOrMerge(currentGame, currentDrag.fromIndex, currentDrag.overIndex as number));
    }

    releaseCellPointer(event);
    dragRef.current = null;
    setDrag(null);
  }

  function finishActivityCellDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const currentDrag = dragRef.current;
    if (!currentDrag) {
      return;
    }

    const droppedOnAnotherCell = currentDrag.overIndex !== null && currentDrag.overIndex !== currentDrag.fromIndex;
    if (currentDrag.hasMoved) {
      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }
    if (droppedOnAnotherCell) {
      setGame((currentGame) => moveOrMergeActivity(currentGame, currentDrag.fromIndex, currentDrag.overIndex as number));
    }

    releaseCellPointer(event);
    dragRef.current = null;
    setDrag(null);
  }

  function cancelCellDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    releaseCellPointer(event);
    dragRef.current = null;
    setDrag(null);
  }

  function handleOrderClick(orderId: string) {
    setGame(fulfillOrder(game, orderId));
  }

  function resetPrototype() {
    setGame(createInitialState());
    setView("merge");
  }

  function handleMapSpotClick(spot: MapSpotDef) {
    setGame(unlockMapSpot(game, spot.id));
  }

  function openActivityView() {
    setGame({ ...game, message: "Spend activity tickets on voucher rolls to produce fair souvenirs." });
    setView("activity");
  }

  function renderHud() {
    return (
      <header className="hud">
        <div className="hud-pill" aria-label="Energy">
          <Zap size={16} aria-hidden="true" />
          <span>{formatHudValue(game.energy)}</span>
        </div>
        <div className="hud-pill" aria-label="Stars">
          <Sparkles size={16} aria-hidden="true" />
          <span>{formatHudValue(game.stars)}</span>
        </div>
        <div className="hud-pill" aria-label="Coins">
          <Coins size={16} aria-hidden="true" />
          <span>{formatHudValue(game.coins)}</span>
        </div>
        <div className="hud-pill" aria-label="Gems">
          <Gem size={16} aria-hidden="true" />
          <span>{formatHudValue(game.gems)}</span>
        </div>
        <button
          className="activity-nav-button"
          type="button"
          onClick={openActivityView}
          aria-label={`Activity board: ${game.activityEnergy} tickets`}
        >
          <Sparkles size={18} aria-hidden="true" />
          <span className="activity-badge" aria-hidden="true">
            {game.activityEnergy}
          </span>
        </button>
        <button className="icon-button" type="button" onClick={resetPrototype} aria-label="Reset prototype">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </header>
    );
  }

  if (view === "activity") {
    return (
      <main className="game-shell">
        <section className="phone-frame activity-frame" aria-label="Travel fair activity">
          {renderHud()}

          <section className="activity-titlebar">
            <button type="button" className="icon-button" aria-label="Back to merge board" onClick={() => setView("merge")}>
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div>
              <p className="eyebrow">Activity</p>
              <h1>{activeActivity.title}</h1>
              <p>{activeActivity.subtitle}</p>
            </div>
            <div className="activity-wallet" aria-label="Activity wallet">
              <strong>{game.activityEnergy}</strong>
              <span>{activeActivity.energyLabel}</span>
              <strong>{game.activityCurrency}</strong>
              <span>{activeActivity.currencyLabel}</span>
            </div>
          </section>

          <section
            className="board activity-board"
            aria-label="Activity merge board"
            style={{ gridTemplateColumns: `repeat(${game.activityBoardCols}, minmax(0, 1fr))` }}
          >
            {game.activityBoard.map((piece, index) => {
              const label = getActivityPieceLabel(piece);
              const selected = game.activitySelectedIndex === index;
              const dragging = drag?.fromIndex === index;
              const dropIntent =
                drag && drag.overIndex === index && drag.fromIndex !== index
                  ? getActivityDropIntent(game, drag.fromIndex, index)
                  : null;
              const pieceBadge =
                piece?.kind === "generator"
                  ? `${piece.remainingTaps ?? activityGeneratorDefs[piece.defId].maxTaps}`
                  : piece?.kind === "locked"
                    ? "Lock"
                    : null;
              return (
                <button
                  className={`cell activity-cell ${label.className} ${label.assetSrc ? "has-asset" : ""} ${
                    selected ? "selected" : ""
                  } ${dragging ? "dragging" : ""} ${dropIntent ? `drop-target ${dropIntent}-target` : ""}`}
                  type="button"
                  key={piece ? piece.uid : `activity-empty-${index}`}
                  onClick={() => handleActivityCellClick(index)}
                  onPointerDown={(event) => handleActivityCellPointerDown(event, index)}
                  onPointerEnter={(event) => setDragTarget(index, event.clientX, event.clientY)}
                  onPointerMove={handleCellPointerMove}
                  onPointerUp={finishActivityCellDrag}
                  onPointerCancel={cancelCellDrag}
                  aria-label={`${label.label} activity cell ${index + 1}`}
                  aria-grabbed={dragging || undefined}
                  draggable={false}
                  data-cell-index={index}
                  data-dragging={dragging ? "true" : undefined}
                  data-drop-intent={dropIntent ?? undefined}
                >
                  {pieceBadge ? <span className="cell-badge">{pieceBadge}</span> : null}
                  {renderPieceVisual(label)}
                </button>
              );
            })}
          </section>

          {drag?.hasMoved && draggedActivityLabel ? (
            <div
              className={`drag-preview ${draggedActivityLabel.className} ${
                draggedActivityLabel.assetSrc ? "has-asset" : ""
              }`}
              style={{ left: drag.clientX, top: drag.clientY }}
              aria-label={`Dragging ${draggedActivityLabel.label}`}
            >
              {renderPieceVisual(draggedActivityLabel)}
            </div>
          ) : null}

          <section className="merge-bottom" aria-label="Activity page bottom controls">
            <button className="bottom-action" type="button" aria-label="Back to merge board" onClick={() => setView("merge")}>
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div className="bottom-info" aria-label="Activity information">
              <div>
                <p className="eyebrow">Selected</p>
                <strong>{selectedActivityPiece ? selectedActivityLabel.label : "None"}</strong>
              </div>
              <p>{game.message}</p>
            </div>
            <button className="bottom-action" type="button" aria-label="Postcard map" onClick={() => setView("map")}>
              <MapIcon size={20} aria-hidden="true" />
            </button>
          </section>
        </section>
      </main>
    );
  }

  if (view === "map") {
    const scenicSpots = mapSpotDefs.filter((spot) => spot.category === "scenic");
    const unlockedScenicCount = scenicSpots.filter((spot) => game.unlockedMapSpotIds.includes(spot.id)).length;
    const postcardPercent = Math.round((unlockedScenicCount / scenicSpots.length) * 100);

    return (
      <main className="game-shell">
        <section className="phone-frame map-frame" aria-label="Travel postcard map">
          {renderHud()}

          <section className="map-titlebar">
            <div>
              <p className="eyebrow">City Postcard</p>
              <h1>City Map</h1>
            </div>
            <div className="map-progress" aria-label="Scenic route progress">
              <strong>{unlockedScenicCount}/{scenicSpots.length}</strong>
              <span>Scenic</span>
            </div>
          </section>

          <section className="postcard-map" aria-label="City postcard map">
            {mapSpotDefs.map((spot) => {
              const status = getMapSpotStatus(game, spot);
              return (
                <button
                  className={`map-spot ${spot.category} ${status} ${spot.areaClass}`}
                  type="button"
                  key={spot.id}
                  onClick={() => handleMapSpotClick(spot)}
                  aria-label={`${spot.title} ${status}`}
                >
                  <span className="map-spot-icon">{spot.emoji}</span>
                  <strong>{spot.shortLabel}</strong>
                  <small>
                    {status === "available"
                      ? `★${spot.starCost}`
                      : status === "locked"
                        ? "Fog"
                        : status === "reserved"
                          ? "Hook"
                          : "Open"}
                  </small>
                </button>
              );
            })}
          </section>

          <section className="map-branch-row" aria-label="Travel branch hooks">
            <span>
              {getMapCategoryIcon("food")}
              Food
            </span>
            <span>
              {getMapCategoryIcon("shopping")}
              Shopping
            </span>
            <span>
              {getMapCategoryIcon("culture")}
              Culture
            </span>
          </section>

          <section className="postcard-status" aria-label="Postcard completion">
            <div>
              <p className="eyebrow">Postcard</p>
              <strong>{postcardPercent}%</strong>
            </div>
            <p>{game.message}</p>
          </section>

          <section className="map-bottom">
            <button className="bottom-action" type="button" aria-label="Back to merge board" onClick={() => setView("merge")}>
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div className="bottom-info" aria-label="Map information">
              <div>
                <p className="eyebrow">Stars</p>
                <strong>{formatHudValue(game.stars)}</strong>
              </div>
              <p>{game.message}</p>
            </div>
            <button
              className="bottom-action"
              type="button"
              aria-label="Postcard album"
              onClick={() => setGame({ ...game, message: "Postcard album hook reserved for collection rewards." })}
            >
              <Images size={20} aria-hidden="true" />
            </button>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <section className="phone-frame merge-frame" aria-label="Travel Merge2 prototype">
        {renderHud()}

        <section className="customer-strip" aria-label="Active customer orders">
          {game.activeOrderIds.map((orderId) => {
            const order = orderDefs[orderId];
            const ready = canFulfillOrder(game, orderId);
            const focused = focusedOrderId === orderId;
            return (
              <article
                className={`customer-ticket requester-${getRequesterClass(order.requester)} ${ready ? "ready" : ""} ${
                  focused ? "focused" : ""
                }`}
                key={order.id}
                aria-label={`${focused ? "Focused order" : "Order"}: ${order.title}`}
                aria-current={focused ? "step" : undefined}
              >
                <div className="customer-portrait" aria-hidden="true">
                  <span className="portrait-head">{getRequesterAvatar(order.requester)}</span>
                  <span className="portrait-body" />
                </div>
                <div className="ticket-main">
                  <span className="requester">{order.requester}</span>
                  {focused ? <span className="focus-chip">Route</span> : null}
                  <h2>{order.title}</h2>
                </div>
                <div className="ticket-platform">
                  <div className="ticket-requirements" aria-label={`${order.title} requirements`}>
                    {order.requirements.map((requirement) => {
                      const item = itemDefs[requirement.itemId];
                      const owned = getOwnedItemCount(game, requirement.itemId);
                      return (
                        <span
                          className={`ticket-requirement-slot ${owned >= requirement.count ? "complete" : ""}`}
                          key={requirement.itemId}
                        >
                          {boardPieceAssets[requirement.itemId] ? (
                            <img src={boardPieceAssets[requirement.itemId]} alt="" draggable={false} />
                          ) : (
                            <span className="requirement-emoji">{item.emoji}</span>
                          )}
                          <strong>
                            {Math.min(owned, requirement.count)}/{requirement.count}
                          </strong>
                        </span>
                      );
                    })}
                  </div>
                  <button
                    className="ticket-deliver"
                    type="button"
                    disabled={!ready}
                    onClick={() => handleOrderClick(order.id)}
                    aria-label={`Deliver ${order.title}`}
                  >
                    {ready ? "OK" : "..."}
                  </button>
                </div>
                <span className="ticket-reward" aria-label={`${order.title} reward`}>
                  <Coins size={12} aria-hidden="true" /> +{order.rewardActivityEnergy * 20}
                  <Sparkles size={12} aria-hidden="true" /> +{order.rewardStars * 10}
                </span>
              </article>
            );
          })}
          {game.activeOrderIds.length === 0 ? (
            <article className="customer-ticket ready">
              <div className="ticket-main">
                <span className="requester">Chapter Hook</span>
                <h2>Recover City Generator</h2>
                <p>Tokyo limited content can be recovered into collection rewards before the next city opens.</p>
              </div>
              <button
                type="button"
                onClick={() => setGame({ ...game, message: "Recovery hook reserved for the next slice." })}
              >
                Preview
              </button>
            </article>
          ) : null}
        </section>

        <section
          className="board merge-board"
          aria-label="Merge board"
          style={{ gridTemplateColumns: `repeat(${game.boardCols}, minmax(0, 1fr))` }}
          data-board-cols={game.boardCols}
          data-board-rows={game.boardRows}
        >
          {game.board.map((piece, index) => {
            const label = getPieceLabel(piece);
            const selected = game.selectedIndex === index;
            const routeNeeded = pieceMatchesRoute(piece, focusedRequirementChainIds);
            const dragging = drag?.fromIndex === index;
            const sourceType = getSourceType(piece);
            const sourceBadge = getSourceBadge(piece);
            const pieceBadge = sourceBadge ?? (piece?.kind === "locked" ? "Lock" : null);
            const dropIntent =
              drag && drag.overIndex === index && drag.fromIndex !== index
                ? getDropIntent(game, drag.fromIndex, index)
                : null;
            return (
              <button
                className={`cell ${label.className} ${label.assetSrc ? "has-asset" : ""} ${
                  selected ? "selected" : ""
                } ${routeNeeded ? "route-needed" : ""} ${dragging ? "dragging" : ""} ${
                  dropIntent ? `drop-target ${dropIntent}-target` : ""
                }`}
                type="button"
                key={piece ? piece.uid : `empty-${index}`}
                onClick={() => handleCellClick(index)}
                onPointerDown={(event) => handleCellPointerDown(event, index)}
                onPointerEnter={(event) => setDragTarget(index, event.clientX, event.clientY)}
                onPointerMove={handleCellPointerMove}
                onPointerUp={finishCellDrag}
                onPointerCancel={cancelCellDrag}
                aria-label={`${label.label} cell ${index + 1}`}
                aria-grabbed={dragging || undefined}
                draggable={false}
                data-cell-index={index}
                data-dragging={dragging ? "true" : undefined}
                data-drop-intent={dropIntent ?? undefined}
                data-route-needed={routeNeeded ? "true" : undefined}
                data-source-type={sourceType ?? undefined}
              >
                {pieceBadge ? <span className="cell-badge">{pieceBadge}</span> : null}
                {renderPieceVisual(label)}
              </button>
            );
          })}
        </section>

        {drag?.hasMoved && draggedLabel ? (
          <div
            className={`drag-preview ${draggedLabel.className} ${draggedLabel.assetSrc ? "has-asset" : ""}`}
            style={{ left: drag.clientX, top: drag.clientY }}
            aria-label={`Dragging ${draggedLabel.label}`}
          >
            {renderPieceVisual(draggedLabel)}
          </div>
        ) : null}

        <section className="merge-bottom" aria-label="Merge page bottom controls">
          <button
            className="bottom-action"
            type="button"
            aria-label="Backpack"
            onClick={() => setGame({ ...game, message: "Backpack storage hook reserved for the next slice." })}
          >
            <Backpack size={20} aria-hidden="true" />
          </button>
          <div className="bottom-info" aria-label="Selected item information">
            <div>
              <p className="eyebrow">Selected</p>
              <strong>{selectedPiece ? selectedLabel.label : "None"}</strong>
            </div>
            <p>{game.message}</p>
          </div>
          <button
            className="bottom-action"
            type="button"
            aria-label="Map"
            onClick={() => setView("map")}
          >
            <MapIcon size={20} aria-hidden="true" />
          </button>
        </section>
      </section>
    </main>
  );
}

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

type AppView = "merge" | "map";
type DragState = {
  fromIndex: number;
  overIndex: number | null;
  hasMoved: boolean;
  startX: number;
  startY: number;
  clientX: number;
  clientY: number;
};

function getPieceLabel(piece: BoardPiece | null): { emoji: string; shortLabel: string; label: string; className: string } {
  if (!piece) {
    return { emoji: "", shortLabel: "", label: "Empty", className: "empty" };
  }
  if (piece.kind === "hidden") {
    return { emoji: "◇", shortLabel: "Sealed", label: "Sealed travel space", className: "hidden" };
  }
  if (piece.kind === "locked") {
    const generator = generatorDefs[piece.defId];
    if (generator) {
      return {
        emoji: generator.emoji,
        shortLabel: generator.shortLabel,
        label: `Locked ${generator.label}`,
        className: "locked locked-generator"
      };
    }
    const item = itemDefs[piece.defId];
    if (item) {
      return {
        emoji: item.emoji,
        shortLabel: item.shortLabel,
        label: `Locked ${item.label}`,
        className: `locked locked-item ${item.scope === "city" ? "city-item" : "persistent-item"}`
      };
    }
    return { emoji: "📦", shortLabel: "Locked", label: "Locked travel space", className: "locked" };
  }
  if (piece.kind === "generator") {
    const generator = generatorDefs[piece.defId];
    return {
      emoji: generator.emoji,
      shortLabel: generator.shortLabel,
      label: generator.label,
      className: `${generator.cityLimited ? "generator city-generator" : "generator persistent-generator"} source-${
        generator.sourceType
      }`
    };
  }
  const item = itemDefs[piece.defId];
  return {
    emoji: item.emoji,
    shortLabel: item.shortLabel,
    label: item.label,
    className: item.scope === "city" ? "item city-item" : "item persistent-item"
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
  const draggedLabel = drag ? getPieceLabel(game.board[drag.fromIndex]) : null;
  const focusedOrderId = getFocusedOrderId(game, chapter.orderIds);
  const focusedOrder = focusedOrderId ? orderDefs[focusedOrderId] : null;

  const selectedLabel = useMemo(() => getPieceLabel(selectedPiece), [selectedPiece]);
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
        <button className="icon-button" type="button" onClick={resetPrototype} aria-label="Reset prototype">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </header>
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
      <section className="phone-frame" aria-label="Travel Merge2 prototype">
        {renderHud()}

        <section className="customer-strip" aria-label="Active customer orders">
          {game.activeOrderIds.map((orderId) => {
            const order = orderDefs[orderId];
            const ready = canFulfillOrder(game, orderId);
            const focused = focusedOrderId === orderId;
            return (
              <article
                className={`customer-ticket ${ready ? "ready" : ""} ${focused ? "focused" : ""}`}
                key={order.id}
                aria-label={`${focused ? "Focused order" : "Order"}: ${order.title}`}
                aria-current={focused ? "step" : undefined}
              >
                <span className="customer-avatar" aria-hidden="true">
                  {getRequesterAvatar(order.requester)}
                </span>
                <div className="ticket-main">
                  <span className="requester">{order.requester}</span>
                  {focused ? <span className="focus-chip">Route</span> : null}
                  <h2>{order.title}</h2>
                </div>
                <div className="ticket-requirements" aria-label={`${order.title} requirements`}>
                  {order.requirements.map((requirement) => (
                    <span key={requirement.itemId}>
                      {itemDefs[requirement.itemId].emoji}x{requirement.count}
                    </span>
                  ))}
                </div>
                <span className="ticket-reward" aria-label={`${order.title} reward`}>
                  <Sparkles size={12} aria-hidden="true" /> +{order.rewardStars}
                </span>
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => handleOrderClick(order.id)}
                  aria-label={`Deliver ${order.title}`}
                >
                  Deliver
                </button>
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
          className="board"
          aria-label="Merge board"
          style={{ gridTemplateColumns: `repeat(${game.boardCols}, minmax(0, 1fr))` }}
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
                className={`cell ${label.className} ${selected ? "selected" : ""} ${routeNeeded ? "route-needed" : ""} ${
                  dragging ? "dragging" : ""
                } ${dropIntent ? `drop-target ${dropIntent}-target` : ""}`}
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
                <span className="cell-emoji">{label.emoji}</span>
                <span className="cell-label">{label.shortLabel}</span>
              </button>
            );
          })}
        </section>

        {drag?.hasMoved && draggedLabel ? (
          <div
            className={`drag-preview ${draggedLabel.className}`}
            style={{ left: drag.clientX, top: drag.clientY }}
            aria-label={`Dragging ${draggedLabel.label}`}
          >
            <span className="cell-emoji">{draggedLabel.emoji}</span>
            <span className="cell-label">{draggedLabel.shortLabel}</span>
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

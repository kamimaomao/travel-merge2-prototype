import { Backpack, Map as MapIcon, RotateCcw, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { cityChapters, generatorDefs, itemDefs, orderDefs } from "./game/content";
import { createInitialState } from "./game/createInitialState";
import { emitFromGenerator, fulfillOrder, moveOrMerge } from "./game/mergeLogic";
import type { BoardPiece, GameState } from "./game/types";

function getPieceLabel(piece: BoardPiece | null): { emoji: string; shortLabel: string; label: string; className: string } {
  if (!piece) {
    return { emoji: "", shortLabel: "", label: "Empty", className: "empty" };
  }
  if (piece.kind === "hidden") {
    return { emoji: "◇", shortLabel: "Sealed", label: "Sealed travel space", className: "hidden" };
  }
  if (piece.kind === "locked") {
    return { emoji: "📦", shortLabel: "Locked", label: "Locked travel space", className: "locked" };
  }
  if (piece.kind === "generator") {
    const generator = generatorDefs[piece.defId];
    return {
      emoji: generator.emoji,
      shortLabel: generator.shortLabel,
      label: generator.label,
      className: generator.cityLimited ? "generator city-generator" : "generator persistent-generator"
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

function canFulfillOrder(state: GameState, orderId: string): boolean {
  const order = orderDefs[orderId];
  return order.requirements.every((requirement) => {
    const owned = state.board.filter((piece) => piece?.kind === "item" && piece.defId === requirement.itemId).length;
    return owned >= requirement.count;
  });
}

export default function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState());
  const chapter = cityChapters[game.cityChapterId];
  const selectedPiece = game.selectedIndex === null ? null : game.board[game.selectedIndex];

  const selectedLabel = useMemo(() => getPieceLabel(selectedPiece), [selectedPiece]);

  function handleCellClick(index: number) {
    const piece = game.board[index];
    if (game.selectedIndex === null) {
      if (!piece) {
        setGame({ ...game, message: "Select a piece first." });
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
      setGame({ ...game, selectedIndex: index, message: `${getPieceLabel(piece).label} selected.` });
      return;
    }

    if (piece?.kind === "generator") {
      setGame(emitFromGenerator(game, index));
      return;
    }

    if (piece?.kind === "hidden" || piece?.kind === "locked") {
      setGame(moveOrMerge(game, game.selectedIndex, index));
      return;
    }

    const selected = game.board[game.selectedIndex];
    if (
      piece &&
      selected &&
      (piece.kind !== selected.kind || piece.defId !== selected.defId)
    ) {
      setGame({ ...game, selectedIndex: index, message: `${getPieceLabel(piece).label} selected.` });
      return;
    }

    setGame(moveOrMerge(game, game.selectedIndex, index));
  }

  function handleOrderClick(orderId: string) {
    setGame(fulfillOrder(game, orderId));
  }

  function resetPrototype() {
    setGame(createInitialState());
  }

  return (
    <main className="game-shell">
      <section className="phone-frame" aria-label="Travel Merge2 prototype">
        <header className="hud">
          <div className="hud-pill">
            <Zap size={16} aria-hidden="true" />
            <span>{game.energy}</span>
          </div>
          <div className="hud-pill">
            <Sparkles size={16} aria-hidden="true" />
            <span>{game.stars}</span>
          </div>
          <div className="hud-progress">
            {chapter.cityName} {chapter.dayLabel}
            <strong>{game.cityProgress}/4</strong>
          </div>
          <button className="icon-button" type="button" onClick={resetPrototype} aria-label="Reset prototype">
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </header>

        <section className="scene-strip">
          <div>
            <p className="eyebrow">Current City Layer</p>
            <h1>{chapter.sceneTitle}</h1>
            <p>{chapter.sceneSubtitle}</p>
          </div>
        </section>

        <section className="customer-strip" aria-label="Active customer orders">
          {game.activeOrderIds.map((orderId) => {
            const order = orderDefs[orderId];
            const ready = canFulfillOrder(game, orderId);
            return (
              <article className={`customer-ticket ${ready ? "ready" : ""}`} key={order.id}>
                <div className="ticket-main">
                  <span className="requester">{order.requester}</span>
                  <h2>{order.title}</h2>
                  <p>{order.flavor}</p>
                </div>
                <div className="ticket-requirements" aria-label={`${order.title} requirements`}>
                  {order.requirements.map((requirement) => (
                    <span key={requirement.itemId}>
                      {itemDefs[requirement.itemId].emoji}x{requirement.count}
                    </span>
                  ))}
                </div>
                <button type="button" disabled={!ready} onClick={() => handleOrderClick(order.id)}>
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
            return (
              <button
                className={`cell ${label.className} ${selected ? "selected" : ""}`}
                type="button"
                key={piece ? piece.uid : `empty-${index}`}
                onClick={() => handleCellClick(index)}
                aria-label={`${label.label} cell ${index + 1}`}
              >
                <span className="cell-emoji">{label.emoji}</span>
                <span className="cell-label">{label.shortLabel}</span>
              </button>
            );
          })}
        </section>

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
            onClick={() => setGame({ ...game, message: "Travel map and decoration loop are reserved." })}
          >
            <MapIcon size={20} aria-hidden="true" />
          </button>
        </section>
      </section>
    </main>
  );
}

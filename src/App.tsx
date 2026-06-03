import { RotateCcw, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { cityChapters, generatorDefs, itemDefs, orderDefs } from "./game/content";
import { createInitialState } from "./game/createInitialState";
import { emitFromGenerator, fulfillOrder, moveOrMerge } from "./game/mergeLogic";
import type { BoardPiece, GameState } from "./game/types";

function getPieceLabel(piece: BoardPiece | null): { emoji: string; shortLabel: string; label: string; className: string } {
  if (!piece) {
    return { emoji: "", shortLabel: "", label: "Empty", className: "empty" };
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

    const selected = game.board[game.selectedIndex];
    if (
      piece &&
      selected &&
      (piece.kind !== selected.kind || piece.defId !== selected.defId) &&
      piece.kind !== "locked"
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
          <div className="cast-strip" aria-label="Travel cast">
            <span>Avery</span>
            <span>Mina</span>
            <span>Theo</span>
            <span className="cat">Mochi 🐈</span>
          </div>
        </section>

        <section className="board" style={{ gridTemplateColumns: `repeat(${game.boardCols}, minmax(0, 1fr))` }}>
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

        <section className="feedback-panel">
          <div>
            <p className="eyebrow">Selected</p>
            <strong>{selectedPiece ? selectedLabel.label : "None"}</strong>
          </div>
          <p>{game.message}</p>
        </section>

        <section className="orders-panel" aria-label="Active orders">
          <div className="orders-header">
            <div>
              <p className="eyebrow">Orders</p>
              <h2>Travel Timeline</h2>
            </div>
            <span>Cat mood {game.catMood}</span>
          </div>
          <div className="orders-list">
            {game.activeOrderIds.map((orderId) => {
              const order = orderDefs[orderId];
              const ready = canFulfillOrder(game, orderId);
              return (
                <article className={`order-card ${ready ? "ready" : ""}`} key={order.id}>
                  <div>
                    <span className="requester">{order.requester}</span>
                    <h3>{order.title}</h3>
                    <p>{order.flavor}</p>
                    <ul>
                      {order.requirements.map((requirement) => (
                        <li key={requirement.itemId}>
                          {itemDefs[requirement.itemId].emoji} {itemDefs[requirement.itemId].label} x{requirement.count}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button type="button" disabled={!ready} onClick={() => handleOrderClick(order.id)}>
                    Deliver
                  </button>
                </article>
              );
            })}
            {game.activeOrderIds.length === 0 ? (
              <article className="order-card ready">
                <div>
                  <span className="requester">Chapter Hook</span>
                  <h3>Recover City Generator</h3>
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
          </div>
        </section>
      </section>
    </main>
  );
}

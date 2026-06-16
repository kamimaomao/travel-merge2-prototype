# Hex Kingdoms Design

## Goal

Create a clean, standalone mobile-first Slay-like prototype in a new `hex-kingdoms/` directory. The project should reproduce the core appeal of Sean O'Connor's Slay: hex territory control, territory-level money, unit wages, buying pieces, combining units, cutting land, tree pressure, bankruptcy, and a complete local match against AI.

The game uses original packaging and art direction. It should not copy Slay's title, UI, or original artwork. The working product name is `hex-kingdoms`.

Reference rules: <https://www.windowsgames.co.uk/slayRules.html>.

## Scope

First playable slice:

- Mobile portrait browser game.
- One small island quick match.
- Two sides: human player and one AI opponent.
- Complete single-match loop from opening board to victory or defeat.
- Wood-board tabletop visual theme.
- All visible board graphics are generated image assets and rendered with `<img>`.
- No canvas rendering, no SVG board drawing, and no emoji as board art.

Deferred:

- Large islands.
- More than two players.
- Full campaign, rankings, surrender, undo, and custom themes.
- Network play.
- Advanced AI difficulty levels.
- Full procedural island generator beyond the first quick-match map needs.

## Project Structure

The new project lives at `/Users/kamisola/Documents/宝开/hex-kingdoms/` so the existing Merge-2 prototype remains untouched.

Recommended stack:

- React 18.
- TypeScript.
- Vite.
- Vitest and Testing Library for verification.

Planned source layout:

- `src/game/`: pure TypeScript rules for map state, territories, economy, movement, attacks, bankruptcy, trees, victory, and AI.
- `src/assets/`: PNG assets produced with image2/image_gen.
- `src/App.tsx`: mobile UI, turn flow, selection, and action panels.
- `src/game/*.test.ts`: focused rule tests.

No networking, persistence, or map editor is included in the first slice.

## Core Rules

The prototype uses a small `7 x 9` style hex island tuned for portrait play. Some coordinates are sea, and land is split between the player, the AI, and a small amount of neutral territory.

Territories are connected groups of same-owner land. Each connected group tracks its own money. At the start of a side's turn, each territory earns money from land tiles that are not blocked by trees, then pays unit wages. If the territory cannot pay, it goes bankrupt: its units die, affected unit tiles become gravestones, and the territory's money is cleared.

Pieces:

- Four unit strengths, represented as wooden tabletop pieces.
- Fort piece for defense.
- Treasury marker for a territory's money.
- Trees that block income and spread.
- Gravestones that can later turn into trees.

Buying:

- Buy from the currently selected friendly territory.
- Unit, wage, and fort values live in one rules table and should follow Slay's core economy unless an implementation note records a deliberate mobile-scope deviation.
- Bought pieces must be placed on legal empty land in that territory.
- Pieces cannot be sold back.

Movement and attack:

- A unit can move within its own territory before it attacks.
- A unit can attack an adjacent enemy or neutral tile if its strength beats the target defense.
- A unit can chop a tree in its own territory instead of attacking.
- Units, treasuries, and forts defend their own tile and nearby same-territory tiles.
- Capturing land may connect friendly territories or split enemy territories. Territory money is recalculated after topology changes.

Combining:

- Friendly units in the same territory can combine into a stronger unit.
- Strength is capped at level 4.
- Stronger units cost more wages, so combining can create bankruptcy risk.

Trees:

- Trees spread at turn start using a simplified readable rule suitable for the small map.
- Tree tiles do not produce income.
- Gravestones can become trees on a later turn.

Victory:

- A side loses when it has no remaining land.
- The other side wins immediately.

## AI

The first AI should be deterministic enough to test and readable enough to debug. It does not need to be optimal.

AI priorities:

1. Attack adjacent land when a legal move improves territory size or cuts the player.
2. Chop trees that block income in valuable territories.
3. Buy a basic unit when a territory can afford it and has useful placement.
4. Combine units only when the resulting wage is affordable and a stronger attack is available.
5. Buy a fort when threatened and enough money remains.
6. End turn if no useful legal action remains.

The AI must only use the same rule helpers available to the player. Tests should prove it can complete a legal turn without corrupting state.

## Mobile UI

The first screen is the game, not a landing page.

Portrait layout:

- Top HUD: current side, turn number, selected territory money, income, wages, and an end-turn button.
- Middle: compact hex island board.
- Bottom: selected tile details and contextual actions.
- Message strip: illegal move reasons, AI action summaries, bankruptcy notices, and win/loss messages.

Interaction:

- Tap a friendly unit to select it.
- Tap an adjacent legal target to move, attack, or chop.
- Tap friendly land to inspect territory economy.
- Tap buy buttons in the bottom panel, then tap a legal friendly tile to place the piece.
- End turn triggers AI actions automatically.

No drag interaction is required in the first version. Tap selection is safer on mobile and keeps the rule loop clear.

## Board Asset Contract

The user's image rule is strict: if the board visually depicts a game object or tile, it must come from image2/image_gen as a PNG and be rendered through `<img>`.

Allowed:

- CSS for layout, spacing, hit targets, panels, buttons, text, hover or selected outlines, and responsive sizing.
- DOM image stacking, such as a terrain PNG plus a unit PNG overlay.
- Lucide or text icons outside the board area for UI controls.

Not allowed for board art:

- `<canvas>`.
- Canvas APIs.
- SVG board or piece drawing.
- CSS-drawn hexagons as the visual tile art.
- Emoji as pieces, terrain, trees, forts, or grave markers.

Initial asset list:

- Neutral hex tile.
- Player hex tile.
- AI hex tile.
- Player unit levels 1 through 4.
- AI unit levels 1 through 4.
- Fort.
- Treasury marker.
- Tree.
- Gravestone.
- Sea or empty background tile if needed for alignment.

The preferred composition is tile PNG plus overlay PNGs. This keeps the asset count small while still satisfying the no-canvas requirement.

## Visual Direction

The visual theme is a minimal wooden tabletop strategy game:

- Wood-grain hex tiles.
- Clean colored faction inlays for player and AI.
- Chunky wooden unit pieces with clear level differences.
- Fort, tree, and gravestone pieces designed as readable board tokens.
- Calm mobile UI around the board, with restrained color and clear touch targets.

The art should be original and should avoid copying Slay's medieval sprites or interface.

## Testing And Verification

Success criteria before calling the slice playable:

- `npm test` covers income, wages, buying, legal attacks, defense checks, combining, territory splits, territory joins, bankruptcy, tree spread, victory, and a legal AI turn.
- `npm run build` passes.
- Mobile portrait run-through confirms the first screen is the board, selection works, end turn works, and AI acts.
- Static check confirms no `<canvas>` element or canvas API usage exists in the project.
- Board rendering uses PNG assets through `<img>`.
- The board contains no SVG art and no emoji placeholders for game objects.

## Risks And Tradeoffs

The first slice intentionally uses a smaller island than the original game. This makes the game readable on mobile but reduces the multi-front pressure of larger Slay matches.

The AI is scoped as a simple greedy opponent. It should create a playable match, but it will not match a mature strategy AI.

The rule implementation should prioritize the core loop. Edge cases that do not affect the quick match can be deferred if they would delay getting a complete playable game.

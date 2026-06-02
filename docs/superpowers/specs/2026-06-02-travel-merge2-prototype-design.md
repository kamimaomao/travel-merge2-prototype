# Travel Merge2 Prototype Design

## Purpose

Build the first playable prototype for a vertical, order-driven Merge2 travel game. The prototype should validate the core feel: players spend energy on board-resident generators, merge travel items, satisfy orders, and build expectation toward the next piece of journey progress.

This prototype prioritizes playable execution over complete planning. It should be good enough to feel the loop, expose wrong assumptions, and support fast iteration.

## Current Product Slice

The first slice uses the city travel order direction. The main board is a long-running timeline for the whole game, not a disposable board that fully changes with each city. The current city adds temporary flavor, orders, content, and generators on top of that persistent board.

First playable slice:

- Portrait-first web prototype.
- One persistent main merge board.
- One current city chapter, provisionally Tokyo Day 1.
- Board-resident generators only.
- Merge2 item upgrading.
- Order completion for stars and city progress.
- A visible pet cat as an emotional and order-driving asset.
- A small chapter-end recovery hook for city-limited generators.

## Core Player Loop

1. Player taps a generator on the board.
2. Generator consumes energy and produces a low-tier item into an empty board cell.
3. Player merges two identical items into the next tier.
4. Orders ask for specific items from persistent travel chains and current-city chains.
5. Completing orders grants stars, city progress, and small feedback from the cast or cat.
6. Progress reveals the next city moment or prepares the next order.

The first prototype should make this loop obvious within the first 30 to 60 seconds.

## Board Model

The board is the economic space. Generators, items, blockers, and empty cells all compete for board slots.

Default board:

- Size: 6 x 6 for the first prototype, adjustable later.
- Input: click/tap select, move to empty cells, merge into identical cells.
- Generators occupy board cells and can be merged with same-level generators.
- Generator output requires an empty cell.
- Energy is consumed only when a generator successfully emits an item.
- If the board has no empty cells, emission fails with clear feedback.

Initial board composition:

- A small working pocket with active merge pairs.
- Persistent travel generators near usable empty space.
- One current-city generator.
- A few locked or wrapped cells to create light board pressure.
- Enough visible empty space to avoid early frustration.

## Generator Types

Persistent generators stay relevant across the long timeline:

- Suitcase: produces packable travel items such as small bag, backpack, clothing, and travel documents.
- Toiletry kit: produces cleanser, towel, skincare, and similar daily travel items.
- Medicine pouch: produces medicine, bandage, pill box, and first-aid items.
- Snack source: can later support instant noodles, drinks, and general food needs.

Current-city generators are chapter-limited:

- Tokyo convenience bag: produces rice ball, bento, ramen ticket, local receipt, train stamp, and small souvenirs.

The prototype only needs one current-city generator. Shopping and food should be represented as content categories in data, not as independent full systems yet.

## Item Chains

Persistent chains:

- Travel prep chain: small pouch -> day bag -> backpack -> organized luggage.
- Toiletry chain: cleanser sample -> cleanser bottle -> skincare set.
- Medicine chain: pill -> medicine strip -> travel medicine box.
- General snack chain: instant noodles -> travel meal kit.

Current-city chains:

- Local food chain: rice ball -> bento -> ramen ticket.
- Souvenir chain: charm -> wind chime -> stamp booklet.
- Transit chain: station ticket -> day pass.

The first prototype can use simple labels or icons. It does not need final art, but each item must be visually distinct at board-cell size.

## Orders

Orders are the main demand driver. Each order can require persistent items, current-city items, or both.

First order set:

- Departure prep: medicine box and cleanser.
- Tokyo morning errand: rice ball and station ticket.
- Cat preference: small bag and charm.
- Cast request: travel meal kit or backpack.

Rewards:

- Stars for meta progress.
- City progress for current chapter.
- Optional cat mood or cast reaction text.

The first prototype should include 3 to 5 orders and generate the next order after completion.

## Timeline And Chapter Layer

The main board persists across chapters. City content is layered on top.

Persistent layer:

- Core board state.
- Persistent generators.
- Persistent item chains.
- Player energy, stars, and long-term progress.

City layer:

- Current city name and day.
- City-specific background or banner.
- City-specific generator.
- City-specific orders and item chains.

Chapter-end recovery hook:

- When leaving a city, city-limited generators can be recovered through a travel collection or achievement action.
- Recovery can grant stars, coins, energy, city collection progress, or next-city starter resources.
- The first prototype only needs to show the hook; it does not need a complete collection system.

## Cast And Cat

The cast should feel like a traveling friend group, but the first prototype should avoid building a heavy story system.

Prototype usage:

- Show a small cast strip or current requester near the order area.
- Orders can be attributed to a cast member or the cat.
- The cat is kept as a visible emotional anchor and can request items.

Deferred:

- Full relationship system.
- Branching dialogue.
- Character progression.
- Multi-character story scenes.

## Deferred Expansion Hooks

Shopping and food are important travel experiences, but their forms are not settled yet. The prototype reserves data categories for them without turning them into separate systems.

Reserved hooks:

- Content category: shopping.
- Content category: food.
- Content category: local souvenir.
- City-limited generator type.
- City-limited item chain.
- Chapter recovery reward table.

These hooks should be data-level categories so they can become orders, generators, collections, side systems, or events later.

## UI Structure

First screen is the playable game, not a landing page.

Portrait layout:

- Top HUD: energy, stars, city/day progress.
- Upper scene strip: current city atmosphere and cast/cat presence.
- Center: merge board.
- Bottom or side area: active orders, selected item detail, reset/undo tools.

Design constraints:

- Generators must appear inside board cells.
- No off-board random spawn buttons.
- Text must be readable on mobile.
- Important actions should have clear touch targets.

## Data And Mechanics Architecture

Keep content and mechanics separate.

Content data:

- Item definitions.
- Item chains.
- Generator definitions and output weights.
- Order definitions.
- City chapter definitions.
- Recovery reward definitions.

Mechanics:

- Board state.
- Select, move, merge, and emit validation.
- Energy consumption.
- Order fulfillment checks.
- Reward application.
- City progress updates.

This separation keeps the prototype tunable when the theme, items, or city content changes.

## Error Handling

The prototype should handle common bad states visibly:

- Not enough energy: show feedback and prevent emission.
- No empty board cell: show feedback and prevent emission.
- Invalid merge: reject without changing state.
- Required order item missing: do not allow delivery.
- Board nearly full: offer reset or a simple sell/trash recovery action.

## Testing And Verification

Minimum verification before calling the prototype playable:

- Tap a persistent generator and confirm it emits into an empty cell.
- Tap a city generator and confirm it emits only city content.
- Merge two identical items and confirm the next tier appears.
- Complete at least one order requiring persistent items.
- Complete at least one order requiring current-city items.
- Confirm energy decreases only on successful emissions.
- Confirm emission fails cleanly when no empty cell exists.
- Confirm the layout is usable in a portrait browser viewport.

## Non-Goals For First Prototype

- Final monetization.
- Deep numerical balance.
- Full decoration system.
- Full shopping system.
- Full food system.
- Full character drama system.
- Multiple cities.
- Production-quality art.

## Open Decisions Resolved For This Slice

- Use city travel orders as the first gameplay wrapper.
- Treat the main board as a long-running timeline.
- Include current-city content as a temporary layer.
- Keep city-limited generators recoverable at chapter end.
- Leave shopping and food as expansion hooks.
- Use Tokyo Day 1 as the provisional first city unless replaced later.

# Merge Board Drag Interaction Design

## Goal

Replace the prototype's temporary tap-source/tap-target interaction with the standard Merge-2 interaction model: tap generators to produce, and drag board pieces to move or merge.

## Interaction Contract

- Tapping a generator produces an item and consumes energy.
- Tapping a normal item only shows its information.
- Dragging an item or generator onto an empty cell moves it.
- Dragging onto a valid identical piece merges or upgrades it.
- Dragging onto hidden cells, incompatible pieces, or outside the board leaves the source in place.
- Drag start lifts the source cell. Valid move targets, valid merge targets, and invalid targets receive distinct feedback.

## Architecture

The existing `moveOrMerge` function remains the single authority for resolving board state. A small exported drop-intent helper describes whether a hovered target is a move, merge, or invalid target so the React board can render feedback without mutating game state.

`App.tsx` tracks transient drag state with Pointer Events and refs. Pointer movement resolves the cell under the pointer, while pointer release calls `moveOrMerge` once. This supports mouse, touch, and pen input without an additional dependency.

## Verification

- Component tests prove clicking two cells no longer moves a piece.
- Component tests prove pointer dragging merges identical pieces.
- Component tests prove generator tapping still consumes energy.
- Pure logic tests cover move, merge, and invalid drop intent.
- Browser playtesting validates mouse/touch-style dragging, visual target feedback, console health, and mobile layout.

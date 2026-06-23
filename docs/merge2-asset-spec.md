# Merge2 Asset Spec Notes

Related style direction: [travel-merge2-art-direction.md](travel-merge2-art-direction.md).

## Board Piece Asset Contract

- Generated source assets are square, 1:1 PNGs.
- Source size target for generation: 1024 x 1024.
- Runtime board-piece assets should be compressed WebP with alpha.
- Runtime size target: 384 x 384 for ordinary board pieces, 512 x 512 only for UI pieces that are displayed larger than one board cell.
- Runtime file-size target: ideally 10-60 KB per board-piece asset. Anything above 150 KB needs a specific reason.
- Runtime display: fill one board cell at `width: 100%; height: 100%`.
- Composition: full rounded-square cell base plus the item/generator object inside the same image.
- Camera: strict front-facing orthographic 2D, no perspective or tilted tabletop view.
- Readability: object silhouette must remain clear at roughly 56-72 px on a phone screen.
- Text: no readable text inside item art unless explicitly required.
- Background: transparent outside the rounded cell corners.
- Board pieces should include their own visual state when needed, such as sealed, locked, generator energy, finite-use, or reward container.
- Keep high-resolution generated sources outside the runtime bundle unless the user explicitly asks to retain source art in the project repository.

## Current Visual Decision

The last image pass is not retained. Only the square board-piece sizing and full-cell asset structure are carried forward for the next art pass.

All future visible game assets should be generated as image assets following the travel-journal art direction. Canvas/CSS-drawn outlines are acceptable only as temporary debug placeholders, not as final visual assets.

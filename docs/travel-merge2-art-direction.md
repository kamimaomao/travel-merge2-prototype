# Travel Merge2 Art Direction

## Direction

Original global-travel merge game assets with a polished commercial casual-game finish.

The target is not realistic travel photography, not flat wireframe UI, and not a low-complexity paper prototype. The page should feel like a mature casual merge game built from illustrated travel keepsakes: paper, stickers, small bags, tickets, stamps, food wrappers, postcards, charms, boxes, and compact UI plaques.

## Reference Reading

The accepted reference direction is the square board-piece treatment shown in the user's approved sample:

- rounded square asset with full-cell base included in the image
- soft cream and kraft-paper materials
- raised rim and inner bevel
- readable center object
- tactile details such as folds, stitches, wax seal, stamp marks, lock plate, and soft shadow
- no exposed canvas-style outlines

This is the style anchor for board pieces. Future assets should translate this feeling into original travel-game assets rather than copying the exact sample.

The newer farm merge reference supplied by the user is the main reference for the merge-page color organization, UI weight, and art complexity. Treat it as if the same production team were making a global travel game instead of a farm game.

Extract these transferable rules:

- bright commercial casual-game saturation
- clear color blocking between HUD, order strip, board, blockers, and bottom info
- chunky rounded UI panels with thick rims and soft bevels
- rich item sprites with visible volume, highlight, shadow, and small material details
- busy but readable board state, with many active objects, blockers, reward icons, and progress cues
- character/order area integrated above the board rather than a sterile dashboard
- strong reward readability through coins, checkmarks, gift packs, timers, badges, and glossy icons

Current correction from visual review:

- the first generated batch is too realistic, too shadow-heavy, and not bright enough
- reduce realistic paper/leather grain and heavy occlusion shadows
- push toward clean stylized casual-game sprites like the reference crop/coin assets: bright fills, simple rounded forms, controlled highlights, soft short shadows
- keep commercial 2.5D volume, but avoid product-render realism
- assets should feel cheerful and touchable, not antique, dusty, or premium-realistic

Do not copy:

- farm topic, crops, hay, animals, greenhouse fiction, exact characters, exact panel layout, or exact color selections
- the heavy farm yellow/green dominance
- any branded UI/icon composition from the reference

For this project, translate the same production value into travel equivalents: sky, route maps, tickets, luggage, food packaging, souvenirs, passports, stickers, hotel desks, city postcards, and event gift packs.

## Product Fantasy

The player is assembling a trip from small, collectible travel objects. Every merge should feel like sorting a colorful travel desk full of souvenirs and prep items, then turning them into progress on a city journey.

The visual promise is:

- colorful travel preparation
- collectible city souvenirs
- warm character-driven journey energy
- practical mobile readability
- strong commercial casual-game reward feedback

## Visual Grammar

### Shape

- Rounded-square UI with compact, chunky forms.
- Corners are soft but not overly bubbly.
- Main silhouettes must be readable at 56-72 px.
- Board pieces should look like small physical objects placed inside a crafted tile.
- Avoid thin icon-line art as the primary read.
- UI panels should feel thick, layered, and touchable, closer to production casual-game UI than minimalist app UI.

### Material

Primary materials:

- warm paper
- kraft envelope
- soft leather
- stitched fabric
- enamel pin
- wax seal
- printed ticket/cardstock
- glossy sticker
- ceramic or lacquered souvenir
- polished enamel UI badges
- soft plastic-like reward shine only on currency, gems, event gifts, and checkmarks

Rendering priority:

- color block first
- silhouette second
- soft highlight third
- material detail last

Material texture should support the object but never dominate it. At board size, the player should read "bag", "ticket", "food", "coin", or "gift" before reading leather grain or paper grain.

Secondary materials:

- brushed metal only for locks, clasps, badge rims, and rare rewards
- glass only for premium currency or special reward containers

Avoid:

- pure vector flat fills
- generic gradient cards
- plastic toy shine on every object
- realistic photo texture
- low-detail emoji-like symbols
- thin prototype wireframes
- heavy realistic leather/paper grain
- dark ambient occlusion around every object
- antique, dusty, or low-saturation travel scrapbook mood

### Lighting

- Front-facing orthographic asset lighting.
- Soft top-left key light.
- Short, light contact shadow only.
- Gentle inner rim shadow on tile bases.
- Highlight should clarify volume, not create heavy 3D perspective.
- Use the reference's commercial 2.5D polish: rounded highlights, soft drop shadows, clear object separation, and readable bevels.
- Prefer bright cel-shaded gradients over realistic rendering.

Avoid:

- dramatic spotlight
- deep cast shadows
- heavy realistic occlusion shadows
- isometric tabletop angle
- tilted board perspective
- dark UI backgrounds for core gameplay

### Palette

Base palette:

- cream paper: `#fff1d2`
- warm ivory: `#fff8e8`
- kraft tan: `#c9894b`
- caramel rim: `#a9682d`
- travel teal: `#2f8394`
- map blue: `#6db5d0`
- leaf green: `#69a86f`
- stamp red: `#b93a32`
- ink navy: `#193247`
- soft shadow: `rgba(48, 39, 28, 0.22)`

Usage:

- board cell bases should mostly live in cream, ivory, tan, pale map paper, and light wood tones
- generator/state borders can use stronger category colors
- red is reserved for attention, wax seal, notification badges, close buttons, and limited-time urgency
- blue/teal is used for travel/map/navigation clarity and sky/world context
- gold is used for rewards, locks, premium containers, coins, and high-value UI
- green is used sparingly for completion/check feedback, not as the dominant topic color
- purple/magenta is reserved for premium gems, special events, or rare rewards

Reference color rule:

- high saturation is allowed, but each screen zone needs a clear color role
- HUD currencies can be bright and glossy
- the board itself should stay warm and readable
- blockers should use a repeated texture family so the player reads board pressure quickly
- rewards/checkmarks/event badges can be the most saturated elements
- travel theme should shift the reference away from farm yellow/green toward sky blue, postcard cream, map teal, coral red, gold, and selective city-accent colors
- item sprites should be brighter than the first generated batch, with midtone shadows and clean highlights rather than dark shading

Avoid a one-hue screen. The game should not become all blue, all beige, all purple, or all brown.

## Main Merge Page Complexity

Use the farm merge reference for complexity level.

The screen should feel full and commercially finished, not sparse:

- top resource HUD with multiple glossy currencies and plus affordances
- compact order/customer strip with character presence and visible rewards
- timed/event icon visible as a colorful side or top asset
- board filled with a mix of empty cells, blockers, active items, generators, and ready-order cues
- bottom info panel with a strong icon button and selected-object explanation
- checkmarks, badges, timers, and coin rewards should be visually prominent

Board complexity target:

- 35-55% immediately playable items
- 15-30% empty working cells
- 20-40% blockers, locked pieces, sealed cells, or reveal pressure
- 1-3 visible generators in normal mid-session screenshots
- 2-4 active orders visible or partially visible, depending on final phone layout

Asset complexity target:

- each board item should have 2-4 readable internal details, such as straps, labels, shine, stitch, folds, ribbon, stamp, wrapper edge, or clasp
- each generator should have 4-7 readable details and a stronger base/rim
- blockers should repeat one strong texture motif, not become unique art for every cell
- visual density should be high, but item family silhouettes must still be readable at board size
- details should be clean and graphic, not realistic micro-texture
- shadow should be a small readability device, not the main source of volume

Travel translation examples:

- farm field tile -> warm map/planner tile, hotel desk tile, folded paper tile, or travel notebook tile
- hay/covered cells -> sealed parcels, folded maps, paper wraps, sticker-covered envelopes, luggage tags
- crop/animal items -> travel items, tickets, snacks, local foods, souvenirs, camera/trip objects
- farm order customers -> traveling friend group and local requesters
- greenhouse/level scene -> city chapter strip, station street, hotel lobby, airport gate, market alley

## Board Piece Rules

Each board piece is a complete image asset, not a CSS-drawn tile with an icon on top.

Required:

- PNG, 1:1 ratio
- generation source target: 1024 x 1024
- transparent outside rounded corners
- full tile base included
- object centered inside tile
- front-facing orthographic 2D
- no perspective skew
- no tiny readable text inside the object
- object occupies roughly 62-76% of tile width
- leave a small safe margin for state badges if the runtime needs one

Board piece tiers:

- Tier 1: simple object, largest silhouette, fewer details
- Tier 2: same object family with one clear upgrade detail
- Tier 3: added material richness, sticker, ribbon, stamp, or small accessory
- Tier 4+: more complete object bundle, but still one readable silhouette

## Asset Categories

### Empty Cell

Looks like a clean cream paper tile with a raised rim.

Purpose:

- calm working space
- readable drag target
- should not compete with real items

### Hidden Cell

Looks like a sealed parcel, fogged envelope, or covered travel note.

Purpose:

- unrevealed board space
- communicates "not available yet"

Acceptable motifs:

- sealed envelope
- folded map cover
- paper wrap
- closed parcel

### Locked Cell

Looks like a kraft/leather tile with a lock plate or tied ribbon.

Purpose:

- visible but blocked board pressure
- communicates "can be unlocked later"

Acceptable motifs:

- small brass lock
- stitched leather patch
- tied travel tag
- wax-sealed paper

### Permanent Main-Board Generator

Looks like a durable travel object that can live on the board for a long time.

Examples:

- suitcase
- guidebook stack
- camera kit
- snack pouch

Visual requirements:

- heavier rim or base than normal items
- small embedded badge or clasp area for charges/state
- appears reusable, not disposable

### Upgradeable Generator

Looks like a generator family with visible tier growth.

Examples:

- guidebook -> annotated guidebook -> city planner binder
- suitcase -> organized suitcase -> premium trunk

Visual requirements:

- same silhouette family across tiers
- upgrade detail must be visible at board-cell size

### Charge/Cooldown Generator

Looks reusable but temporarily limited.

Examples:

- camera kit with film counter
- transit pass wallet
- pocket itinerary holder

Visual requirements:

- include a small designed counter zone if needed
- should not look broken when charges are empty

### Finite-Use Activity Generator

Looks disposable or event-limited.

Examples:

- festival voucher stack
- event gift bag
- market coupon envelope
- picnic basket with limited servings

Visual requirements:

- more colorful than permanent generators
- clear limited/event identity
- can visually degrade or disappear when exhausted later

### One-Time Container

Looks like a reward payout object, not a long-term generator.

Examples:

- souvenir gift box
- sealed prize envelope
- postcard reward packet
- small treasure tin

Visual requirements:

- strong reward read
- gold/red accent allowed
- should feel clickable/openable once

### City Item

Looks like a city-specific collectible or food/travel object.

Examples for Tokyo:

- onigiri wrapper
- bento
- ramen ticket
- station ticket
- wind chime
- stamp booklet
- charm

Visual requirements:

- more local flavor than persistent items
- should still sit inside the same global tile language

### Persistent Travel Item

Looks useful across cities.

Examples:

- pouch
- day bag
- backpack
- organized luggage
- general snack kit

Visual requirements:

- practical travel-prep feeling
- less location-specific decoration
- color should be calmer than city/event items

## UI Surface Rules

UI assets should follow the same physical travel-journal language.

### HUD

- resource capsules should be image-backed plaques or badges
- icons should be custom game icons, not lucide placeholders in final art
- background material: ivory paper or enamel badge
- text remains live UI text for readability
- final HUD should have the reference's glossy casual-game readability: thick capsule, bright icon, strong number, small plus button where needed

### Order Cards

- order card frame should resemble a small travel request slip
- requester avatar frame can be a sticker, passport photo circle, or small stamped portrait frame
- requirement slots should use tiny asset-backed item chips
- deliver button should be a raised image-backed button
- order cards should have character/reward warmth comparable to the reference: visible requester, required items, reward amount, and completion check/readiness cue

### Board Frame

- board background should feel like a travel desk, folded map, notebook page, or planner surface
- cells remain strict grid
- no decorative character/pet covering the live board
- board should be dense and textured enough to feel like a final mobile game surface, not a flat CSS grid
- hidden/blocked cells may use repeated travel textures the way the reference uses repeated field texture

### Bottom Bar

- backpack/storage button: travel bag plaque
- selected-info panel: small itinerary card
- map/progression button: folded-map plaque
- bottom information panel may use the reference's thick rounded plaque style, but converted into a travel note/map-card material

### Activity Entry

- event icon should be a standalone image asset
- badge number can remain live text, but badge frame should be image-backed later
- event style can be more saturated but must not break the base travel-journal art language
- event gifts may use the reference's high-saturation reward styling, translated into travel event packets, suitcase stickers, postcard bundles, or market gift bags

## Image Generation Prompt Base

Use this base for individual board-piece assets:

```text
original polished commercial casual mobile game asset, square board piece for a global travel merge-2 game,
full rounded-square tile included, transparent outside rounded corners,
bright stylized casual-game rendering, warm travel journal materials, cream paper and kraft paper materials,
soft raised rim, subtle inner bevel, clean top-left highlight, short light contact shadow only, glossy reward readability where appropriate,
front-facing orthographic 2D, centered readable object, tactile details,
medium-high art complexity with clean color blocking, readable at 64px phone board-cell size,
no heavy realistic shadows, no dark ambient occlusion, no photorealistic texture, no perspective, no isometric angle, no tabletop view, no text, no logo, no screenshot, no flat vector icon
```

Add the specific object after this base, for example:

```text
object: small travel pouch, level 1 persistent travel item, soft fabric pouch with tiny zipper pull, calm teal accent
```

## Hard Rejection Rules

Reject any generated asset that has:

- canvas-like outline art
- plain CSS-style rounded rectangle with icon
- emoji-style object
- unreadable silhouette at 64 px
- perspective tilt or tabletop angle
- cropped object
- non-transparent outside corners
- generic fantasy UI unrelated to travel
- low-complexity paper mockup look
- farm-topic color dominance or crop/field motifs
- heavy realistic rendering or dark object shadows
- dull, dusty, antique, or low-saturation output
- excessive text baked into the image
- logo or copied reference-game element
- background scene baked into a board piece
- different tile geometry from the asset contract

## First Asset Batch

Do this batch before touching the whole UI:

1. empty cell
2. hidden sealed cell
3. locked cell
4. small pouch
5. day bag
6. suitcase generator level 1
7. guidebook generator level 1
8. onigiri
9. station ticket
10. souvenir gift box

This batch tests the whole style system: empty state, blocked state, persistent item, city item, permanent generator, upgradeable generator, and one-time container.

Only after this batch passes visual review should the same rules be applied to HUD, order cards, map, activity board, food, shopping, and postcard assets.

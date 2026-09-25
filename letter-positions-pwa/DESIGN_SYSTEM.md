# Hurufi UI System

Hurufi uses a compact design system inspired by the **design discipline** of ChunUI, adapted for an Arabic early-learning PWA.

Reference: https://github.com/liseami/ChunUI  
ChunUI is MIT licensed. Hurufi does not depend on ChunUI at runtime; this web design layer is an independent implementation.

## 1. Core rule

New UI must use semantic tokens from `design-system.css`. Do not add arbitrary colors, font sizes, radii, shadows, or motion curves to feature CSS.

## 2. Interface typography

Interface text has only three levels:

- `--ui-text-sm: 13px` — metadata, hints, secondary labels
- `--ui-text-base: 17px` — buttons, normal interface text
- `--ui-text-lg: 24px` — screen and section titles

### Educational exception

Arabic learning content is not interface typography. Letters and teaching words may be 32–112px when clarity requires it. The selected learning font remains controlled by the font picker.

## 3. Color semantics

- `--ui-brand` — Hurufi green. Primary actions, active state, progress, correct answers, connection lines.
- `--ui-target` — red. Reserved for the **target letter inside a real word**.
- `--ui-ink` — primary text.
- `--ui-muted` — secondary text.
- `--ui-surface`, `--ui-bg`, `--ui-line` — neutral hierarchy.

Do not use decorative colors for ordinary interface elements.

## 4. Geometry

- Small radius: 12px
- Medium radius: 18px
- Large radius: 26px
- Pills: 999px
- Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32px

## 5. Components

Prefer existing families before creating a new visual pattern:

- `.btn` — actions
- `.icon-btn` — header/icon actions
- `.card`, `.question-card` — content surfaces
- `.path-row`, `.stage-row` — list/navigation rows
- `.answer` — quiz answer
- `.font-panel` — sheet/popup surface
- `.bottom-nav` — primary navigation

Buttons use subtle depth and a short press response. Avoid flat web-style buttons unless the component is intentionally low-emphasis.

## 6. Motion

Use:
- `--ui-fast: 140ms`
- `--ui-normal: 220ms`
- `--ui-ease: cubic-bezier(.2,.8,.2,1)`

Do not add continuous decorative animation. Respect `prefers-reduced-motion`.

## 7. Arabic learning rules

These are product rules, not decorative preferences:

1. **Position and joining are separate concepts.**
2. The train teaches **position only**.
3. The target letter inside a real word is red.
4. Connection state remains green/neutral.
5. Font changes must affect educational glyphs without changing the whole application UI.
6. A learning screen must favor glyph clarity over compactness.

## 8. CSS architecture

Load order:

1. `styles.css` — legacy/features and specialized learning visuals.
2. `design-system.css` — semantic tokens and final shared component rules.

When a legacy rule conflicts with the system, migrate the feature toward semantic tokens instead of adding another arbitrary override.

## 9. Current version

Introduced with Hurufi **v1.8.0**.

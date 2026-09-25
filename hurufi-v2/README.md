# Hurufi 2 — Golden Lesson

A clean-room prototype for the new Hurufi learning experience.

## Scope

Only one letter is implemented: **م**.

The lesson is intentionally narrow:

1. Recognize م
2. Identify م among other letters
3. See م inside real words
4. Learn position with one Arabic-direction train
5. See joining states through real words
6. Complete a five-question challenge

## Verified examples

| Word | Target index | Position | Connection |
|---|---:|---|---|
| موز | 0 | start | joins next |
| قمر | 1 | middle | joins both |
| علم | 2 | end | joins previous |
| نجوم | 3 | end | isolated |

The application validates these properties at runtime before showing the lesson. If content metadata is inconsistent with the actual word, the lesson refuses to load rather than teaching the wrong answer.

## Product rules

- One learning goal per screen.
- Red is reserved for the target letter **inside a real word**.
- The train teaches position only.
- Position and joining are separate concepts.
- Child UI contains no font/settings/admin clutter.
- UI text uses a restrained 13 / 17 / 24 hierarchy; educational glyphs may be larger.

Version: **2.0.0-alpha.1**

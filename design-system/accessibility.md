# Accessibility Guidelines - COSYlanguages Design System

## Contrast Ratios
- **Text & Images of Text:** Minimum 4.5:1 contrast ratio against background (WCAG AA).
- **Large Text (18pt / 24px or bold 14pt / 18.5px):** Minimum 3:1 contrast ratio.
- **UI Components & Graphical Objects:** Minimum 3:1 contrast ratio for borders and state indicators.

## Keyboard Navigation
- All interactive controls (buttons, links, inputs) must receive visible focus states (`outline: 3px solid var(--cosy-color-primary)`).
- Modal dialogs trap focus while open and restore focus upon dismissal.

## Screen Readers & ARIA
- Use semantic HTML tags (`<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<button>`).
- Use `aria-expanded` for toggles, `aria-live="polite"` for asynchronous status alerts.

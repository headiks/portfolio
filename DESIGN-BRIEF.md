# Portfolio frontend — brief for Claude Design

Static one-page portfolio of an AI/ML engineer (Alexander Egorov), tailored to an "AI engineer" vacancy.
No build step, no framework: `index.html` + `styles.css` + `app.js`. Open `index.html` directly or serve the folder.

Current design: "A Modernist" from the design handoff — Archivo (Google Fonts), 2 px hard lines, no rounded corners, red accent; light = variant 1a, dark = variant 1j.

## Fixed requirements (keep in any redesign)
1. **Language switch RU / EN in the top-right corner**, visible at the very top at all times. **Theme switch (sun / moon) in the top-left corner.** Light theme is always the default on a first visit (the system dark setting is ignored); dark is applied via `data-theme="dark"` on `<html>` and remembered in `localStorage`. Dark tokens live in `:root[data-theme="dark"]`.
2. **Contacts always visible while scrolling**: sticky top bar on desktop (Telegram, Email, phone); fixed bottom bar on phones (Telegram, Email, Call). Closing contact block at the end.
3. **Minimalist, fast to scan**: short blocks, no walls of text, one accent colour.
4. Works at 360 px width, no horizontal page scroll. Accessible: semantic landmarks, visible focus, contrast (`--ac-t` is the accent for small text).

## Page order
Hero (role, contacts, summary, 4 key numbers) → Fit for the vacancy (task → proof) → Experience → Beyond work (Yandex ML Challenge, 2nd place) → Skills → Education → Contact footer.

## Experience: interactive horizontal timeline
- Oldest stage on the left, newest on the right. Each stage is a `button.tl-item` card (dates, role, company, one-line summary, key result, Expand/Collapse) hanging off a horizontal axis with a dot.
- Click a card (or the ← → buttons, or arrow keys while a card is focused) to open its full description in `.tl-panel` below the track; click again or "Collapse" to close. The newest stage is open by default.
- The track is a horizontal scroller with scroll-snap, so on phones it swipes left/right; on wide screens all four cards fit.
- Axis state is driven by `data-s="past|now|next"` set in `app.js`; the current job has `data-current` (pulsing dot).

- Each expanded stage shows the complete résumé text for that job (no truncation, no nested "more" toggles).

## Certificate
The "Beyond work" block has a "View certificate" button (`[data-cert-open]`) that opens a native `<dialog id="cert">` with `assets/yandex-ml-challenge-certificate.jpg`; closes via ×, Esc or a click on the backdrop. The image is part of the archive.

## Email
Every `mailto:` link (header, hero button, mobile bar, footer) opens `#mailpop` instead of the mail client: the address, a Copy button (turns into "Copied ✓"), an "Open in mail app" link and a close button. Esc or a click outside closes it. Keep this behaviour in any redesign.

## Motion (all disabled with `prefers-reduced-motion`; page is fully readable without JS)
- Elements with `.rv` or inside `[data-stagger]` fade/slide in once when scrolled into view (IntersectionObserver in `app.js`); `.cnt[data-to]` numbers count up; the hero title reveals line by line; the header's bottom edge is a scroll progress bar; the timeline axis draws left to right.
- The hidden "before reveal" state exists only under `html.js`, which `app.js` sets only when motion is allowed.

## Markup conventions
- Every translatable text is a pair: `<span lang="ru">…</span><span lang="en">…</span>`. CSS hides the inactive one (`html[lang="ru"] [lang="en"]`). Keep both when restyling or moving text.
- `app.js` switches `<html lang>`, the `<title>`, the meta description and `aria-pressed` on `[data-lang-btn]`; the choice is stored in `localStorage` (`?lang=en` also works).
- All colours, fonts and spacing are tokens at the top of `styles.css` (`:root`, dark overrides in the media query). Change those first.
- Contact links: Telegram `https://t.me/head3ker`, `mailto:head3ker@yandex.ru`, `tel:+79206935567`; plus GitHub, LinkedIn, hh.ru in the hero and footer.

## Content rules
Facts and numbers come from the résumé; do not invent or round them. Not claimed on purpose: MCP, LangGraph, team training.

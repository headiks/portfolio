# Portfolio — Alexander Egorov

Bilingual (RU/EN) static portfolio. No build: `index.html`, `styles.css`, `app.js`.

Live: https://headiks.github.io/portfolio/

## Run locally

```bash
python -m http.server 8080
```

Open http://localhost:8080 (`?lang=en` for English).

## Deploy to GitHub Pages

```bash
gh auth login
gh repo create portfolio --public --source . --push
gh api -X POST repos/headiks/portfolio/pages -f "source[branch]=main" -f "source[path]=/"
```

First build takes about a minute. Edit text in `index.html` (each text is a `lang="ru"` / `lang="en"` pair), push to `main` to update.

## Redesign

`export/portfolio-claude-design.zip` holds the frontend plus `DESIGN-BRIEF.md` for Claude Design.

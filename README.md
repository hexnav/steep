# Steep ☕ — a focus timer shaped like a glass of tea

Pick a tea, focus until it's ready, and keep a tally of your cups.

Steep is a Pomodoro-style focus timer where the timer is a glass of tea: as time passes, the water slowly darkens from clear to a deep brew. Finish a session and you earn a cup.

**[Live demo](https://hexnav.github.io/steep/)** · built with plain HTML, CSS and vanilla JavaScript — no frameworks, no build step.

![Steep screenshot](screenshot.png)

## Features

- **Three brews** — Green (25 min focus), Black (50 min deep work), Herbal (5 min break)
- **A glass that brews in real time** — the water colour is blended with CSS `color-mix()`, driven by a `--p` custom property that JavaScript updates
- **Cups counter** — every finished focus session adds a cup; resets each day
- **Task list** — add, complete and delete tasks
- **Light / dark theme** — remembers your choice, falls back to your system preference
- **Saved in your browser** — tasks, cups and theme persist with `localStorage`
- **Finish chime** — generated with the Web Audio API (no audio files)
- **Accurate timing** — the timer stores an end timestamp instead of counting ticks, so it stays correct even if the tab is throttled
- **Accessible** — semantic HTML, ARIA roles for the brew picker, visible focus rings, a live status region, and `prefers-reduced-motion` support
- **Responsive** — two columns on desktop, one on mobile

## Tech

| | |
|---|---|
| HTML5 | semantic structure, inline SVG |
| CSS3 | custom properties, Grid, Flexbox, `clamp()`, `color-mix()`, keyframe animations, `@media` queries |
| JavaScript (ES6+) | DOM manipulation, event delegation, `localStorage`, `setInterval`, Web Audio API |

## What I practised

- Designing a UI around one visual idea (the tea glass) instead of a generic timer
- Theming with CSS variables and a `data-theme` attribute
- Keeping state in one object and re-rendering the UI from it
- Building accessible interactive components (radio group, form errors, live regions)
- Persisting data safely with `try/catch` around `localStorage`

## Run it locally

```bash
git clone https://github.com/hexnav/steep.git
cd steep
```

Then open `index.html` in your browser. That's it.

## Project structure

```
steep/
├── index.html   # page structure
├── style.css    # themes, layout, animations
├── script.js    # timer, brews, cups, tasks, theme
└── README.md
```

## Ideas for next steps

- Long-break cycle after every 4 cups
- Edit task text
- Weekly stats view
- Custom brew durations

## License

MIT

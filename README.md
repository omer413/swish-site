# Swish site

Static one-page site. No build step.

## Open it
- Quickest: double-click `index.html`.
- For smooth scrolling and all animations behaving exactly as intended, serve the folder:
  `cd swish-site && python3 -m http.server 8000` then open http://localhost:8000

## What's inside
- `index.html` — all sections (hero, intro, logos, work grid, expertise list, testimonial, story, marquee, journal slider, footer)
- `assets/css/main.css` — layout, responsive breakpoints (1100 / 960 / 720px), dark mode
- `assets/js/main.js` — GSAP + ScrollTrigger animations, Lenis smooth scroll, cursor, magnetic buttons, sliders
- `assets/vendor/` — GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13 (bundled so it works offline)
- `assets/fonts/` — Inter Tight (SIL Open Font License)
- `assets/img/` — generated placeholder artwork (SVG); swap in real project imagery

All copy, client names and contact details are placeholders.

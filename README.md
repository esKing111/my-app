# CWA – HTML5 Generator (Next.js, App Router, TypeScript)

A Next.js app that builds copy‑paste HTML files (HTML + JS with only inline CSS) for use in MOODLE LMS. Includes pages, accessibility, dark/light themes, responsive header with animated hamburger menu, and a Tabs builder that persists to localStorage.

## Features
- App Router (TypeScript) scaffolded with create-next-app
- Pages: Home, About, Tabs, Escape Room, Coding Races, Court Room
- Header
  - Student number on the left
  - Navigation tabs
  - Dark/Light toggle (system aware, persisted)
  - Animated Hamburger menu (CSS transform to “X”, dropdown with Escape/Click‑outside close)
- Footer: copyright, student name, student number, date
- Accessibility: semantic landmarks, ARIA labels, keyboard support (Escape to close menu; Left/Right on generated tabs)
- Persistence
  - Theme preference in localStorage
  - Last selected top nav tab in a cookie
  - Tabs builder state in localStorage
- Output generators
  - Produce standalone HTML files that run when pasted into Hello.html
  - Only inline styles; no CSS classes
  - Copy to clipboard and live iframe preview

## Pages
- Home (/): General HTML+JS inline-code generator with live preview and “Copy Code”.
- About (/about): Name, student number, and how‑to video.
- Tabs (/tabs): Build up to 15 tabs (+/−), edit titles and contents, auto‑save to localStorage, generate standalone HTML (inline styles only) with keyboard navigation.
- Escape Room, Coding Races, Court Room: placeholders ready for content.

## Getting Started (Windows)
- Prerequisites: Node.js 18+ (or 20+), npm 9+
- Install
  ```powershell
  npm install
  ```
- Run dev server
  ```powershell
  npm run dev
  ```
  Open http://localhost:3000
- Production build
  ```powershell
  npm run build
  npm run start
  ```
- Lint
  ```powershell
  npm run lint
  ```

## How to Generate a Paste‑Ready HTML File
- Home page:
  - Edit the template in the editor, click “Copy Code”.
  - Paste into Hello.html and open in any browser.
- Tabs page:
  - Add/edit up to 15 tabs. Click “Copy Output”.
  - Paste into Hello.html and open. The file includes:
    - Inline CSS via style attributes
    - Accessible roles (tablist, tab, tabpanel)
    - Inline JS for click and arrow‑key navigation
  - No CSS classes are used in the output.

## Accessibility
- Uses nav/main/footer/section landmarks
- ARIA labels and roles for menu and tab UI
- Keyboard support:
  - Escape closes the hamburger dropdown
  - Arrow Left/Right cycles tabs in generated output
- Contrast and theming via CSS variables; prefers-reduced-motion respected where applicable

## Theming
- Dark/Light theme via data-theme on <html>
- Persistent across reloads
- All components (header, footer, editors, previews) derive colors from CSS variables

## Persistence
- Cookie stores last selected top navigation tab
- localStorage keys:
  - Theme preference
  - tabs_builder_state (Tabs page model)

## Project Structure
- app/
  - layout.tsx (root layout with html/body)
  - ThemeLayout.tsx (client layout: header, menu, theme)
  - page.tsx (Home)
  - about/page.tsx
  - tabs/page.tsx
  - escape-room/page.tsx
  - coding-races/page.tsx
  - court-room/page.tsx
- public/ (icons)
- app/globals.css (theme variables and base styles)

## Known Limitations
- Generated code intentionally avoids CSS classes; all styling done inline.
- LMS security policies may block external resources; keep scripts/styles inline.

## Troubleshooting
- Theme not switching correctly: hard refresh or clear localStorage for the site.
- Preview looks different from LMS: ensure you pasted the entire HTML document (doctype, head, body).
- Build errors about root layout: root layout must render <html> and <body>; hooks must live in client components (ThemeLayout.tsx).

## License
- Educational project.

## Credits
- Built with Next.js (https://nextjs.org/)
- Author: [Elon Shrestha], Student No: [21740764]
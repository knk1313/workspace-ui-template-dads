# Workspace UI Template (DADS)

[日本語](README.md) | English

An admin-dashboard frontend template that follows the [Digital Agency Design System (DADS)](https://design.digital.go.jp/dads/) of Japan. Built with Vite, React, TypeScript and Tailwind CSS v4.

All data and text on screen are fictional samples. No API or backend is included. This template is an independent implementation based on the public DADS specification and is not an official Digital Agency product.

![Dashboard](docs/screenshots/dashboard.png)

## What is included

- **Design tokens** (`src/tokens/`): values from `@digital-go-jp/design-tokens` 2.0.1 mapped into Tailwind's `@theme`. Tailwind's default palette and font sizes are disabled, so only tokens can be used.
- **About 55 UI components** (`src/components/ui/`) and **4 chart types** (`src/components/charts/`, wrapping Recharts). Each has unit tests and an axe check.
- **Two application shells**: sidebar layout (collapsible, drawer on mobile) and top navigation layout.
- **Seven example pages**: dashboard, list, detail, create/edit form, settings, login, and 404/500.
- **Checks**: a script that rejects hard-coded colours and arbitrary values (`npm run lint`), token contrast tests (WCAG 2.2 AA), and Playwright E2E tests with axe at desktop and mobile widths.

## Setup

```bash
nvm use
npm install
npm run dev               # http://localhost:5173
npm run check             # typecheck + lint + unit tests
npm run test:e2e:install  # first time only
npm run test:e2e
npm run build
```

See the Japanese [README](README.md) for the component list, directory layout and customisation guide.

## License

[MIT License](LICENSE). Token values in `src/tokens/primitives.css` and `src/tokens/typography.css` come from the Digital Agency's `@digital-go-jp/design-tokens` and `@digital-go-jp/tailwind-theme-plugin` (both MIT).

# from10

**Local-first, browser-only grading for instructors** — sessions, rubrics, AI-assisted marking, and Excel export. Your data stays on the device; OpenAI is optional and called **only** when you grade (using your own API key).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Idea

from10 is a small web app for teachers who want to:

- define an exam, questions, and **criteria-based** marks  
- add participants and capture submissions (text, images, PDFs — stored locally)  
- grade **question by question** with help from an LLM, then tweak marks and feedback by hand  
- track progress and export results (**simple** or **detailed** spreadsheets)

There is **no backend**, **no login**, and **no central database** in this repo: persistence is **localStorage + IndexedDB** in the browser. That keeps the stack simple and the project easy to fork or wrap with your own API later.

---

## Tech stack

| Area | Choices |
|------|---------|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| UI | [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 4 |
| Components | [Base UI](https://base-ui.com/), [shadcn/ui](https://ui.shadcn.com/) patterns |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Validation | [Zod](https://zod.dev/) |
| Storage | `localStorage`, [idb](https://github.com/jakearchibald/idb) (IndexedDB) |
| PDF in browser | [pdf.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) |
| Spreadsheets | [SheetJS Community Edition](https://sheetjs.com/) (`xlsx`) |
| Testing | [Vitest](https://vitest.dev/) |
| Linting | ESLint + `eslint-config-next` |

AI grading talks to **OpenAI’s Chat Completions API** from the client when you’ve saved a key (see onboarding / settings).

Supported **English** and **Arabic** UI with **LTR / RTL**, plus **light / dark** themes.

---

## Download

Use Git:

```bash
git clone https://github.com/rabukhader/from10.git
cd from10
```

Or download a ZIP from your repository’s **Code → Download ZIP** on GitHub.

Requires **[Node.js](https://nodejs.org/)** (use current **LTS**, e.g. **20.x or newer**) and **npm** (ships with Node).

---

## Getting started

Install dependencies:

```bash
npm install
```

Run the app in development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), complete onboarding (API key + preferences), then create a session.

Other useful commands:

```bash
npm run build   # production build
npm run start   # run production server (after build)
npm run lint    # ESLint
npm run test    # Vitest
```

### Working on the project

- **`src/config/`** — app name, feature flags, i18n defaults, theme-related knobs  
- **`src/domain/`** — types / domain shapes  
- **`src/lib/`** — AI client, storage, export, grading helpers, PDF utilities  
- **`components/`** — UI by area (sessions, grading, submissions, settings, …)  
- **`app/`** — Next.js routes  

Before you open a PR, run **`npm run lint`** and **`npm run test`** when your change touches logic.

---

## Contributing

We welcome **issues**, **discussion**, **pull requests**, and **small focused improvements**. If you’re unsure whether an idea fits the project, open an issue first and we can align on scope.

Please:

- keep PRs **readable** (one theme per PR when possible)  
- describe **what** changed and **why**  
- add or update tests when behavior changes  

Thank you for helping make from10 better.

---

## License & copyright

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file.

```text
Copyright (c) 2026 Rasheed Abu Khader
```

---

## Fine print

<p><strong style="color:#0969da; font-weight:800;">Grading never really ends — it only pauses. Here’s hoping from10 makes your next pause a bit shorter.</strong></p>

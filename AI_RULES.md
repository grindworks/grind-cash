# GrindCash AI Rules

> Product type: PWA. Shared rules: [`../AGENTS.md`](../AGENTS.md) §1, §2, §4, §6 and the PWA rules in §7. This file adds GrindCash rules and wins where the two differ.

## 1. Stack

- Vanilla JavaScript, no frontend framework.
- Wasm SQLite (`sql.js`): the database lives in memory. Manage memory explicitly (`stmt.free()`, `db.close()` before re-instantiating) to prevent leaks.
- Tailwind CSS v4.3.1 from npm devDependencies (`@tailwindcss/cli`, `tailwindcss`, pinned); `./build.sh` or `npm run build` regenerates `styles.css`. npm is a development tool only; nothing from `node_modules` ships.

## 2. Data and files

- Files: SQLite databases opened as `.cash` or `.grind` (`manifest.json` file handlers).
- SQL: ALWAYS use parameterized queries (`db.prepare("... WHERE id = ?")`). Never interpolate variables into SQL strings.
- **Zero-trust UI:** The SQLite database is the source of truth. Do not rely only on HTML attributes (`disabled`, `contenteditable="false"`) to lock records. Check the record's state (e.g., `is_exported`) in SQL before every `UPDATE` or `DELETE`.
- `sql.js` does not auto-persist. Every INSERT, UPDATE or DELETE must call `setDirty(true)` so the user is warned before closing the tab. Drafts are saved on `draftTimer` while the app is active (see shared §7 on unload).
- **Precision:** Never let display formatters (e.g., `Intl.NumberFormat`) hide floating-point error. For currencies without decimals (such as JPY), round with `Math.round()` _before_ saving to the database.
- **DOM guardrails:** Cap options, tags and search results in the SQL query (e.g., `LIMIT 100`). Rendering thousands of DOM nodes at once stalls the UI on large datasets.

## 3. UI

- Look, top bar, shortcuts, toasts, dialogs, wording and languages follow shared §7 UI. Do not restate them here; add only what differs.
- Product-specific top-bar controls: UI language, dictionary and base currency selectors, placed before the file password field.
- UI languages: English, Japanese, German, French, Spanish and Italian, in `lang/`, for overseas users. Do not add or drop a language without asking.

## 4. Code

- Stricter than shared §5: write comments as concise Git-style English in the imperative mood ("Fix data validation", not "This fixes data validation").

## 5. Known gaps against shared §7

- `showToast` takes an options object instead of `type`; toast position and animation follow the shared rule already.
- Tailwind is pinned at 4.3.1 through npm; `build.sh` runs `npx tailwindcss` instead of the pinned binary.
- `i18n.js` differs from grind-people's copy (default language `en` vs `ja`); make the two identical.
- Japanese outside `lang/`: the default Japanese account dictionaries and CSV header/date patterns in `main.js` (data, not UI strings), and the `lang="ja"` SEO text in the `<noscript>` block of `index.html`.

# Front-End Engineering Assessment

**Position applied for: Senior Front-End Engineer**

- `PART-A.md` — answers to the 13 written questions
- `app/` — Part B: order-list screen (Vite + React + TypeScript)
- `app/NOTES.md` — how each constraint was met, plus the decisions made
- `app/evidence/` — render-count screenshots (before/after) and print PDF

## Run

```bash
cd app
npm install
npm run dev
```

Open http://localhost:5173

## The screen

5,000 generated orders with:

- search by order number (substring match),
- multi-status filter (status checkboxes combine),
- click a row to open the side panel with the order detail,
- keyboard: ↑/↓ move the selection, Enter opens the panel, Esc closes it and returns focus to the row.

Filter state lives in the URL — reloading and pressing the browser Back button both restore it. Ctrl-P prints every filtered row, not just the visible ones.

## Evidence

Open the app with `?debug=1` to see per-row render counters. Screenshots of the same keystrokes before and after the memoisation change, and the print PDF, are in `app/evidence/`.

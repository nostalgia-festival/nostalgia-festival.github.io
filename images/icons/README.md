# XP system icons

Authentic Windows XP `.ico` files used across the site (replacing the modern
Twemoji emoji). Each is consumed by `src/components/Icon.tsx`, which bundles
every `*.ico` in this folder at build time and falls back to the matching emoji
when a slug is missing.

The files here are **slug-named copies**. The untouched originals — by their real
XP names — live in [`source/`](source/) (a subfolder, so the non-recursive glob
in `Icon.tsx` ignores them). To re-skin an icon, drop a different `.ico` over the
slug file below (or copy another one out of `source/`).

## Slug → chosen original

| slug (`*.ico`) | original (`source/…`) | replaces | used in |
|----------------|-----------------------|----------|---------|
| `document`   | `Notepad.ico`            | 📄 | desktop `פרטים.txt`, details title, info-folder default + text popup |
| `folder`     | `folder.ico`             | 📁 | desktop `מידע`, info-folder title |
| `tickets`    | `Star.ico`               | 🎟️ | desktop `כרטיסים.exe`, ticket wizard title, hero CTA |
| `mail`       | `Fax.ico`                | ✉️ | desktop `צרו קשר`, contact title + email link |
| `picture`    | `Photos.ico`             | 🖼️ | info-folder image-item popup title |
| `calendar`   | `TimeDocument.ico`       | 📅 | details row — תאריך |
| `door`       | `Welcome.ico`            | 🚪 | details row — פתיחת דלתות |
| `microphone` | `MusicalNote&Speaker.ico`| 🎤 | details row — אירועי במה ראשית |
| `location`   | `Location.ico`           | 📍 | details row — מיקום |
| `cd`         | `CD.ico`                 | 💿 | info-folder — dj |
| `party`      | `GameConsole.ico`        | 🎉 | info-folder — stands; countdown "doors open" |
| `mystery`    | `QuestionMark.ico`       | ❓ | info-folder — mystery 1–4 |
| `payment`    | `key.ico`                | 💳 | ticket wizard pay button ("מאובטח" → key) |

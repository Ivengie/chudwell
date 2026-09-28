# Chudwell

> of the chuds, by the chuds, for the *chuds.*
> A quiet corner of the internet: a home for every kind of story, made for wandering, lingering, and finding your people.

Chudwell is a front-end-only web fiction library and writing platform built with **React, React Router (`HashRouter`) and Vite**. Readers can browse, search, read chapter by chapter with optional background music, like and comment, and organise reading lists. Writers get a built-in studio for drafting and publishing their own books.

There is **no backend**. Data is seeded from `src/data/seed.js` and persisted in the browser's `localStorage`.

---

## Features

**Discovery**
- Featured Works grid on the home page
- Global search by title or author (header search bar)
- Advanced Search: title keywords, author name, min/max word count
- Browse: keyword, status (All / Ongoing / Completed / Dropped), sort (Likes / Latest Update / Word Count), ascending or descending, and tag filters (Fiction, Adventure, Drama, Science Fiction, Romance, Mystery, Literary)

**Reading**
- Book detail modal with cover, tags, stats, and synopsis
- Chapter reader with chapter dropdown, previous/next controls, and floating navigation
- Optional per-chapter background music, with a play/pause toggle
- Chapter likes and comments

**Shelves** *(reader and writer accounts)*
- Reading History with progress bars
- Reading Lists: create, rename, add and remove books

**Writer Studio** *(writer accounts)*
- Create new books and manage drafts and published books ("My Books")
- Edit title, synopsis, tags, status, and cover image
- Add, edit, and delete chapters, each with an optional background audio URL
- Publish a book (a cover image is required)

**General**
- Light / dark theme toggle (remembered between visits)
- Slide-out drawer navigation, notifications, and profile menu
- Editable display name and profile picture
- Responsive layout

---

## Roles and demo accounts

Chudwell has three access levels, enforced client-side by `canAccess()` in `app.js`:

| Role | Can do |
|---|---|
| **Guest** | Browse, search, read public books, like chapters |
| **Reader** | Everything a guest can, plus comments, notifications, Shelves (history and reading lists), profile customisation |
| **Writer** | Everything a reader can, plus create, edit, and publish books |

Demo logins (open the profile icon in the header):

| Username | Email | Password | Role |
|---|---|---|---|
| `reader` | reader@chudwell.com | `reader123` | Reader |
| `writer` | writer@chudwell.com | `writer123` | Writer |
| `author` | author@chudwell.com | `author123` | Writer |

You can also choose **Continue as Guest**.

> ⚠️ These credentials are hard-coded in client-side JavaScript, so they are visible to anyone who views the source. This is a demo/prototype login, **not real authentication**. Don't reuse real passwords here.

---

## Tech stack

- **React 19** and **React Router 7** (`HashRouter`)
- **Vite** (dev server and build), **gh-pages** for deployment
- Plain **CSS** (`src/styles.css`, light/dark themes) and **Google Fonts**
- **`localStorage`** for persistence, wrapped in React context

## Project structure

```
chudwell/
├── index.html
├── vite.config.js          # base path for GitHub Pages
├── package.json            # scripts: dev, build, preview, deploy
├── public/images/          # book covers
└── src/
    ├── main.jsx            # entry point
    ├── App.jsx             # HashRouter + routes
    ├── config.js           # storage keys, demo accounts, permissions, asset() helper
    ├── utils.js
    ├── styles.css
    ├── data/seed.js        # seed books and chapters
    ├── context/
    │   ├── AuthContext.jsx     # login, roles, profile
    │   ├── LibraryContext.jsx  # books, chapters, likes, comments, lists, drafts
    │   └── ModalContext.jsx    # one popup at a time
    ├── components/
    │   ├── Layout.jsx          # header, drawer, <Outlet />
    │   ├── BookCard.jsx
    │   ├── RequireRole.jsx     # route guard
    │   └── modals/             # book detail, profile, reading lists, my books...
    └── pages/
        ├── HomePage.jsx
        ├── BrowsePage.jsx
        ├── AdvancedSearchPage.jsx
        ├── SearchResultsPage.jsx
        ├── ShelvesPage.jsx
        ├── ReaderPage.jsx
        ├── StudioPage.jsx
        └── NotFoundPage.jsx
```

## Routes

| URL | Page | Access |
|---|---|---|
| `#/` | Home | everyone |
| `#/browse` | Browse filters | everyone |
| `#/advanced-search` | Advanced search | everyone |
| `#/search?mode=...` | Search results (the query lives in the URL, so refresh keeps them) | everyone |
| `#/shelves` | History and reading lists | reader, writer |
| `#/read/:bookId/:chapter` | Reader (chapter is 1-based) | everyone |
| `#/studio/:type/:bookId` | Writer studio (`draft` or `published`) | writer |
| anything else | "There's nothing here" page | everyone |

Routes a role can't access redirect to `#/`. Popups (book detail, profile, etc.) are not routes; they close on navigation.

---

## Running locally

```bash
npm install
npm run dev
```

Open the URL Vite prints; because `base` is set, it looks like `http://localhost:5173/chudwell/`.

---

## Deploying to GitHub Pages

1. **Set `base`** in `vite.config.js` to your repo name, with a slash on both sides:
   ```js
   base: '/chudwell/',   // repo "chudwell" -> https://<user>.github.io/chudwell/
   ```
   (If your repo is named `<user>.github.io`, use `base: '/'`.)
2. **Push the source to GitHub** (create an empty repo first):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/chudwell.git
   git push -u origin main
   ```
3. **Deploy the built site:**
   ```bash
   npm run deploy
   ```
   `predeploy` builds into `dist/`, then `gh-pages` pushes it to a `gh-pages` branch.
4. On GitHub, go to **Settings → Pages** and set the source to the **`gh-pages`** branch (root).
5. After a minute or two, visit `https://<your-username>.github.io/chudwell/`.

To update the live site later, run both `git push` (source code) and `npm run deploy` (live site).

### Why refresh works

GitHub Pages can only serve files that exist, so a URL like `/chudwell/browse` would 404 on refresh. `HashRouter` puts the route after the `#` (`/chudwell/#/browse`). The browser never sends that part to the server, so Pages always serves `index.html` and React Router reads the hash to show the right page.

Two settings must both be right:
- **`HashRouter`** (in `App.jsx`) makes refresh work.
- **`base` in `vite.config.js`** makes the JS, CSS, and images load. Images are referenced through the `asset()` helper in `src/config.js`, which prefixes Vite's base path automatically.

### Gotchas

- **`base` typo = blank page.** Check the browser console for 404s on `/assets/...` files.
- **Filenames are case-sensitive on GitHub Pages.** Cover paths in `src/data/seed.js` must match the files in `public/images/` exactly.
- **`localStorage` is per-origin.** Data saved locally will not appear on the deployed site.
- **Music playback** uses external audio URLs (SoundHelix demo tracks), so it needs an internet connection.

---

## Data and persistence

App state is saved under these `localStorage` keys:

| Key | Contents |
|---|---|
| `Chudwell-theme` | `light` or `dark` |
| `inkwell_books` | Book metadata overrides |
| `inkwell_reader_data` | Chapters, likes, and comments |
| `inkwell_lists` | Reading lists |
| `inkwell_drafts` | Writer drafts |
| `inkwell_user_published` | Books published by users |
| `inkwell_state` | Login state, role, display name, avatar |

*(The `inkwell_` prefix is a leftover from an earlier project name.)*

To reset the site to its default state, clear the site's data in your browser's dev tools (**Application → Local Storage → Clear**).

The seed catalogue (five books and their chapters) lives in `src/data/seed.js`. Edit it to change the featured content. Word counts and like totals are calculated from the chapters, not stored.

---

## Known limitations

- No real backend or authentication; accounts are hard-coded demo accounts (see `src/config.js`)
- Data is local to each browser and is not shared between users or devices
- Uploaded covers and avatars are stored in `localStorage`, which has a size limit (roughly 5 MB), so very large images may fail to save
- Fixes and improvements welcome

---

## Credits

Book covers and excerpts for *Pride and Prejudice* and *The Song of Achilles* are placeholder content for demonstration purposes. All rights belong to their respective authors and publishers; replace them with original or properly licensed material before any public launch.

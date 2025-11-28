
# 🌌 Nightmind Screensaver · Studio

An ambient, fullscreen web **screensaver** for your desktop: animated space-inspired themes, a minimal clock + quote overlay, and a collapsible control dock. Built to live quietly in the background while you study, code, or vibe.

---

## ✨ Features

* **Animated themes (canvas-based):**

  * `Space Drift` – starfield drift
  * `Nebula Drift` – soft nebula glows
  * `Deep Void` – slow, breathing gradients
  * `Cosmic Dust` – floating dust motes
  * `Aurora` – aurora-like arcs
  * `Night Ocean` – layered wave shapes
  * `Fireflies` – drifting firefly orbs
  * `Sakura` – falling petal-like particles

* **Mood system** (affects speed/intensity):

  * `Calm` · `Flow` · `Alive`

* **Minimal overlays:**

  * Center **digital clock** (24h, with date)
  * Bottom **quote strip** with rotating Nightmind quotes

* **Control dock (Studio mode):**

  * Theme picker (pills)
  * Mood selector
  * Toggles: `Clock`, `Quotes`, `Extra dark`
  * Sliders: `Motion` (Low/Med/High), `Density` (Low/Med/High)
  * **Collapse button** → hides the big dock and switches to a **mini dock** in the corner

* **Mini dock (Screensaver mode):**

  * Tiny label: `Theme · Mood`
  * `Menu` button to re-open the full dock

* **Idle UI hide:**

  * No input for 30s → all UI fades out, only animation + overlays remain
  * Any mouse/keyboard activity → UI fades back in

* **Keyboard shortcuts:**

  * `F` – toggle fullscreen
  * `T` – next theme
  * `C` – toggle clock
  * `Q` – toggle quotes
  * `M` – toggle menu (full dock ↔ mini dock)

* **State is remembered** via `localStorage`:

  * Theme, mood, motion, density, clock/quotes visibility, extra dark, dock collapsed state

* **No build step** – just static HTML, CSS, JS + Anime.js via CDN.

---

## 🗂 Project Structure

```text
.
├── index.html    # Main HTML shell (canvas, overlays, dock, mini dock)
├── styles.css    # Visual design + layout for overlays and dock
└── main.js       # Screensaver engine, state, UI wiring, animations
```

* `Anime.js` is loaded from a CDN in `index.html`.
* The screensaver visuals are rendered to `<canvas id="bgCanvas">`.
* UI elements are standard HTML with CSS + some Anime.js entrance animation.

---

## 🚀 Getting Started (Local)

### 1. Download / clone

Put the three files in a folder, e.g.:

```text
nightmind/
  index.html
  styles.css
  main.js
```

### 2. Quick run

**Option A – double-click**

* Just open `index.html` in your browser.
* Most modern browsers will run it fine as a file.

**Option B – tiny local server (recommended)**

If you have Python:

```bash
cd path/to/nightmind
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Hit `F` for fullscreen and let it idle to see the UI fade out.

---

## 🎹 Controls

### Mouse / UI

* Use the **dock at the bottom** to:

  * Pick a **theme**
  * Change **mood**
  * Toggle `Clock`, `Quotes`, `Extra dark`
  * Adjust **Motion** and **Density**
  * Click the ⌄ **collapse button** to switch to **minimal dock**

* Use the **mini dock** (small bar) to:

  * See current `Theme · Mood`
  * Re-open full dock via **Menu** button

### Keyboard

* `F` → fullscreen toggle
* `T` → cycle themes
* `C` → show/hide clock
* `Q` → show/hide quotes
* `M` → toggle between full dock and minimal dock

---

## 🌐 Deployment

Because it’s a static site, you can host it anywhere that serves static files.

### GitHub Pages

1. Create a new repo, e.g. `nightmind-screensaver`.

2. Add the three files and push:

   ```bash
   git init
   git add index.html styles.css main.js
   git commit -m "Initial Nightmind Screensaver"
   git branch -M main
   git remote add origin https://github.com/<your-username>/nightmind-screensaver.git
   git push -u origin main
   ```

3. In GitHub:

   * Go to **Settings → Pages**
   * Set **Source** to `main` branch, root (`/`)
   * Save and open the provided URL.

### Netlify (drag & drop, no Git required)

1. Zip the folder or keep it as is.
2. Go to [Netlify](https://www.netlify.com/), create an account.
3. Choose **“Deploy manually”**, drag your folder (with `index.html`) into the drop area.
4. Netlify will give you a live URL.

---

## 🛠 Customisation

Quick things you can tweak:

* **Quotes**
  In `main.js`, edit the `quotes` array to add your own lines.

* **Idle timeout**
  Change `IDLE_MS` in `main.js` (default: `30000` ms).

* **Default theme/mood**
  Change the initial `state` object in `main.js`.

* **Colors / look**
  Adjust CSS variables in `styles.css` (`:root` section) for theme colors, radii, shadows, etc.

---


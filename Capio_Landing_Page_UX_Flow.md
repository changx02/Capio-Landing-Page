# CAPIO — Landing Page UX Flow & Design Spec
## For Claude Code Implementation

**URL:** capioplan.com
**Style:** Fylla editorial — big type top-left, full-width media, asymmetric grids
**Media focus:** Videos and GIFs instead of photos
**Framework:** HTML/CSS/JS (static)

---

## DESIGN SYSTEM

### Colors

```css
:root {
  --bg-primary: #F5F0E8;
  --bg-secondary: #EDE8DC;
  --bg-dark: #1A1A1A;
  --text-primary: #1A1A1A;
  --text-secondary: #6B6560;
  --text-muted: #9C9690;
  --text-on-dark: #F5F0E8;
  --border: #D4CFC6;
  --border-light: #E8E3DA;
}
```

### Typography

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap');

--font-display: 'DM Serif Display', serif;
--font-body: 'DM Sans', sans-serif;

--text-hero: clamp(3rem, 6vw, 5rem);
--text-h2: clamp(2rem, 4vw, 3.25rem);
--text-h3: clamp(1.25rem, 2vw, 1.5rem);
--text-body: clamp(1rem, 1.5vw, 1.125rem);
--text-label: 0.75rem;
--text-small: 0.875rem;
```

### Layout

```css
--max-width: 1280px;
--section-padding: clamp(4rem, 8vw, 7rem) 0;
--content-padding: 0 clamp(1.5rem, 5vw, 4rem);
```

### Principles

- Big serif headline top-left → full-width media below (Fylla "About Us" pattern)
- Small uppercase tracked labels above sections ("THE PROBLEM", "HOW IT WORKS")
- Asymmetric content grids: big statement left, details right
- Thin 1px horizontal rules between sections
- Videos and GIFs as hero media — not static images
- Left-aligned everything. Never centered.
- Black anchors the cream. No color anywhere.

---

## PAGE FLOW

---

### NAV

```
┌────────────────────────────────────────────────────────────────────────┐
│  [◇ Capio]                                          [ Notify Me ]     │
└────────────────────────────────────────────────────────────────────────┘
```

- Sticky, 64px, bg-primary with backdrop-blur on scroll
- Logo left: brand mark + wordmark
- CTA right: "Notify Me" — 1px black border, transparent fill, 4px radius. Hover: black fill, cream text
- Bottom border appears on scroll (1px border-light)
- Post-launch CTA: "Download"

---

### SECTION 1: HERO

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-primary                                                        │
│                                                                        │
│  INTRODUCING CAPIO                                                     │
│                                                                        │
│  Stop rewriting                                                        │
│  your planner. Ever.                                                   │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                                                                │    │
│  │                                                                │    │
│  │              [FULL-WIDTH VIDEO]                                │    │
│  │         "Introducing Capio" — auto-plays muted                 │    │
│  │          Click/tap for sound. 16:9 ratio.                      │    │
│  │                                                                │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Matches Fylla "About Us" pattern exactly:** small label top → big headline below it → full-width media spanning the page.

- Label: "INTRODUCING CAPIO" — text-label, uppercase, letter-spacing 0.2em, text-muted, left-aligned
- Headline: font-display, text-hero, left-aligned. "Stop rewriting your planner. Ever." — "Ever." on its own line with a period. Big, dramatic, takes up space.
- Video: full content width (not max-width constrained), 8px radius, auto-plays muted with play button overlay for sound. Pre-launch: static iPad thumbnail with centered play button (black circle, cream triangle).
- No subtext here. No CTA here. The headline and video do all the work. CTA comes in the next section.
- Animation: label fades in (0.2s) → headline slides up (0.4s) → video fades in (0.8s)

---

### SECTION 2: VALUE PROP + CTA

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-primary                                                        │
│                                                                        │
│  Your planner should do the        Write it once. It's handled.        │
│  work for you. Capio reads                                             │
│  your handwriting, recognizes      ┌─────────────────────────────┐    │
│  dates and times, sets             │ your@email.com  [Notify Me] │    │
│  reminders, and organizes          └─────────────────────────────┘    │
│  your day automatically.                                               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- Two columns: description left (55%) / CTA right (45%)
- Left: text-body, text-secondary, max-width natural within column
- Right: "Write it once. It's handled." — text-h3, weight 700, black. Then email form below.
- Email form: input (1px black border, cream bg) + button ("Notify Me" — black fill, cream text)
- This section is compact — no extra padding. It's a continuation of the hero, not a new section.
- Thin rule below separating from next section

---

### ─────────────── DIVIDER ───────────────

---

### SECTION 3: THE PROBLEM

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-primary                                                        │
│                                                                        │
│  THE PROBLEM                                                           │
│                                                                        │
│  Planning shouldn't              ○  PAPER PLANNERS                     │
│  be this much work.                 You write a task. Then you         │
│                                     rewrite it tomorrow. Then          │
│                                     again next week. You flip          │
│                                     pages. You miss things.            │
│                                     No reminders.                      │
│                                                                        │
│                                  ○  DIGITAL PLANNERS                   │
│                                     Five taps to create one            │
│                                     meeting. No free writing.          │
│                                     No flexibility. No flow.           │
│                                     One note turns into five steps.    │
│                                                                        │
│  ┌───────────────────────────┐                                         │
│  │ This isn't a discipline   │                                         │
│  │ problem. It's a tool      │                                         │
│  │ problem.                  │                                         │
│  └───────────────────────────┘                                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Matches Fylla "Our Values" pattern:** big statement left, details with markers right.

- Label: "THE PROBLEM" — uppercase, tracked, text-muted
- Heading left (40%): font-display, text-h2. Large, takes up vertical space.
- Details right (60%): two items stacked vertically, each with circle marker (○) + uppercase bold name + description below. Exactly like Fylla's Vision/Innovation/Connection layout.
- Closing statement: text-h3, weight 700, left-aligned below. Stands alone.
- Mobile: heading on top, details below

---

### ─────────────── DIVIDER ───────────────

---

### SECTION 4: THE SOLUTION

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-dark (FULL BLACK)                                              │
│                                                                        │
│  THE SOLUTION                                                          │
│                                                                        │
│  Think once.                                                           │
│  Write once.                                                           │
│  Done.                                                                 │
│                                                                        │
│  No sorting.       No rewriting.       No second pass.                 │
│                                                                        │
│  You don't have to organize your planner anymore.                      │
│  You just use it.                                                      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- Full black. Cream text. The emotional turn.
- Label: muted cream, uppercase
- Headline: font-display, text-hero, cream, left-aligned. Each phrase its own line.
- "No sorting / No rewriting / No second pass" — horizontal row on desktop, spaced evenly. text-h3.
- Final lines: text-body, softer cream.
- Short section. Black space does the work.

---

### SECTION 5: HOW IT WORKS — Demo 1

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-primary                                                        │
│                                                                        │
│  HOW IT WORKS                                                          │
│                                                                        │
│  Write it.                                                             │
│  Watch it land.                                                        │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                                                                │    │
│  │              [FULL-WIDTH GIF]                                  │    │
│  │     Hand writes "lunch with Sarah Thursday 12pm"               │    │
│  │     Taps DAY. Task appears on Thursday at 12pm.                │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  Dates just land. Times just show up.                                  │
│  Reminders — already set.                                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Same Fylla "About Us" pattern again:** label → big headline → full-width media → supporting text below.

- Label: "HOW IT WORKS" — uppercase, tracked
- Heading: font-display, text-h2, left-aligned
- GIF: FULL content width, 8px radius. Looping. Shows single task routing.
- Text below GIF: text-h3, weight 500, left-aligned
- Pre-launch without GIF: static iPad screenshot with caption

---

### ─────────────── DIVIDER ───────────────

---

### SECTION 6: HOW IT WORKS — Demo 2

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-primary                                                        │
│                                                                        │
│  One brain dump.                                                       │
│  Your entire week — organized.                                         │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                                                                │    │
│  │              [FULL-WIDTH GIF]                                  │    │
│  │     Hand writes 5 brain dump lines in Capture.                 │    │
│  │     Taps DAY. Everything is organized.                         │    │
│  │     Swipes to next day — more tasks.                           │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  You wrote it once. Capio handled the rest.                            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- Same pattern: headline → full-width GIF → supporting text
- No label this time (it's a continuation of "HOW IT WORKS")
- Heading: font-display, text-h2
- GIF: full width, 8px radius, looping. Shows the brain dump moment.
- Closing: text-h3, weight 700

---

### ─────────────── DIVIDER ───────────────

---

### SECTION 7: FEATURES

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-primary                                                        │
│                                                                        │
│  FEATURES                                                              │
│                                                                        │
│  Everything you need.            ○  FOCUS 3                            │
│  Nothing you don't.                 Three priorities. Every morning.   │
│                                     Circle any task to promote it.    │
│                                                                        │
│                                  ○  ACTION LIST                        │
│  ┌──────────────────────┐          Everything else lives here.         │
│  │                      │                                              │
│  │  [iPad screenshot    │       ○  TIME BLOCK                          │
│  │   Daily View         │          Write a time. It lands.             │
│  │   STICKY on scroll]  │          Reminder set.                       │
│  │                      │                                              │
│  │                      │       ○  GESTURES                            │
│  │                      │          Checkmark — done. Chevron — moved.  │
│  │                      │          Circle — promoted. No menus.        │
│  └──────────────────────┘                                              │
│                                  ○  AUTO-ROLLOVER                      │
│                                     Didn't finish? Already waiting     │
│                                     tomorrow. Never rewrite again.     │
│                                                                        │
│                                  ○  SPRINT GOALS                       │
│                                     Set. Break down. Track.            │
│                                                                        │
│                                  ○  BRAIN DUMP                         │
│                                     Dump everything. Capio routes      │
│                                     it all. The mess becomes the plan. │
│                                                                        │
│  Plus search, freehand notes, and drawing — built in.                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Fylla "Our Values" pattern:** big statement + sticky visual left, detail list right.

- Label: "FEATURES" — uppercase, tracked
- Heading left: font-display, text-h2
- iPad screenshot left: positioned below the heading, STICKY on desktop (position: sticky, top: 100px). Stays visible while features scroll on the right.
- Feature list right (55%): circle marker (○) + uppercase bold name + 1-2 line description. 2rem spacing between each. Exactly like Fylla's Vision/Innovation/Connection but with 7 items.
- Bottom: "Plus search, freehand notes..." — text-small, text-muted
- Mobile: heading → screenshot → feature list (all stacked, sticky disabled)

---

### ─────────────── DIVIDER ───────────────

---

### SECTION 8: VIEWS

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-secondary                                                      │
│                                                                        │
│  YOUR PLANNER                                                          │
│                                                                        │
│  One planner. Six views.                                               │
│  Your entire year.                                                     │
│                                                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ GIF  │  │ GIF  │  │ GIF  │  │ GIF  │  │ GIF  │  │ GIF  │          │
│  │ DAY  │  │ WKS  │  │ MAR  │  │ YR   │  │ CAP  │  │ NTS  │          │
│  │      │  │      │  │      │  │      │  │      │  │      │          │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘          │
│  Daily     Weekly    Monthly   Yearly   Capture    Notes               │
│                                                                        │
│  Every view syncs. Write once, see everywhere.                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- Label: "YOUR PLANNER" — uppercase, tracked
- Heading: font-display, text-h2, left-aligned
- 6 thumbnails in horizontal row: each is a small GIF or screenshot showing that view in action. 1px border, 4px radius. Each has label below.
- On hover: thumbnail scales slightly (transform: scale(1.02)) — subtle
- Mobile: horizontal scroll with snap points
- Closing: text-body, weight 500

---

### ─────────────── DIVIDER ───────────────

---

### SECTION 9: COMPARISON

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-primary                                                        │
│                                                                        │
│  WHY CAPIO                                                             │
│                                                                        │
│  What makes Capio                [COMPARISON TABLE]                    │
│  different.                      Paper | Digital | Notes | Capio       │
│                                  ──────────────────────────────        │
│  Simple like paper.              Write freely  ✓  ✗  ✓  ✓             │
│  Powerful like software.         Understands   ✗  ✗  ✗  ✓             │
│  Nothing else does both.         Auto-routes   ✗  ✗  ✗  ✓             │
│                                  Reminders     ✗  ✗  ✗  ✓             │
│                                  Rollover      ✗  ✗  ✗  ✓             │
│                                  Brain dump    ✗  ✗  ✗  ✓             │
│                                  Gestures      ✗  ✗  ✗  ✓             │
│                                  No account    ✓  ✗  ✗  ✓             │
│                                  No tracking   ✓  ✗  ✗  ✓             │
│                                  iPad+iPhone   ✗  ✓  ✓  ✓             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Fylla asymmetric:** statement left, table right.

- Label: "WHY CAPIO" — uppercase, tracked
- Left (35%): heading font-display, text-h2 + closing statement text-h3, weight 700
- Right (65%): comparison table. No cell backgrounds. Thin 1px row borders only. Header uppercase.
- ✓: black, weight 700. ✗: text-muted, barely visible.
- Mobile: heading on top, table below with horizontal scroll + sticky first column

---

### ─────────────── DIVIDER ───────────────

---

### SECTION 10: PRICING

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-secondary                                                      │
│                                                                        │
│  PRICING                                                               │
│                                                                        │
│  Start your 7-day               ┌─────────────┐  ┌─────────────┐      │
│  free trial.                    │             │  │ BEST VALUE  │      │
│                                 │  $14.99     │  │             │      │
│  Try everything.                │  /month     │  │  $119.99    │      │
│  Full access.                   │             │  │  /year      │      │
│  No credit card required.       │             │  │  Save 4 mo  │      │
│                                 └─────────────┘  └─────────────┘      │
│                                                                        │
│  ┌───────────────────────────────────────────┐                         │
│  │  your@email.com           [ Notify Me ]   │                         │
│  └───────────────────────────────────────────┘                         │
│  Launching August 2026. Sign up to be first.                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- Label: "PRICING" — uppercase, tracked
- Left (40%): heading + subtitle, left-aligned
- Right (60%): two pricing cards. 1px black border, no fill, 4px radius. Annual has "BEST VALUE" label.
- Email form below, full width
- Post-launch: App Store buttons replace form
- Mobile: text top, cards stacked (annual first)

---

### SECTION 11: PRIVACY — bg-dark (BLACK)

```
┌────────────────────────────────────────────────────────────────────────┐
│  ████████████████████████████████████████████████████████████████████  │
│                                                                        │
│  PRIVACY                                                               │
│                                                                        │
│  Your data stays on              No cloud servers.                     │
│  your devices. Period.           No tracking.                          │
│                                  No ads.                               │
│                                  No account required.                  │
│                                                                        │
│  Built for professionals who take their privacy                        │
│  as seriously as their planning.                                       │
│                                                                        │
│  ████████████████████████████████████████████████████████████████████  │
└────────────────────────────────────────────────────────────────────────┘
```

- Black background, cream text
- Fylla asymmetric: heading left, "No" list right
- Label: muted cream, uppercase
- Heading left: font-display, text-h2, cream
- Right: each "No" statement stacked, text-h3
- Closing: text-body, softer cream, spans full width
- Short section.

---

### SECTION 12: THE CLOSE

```
┌────────────────────────────────────────────────────────────────────────┐
│  bg: bg-primary                                                        │
│                                                                        │
│  Stop organizing                                                       │
│  your life.                                                            │
│                                                                        │
│  You've rewritten tasks.                                               │
│  You've rebuilt your plans.                                            │
│  You've lost things.                                                   │
│                                                                        │
│  Not because you're disorganized.                                      │
│  Because your tools are.                                               │
│                                                                        │
│  Capio fixes that.                                                     │
│  You write once. It's handled.                                         │
│                                                                        │
│  Your planner.                                                         │
│  Now intelligent.                                                      │
│                                                                        │
│  ┌───────────────────────────────────────────┐                         │
│  │  your@email.com           [ Notify Me ]   │                         │
│  └───────────────────────────────────────────┘                         │
│                                                                        │
│  Write. Set. Go.                                                       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- Headline: font-display, text-hero, left-aligned
- All text left-aligned
- "Not because... Because your tools are." — weight 700
- "Your planner. Now intelligent." — font-display, text-h2, extra top margin
- Email form, left-aligned
- "Write. Set. Go." — text-label, uppercase, letter-spacing 0.25em, text-muted

---

### SECTION 13: FOOTER — bg-dark (BLACK)

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  [◇ Capio logo mark — cream]                                           │
│                                                                        │
│  ABOUT                                                                 │
│  Designed and built by Vee — a product designer                        │
│  who got tired of choosing between simple and smart.                   │
│                                                                        │
│  @capioplan · hello@capioplan.com                                      │
│  Privacy Policy · Terms of Service                                     │
│  © 2026 Capio                                                          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

- All left-aligned
- Logo mark only, cream
- "ABOUT" label: uppercase, tracked, muted
- About: text-body, cream, max-width 400px
- Links: cream, underline on hover

---

## SECTION PATTERN SUMMARY

The page uses TWO Fylla patterns alternating:

**Pattern A — "About Us":** Label → big headline → full-width media below
Used in: Hero, Demo 1, Demo 2

**Pattern B — "Our Values":** Label → big statement left / detail list right
Used in: Problem, Features, Comparison, Pricing, Privacy

This creates visual rhythm — wide sections alternate with split sections as you scroll.

---

## BACKGROUND RHYTHM

| # | Section | Background |
|---|---------|-----------|
| 1 | Hero | Cream |
| 2 | Value prop + CTA | Cream |
| 3 | Problem | Cream |
| 4 | Solution | **BLACK** |
| 5 | Demo 1 | Cream |
| 6 | Demo 2 | Cream |
| 7 | Features | Cream |
| 8 | Views | Darker cream |
| 9 | Comparison | Cream |
| 10 | Pricing | Darker cream |
| 11 | Privacy | **BLACK** |
| 12 | Close | Cream |
| 13 | Footer | **BLACK** |

---

## RESPONSIVE

| Breakpoint | Changes |
|-----------|---------|
| Desktop 1200px+ | Full asymmetric layouts, sticky screenshot |
| Tablet 768-1199px | Asymmetric columns become 50/50. Sticky disabled. |
| Mobile < 768px | Single column. Left-aligned. GIFs full width. Table horizontal scroll. View thumbnails horizontal scroll. |

---

## ANIMATIONS

- Hero: label fades (0.2s) → headline slides up (0.4s) → video fades in (0.8s)
- Section labels: fade up on scroll (IntersectionObserver)
- Feature items: stagger fade-up
- View thumbnails: stagger fade-up
- Dark sections: no animation — instant
- Email submit: "Sending..." → "You're in!" with checkmark

No parallax. No bounce. Editorial precision.

---

## ASSETS NEEDED

- Capio logo mark SVG (tilted page)
- Capio wordmark SVG
- "Introducing Capio" video (MP4) or static thumbnail
- GIF: single task routing (Demo 1)
- GIF: brain dump routing (Demo 2)
- iPad screenshot: Daily View (for Features sticky)
- 6 view thumbnails: small GIFs or screenshots of each view
- Favicon: logo mark

---

## FILE STRUCTURE

```
/
├── index.html
├── css/style.css
├── js/main.js
├── assets/
│   ├── logo-mark.svg
│   ├── logo-wordmark.svg
│   ├── video/introducing-capio.mp4
│   ├── gifs/
│   │   ├── single-task-routing.gif
│   │   └── brain-dump-routing.gif
│   ├── screenshots/
│   │   ├── daily-view.png
│   │   ├── weekly-view.png
│   │   ├── monthly-view.png
│   │   ├── yearly-view.png
│   │   ├── capture-view.png
│   │   └── notes-view.png
│   └── thumbnail.jpg
└── favicon.ico
```

---

**Document End**

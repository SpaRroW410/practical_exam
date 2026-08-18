# Exam Presentation System
## Software Design Document
### Version 2.0 — As-Built

*Community Medicine Examination Presentation System*

---

## Chapter 1 — Project Overview

### Purpose

The Exam Presentation System is a browser-based tool for running a
structured, timed practical examination in Community Medicine. Instead of
a paper booklet or a slide deck operated by hand, an invigilator loads the
application on a shared screen or projector, starts the exam, and the
system presents each section — Clinical Case, Epidemiology, Biostatistics,
OSPE, Spotter — in a fixed sequence, each with its own timer, and finishes
with a summary screen. The examination content itself (questions, answer
keys, marks, images, timings) is authored once in an Excel workbook
(`QuestionBank.xlsx`) and converted into the JSON the application actually
reads, so non-technical faculty can maintain the exam content without
touching code.

### Objectives

- Present a fixed sequence of examination sections with accurate,
  unattended timing, so no section overruns or is shortchanged.
- Keep the question bank in one authoritative place (the Excel workbook)
  and make it trivial to regenerate the application's data from it —
  with no server, no installed toolchain, and no dependency on any one
  person's machine.
- Run identically whether the exam is on the open internet (hosted on
  Netlify or GitHub Pages) or entirely offline from a USB pendrive with a
  bare double-click, with no code branching a maintainer has to think
  about.
- Let an invigilator assemble a fresh, non-repeating question set quickly
  — either by hand or via a random draw — including across a multi-day
  exam, without duplicating what a previous day already used.
- Produce a printable question paper (with or without the answer key)
  straight from the browser, matching whatever is currently selected.

### Scope

**In scope:**
- Sequential presentation of five examination sections with per-section
  and per-slide timers, keyboard and on-screen navigation, and a closing
  summary.
- UG/PG-aware content filtering (difficulty, Spotter station count) from
  a single question bank.
- Manual and random question/Spotter-set selection, including a
  cross-day "previously used" exclusion mechanism.
- Excel-to-JSON data pipeline with an in-browser review/edit/diff tool
  (`Rebuild Data.html`) that needs no server, R, or internet connection.
- Browser print-to-PDF of the assembled question paper, with an optional
  answer key, and a separate admin-only full question-bank export.
- Dual deployment: static web hosting (Netlify/GitHub Pages) and an
  offline pendrive copy with a Windows kiosk-mode launcher.

**Out of scope:**
- Per-candidate login, individual result capture, or scoring.
- A server-side database, multi-institution accounts, or any backend
  beyond static file hosting.
- Networked/simultaneous multi-station exams (this is a single shared
  screen/projector, not a per-candidate device system).

### Target Users

| Role | How they use the system |
|---|---|
| **Invigilator / faculty running the exam** | Selects or randomizes a question set on the Home screen, starts the exam, operates Previous/Next (or lets timers auto-advance where they do), and reads the Summary at the end. Primary day-to-day user. |
| **Candidates (UG/PG students)** | View the presented content on a shared screen or projector; do not interact with the application directly. |
| **Question-bank maintainer** | A faculty member who edits `QuestionBank.xlsx` (directly, or via `Rebuild Data.html`'s in-browser editor) and regenerates `data/questions.json` / `data/settings.json`, keeping the exam content current. |
| **Administrator** | Uses the separate admin-code-gated screen to export the full question bank (filtered by UG/PG) as a printable reference document. |
| **IT / lab staff** | Deploys the pendrive copy (double-click `Start Exam System.bat`) or the hosted copy (push to the Netlify/GitHub Pages branch); not expected to edit code. |

### Requirements

**Functional**
1. Present Clinical, Epidemiology, Biostatistics, OSPE, and Spotter
   sections in that fixed order, each rendering from `data/questions.json`.
2. Enforce a UG/PG exam-level toggle that filters eligible questions by
   `Difficulty`, and the Spotter station count/sequence, from a single
   shared question bank.
3. Provide manual dropdown selection and a "RANDOM SET" draw for all five
   sections on the Home screen, plus a fully independent domain-random
   Spotter composition mode.
4. Track "previously used" questions/sets/slides across days (client-side,
   `localStorage`, exportable as JSON) and steer random draws away from
   them.
5. Run a rising overall timer for the whole exam and a falling per-section
   (or per-Spotter-slide) timer with a warning state and, where wired up,
   automatic advance on expiry.
6. Print the currently selected question paper, with or without the
   answer key, directly from the browser.
7. Regenerate `data/questions.json`, `data/settings.json`, and the
   offline-embedded data file from `QuestionBank.xlsx` entirely in the
   browser — no server, no R, no internet connection required.
8. Gate entry to the exam with a shared access code, and the admin
   question-bank export with a separate admin code.

**Non-functional**
1. Zero build step: the deployed application is static HTML/CSS/JS, run
   directly by a browser.
2. Zero server dependency for the offline path: works from a bare
   `file://` double-click with no local server.
3. No layout overflow: question content must always fit its allotted
   screen band regardless of question length (enforced by a runtime
   auto-fit algorithm, not manual per-question tuning).
4. Deterministic, reproducible data generation: the same workbook always
   produces the same `questions.json`/`settings.json`, whether generated
   via the browser tool or (historically) the R script.

---

## Chapter 2 — Technology Stack

### HTML5

A single entry point, `index.html`, defines the application shell
(`#app-header`, `#app-content`, `#app-footer`) plus a hidden `#print-area`
used only when printing. All screen content beyond that shell is injected
into `#app-content` at runtime as HTML strings built from JavaScript
template literals — there is no server-side templating and no separate
`.html` file per screen. `Rebuild Data.html` is a second, independent
entry point (the maintenance tool), self-contained in the same style.

### CSS3

Four stylesheets, loaded in this order and layering cleanly on top of one
another:

| File | Responsibility |
|---|---|
| `css/theme.css` | Design tokens (CSS custom properties: `--primary`, `--border`, the six `--pastel-N`/`--pastel-border-N` pairs), the exam-screen layout primitives (`.question-top`, `.question-subquestions`, `.spotter-layout`, `.question-image`), and shared component styles. |
| `css/main.css` | Base reset and body-level layout (header/content/footer flex shell). |
| `css/home.css` | Home/selection-screen grid, buttons, and the "Previously Used" exclusion table. |
| `css/exam.css` | The `.exam-screen` flex container itself. |

No CSS framework or preprocessor is used. Layout relies on plain
flexbox and CSS Grid, with `flex-grow` ratios (e.g. `6.5 : 3.5`) used
deliberately to express the split-band layouts described in Chapter 9.

### JavaScript

Vanilla ES6+, no framework (no React/Vue/etc.), no bundler, and no
runtime npm dependency. Seventeen script files are loaded via plain
`<script>` tags in a fixed, dependency-respecting order (see
`index.html`); every file contributes to one shared global scope —
functions and the `appState`/`appData` objects are called directly by
name across files, there is no module system or `import`/`export`.
Screens are built as HTML template-literal strings and injected via
`innerHTML`.

### JSON

The interchange and storage format for both examination content
(`data/questions.json`) and configuration (`data/settings.json`). The
same JSON is also re-expressed as a plain JavaScript global
(`data/data-embedded.js`, defining `EMBEDDED_APP_DATA`) so the offline
copy can load it via a `<script>` tag instead of `fetch()`, which is
blocked by CORS under a bare `file://` URL (see Chapter 4).

### Git

Source control for the whole project, hosted on GitHub
(`SpaRroW410/practical_exam`). Work happens on feature branches and is
merged into `main`; `main` is the branch GitHub Pages and Netlify both
build from.

### VS Code

The primary editor used for day-to-day development on the codebase.

### Supporting tools (not in the original list, included for completeness)

- **SheetJS** (`tools/vendor/xlsx.full.min.js`, vendored, Apache-2.0):
  the in-browser Excel parser/writer behind `Rebuild Data.html` and
  `tools/rebuild.js`.
- **GitHub Actions**: the "pages build and deployment" workflow that
  serves the online copy from `main`.
- **R** (`tools/build.R`): the original, now-deprecated Excel→JSON
  converter, kept only as a fallback; superseded by `Rebuild Data.html`.

---

## Chapter 3 — Folder Structure

```
practical_exam/
├── index.html                  Application entry point (the exam itself)
├── Rebuild Data.html           Standalone data-maintenance tool (Excel <-> JSON)
├── Start Exam System.bat       Windows kiosk-mode launcher for the offline copy
├── QuestionBank.xlsx           The single authoritative source of exam content
├── .nojekyll                   Disables GitHub Pages' Jekyll build step (plain static site)
├── README.md
│
├── css/
│   ├── theme.css                Design tokens + exam-screen layout primitives
│   ├── main.css                 Base reset + page shell layout
│   ├── home.css                 Home/selection screen + exclusion table
│   └── exam.css                 .exam-screen flex container
│
├── js/
│   ├── config.js                 APP_CONFIG (access codes), appState, appData, section order/names
│   ├── loader.js                 loadApplicationData(): embedded-data-first, fetch() fallback
│   ├── ui.js                     renderPage(), info tiles, fitQuestionLayout()/fitTwoBandLayout()
│   ├── navigation.js              Previous/Next section logic, keyboard handling
│   ├── timer.js                  Overall + section timer engine, beep, warning state
│   ├── password.js               Access-code and admin-code gate screens
│   ├── usage-log.js              "Previously used" exclusion log (localStorage)
│   ├── print.js                  Browser print/PDF generation for the question paper + admin export
│   ├── app.js                    initializeApplication(), applySelectionToState(), startExam()
│   │
│   └── views/                    One renderer module per screen
│       ├── home.js                 Setup/selection screen, RANDOM SET, exclusion UI
│       ├── admin.js                Admin question-bank export screen
│       ├── clinical.js             Clinical Case section
│       ├── epidemiology.js         Epidemiology section
│       ├── biostatistics.js        Biostatistics section
│       ├── ospe.js                 OSPE section
│       ├── spotter.js              Spotter section (own per-slide navigation/timer, random draw)
│       └── summary.js              Closing summary screen
│
├── data/
│   ├── questions.json            Generated: all exam content, keyed by section
│   ├── settings.json             Generated: flat configuration key/value map
│   └── data-embedded.js          Generated (offline copy only): the same data as a JS global
│
├── images/
│   ├── clinical/    epidemiology/    biostatistics/    ospe/    spotter/
│   │                (one subfolder per section; filenames referenced by each
│   │                 row's Image_File field — see Chapter 11)
│
├── audio/
│   └── beep.mp3                  Warning-threshold beep sound
│
├── tools/
│   ├── rebuild.js                 Shared parse/build/diff logic used by Rebuild Data.html
│   ├── build.R                    Deprecated R fallback for the same conversion
│   └── vendor/
│       └── xlsx.full.min.js       Vendored SheetJS library
│
└── docs/
    └── Software_Design_Document.md   This document
```

**Design rationale.** The split between `js/` (shared engine: timers,
navigation, layout-fitting, access control) and `js/views/` (one file per
screen) keeps each section's rendering logic isolated while sharing common
primitives — every section view calls the same `renderNavigationButtons()`,
`fitTwoBandLayout()`, and `startSectionTimer()` rather than reimplementing
them. `tools/` is deliberately separate from `js/` because it is
maintenance tooling, not part of the exam application itself; nothing in
`js/` depends on anything in `tools/`, and vice versa.

**Housekeeping note.** Two stray files currently sit at the repository
root — `~$QuestionBank.xlsx` (a Microsoft Office lock file, created
automatically while the workbook is open in Excel) and
`inspect_headers.ps1` (an ad hoc PowerShell script). Neither is part of
the application; they are candidates for a future cleanup pass, not
something referenced by any code path.

---

## Chapter 4 — Database Design

There is no database in the traditional sense — the system has no
runtime write path and no query engine. Content flows one direction,
through three stages:

```
   QuestionBank.xlsx                  data/questions.json
   ┌─────────────────────┐            data/settings.json
   │ Clinical_Case sheet  │            data/data-embedded.js
   │ Epidemiology sheet   │  ─────►    (generated, versioned in git)
   │ Biostatistics sheet  │  parse &
   │ OSPE sheet           │  convert          │
   │ Spotter sheet        │                   │  loaded at runtime by
   │ Settings sheet       │                   ▼  js/loader.js
   │ Index / Dashboard /  │            ┌───────────────────┐
   │ Lists / Instructions │            │   Running exam     │
   │ (maintenance-only,   │            │  appData.questions │
   │  never reach the app)│            │  appData.settings  │
   └─────────────────────┘            └───────────────────┘
```

**Stage 1 — Workbook.** `QuestionBank.xlsx` is hand-maintained in Excel
(directly, or through `Rebuild Data.html`'s interactive editor, which
writes the same shape back out as an updated `.xlsx`). It holds ten
sheets: five question sheets (`Clinical_Case`, `Epidemiology`,
`Biostatistics`, `OSPE`, `Spotter`), `Settings`, and four
maintenance-only sheets (`Dashboard`, `Lists`, `Index`, `Instructions`)
that the conversion step reads or writes for human reference but the
running application never sees.

**Stage 2 — Conversion.** `tools/rebuild.js` (run inside
`Rebuild Data.html`, entirely client-side via the vendored SheetJS
library) parses the five question sheets into one JSON object keyed by
section, and the `Settings` sheet into a flat key/value map — reproducing
exactly what the now-deprecated `tools/build.R` used to do, including its
one real quirk: R's `readxl` forces an entire settings column to text the
moment any cell in it is non-numeric, so every settings value is
deliberately `String()`-coerced to match, with an explicit uppercase
`"TRUE"`/`"FALSE"` fix for booleans (JS's own `String(true)` is lowercase,
R's is not).

**Stage 3 — Application.** `js/loader.js` populates two in-memory
objects, `appData.questions` and `appData.settings` (declared in
`js/config.js`), either from the embedded JS global (offline copy) or via
`fetch()` (online). Every screen in `js/views/` reads from these two
objects directly; nothing is ever written back to them from user
interaction (selection state lives separately, in `appState.exam`).

### Schema (top level)

```
questions.json
├── clinical:       Row[]   (Section_Header + Question rows)
├── epidemiology:   Row[]
├── biostatistics:  Row[]
├── ospe:           Row[]
└── spotter:        Row[]   (Section_Header + Spotter_Slide rows)

settings.json
└── { Parameter: Value, ... }   — flat map, every value a string
```

`settings.json`, in full, as currently generated:

```json
{
  "App_Name": "Community Medicine Examination System",
  "Version": "1",
  "Institution": null,
  "Theme": "Light",
  "Default_Exam_Level": "UG",
  "Clinical_Time_Min": "20",
  "Epidemiology_Time_Min": "10",
  "Biostatistics_Time_Min": "10",
  "OSPE_Time_Min": "10",
  "Spotter_Time_UG_Sec": "60",
  "Spotter_Time_PG_Sec": "90",
  "Reserve_Time_Sec": "60",
  "Warning_Normal_Sec": "120",
  "Warning_Spotter_Sec": "10",
  "Enable_Beep": "TRUE",
  "Enable_Auto_Advance": "TRUE",
  "UG_Spotter_Slides": "1,2,3,4,5,6,7,8,9,10",
  "PG_Spotter_Slides": "1,2,3,4,5,6,7,8,9,11",
  "Show_Total_Marks": "TRUE",
  "Show_Question_Marks": "TRUE",
  "Calculate_From_A_B_C": "TRUE",
  "Clinical_Image_Path": "images/clinical",
  "Epidemiology_Image_Path": "images/epidemiology",
  "Biostatistics_Image_Path": "images/biostatistics",
  "OSPE_Image_Path": "images/ospe",
  "Spotter_Image_Path": "images/spotter"
}
```

Of these, `Clinical_Time_Min` / `Epidemiology_Time_Min` /
`Biostatistics_Time_Min` / `OSPE_Time_Min`, both `Spotter_Time_*_Sec`,
`Reserve_Time_Sec`, both `Warning_*_Sec`, and `UG_Spotter_Slides` /
`PG_Spotter_Slides` are read directly by `js/timer.js` and
`js/views/*.js`. `App_Name`, `Version`, `Institution`, `Theme`,
`Default_Exam_Level`, `Enable_Beep`, `Enable_Auto_Advance`,
`Show_Total_Marks`, `Show_Question_Marks`, `Calculate_From_A_B_C`, and
all five `*_Image_Path` values exist in the sheet but are **not**
currently read anywhere in the application code — they document intent
for a future version rather than active configuration today (see
Chapter 13).

---

## Chapter 5 — JSON Schema

Both `questions.json`'s section arrays share a common shape for the four
written sections; Spotter's is closely related but distinct. Every row
carries `Item_Type`, which is either `"Section_Header"` (one per section,
carrying the section's intro text/instructions and total marks) or the
section's item type (`"Question"` for the written sections,
`"Spotter_Slide"` for Spotter).

### Clinical / Epidemiology / Biostatistics / OSPE

```
Question_ID          string   e.g. "CL001" — not read by the app; used only
                               by the maintenance tooling (Rebuild Data.html's
                               auto-generated Index sheet)
Item_Type             string   "Section_Header" | "Question"
Question_No           string   the number selected in the Home screen dropdown
Topic                 string   free-text; not read by the app today
Difficulty             string   "Easy" | "Moderate" | "Difficult"
Title                 string   short on-screen label (e.g. "Case 1")
Scenario_or_Stem       string   the question's narrative/setup text
Sub_Question_A/B/C     string   the three graded parts (C is PG-only on screen
                               and omitted from UG print output)
Answer_Key_A/B/C       string   printed only via the admin/answer-key print path
Marks_A/B/C             number   per sub-question marks
Plot_Instruction       string   Biostatistics-specific graphing instruction;
                               rendered at a fixed size, independent of the
                               scenario text (see Chapter 9)
Image_File             string   filename only — resolved against the section's
                               images/ subfolder (see Chapter 11)
Image_Caption          string   caption shown under the image
Total_Marks            number   sum shown in the section header
Status                string   not read by the app today
Last_Updated          string   not read by the app today
Remarks                string   not read by the app today
```

Example (`clinical`):

```json
{
    "Question_ID": "CL001",
    "Item_Type": "Question",
    "Question_No": "1",
    "Topic": "Immunization",
    "Difficulty": "Moderate",
    "Title": "Case 1",
    "Scenario_or_Stem": "A 2-year-old male child is brought to the PHC by his mother. He has received vaccines only up to 14 weeks of age...",
    "Sub_Question_A": "1) What is your diagnosis?\r\n2) What additional history will you obtain?",
    "Answer_Key_A": "Partially immunized (defaulter) child needing catch-up immunization...",
    "Marks_A": 6,
    "Sub_Question_B": "1) Prepare a catch-up immunization plan according to UIP...",
    "Answer_Key_B": "Catch-up follows age-appropriate schedule with minimum intervals...",
    "Marks_B": 8,
    "Sub_Question_C": "Using the WHO \"Three C\" model, construct a conceptual framework...",
    "Answer_Key_C": "(Confidence, Complacency, Convenience)",
    "Marks_C": 6,
    "Plot_Instruction": null,
    "Image_File": null,
    "Image_Caption": null,
    "Total_Marks": 20,
    "Status": "Active",
    "Last_Updated": "2026-08-01",
    "Remarks": "Case 1 – Delayed Immunization (Catch-up Vaccination)"
}
```

### Spotter

```
Spotter_ID            string   e.g. "SP001-01" — maintenance-tooling only
Item_Type              string   "Section_Header" | "Spotter_Slide"
Set_No                 string   e.g. "Set 1" — which numbered set this slide
                                belongs to (irrelevant to the domain-random
                                draw, which ignores Set_No entirely)
Spotter_No              string   e.g. "Spotter 1" — its digit determines which
                                "station" (1–11) it competes for in a random
                                draw; this is the field that matters for
                                random eligibility, not Set_No
Domain_Category         string   e.g. "Entomology I" — used as a soft
                                preference to avoid repeating a domain within
                                one random-composed set
Topic, Difficulty,       —      same meaning as the written sections
Title, Sub_Question_A/B/C,
Answer_Key_A/B/C, Marks_A/B/C,
Image_File, Image_Caption
Remarks                 string   not read by the app today
Total_Marks              number
Status                  string   not read by the app today
```

Example (`spotter`):

```json
{
    "Spotter_ID": "SP001-01",
    "Item_Type": "Spotter_Slide",
    "Set_No": "Set 1",
    "Spotter_No": "Spotter 1",
    "Domain_Category": "Entomology I",
    "Topic": "Disinfectants, Water Quality & Vector Control",
    "Difficulty": "Difficult",
    "Title": "Spotter 1",
    "Sub_Question_A": "Identify the specimen and mention its identifying features.",
    "Answer_Key_A": "boat-shaped eggs laid singly on the water surface, each with lateral floats",
    "Marks_A": 1,
    "Sub_Question_B": "State its breeding habitat/site.",
    "Answer_Key_B": "clean, stagnant water collections",
    "Marks_B": 1,
    "Sub_Question_C": "Discuss the public health importance of this pre-larval stage...",
    "Answer_Key_C": "Control measure: indoor residual spraying and insecticide-treated nets...",
    "Marks_C": 1,
    "Image_File": "spotter_1_1_anoph_egg.png",
    "Remarks": "Set 1 Spotter 1 – Anopheles (egg)",
    "Image_Caption": null,
    "Total_Marks": 3,
    "Status": "Active"
}
```

---

## Chapter 6 — Screen Flow

```
Access Code
    │
    ▼
Home (Setup)  ──────────► Admin — Question Bank (parallel branch, admin code)
    │
    ▼
Clinical
    │
    ▼
Epidemiology
    │
    ▼
Biostatistics
    │
    ▼
OSPE
    │
    ▼
Spotter  (its own internal loop: header → slide 1 → slide 2 → ... → Reserve)
    │
    ▼
Summary
```

The Access screen (`js/password.js`) precedes Home and gates everything
else behind it — `initializeApplication()` in `js/app.js` renders it
immediately after data loads. From the Access screen, "Admin — Question
Bank" is a separate, parallel destination (its own admin code), not part
of the main exam flow; it exists to export a printable full question bank
and returns to the Access screen, never into the exam sequence itself.

Once "START EXAM" is clicked on Home, the five sections play strictly in
the order fixed by `SECTION_ORDER` in `js/config.js`
(`clinical, epidemiology, biostatistics, ospe, spotter, summary`) — there
is no way to jump ahead or skip a section. Spotter is the one section with
internal structure of its own: a header/info screen, then one screen per
selected slide, then a final untimed-by-the-user Reserve screen, before
handing off to Summary.

---

## Chapter 7 — Navigation Rules

### Previous

- Steps back one section (`previousSection()`, `js/navigation.js`), or —
  while inside Spotter — one slide at a time
  (`previousSpotterSlide()`, `js/views/spotter.js`), falling back to the
  Spotter header screen once at slide 1.
- Disabled on the very first section's header screen
  (`renderNavigationButtons(!isFirstSection(), true)` in
  `js/views/clinical.js`) — there is nothing before Clinical to go back
  to.
- Stepping back within Spotter pauses the current slide's timer.

### Next

- Advances one section, or one Spotter slide.
- Disabled on the Spotter header/info screen until every slide's image
  has finished preloading (`renderNavigationButtons(true, imageCount === 0)`
  in `js/views/spotter.js`) — this prevents starting the timed portion
  before images are ready to display instantly.

### Keyboard

- **→ (ArrowRight)**: clicks whatever the current Next button does. On
  the Spotter Reserve screen specifically (which has no Next button at
  all), it instead calls `finishSpotter()` directly, letting the
  invigilator end the reserve period early rather than waiting out its
  full countdown.
- **← (ArrowLeft)**: clicks whatever the current Previous button does.
- Both are ignored entirely while `appState.currentView === "home"`, so
  arrow keys don't interfere with dropdown selection on the setup screen.

### Restrictions

- Navigation is strictly linear and sequential — driven by a single
  `appState.currentSection` index into `SECTION_ORDER`; there is no
  direct-jump/menu navigation to an arbitrary section.
- Spotter slides use their own independent previous/next handlers
  (`previousSpotterSlide`/`nextSpotterSlide`), replacing the generic
  section-level Previous/Next for the duration of that section — the
  outer section-level `previousSection()`/`nextSection()` only apply
  when entering or leaving Spotter as a whole.
- The Reserve screen at the end of Spotter has no Next button by design
  — it is time-boxed and ends itself when its countdown reaches zero
  (calling `finishSpotter()`), or early via the ArrowRight shortcut
  above.
- A section's timer reaching zero does **not**, by itself, force
  navigation for the four written sections — see Chapter 8 for exactly
  which timers do and don't auto-advance.

---

## Chapter 8 — Timer Engine

All timing runs through one shared engine, `js/timer.js`, with two kinds
of clock:

### Overall timer

Starts once, at `startExam()`, and counts **up** from `00:00` for the
entire exam duration (`startOverallTimer()`), formatted `MM:SS`. It never
pauses and is not tied to any individual section.

### Section timer

Counts **down** from a caller-supplied duration, in seconds, with a
caller-supplied warning threshold and an optional completion callback:

```js
startSectionTimer(seconds, warningSeconds, onComplete = null)
```

Every section view supplies its own `seconds`/`warningSeconds` pulled
from `appData.settings` (e.g. `Clinical_Time_Min * 60` and
`Warning_Normal_Sec` for Clinical). It can be paused
(`pauseSectionTimer()`) and resumed (`resumeSectionTimer()`) — used when
leaving/re-entering a Spotter slide, and while a section's own header
screen is showing.

### Spotter timer

Spotter re-arms this same section-timer machinery **per slide** rather
than once for the whole section — `Spotter_Time_UG_Sec` or
`Spotter_Time_PG_Sec` (by exam level) for each individual slide, with
`Warning_Spotter_Sec` as its warning threshold, and a final
`Reserve_Time_Sec` countdown once every slide has been shown.

### Automatic advance

Whether a timer auto-advances on expiry depends entirely on whether an
`onComplete` callback was supplied at the call site — there is no global
toggle:

| Section | `onComplete` passed? | Behaviour at 0:00 |
|---|---|---|
| Clinical / Epidemiology / Biostatistics / OSPE | No | Timer stops and shows `00:00`; the invigilator must click Next manually. |
| Spotter — per slide | `nextSpotterSlide` | Automatically advances to the next slide. |
| Spotter — Reserve | `finishSpotter` | Automatically advances to the Summary screen. |

The `Enable_Auto_Advance` setting in `settings.json` is **not** currently
read anywhere in the code — the behaviour above is hard-coded per call
site, not driven by that flag. It documents an intended future toggle
rather than an active one (see Chapter 13).

### Warning logic

When `sectionRemaining <= sectionWarning`, `runSectionTimer()` adds a
`.timer-warning` CSS class to the section-timer display and plays a
single beep (`playBeep()`, loading `audio/beep.mp3`) — gated by a
`beepPlayed` latch so it fires exactly once per timer instance, not every
second while under threshold. Like `Enable_Auto_Advance`, the
`Enable_Beep` setting exists in `settings.json` but is not currently
checked anywhere — the beep is unconditional today.

---

## Chapter 9 — Layout System

Every exam screen must fit its content within the fixed viewport with no
scrolling and no overflow, regardless of how long a given question's text
happens to be. This is solved at runtime, not by manually tuning font
sizes per question — see Chapter 10 for the algorithm itself
(`fitQuestionLayout()`/`fitTwoBandLayout()`, `js/ui.js`).

### Clinical / Epidemiology / Biostatistics / OSPE

Two layouts, chosen per-question by whether it has an image:

- **No image**: scenario/question text flows in a single free band, sized
  up to 44px.
- **With image (figure-bearing question)**: the screen splits **65:35**
  — `.question-top` (scenario + image, `flex: 6.5 1 0`) above
  `.question-subquestions` (`flex: 3.5 1 0`) below — so the sub-questions
  get a guaranteed share of the screen instead of being squeezed by
  however much room the scenario/image happened to need. Within the top
  band, text is capped at 32px and the image fills whatever space is left
  over after text sizing. Biostatistics' `Plot_Instruction` (when present)
  renders *after* the image inside this same top band, at a fixed 30px —
  deliberately excluded from the dynamic-sizing pass so it doesn't get
  silently overridden by the shared scenario/question binary search (the
  binary search still accounts for its real rendered height, so the
  no-overflow guarantee holds either way).

### OSPE tables

OSPE questions render through the same two-band mechanism as the other
written sections; no separate table-specific layout exists beyond the
shared `.question-image`/`.question-top` primitives.

### Spotter

A fixed **50:50** grid (`.spotter-layout`, `grid-template-columns: 1fr 1fr`)
— sub-questions on the left, the image on the right, each in its own
column so growing the question text never steals space from the image
(no `imageWrap` competition, unlike the written sections' stacked
layout). Sub-question text is sized up to 64px within its column.

### Responsive behaviour

Layout is fitted, not just styled: `fitQuestionLayout()` binary-searches
(6 iterations) for the largest font size in `[24, max]` at which the
measured container's `scrollHeight` still fits its `clientHeight`,
re-applying every candidate size directly as an inline style before
measuring. This runs fresh on every question render, so it adapts
automatically to different screen sizes and different question lengths
without any per-question manual adjustment.

### Margins

Handled by the shared `.exam-screen` flex container (`css/exam.css`) and
each layout primitive's own `gap`/`padding` (12–20px throughout); no
separate margin system exists outside the CSS itself.

---

## Chapter 10 — Question Rendering Engine

Each section has its own renderer in `js/views/`, but all of them follow
the same shape: look up the selected row from `appData.questions[section]`
by number, build an HTML string (scenario/stem, sub-questions with marks,
optional image, optional Biostatistics plot instruction), call
`renderPage()` to inject it, wire up navigation, then call the shared
layout-fitting pass.

### Clinical renderer (`js/views/clinical.js`)

Two-phase: `renderClinical()` shows the section header/instructions
screen first (Previous disabled if this is the very first section);
clicking Next reveals the actual selected question via a second render
pass. Starts the section timer on first entry only
(`clinicalTimerStarted` latch), so returning to the question via
Previous/Next doesn't restart the clock. Uses `fitTwoBandLayout(hasImage)`
for sizing.

### Epidemiology / Biostatistics / OSPE renderers

Structurally identical to Clinical (header screen → question screen →
own timer latch → `fitTwoBandLayout`), differing only in which settings
key drives their duration (`Epidemiology_Time_Min`, etc.) and, for
Biostatistics specifically, the extra `Plot_Instruction` block described
in Chapter 9.

### OSPE renderer (`js/views/ospe.js`)

Same pattern as the above; OSPE's content is presented as numbered
stations rather than sub-questions A/B/C, but goes through the identical
header → question → timer → layout pipeline.

### Spotter renderer (`js/views/spotter.js`)

The most distinct of the five: it maintains its own local state
(`spotterSlides`, `currentSpotterIndex`, `reserveMode`) rather than
tracking a single selected question number, because a "Spotter section"
is really a sequence of slides. Its responsibilities:

- **Slide resolution** (`loadSpotterSlides()`): either replays an
  already-cached `appState.randomSpotterSlides` (built once at
  `applySelectionToState()` so header, slides, print output, and summary
  all agree — see `js/app.js`), or filters `appData.questions.spotter`
  by the chosen `Set_No` and the UG/PG slide sequence
  (`UG_Spotter_Slides`/`PG_Spotter_Slides`).
- **Random composition** (`buildRandomSpotterSet()`): draws one slide per
  "station" position (extracted from `Spotter_No`, not `Set_No` — see
  Chapter 5), preferring a slide that is both domain-fresh and not
  already in the cross-day exclusion log, relaxing that preference in two
  graceful steps (domain-fresh regardless of exclusion, then any
  candidate) so a station never comes back empty.
- **Image preloading** (`preloadSpotterImages()`): starts every slide's
  image loading while the header screen is still showing, so the
  per-slide timer never has to wait on network/disk.
- **Per-slide navigation and timer**: its own `previousSpotterSlide()`/
  `nextSpotterSlide()`, each re-arming a fresh section timer
  (`Spotter_Time_UG_Sec`/`Spotter_Time_PG_Sec`) that auto-advances on
  expiry (Chapter 8).
- **Reserve screen**: shown after the last slide, running
  `Reserve_Time_Sec` with `finishSpotter` as its completion callback.

---

## Chapter 11 — Image Management

### Folder structure

One subfolder per section under `images/`:
`images/clinical/`, `images/epidemiology/`, `images/biostatistics/`,
`images/ospe/`, `images/spotter/`. Each row's `Image_File` field holds a
**filename only**; every renderer resolves the full path itself as
`"images/<section>/" + Image_File` (e.g. `js/views/spotter.js`:
`"images/spotter/" + slide.Image_File`). Nothing in `questions.json`
ever stores a full path.

### Naming convention

Spotter (by far the largest set — currently 220 referenced images) uses
a descriptive pattern of `spotter_<set>_<position>_<short-description>.<ext>`,
e.g. `spotter_11_2_cyclops.jpg`, `spotter_14_5_anti_rabies_vaccine.jpg`.
The written sections mostly use a topic-code prefix, e.g.
`BIO01_hb_frequency.png`, `EP014_epidemic_curve.png`. This convention is
descriptive, not enforced by code — the application only ever looks up
whatever literal string is in `Image_File`, so any filename works as long
as `Image_File` matches it exactly (byte-for-byte, including case — this
matters specifically for the case-sensitive filesystem GitHub Pages
serves from, unlike a typical Windows development machine).

A handful of stray, unreferenced `.tif` files currently sit in
`images/spotter/` (bare numeric names like `10176.tif`) — leftover
assets not pointed to by any `Image_File` value, safe to remove in a
future cleanup pass.

### Loading strategy

For the written sections, an image loads lazily as a normal `<img src>`
when its question is rendered. Spotter is the exception: every slide in
the current set is preloaded up front (`preloadSpotterImages()`) while
the header/info screen is showing, with visible progress
(`#spotterPreloadStatus`, "Loading images... N/M"), and the Next button
into the timed portion stays disabled until preloading completes — so no
image ever has to load *during* a timed slide.

### Fallback image

There is no dedicated fallback/placeholder image asset. Spotter's CSS
defines a `.spotter-placeholder` style (dashed border, centered "no
image" styling) for the layout slot, and a missing/broken `Image_File`
reference simply fails to load in the browser (broken-image icon) rather
than substituting a designed placeholder graphic. Introducing a real
fallback asset is a reasonable small future improvement, not something
currently implemented.

---

## Chapter 12 — Coding Standards

These are the conventions actually followed throughout the existing
codebase, not a proposed style guide:

### Naming

- **Functions**: `camelCase`, verb-first and descriptive
  (`renderClinical`, `startSectionTimer`, `buildRandomSpotterSet`,
  `isSpotterSetUsed`). Boolean-returning helpers read as questions
  (`isUG()`, `isFirstSection()`, `isQuestionUsed()`).
- **Variables**: `camelCase` (`sectionRemaining`, `currentSpotterIndex`).
- **Constants**: `UPPER_SNAKE_CASE` for fixed configuration/lookup tables
  (`SECTION_ORDER`, `SECTION_NAMES`, `SPOTTER_SEQUENCE`, `APP_CONFIG`,
  `MIN_TEXT_SIZE`), `camelCase` for `const` bindings that hold ordinary
  runtime values.
- **Files**: lowercase, one word or hyphenated
  (`config.js`, `usage-log.js`); one file per screen under `js/views/`,
  named after the section it renders.
- **CSS classes**: kebab-case, BEM-adjacent but not strict BEM
  (`.question-top`, `.spotter-preload-status`, `.editor-form-panel`).

### Functions

Small and single-purpose — rendering, state mutation, and DOM wiring are
kept as separate function calls even within one screen's setup (e.g.
Clinical: build header HTML → `renderPage()` → `attachNavigationEvents()`
→ start timer → `fitTwoBandLayout()`, each its own statement/call rather
than one large block). Pure data-shaping logic (the diff functions, the
schema helpers in `tools/rebuild.js`) is kept free of DOM access
entirely, which is what makes it independently testable via plain Node.

### Modules

No ES module system — every file's top-level functions and `const`s
join one shared global scope, and load order in `index.html` **is** the
dependency graph (e.g. `js/usage-log.js` must load before
`js/views/spotter.js`, which calls `loadUsedLog()`). There is no
namespacing convention beyond descriptive naming to avoid collisions.

### Comments

Sparse by design — most functions carry no comment at all, since names
are expected to be self-explanatory. Where a comment does appear, it
explains **why**, not what: a non-obvious constraint, a deliberate
trade-off, or a workaround (e.g. the `readxl` text-coercion note in
`tools/rebuild.js`, or the note on why `.plot-instruction` is excluded
from the dynamic-sizing target list in `js/ui.js`). Section-divider
comments (`// --- Timer ---`) are used to break up longer render
functions into readable phases.

### Formatting

A distinctive, consistent house style throughout: **one blank line
between every statement**, including inside function bodies — not just
between logical blocks. Every file opens with a fixed header comment
block (system name, module name, version). Template-literal HTML is
indented to mirror the resulting DOM nesting. No semicolon omission, no
minification in source (minification only happens in the vendored
third-party library).

---

## Chapter 13 — Future Version

Several items commonly proposed for a "future version" of a system like
this are, as of this document, **already implemented** — noted here so
scope isn't duplicated:

| Item | Status |
|---|---|
| Password | **Implemented.** Two-tier access code (`APP_CONFIG.ACCESS_CODE` for the exam, a separate `ADMIN_CODE` for the question-bank export), `js/password.js`. |
| PDF export | **Implemented**, via the browser's own print-to-PDF (`js/print.js`) — both a candidate-facing question paper and an admin-only full question-bank export, UG/PG filtered. Not a programmatic PDF library (e.g. no `jsPDF`), which is the one respect in which this could still grow (see below). |
| Online version | **Implemented.** Static hosting on both Netlify and GitHub Pages from the same `main` branch, with a dual-mode data loader so the identical codebase also runs fully offline. |
| Question editor | **Implemented.** `Rebuild Data.html`'s interactive Review & Edit screen — add/edit questions, an image-filename picker, duplicate guards, and a diff view against the currently committed data files. |

Genuinely outstanding:

- **Answer mode** — a mode where the application itself reveals/grades
  answers interactively (today, answer keys only ever reach a human via
  the print output; there is no on-screen answer-reveal or grading UI).
- **Dark mode** — `settings.json` carries a `Theme` field (`"Light"`)
  that is not read anywhere in the code; no dark-theme CSS exists today.
- **Programmatic PDF export** — replacing/supplementing the
  browser-print-dialog approach with a library-generated PDF for more
  layout control (headers/footers, pagination) than `window.print()`
  offers.
- **Wiring up the currently-inert settings** — `Enable_Beep`,
  `Enable_Auto_Advance`, `Show_Total_Marks`, `Show_Question_Marks`,
  `Calculate_From_A_B_C`, `App_Name`, `Institution`, and the five
  `*_Image_Path` values all exist in `settings.json` today but are not
  read by any code path (Chapters 4 and 8) — a natural next step is
  either wiring them up to real behaviour or removing them to avoid
  implying configurability that doesn't exist.

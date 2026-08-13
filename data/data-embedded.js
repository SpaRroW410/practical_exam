// ============================================================
// Community Medicine Examination System
// Embedded Application Data — placeholder
//
// This file is intentionally inert in the committed repository: it
// defines no globals, so js/loader.js's dual-mode check falls straight
// through to fetch("data/questions.json") / fetch("data/settings.json")
// exactly as it always has. Nothing changes for the Netlify/server
// deployment.
//
// For an offline pendrive copy, open "Rebuild Data.html" (repo root),
// pick QuestionBank.xlsx, and save its "data-embedded.js" output over
// THIS file in your local copy. That file defines EMBEDDED_APP_DATA,
// which loader.js then uses directly — no server, no fetch(), works
// from a bare file:// double-click. Don't commit that generated file
// back to git; data/questions.json and data/settings.json stay the
// single source of truth.
// ============================================================

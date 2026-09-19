// ============================================================
// Community Medicine Examination System
// "Previously Used" Exclusion Log
// Version 1.0
//
// Client-side bookkeeping for multi-day exams: lets the home screen
// remember which questions/spotter sets have already been used so the
// RANDOM SET button can steer away from repeats on a later day.
//
// Stored in localStorage (works automatically for the online GitHub
// Pages / Netlify deployment). For the offline pendrive copy, where a
// different day's exam may run from a different machine or browser
// profile, the same log can be exported/imported as a small JSON file
// instead of relying on localStorage carrying over on its own.
//
// Deliberately client-side only, no server, matching the rest of the app.
// ============================================================


const USAGE_LOG_KEY = "cme_used_questions";

const USAGE_LOG_SECTIONS = [

    "clinical",

    "epidemiology",

    "biostatistics",

    "ospe"

];

function emptyUsedLog() {

    return {

        clinical: [],

        epidemiology: [],

        biostatistics: [],

        ospe: [],

        spotterSets: [],

        spotterSlides: []

    };

}


// ------------------------------------------------------------
// Load / Save
// ------------------------------------------------------------

function loadUsedLog() {

    const raw = localStorage.getItem(USAGE_LOG_KEY);

    if (!raw) return emptyUsedLog();

    try {

        const parsed = JSON.parse(raw);

        return normalizeUsedLog(parsed);

    }

    catch (error) {

        console.error("Corrupt usage log, resetting.", error);

        return emptyUsedLog();

    }

}

function normalizeUsedLog(obj) {

    const normalized = emptyUsedLog();

    if (!obj || typeof obj !== "object") return normalized;

    USAGE_LOG_SECTIONS.forEach(function(section){

        if (Array.isArray(obj[section])) {

            normalized[section] = obj[section].slice();

        }

    });

    if (Array.isArray(obj.spotterSets)) {

        normalized.spotterSets = obj.spotterSets.slice();

    }

    if (Array.isArray(obj.spotterSlides)) {

        normalized.spotterSlides = obj.spotterSlides.slice();

    }

    return normalized;

}

function saveUsedLog(log) {

    localStorage.setItem(USAGE_LOG_KEY, JSON.stringify(log));

}


// ------------------------------------------------------------
// Mutations
// ------------------------------------------------------------

// Called after applySelectionToState(), so appState.exam.* already
// reflects the current dropdown selections, and a "random" Spotter
// choice has already been resolved to concrete slides on
// appState.randomSpotterSlides — see the Spotter branch below.
function markCurrentSelectionUsed() {

    const log = loadUsedLog();

    USAGE_LOG_SECTIONS.forEach(function(section){

        const value = appState.exam[section];

        if (value === undefined || value === null) return;

        const set = new Set(log[section]);

        set.add(Number(value));

        log[section] = Array.from(set);

    });

    // A manually-picked numbered set logs at the Set_No level. "Random"
    // doesn't resolve to a single Set_No, so it instead logs the actual
    // resolved slides (appState.randomSpotterSlides, already built and
    // cached by applySelectionToState() before this function runs) at
    // the individual Spotter_ID level.
    if (typeof appState.exam.spotter === "number") {

        const set = new Set(log.spotterSets);

        set.add(appState.exam.spotter);

        log.spotterSets = Array.from(set);

    }

    else if (appState.exam.spotter === "random" && appState.randomSpotterSlides) {

        const set = new Set(log.spotterSlides);

        appState.randomSpotterSlides.forEach(function(slide){

            set.add(slide.Spotter_ID);

        });

        log.spotterSlides = Array.from(set);

    }

    saveUsedLog(log);

    return log;

}

function clearUsedLog() {

    const log = emptyUsedLog();

    saveUsedLog(log);

    return log;

}


// ------------------------------------------------------------
// Export / Import (offline portability)
// ------------------------------------------------------------

function exportUsedLogJSON() {

    return JSON.stringify(loadUsedLog(), null, 2);

}

function importUsedLogFromObject(obj) {

    const log = normalizeUsedLog(obj);

    saveUsedLog(log);

    return log;

}


// ------------------------------------------------------------
// Seed From data/ Folder
//
// Only runs when this machine/browser profile has no usage log yet at
// all (the localStorage key is entirely absent) — a machine that
// already has local exclusion state, even a deliberately-cleared one,
// is never silently overwritten by a bundled file. So: drop an
// updated data/used_questions.json onto the pendrive between exam
// days and a machine that's never run this app before picks it up
// automatically on first load; the Home screen's manual "IMPORT LIST
// (JSON)" button still works exactly as before and always overrides
// whatever this seeded, since it runs later (user-triggered) and
// writes over the same key.
//
// Relies on fetch(), which works on the online (GitHub Pages/Netlify)
// deployment and any local dev server, but browsers commonly block
// fetch() for a bare file:// double-click — same limitation
// data/data-embedded.js already works around for questions/settings —
// and a browser without fetch() at all is guarded explicitly below
// too. None of these are errors: a missing file (404), an unreachable
// one, invalid JSON, file:// itself, or fetch() not existing all end
// the same way — no exclusion list gets auto-applied, silently. The
// manual Import button (which reads via FileReader, not fetch, so it
// always works offline too) remains the reliable path in every case;
// the Home screen's "Previously Used" table (js/views/home.js) shows
// "No exclusion data present" whenever the resulting log is empty,
// regardless of which of these reasons caused it.
// ------------------------------------------------------------

async function seedUsageLogFromDataFolder() {

    if (localStorage.getItem(USAGE_LOG_KEY) !== null) return;

    // Skip outright under a bare file:// double-click — fetch() is
    // guaranteed to fail there (logging a CORS error to the console on
    // every single launch for no benefit), so there's nothing to try.
    if (location.protocol === "file:") return;

    // Explicit guard rather than relying on the catch below to absorb a
    // ReferenceError — an ancient/unusual browser without fetch() is
    // exactly the "no exclusion list, carry on" case, spelled out
    // instead of falling into that path by accident.
    if (typeof fetch !== "function") return;

    try {

        const response = await fetch("data/used_questions.json");

        if (!response.ok) return;

        const obj = await response.json();

        importUsedLogFromObject(obj);

    }

    catch (error) {

        // No file, unreachable, or not valid JSON — fine, just start
        // with no exclusion list.

    }

}


// ------------------------------------------------------------
// Lookups
// ------------------------------------------------------------

function isQuestionUsed(section, questionNo) {

    const log = loadUsedLog();

    if (!log[section]) return false;

    return log[section].indexOf(Number(questionNo)) !== -1;

}

function isSpotterSetUsed(setNo) {

    const log = loadUsedLog();

    return log.spotterSets.indexOf(Number(setNo)) !== -1;

}

function isSpotterSlideUsed(spotterId) {

    const log = loadUsedLog();

    return log.spotterSlides.indexOf(spotterId) !== -1;

}

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

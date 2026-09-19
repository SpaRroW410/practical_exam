// ============================================================
// Community Medicine Examination System
// Configuration & Application State
// Version 1.0
// ============================================================


// ------------------------------------------------------------
// Access Control
// Change this code before each exam session.
// ------------------------------------------------------------

const APP_CONFIG = {

    ACCESS_CODE: "SpaRroW0410",

    // Separate code for the question-bank screen. Keep it distinct from
    // ACCESS_CODE — candidates are given that one.
    ADMIN_CODE: "SpaRroW0410Admin"

};


// ------------------------------------------------------------
// Application State
// ------------------------------------------------------------

const appState = {

    // Current Screen
    currentView: "home",

    // Current Section Index
    currentSection: 0,

    // Examination Level
    examLevel: "UG",

    // Selected Question Numbers
    exam: {

        clinical: 1,

        epidemiology: 1,

        biostatistics: 1,

        ospe: 1,

        spotter: 1

    },

    // Populated only when the Spotter Set dropdown is set to Random.
    randomSpotterSlides: null,

    // Order of the 5 exam sections for this run (Summary always runs
    // last, appended separately — see activeSectionOrder() below).
    // Left unset until the coordinator confirms a sequence on the
    // Sequence screen; activeSectionOrder() falls back to
    // SECTION_ORDER's standard order until then. Sticky across
    // multiple exam runs in the same session once set, so a custom
    // sequence doesn't have to be re-picked every time.
    sectionSequence: null,

    // Timers

    timer: {

        overall: 0,

        section: 0,

        running: false

    }

};


// ------------------------------------------------------------
// Loaded Data
// ------------------------------------------------------------

const appData = {

    questions: null,

    settings: null

};


// ------------------------------------------------------------
// Section Order
// ------------------------------------------------------------

const SECTION_ORDER = [

    "clinical",

    "epidemiology",

    "biostatistics",

    "ospe",

    "spotter",

    "summary"

];


// ------------------------------------------------------------
// Display Names
// ------------------------------------------------------------

const SECTION_NAMES = {

    clinical: "Clinical Case",

    epidemiology: "Epidemiology",

    biostatistics: "Biostatistics",

    ospe: "OSPE",

    spotter: "Spotter",

    summary: "Summary"

};


// ------------------------------------------------------------
// Spotter Sequence
// ------------------------------------------------------------

const SPOTTER_SEQUENCE = {

    UG: [1,2,3,4,5,6,7,8,9,10],

    PG: [1,2,3,4,5,6,7,8,9,11]

};


// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

// ------------------------------------------------------------
// Active Section Order
//
// Defaults to SECTION_ORDER's standard 5 sections (everything before
// "summary") unless the coordinator picked a custom order on the
// Sequence screen (js/views/sequence.js) — Summary always runs last
// regardless of what order the rest were set to.
// ------------------------------------------------------------

// Written sections whose Home dropdown was set to "None" hold a null
// in appState.exam[section] (see js/app.js's applySelectionToState())
// and are left out here — Spotter has no "None" option, so it's never
// excluded.
function includedSections(){

    return SECTION_ORDER.slice(0, -1).filter(
        key => appState.exam[key] !== null
    );

}

function activeSectionOrder(){

    const included = includedSections();

    const sticky = appState.sectionSequence;

    // A sticky custom order (js/views/sequence.js) is only reused when
    // it still matches the currently-included set — toggling a
    // section's exclusion between runs must not leave a stale/
    // mismatched permutation in place.
    const stickyValid =
        sticky &&
        sticky.length === included.length &&
        sticky.every(key => included.includes(key));

    return (stickyValid ? sticky : included).concat(["summary"]);

}

function currentSectionName(){

    return activeSectionOrder()[appState.currentSection];

}

function isPG(){

    return appState.examLevel === "PG";

}

function isUG(){

    return appState.examLevel === "UG";

}
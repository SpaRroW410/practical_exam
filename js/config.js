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

    ACCESS_CODE: "SpaRroW0410"

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

function currentSectionName(){

    return SECTION_ORDER[appState.currentSection];

}

function isPG(){

    return appState.examLevel === "PG";

}

function isUG(){

    return appState.examLevel === "UG";

}
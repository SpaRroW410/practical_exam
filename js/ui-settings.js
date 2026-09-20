// ============================================================
// Community Medicine Examination System
// UI Settings (font-size tuning)
// Version 1.0
//
// Lets a coordinator adjust the exam's text sizing for a specific
// room/projector from Admin > UI Settings (js/views/admin-ui-settings.js)
// without a developer editing CSS/JS and re-deploying. Live,
// per-machine, no-redeploy — same localStorage pattern as
// js/usage-log.js's exclusion log and js/resume.js's crash recovery
// (single key, try/catch JSON parse, defaults merged in).
//
// Deliberately limited to the "how big can this grow" ceilings, not
// the shared minimum floor (js/ui.js's MIN_TEXT_SIZE stays a fixed
// safety invariant against overflow) and not any structural layout
// ratio (the 70:30 image/sub-question split, Spotter's 50/50 grid).
// ============================================================


const UI_SETTINGS_KEY = "cme_ui_settings";

const UI_SETTING_DEFAULTS = {

    scenarioMaxWithImage: 36,

    subQuestionMax: 44,

    scenarioMaxNoImage: 72,

    spotterSubQuestionMax: 64,

    plotInstructionSize: 30,

    plotInstructionSizeWithImage: 34

};


// ------------------------------------------------------------
// Load / Save / Reset
// ------------------------------------------------------------

function loadUISettings() {

    const raw = localStorage.getItem(UI_SETTINGS_KEY);

    if (!raw) return Object.assign({}, UI_SETTING_DEFAULTS);

    try {

        const parsed = JSON.parse(raw);

        return Object.assign({}, UI_SETTING_DEFAULTS, parsed);

    }

    catch (error) {

        console.error("Corrupt UI settings, resetting.", error);

        return Object.assign({}, UI_SETTING_DEFAULTS);

    }

}

let uiSettings = loadUISettings();

function getUISetting(key) {

    return uiSettings[key];

}

function saveUISettings(values) {

    uiSettings = Object.assign({}, UI_SETTING_DEFAULTS, values);

    localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(uiSettings));

    applyUISettingsToCSS();

}

function resetUISettings() {

    localStorage.removeItem(UI_SETTINGS_KEY);

    uiSettings = Object.assign({}, UI_SETTING_DEFAULTS);

    applyUISettingsToCSS();

}


// ------------------------------------------------------------
// Apply — Plot Instruction's fixed CSS sizes go through custom
// properties (css/theme.css's .plot-instruction / .scenario-plot-group
// .plot-instruction), so a change here takes effect immediately with
// no re-render needed. The scenario/sub-question/Spotter ceilings are
// read fresh by getUISetting() every time a question renders (js/ui.js,
// js/views/spotter.js, js/views/admin-preview.js,
// js/views/admin-rebuild.js), so they need no separate "apply" step.
// ------------------------------------------------------------

function applyUISettingsToCSS() {

    document.documentElement.style.setProperty(
        "--plot-instruction-size",
        uiSettings.plotInstructionSize + "px"
    );

    document.documentElement.style.setProperty(
        "--plot-instruction-size-image",
        uiSettings.plotInstructionSizeWithImage + "px"
    );

}

applyUISettingsToCSS();

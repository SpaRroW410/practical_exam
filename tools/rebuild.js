// ============================================================
// Community Medicine Examination System
// Offline Excel -> JSON / Embedded-JS Rebuild Tool
//
// Runs entirely in the browser via the bundled SheetJS library
// (tools/vendor/xlsx.full.min.js) — no server, no install, no
// internet connection. Reads QuestionBank.xlsx and reproduces the
// same output tools/build.R does, validated field-by-field against
// the committed data/questions.json and data/settings.json:
//
//   - Question sheets need no extra type coercion; SheetJS's own
//     per-cell type inference already matches (Question_No comes
//     through as a string, Marks_A/Total_Marks as numbers).
//   - The Settings sheet DOES need explicit handling: R's readxl
//     forces a whole column to text the moment any value in it is
//     non-numeric, which is why every value in the existing
//     settings.json is a string even for numbers like "20". SheetJS
//     parses each cell independently and won't do this on its own,
//     so every settings value is deliberately String()-coerced here.
//   - Biostatistics and OSPE are missing Answer_Key_C in the real
//     workbook; every row is null-filled for Answer_Key_A/B/C, same
//     as build.R's ensure_answer_keys().
// ============================================================


const SECTION_SHEETS = {

    clinical: "Clinical_Case",

    epidemiology: "Epidemiology",

    biostatistics: "Biostatistics",

    ospe: "OSPE",

    spotter: "Spotter"

};

const REQUIRED_SHEETS =
    Object.values(SECTION_SHEETS).concat(["Settings"]);

const ANSWER_KEY_FIELDS =
    ["Answer_Key_A", "Answer_Key_B", "Answer_Key_C"];


// ------------------------------------------------------------
// Editable Field Schemas
//
// Matches the columns actually present in the real workbook (verified
// this session, not assumed) — the four written sections share one
// shape, Spotter has its own (Spotter_ID/Set_No/Spotter_No/
// Domain_Category instead of Question_ID/Question_No, no
// Scenario_or_Stem/Plot_Instruction/Last_Updated).
// ------------------------------------------------------------

const WRITTEN_SECTION_FIELDS = [

    "Question_ID", "Item_Type", "Question_No", "Topic", "Difficulty",
    "Title", "Scenario_or_Stem", "Sub_Question_A", "Answer_Key_A",
    "Marks_A", "Sub_Question_B", "Answer_Key_B", "Marks_B",
    "Sub_Question_C", "Answer_Key_C", "Marks_C", "Plot_Instruction",
    "Image_File", "Image_Caption", "Total_Marks", "Status",
    "Last_Updated", "Remarks"

];

const SPOTTER_FIELDS = [

    "Spotter_ID", "Item_Type", "Set_No", "Spotter_No", "Domain_Category",
    "Topic", "Difficulty", "Title", "Sub_Question_A", "Answer_Key_A",
    "Marks_A", "Sub_Question_B", "Answer_Key_B", "Marks_B",
    "Sub_Question_C", "Answer_Key_C", "Marks_C", "Image_File", "Remarks",
    "Image_Caption", "Total_Marks", "Status"

];

const SECTION_IMAGE_FOLDER = {

    clinical: "images/clinical/",

    epidemiology: "images/epidemiology/",

    biostatistics: "images/biostatistics/",

    ospe: "images/ospe/",

    spotter: "images/spotter/"

};

function fieldsForSection(sectionKey) {

    return sectionKey === "spotter" ? SPOTTER_FIELDS : WRITTEN_SECTION_FIELDS;

}

function itemTypeForSection(sectionKey) {

    return sectionKey === "spotter" ? "Spotter_Slide" : "Question";

}


// ------------------------------------------------------------
// Parse a workbook (ArrayBuffer) into { questions, settings }
// ------------------------------------------------------------

function parseWorkbook(arrayBuffer) {

    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    const missingSheets = REQUIRED_SHEETS.filter(

        name => workbook.SheetNames.indexOf(name) === -1

    );

    if (missingSheets.length > 0) {

        throw new Error(

            "Missing expected sheet(s): " + missingSheets.join(", ") +
            ". Found: " + workbook.SheetNames.join(", ")

        );

    }

    const questions = {};

    const counts = {};

    Object.keys(SECTION_SHEETS).forEach(function(sectionKey){

        const sheetName = SECTION_SHEETS[sectionKey];

        const rows =
            XLSX.utils.sheet_to_json(

                workbook.Sheets[sheetName],

                { defval: null }

            );

        rows.forEach(function(row){

            ANSWER_KEY_FIELDS.forEach(function(field){

                if (!(field in row)) row[field] = null;

            });

        });

        questions[sectionKey] = rows;

        counts[sectionKey] = summarizeSection(sectionKey, rows);

    });

    const settingsRows =
        XLSX.utils.sheet_to_json(

            workbook.Sheets.Settings,

            { defval: null }

        );

    const settings = {};

    // Description isn't part of the app's data model (settings.json
    // never carried it), but it's real content in the workbook — kept
    // here purely so an .xlsx round-trip doesn't quietly erase it.
    const settingsDescriptions = {};

    settingsRows.forEach(function(row){

        if (!row.Parameter) return;

        settings[row.Parameter] = coerceSettingValue(row.Value);

        settingsDescriptions[row.Parameter] = row.Description ?? null;

    });

    return {

        questions,

        settings,

        settingsDescriptions,

        counts,

        // Retained so buildUpdatedWorkbook() can write the edited
        // section/Settings sheets back into the SAME workbook object,
        // leaving Dashboard/Lists/Index/Instructions untouched rather
        // than silently dropping them.
        workbook

    };

}


// R's readxl reads a boolean-typed cell as a logical, and stringifying
// it (as the character-coercion below already does for every settings
// value) produces "TRUE"/"FALSE" — R's own uppercase convention.
// SheetJS returns a native JS boolean for the same cell, and JS's
// String(true) is lowercase "true". Coerce explicitly so the two tools
// agree byte-for-byte rather than differing only by case.
function coerceSettingValue(value) {

    if (value === null) return null;

    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";

    return String(value);

}

function summarizeSection(sectionKey, rows) {

    const itemType =
        sectionKey === "spotter" ? "Spotter_Slide" : "Question";

    const items = rows.filter(r => r.Item_Type === itemType).length;

    const headers =
        rows.filter(r => r.Item_Type === "Section_Header").length;

    return { total: rows.length, items, headers };

}


// ------------------------------------------------------------
// Output builders
// ------------------------------------------------------------

function buildQuestionsJSON(parsed) {

    return JSON.stringify(parsed.questions, null, 2);

}

function buildSettingsJSON(parsed) {

    return JSON.stringify(parsed.settings, null, 2);

}

function buildEmbeddedJS(parsed) {

    return (

        "// ============================================================\n" +
        "// Community Medicine Examination System\n" +
        "// Embedded Application Data — generated by Rebuild Data.html\n" +
        "// Generated: " + new Date().toISOString() + "\n" +
        "//\n" +
        "// Loaded by index.html before js/loader.js. When this defines\n" +
        "// EMBEDDED_APP_DATA, loader.js uses it directly instead of\n" +
        "// fetch()-ing data/questions.json and data/settings.json, so\n" +
        "// the app works from a bare file:// double-click.\n" +
        "// ============================================================\n\n" +
        "const EMBEDDED_APP_DATA = {\n" +
        "    questions: " + JSON.stringify(parsed.questions, null, 4) + ",\n" +
        "    settings: " + JSON.stringify(parsed.settings, null, 4) + "\n" +
        "};\n"

    );

}


// ------------------------------------------------------------
// Index Sheet
//
// A flat, all-sections listing used purely for browsing/QA — not read
// by the app or by parseWorkbook() itself. Previously hand-typed and,
// as found this session, already out of sync with the real data (6
// missing Epidemiology rows, stale Title text). Rebuilding it here from
// the same parsed.questions the rest of this file already trusts means
// it can't drift again. Title is left out: for most rows it just
// repeats Question_ID-shaped text, so it added nothing an index needs.
// ------------------------------------------------------------

const SECTION_DISPLAY_NAME = {

    clinical: "Clinical Case",

    epidemiology: "Epidemiology",

    biostatistics: "Biostatistics",

    ospe: "OSPE",

    spotter: "Spotter"

};

function buildIndexRows(parsed) {

    const rows = [];

    Object.keys(SECTION_SHEETS).forEach(function(sectionKey){

        const itemType = itemTypeForSection(sectionKey);

        const isSpotter = sectionKey === "spotter";

        parsed.questions[sectionKey].forEach(function(row){

            if (row.Item_Type !== itemType) return; // skip Section_Header rows

            rows.push({

                Question_ID: isSpotter ? row.Spotter_ID : row.Question_ID,

                Section: SECTION_DISPLAY_NAME[sectionKey],

                Set_No: isSpotter ? row.Set_No : "N/A",

                Item_No: isSpotter ? row.Spotter_No : row.Question_No,

                Topic: row.Topic,

                Difficulty: row.Difficulty

            });

        });

    });

    return rows;

}


// ------------------------------------------------------------
// .xlsx Round-Trip
//
// Writes the current (possibly edited) section and Settings rows back
// into the ORIGINAL parsed workbook object — replacing only those 7
// sheets — rather than building a new workbook from scratch, so
// Dashboard/Lists/Instructions and anything else in the real file
// survive untouched.
// ------------------------------------------------------------

function buildUpdatedWorkbook(parsed) {

    Object.keys(SECTION_SHEETS).forEach(function(sectionKey){

        const sheetName = SECTION_SHEETS[sectionKey];

        parsed.workbook.Sheets[sheetName] =
            XLSX.utils.json_to_sheet(parsed.questions[sectionKey]);

    });

    const settingsRows = Object.keys(parsed.settings).map(function(param){

        return {

            Parameter: param,

            Value: parsed.settings[param],

            Description: parsed.settingsDescriptions[param] ?? null

        };

    });

    parsed.workbook.Sheets.Settings =
        XLSX.utils.json_to_sheet(settingsRows);

    parsed.workbook.Sheets.Index =
        XLSX.utils.json_to_sheet(buildIndexRows(parsed));

    return XLSX.write(

        parsed.workbook,

        { type: "array", bookType: "xlsx" }

    );

}


// ------------------------------------------------------------
// Saving
// ------------------------------------------------------------

function downloadFile(filename, content, mimeType) {

    const blob = new Blob(

        [content],

        { type: mimeType || "text/plain" }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = filename;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

}

async function writeFileToDirectory(dirHandle, filename, content) {

    const fileHandle =
        await dirHandle.getFileHandle(filename, { create: true });

    const writable = await fileHandle.createWritable();

    await writable.write(content);

    await writable.close();

}

async function saveOutputs(outputs) {

    // File System Access API (Chromium/Edge): pick the data/ folder
    // once, write all three files directly into it, no manual moving.
    if (window.showDirectoryPicker) {

        const dirHandle = await window.showDirectoryPicker();

        for (const filename in outputs) {

            await writeFileToDirectory(dirHandle, filename, outputs[filename]);

        }

        return "written";

    }

    // Fallback: plain downloads, to be moved into data/ by hand.
    for (const filename in outputs) {

        downloadFile(filename, outputs[filename]);

    }

    return "downloaded";

}

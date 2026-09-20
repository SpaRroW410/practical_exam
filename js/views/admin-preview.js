// ============================================================
// Community Medicine Examination System
// Admin — Display Testing
//
// Lets an admin visually step through every question in a section
// exactly as a candidate would see it (images, sub-questions, layout),
// with no timer and a three-way level filter: All (no filter), Only UG
// (excludes anything marked Difficult and hides Sub_Question_C — what a
// UG candidate would actually see), and Only PG (the complement — ONLY
// the Difficult-marked items, i.e. exactly what's PG-exclusive and was
// never in the UG pool). This is a review-tool partition, not a replay
// of the real exam's draw pool (a real PG candidate draws from every
// difficulty, not just Difficult — see js/views/spotter.js's
// allowedDifficulty) — Only PG here exists specifically so the admin can
// inspect the harder, UG-excluded content in isolation. Purely a
// display/content review tool. Deliberately independent of the real
// exam renderers (js/views/clinical.js etc.) and the timer/navigation
// engine: it reuses their CSS classes so it looks identical on screen,
// but touches none of their code, so there is zero risk to the tested
// live-exam flow. Answer keys are never shown here, matching the
// existing Question Bank print's non-disclosure stance.
//
// Level filter shared by every collector below: "ug" keeps only
// non-Difficult rows, "pg" keeps only Difficult rows (the UG-excluded
// complement), "all" (or anything else) keeps everything.
function difficultyPassesLevel(difficulty, level) {

    if (level === "ug") return difficulty !== "Difficult";

    if (level === "pg") return difficulty === "Difficult";

    return true;

}

// Spotter has an extra Individual/Set mode choice, because the real
// app itself filters Spotter eligibility two different ways depending
// on how a slide is reached (js/views/spotter.js vs js/views/home.js):
// Individual mode (position/domain groups, across all sets) filters
// each SLIDE by its own Difficulty, mirroring the random per-station
// draw; Set mode (one whole numbered set, browsed in order) filters
// whole SETS by their Section_Header row's Difficulty, mirroring how a
// specific Set_No is chosen manually for a given level.
// ============================================================


const SPOTTER_PREVIEW_GROUPS = {

    full: { label: "Full (all 220 slides)", positions: null },

    entomology: { label: "Entomology (positions 1–2)", positions: [1, 2] },

    nutrition: { label: "Nutrition (positions 3–4)", positions: [3, 4] },

    immunization: { label: "Immunization (positions 5–6)", positions: [5, 6] },

    contraceptive: { label: "Contraceptive (positions 7–8)", positions: [7, 8] },

    misc: { label: "Miscellaneous (positions 9–11)", positions: [9, 10, 11] }

};

let adminPreviewItems = [];

let adminPreviewIndex = 0;

let adminPreviewSectionKey = null;

let adminPreviewLevel = "all"; // "all" | "ug" | "pg"

let adminPreviewSpotterMode = "individual"; // "individual" | "set"


// ------------------------------------------------------------
// Entry point
//
// `options`: { level, spotterMode, spotterScope, spotterSetNo }
// ------------------------------------------------------------

function renderAdminPreview(sectionKey, options) {

    options = options || {};

    appState.currentView = "admin-preview";

    adminPreviewSectionKey = sectionKey;

    adminPreviewLevel = options.level || "all";

    adminPreviewSpotterMode = options.spotterMode || "individual";

    adminPreviewItems =
        sectionKey === "spotter"
            ? collectSpotterPreviewItems(options)
            : collectWrittenPreviewItems(sectionKey);

    adminPreviewIndex = 0;

    showAdminPreviewItem();

}

function collectWrittenPreviewItems(sectionKey) {

    return (appData.questions[sectionKey] || [])

        .filter(row => row.Item_Type === "Question")

        .filter(row => difficultyPassesLevel(row.Difficulty, adminPreviewLevel))

        .sort((a, b) => Number(a.Question_No) - Number(b.Question_No));

}

function spotterPositionOfRow(row) {

    return Number(String(row.Spotter_No).replace(/[^\d]/g, ""));

}

function spotterSetNumberOfRow(row) {

    return Number(String(row.Set_No).replace(/[^\d]/g, ""));

}

// Mirrors js/views/home.js's getEligibleSpotterSetNumbers(), but
// against an admin-chosen level string instead of the real exam's
// appState.exam.level — Display Testing's level is independent of
// whatever level a candidate has (or hasn't) selected.
function eligibleSpotterSetNumbersForLevel(level) {

    return appData.questions.spotter

        .filter(x => x.Item_Type === "Section_Header")

        .filter(h => difficultyPassesLevel(h.Difficulty, level))

        .map(spotterSetNumberOfRow)

        .sort((a, b) => a - b);

}

// `options`: { spotterMode, spotterScope, spotterSetNo }
function collectSpotterPreviewItems(options) {

    options = options || {};

    if (options.spotterMode === "set") {

        const setNo = Number(options.spotterSetNo);

        const header = appData.questions.spotter.find(

            x => x.Item_Type === "Section_Header" &&
                spotterSetNumberOfRow(x) === setNo

        );

        // Defensive: even if the picker only ever offers eligible sets,
        // never show a set this level shouldn't see.
        if (!header || !difficultyPassesLevel(header.Difficulty, adminPreviewLevel)) {

            return [];

        }

        return appData.questions.spotter

            .filter(row => row.Item_Type === "Spotter_Slide")

            .filter(row => spotterSetNumberOfRow(row) === setNo)

            .sort((a, b) => spotterPositionOfRow(a) - spotterPositionOfRow(b));

    }

    const group = SPOTTER_PREVIEW_GROUPS[options.spotterScope] || SPOTTER_PREVIEW_GROUPS.full;

    return appData.questions.spotter

        .filter(row => row.Item_Type === "Spotter_Slide")

        .filter(row =>
            !group.positions ||
            group.positions.indexOf(spotterPositionOfRow(row)) !== -1
        )

        .filter(row => difficultyPassesLevel(row.Difficulty, adminPreviewLevel))

        .sort(function(a, b){

            const setA = spotterSetNumberOfRow(a);

            const setB = spotterSetNumberOfRow(b);

            if (setA !== setB) return setA - setB;

            return spotterPositionOfRow(a) - spotterPositionOfRow(b);

        });

}


// ------------------------------------------------------------
// Render current item
// ------------------------------------------------------------

function showAdminPreviewItem() {

    if (adminPreviewItems.length === 0) {

        renderPage(`

            <section class="exam-screen">

                <div class="section-header">
                    <h2>No items to preview</h2>
                    <p>This section/scope has no items yet.</p>
                </div>

                ${renderNavigationButtons(false, false)}

                <div class="home-actions" style="margin-top:16px;">
                    <button id="adminPreviewBack" class="start-button print-button">BACK TO ADMIN</button>
                </div>

            </section>

        `);

        document.getElementById("adminPreviewBack").onclick = renderAdminScreen;

        return;

    }

    const row = adminPreviewItems[adminPreviewIndex];

    const positionLabel =
        adminPreviewSectionKey === "spotter"
            ? row.Set_No + " — " + row.Spotter_No
            : "Question " + row.Question_No;

    const idLabel =
        adminPreviewSectionKey === "spotter" ? row.Spotter_ID : row.Question_ID;

    const html = adminPreviewSectionKey === "spotter"
        ? buildSpotterPreviewHTML(row, adminPreviewLevel)
        : buildWrittenPreviewHTML(row, adminPreviewSectionKey, adminPreviewLevel);

    renderPage(`

        <section class="exam-screen">

            <div class="admin-preview-toolbar">

                <div class="admin-preview-position">
                    <strong>${escapeAdminPreviewHtml(idLabel)}</strong>
                    &mdash; ${escapeAdminPreviewHtml(positionLabel)}
                    (${adminPreviewIndex + 1} of ${adminPreviewItems.length})
                    ${adminPreviewLevel !== "all" ? " — " + adminPreviewLevel.toUpperCase() + " only" : ""}
                </div>

                <button id="adminPreviewBack" class="start-button print-button">BACK TO ADMIN</button>

            </div>

            ${html}

            ${renderNavigationButtons(

                adminPreviewIndex > 0,

                adminPreviewIndex < adminPreviewItems.length - 1

            )}

        </section>

    `);

    document.getElementById("adminPreviewBack").onclick = renderAdminScreen;

    document.getElementById("previousButton").onclick = function(){

        if (adminPreviewIndex > 0) {

            adminPreviewIndex--;

            showAdminPreviewItem();

        }

    };

    document.getElementById("nextButton").onclick = function(){

        if (adminPreviewIndex < adminPreviewItems.length - 1) {

            adminPreviewIndex++;

            showAdminPreviewItem();

        }

    };

    // Same fitting pass the real exam screens use — pure layout code,
    // safe to reuse as-is.
    if (adminPreviewSectionKey === "spotter") {

        fitQuestionLayout(

            null,

            document.querySelector(".spotter-layout .question-subquestions"),

            64

        );

    }

    else {

        fitTwoBandLayout(!!document.querySelector(".question-image"));

    }

}

function escapeAdminPreviewHtml(value) {

    return String(value ?? "").replace(/[&<>"']/g, function(ch){

        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[ch];

    });

}


// ------------------------------------------------------------
// Written sections (Clinical / Epidemiology / Biostatistics / OSPE)
// Mirrors the markup shape of js/views/clinical.js etc. Includes
// Sub_Question_C when present, unless level is "ug" (then it's
// hidden, matching what a real UG candidate would see). Never shows
// Answer_Key_*.
//
// sectionKey/level are passed explicitly (rather than read off the
// module-level adminPreviewSectionKey/adminPreviewLevel) so this is
// reusable from js/views/admin-rebuild.js's live preview, which has
// its own independent section/level context — see showAdminPreviewItem()
// below for this screen's own call, and getDisplayMarks() (js/ui.js)
// for why the marks values (not just C's visibility) now depend on
// level too: UG's real Marks_A/B differ from PG's curated columns.
// ------------------------------------------------------------

function buildWrittenPreviewHTML(question, sectionKey, level) {

    const hasImage = !!(question.Image_File && question.Image_File !== "");

    // .scenario-emphasized only applies alongside an image (the 70:30
    // split, where scenario/sub-questions are already independently
    // sized bands) — mirrors js/views/epidemiology.js etc. exactly. The
    // free-flowing no-image layout keeps scenario in the shared dynamic
    // sizing group so it scales together with the sub-questions instead
    // of leaving them to balloon on their own.
    const emphasize =
        hasImage && ["epidemiology", "biostatistics", "ospe"].indexOf(sectionKey) !== -1;

    let html = `${hasImage ? `<div class="question-top">` : ""}`;

    if (!hasImage) {

        html += `
            <div class="scenario">${nl2br(question.Scenario_or_Stem)}</div>
        `;

    }

    // Image leads, then the scenario (+ Plot Instruction) sits in a
    // compact caption strip right below it — mirrors the image-first
    // order js/views/epidemiology.js etc. now render in the real exam.
    if (hasImage) {

        html += `
            <div class="question-image">
                <img src="images/${sectionKey}/${question.Image_File}" alt="Question Image">
                <div class="image-caption">${nl2br(question.Image_Caption ?? "")}</div>
            </div>
            <div class="scenario-plot-group">
                <div class="scenario${emphasize ? " scenario-emphasized" : ""}">${nl2br(question.Scenario_or_Stem)}</div>
        `;

    }

    if (question.Plot_Instruction && question.Plot_Instruction !== "") {

        html += `
            <div class="plot-instruction">
                <strong>Plot Instruction:</strong>
                ${nl2br(question.Plot_Instruction)}
                <span class="marks">(${question.Marks_Plot ?? ""})</span>
            </div>
        `;

    }

    if (hasImage) html += `</div>`; // close .scenario-plot-group

    if (hasImage) html += `</div>`; // close .question-top

    html += `<div class="question-subquestions">`;

    const previewLetters = level === "ug" ? ["A", "B"] : ["A", "B", "C"];

    // PG-style (raw Marks_A/B/C) for "all"/"pg"; UG-aware (curated
    // override, falling back to the even-split) only for "ug" — matches
    // previewLetters' own gate exactly.
    const marks = getDisplayMarks(question, level !== "ug");

    previewLetters.forEach(function(letter){

        const sub = question["Sub_Question_" + letter];

        if (!sub) return;

        html += `
            <div class="question">
                <strong>${letter}.</strong>
                ${nl2br(sub)}
                <span class="marks">(${marks[letter] ?? ""})</span>
            </div>
        `;

    });

    html += `</div>`;

    return html;

}


// ------------------------------------------------------------
// Spotter — mirrors js/views/spotter.js's showSpotterSlide() markup.
// Includes Sub_Question_C when present, unless level is "ug". Spotter's
// marks are always raw Marks_A/B/C (js/views/spotter.js never routes
// them through getDisplayMarks() — no UG/PG split concept there),
// unaffected by Part 1's curated-UG-marks change.
// ------------------------------------------------------------

function buildSpotterPreviewHTML(slide, level) {

    let subHtml = "";

    const previewLetters = level === "ug" ? ["A", "B"] : ["A", "B", "C"];

    previewLetters.forEach(function(letter){

        const sub = slide["Sub_Question_" + letter];

        const marks = slide["Marks_" + letter];

        if (!sub) return;

        subHtml += `
            <div class="question">
                <strong>${letter}.</strong>
                ${nl2br(sub)}
                <span class="marks">(${marks ?? ""})</span>
            </div>
        `;

    });

    const imageHtml = slide.Image_File && slide.Image_File !== ""
        ? `<div class="spotter-image-wrap">
               <img src="images/spotter/${slide.Image_File}" alt="Spotter Image" class="spotter-image">
           </div>`
        : `<div class="spotter-image-wrap">
               <div class="spotter-placeholder">No Image</div>
           </div>`;

    return `
        <div class="spotter-layout">
            <div class="question-subquestions">${subHtml}</div>
            ${imageHtml}
        </div>
    `;

}

// ============================================================
// Community Medicine Examination System
// Admin — Display Testing
//
// Lets an admin visually step through every question in a section
// exactly as a candidate would see it (images, sub-questions, layout),
// with no timer and, by default, no UG/PG filter — an optional UG-only
// toggle narrows it to exactly what a UG candidate would see (Difficult
// items excluded, Sub_Question_C hidden). Purely a display/content
// review tool. Deliberately independent of the real exam renderers
// (js/views/clinical.js etc.) and the timer/navigation engine: it reuses
// their CSS classes so it looks identical on screen, but touches none
// of their code, so there is zero risk to the tested live-exam flow.
// Answer keys are never shown here, matching the existing Question Bank
// print's non-disclosure stance.
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

let adminPreviewUGOnly = false;


// ------------------------------------------------------------
// Entry point
// ------------------------------------------------------------

function renderAdminPreview(sectionKey, spotterScope, ugOnly) {

    appState.currentView = "admin-preview";

    adminPreviewSectionKey = sectionKey;

    adminPreviewUGOnly = !!ugOnly;

    adminPreviewItems =
        sectionKey === "spotter"
            ? collectSpotterPreviewItems(spotterScope || "full")
            : collectWrittenPreviewItems(sectionKey);

    adminPreviewIndex = 0;

    showAdminPreviewItem();

}

function collectWrittenPreviewItems(sectionKey) {

    return (appData.questions[sectionKey] || [])

        .filter(row => row.Item_Type === "Question")

        .filter(row => !adminPreviewUGOnly || row.Difficulty !== "Difficult")

        .sort((a, b) => Number(a.Question_No) - Number(b.Question_No));

}

function spotterPositionOfRow(row) {

    return Number(String(row.Spotter_No).replace(/[^\d]/g, ""));

}

function collectSpotterPreviewItems(scopeKey) {

    const group = SPOTTER_PREVIEW_GROUPS[scopeKey] || SPOTTER_PREVIEW_GROUPS.full;

    return appData.questions.spotter

        .filter(row => row.Item_Type === "Spotter_Slide")

        .filter(row =>
            !group.positions ||
            group.positions.indexOf(spotterPositionOfRow(row)) !== -1
        )

        .filter(row => !adminPreviewUGOnly || row.Difficulty !== "Difficult")

        .sort(function(a, b){

            const setA = Number(String(a.Set_No).replace(/[^\d]/g, ""));

            const setB = Number(String(b.Set_No).replace(/[^\d]/g, ""));

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
        ? buildSpotterPreviewHTML(row)
        : buildWrittenPreviewHTML(row);

    renderPage(`

        <section class="exam-screen">

            <div class="admin-preview-toolbar">

                <div class="admin-preview-position">
                    <strong>${escapeAdminPreviewHtml(idLabel)}</strong>
                    &mdash; ${escapeAdminPreviewHtml(positionLabel)}
                    (${adminPreviewIndex + 1} of ${adminPreviewItems.length})
                    ${adminPreviewUGOnly ? " — UG only" : ""}
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

        const hasImage = !!document.querySelector(".question-image");

        if (hasImage) {

            fitQuestionLayout(

                document.querySelector(".question-image"),

                document.querySelector(".question-top"),

                32

            );

            fitQuestionLayout(

                null,

                document.querySelector(".question-subquestions"),

                44

            );

        }

        else {

            fitQuestionLayout(null);

        }

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
// Sub_Question_C when present, unless adminPreviewUGOnly is set (then
// it's hidden, matching what a real UG candidate would see). Never
// shows Answer_Key_*.
// ------------------------------------------------------------

function buildWrittenPreviewHTML(question) {

    const hasImage = !!(question.Image_File && question.Image_File !== "");

    let html = `${hasImage ? `<div class="question-top">` : ""}
        <div class="scenario">${nl2br(question.Scenario_or_Stem)}</div>
    `;

    if (hasImage) {

        html += `
            <div class="question-image">
                <img src="images/${adminPreviewSectionKey}/${question.Image_File}" alt="Question Image">
                <div class="image-caption">${nl2br(question.Image_Caption ?? "")}</div>
            </div>
        `;

    }

    if (question.Plot_Instruction && question.Plot_Instruction !== "") {

        html += `
            <div class="plot-instruction">
                <strong>Plot Instruction:</strong>
                ${nl2br(question.Plot_Instruction)}
            </div>
        `;

    }

    if (hasImage) html += `</div>`;

    html += `<div class="question-subquestions">`;

    const previewLetters = adminPreviewUGOnly ? ["A", "B"] : ["A", "B", "C"];

    previewLetters.forEach(function(letter){

        const sub = question["Sub_Question_" + letter];

        const marks = question["Marks_" + letter];

        if (!sub) return;

        html += `
            <div class="question">
                <strong>${letter}.</strong>
                ${nl2br(sub)}
                <span class="marks">(${marks ?? ""})</span>
            </div>
        `;

    });

    html += `</div>`;

    return html;

}


// ------------------------------------------------------------
// Spotter — mirrors js/views/spotter.js's showSpotterSlide() markup.
// Includes Sub_Question_C when present, unless adminPreviewUGOnly.
// ------------------------------------------------------------

function buildSpotterPreviewHTML(slide) {

    let subHtml = "";

    const previewLetters = adminPreviewUGOnly ? ["A", "B"] : ["A", "B", "C"];

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

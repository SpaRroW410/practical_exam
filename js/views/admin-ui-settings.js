// ============================================================
// Community Medicine Examination System
// Admin — UI Settings
//
// Lets a coordinator adjust the exam's text-sizing ceilings for a
// specific room/projector — live, per-machine, no redeploy (see
// js/ui-settings.js for the localStorage-backed read/write/apply
// logic this screen is just a form over). Follows the same shape as
// js/views/admin-rebuild.js (own renderPage(), BACK TO ADMIN button,
// fresh state each visit) and reuses that screen's live-preview modal
// CSS (css/admin-rebuild.css's now-unscoped .editor-preview-modal
// rules) and JS builders (js/views/admin-preview.js's
// buildWrittenPreviewHTML()/buildSpotterPreviewHTML()) — only one
// Admin screen is ever on-page at a time, so sharing the same element
// ids/classes across the two screens is safe.
// ============================================================

const UI_SETTING_FIELDS = [

    { key: "scenarioMaxWithImage", label: "Scenario size — with image (px)", min: 20, max: 80 },

    { key: "subQuestionMax", label: "Sub-question size (px)", min: 20, max: 80 },

    { key: "scenarioMaxNoImage", label: "Scenario size — no image (px)", min: 20, max: 100 },

    { key: "spotterSubQuestionMax", label: "Spotter question size (px)", min: 20, max: 100 },

    { key: "plotInstructionSize", label: "Plot Instruction size (px)", min: 16, max: 60 },

    { key: "plotInstructionSizeWithImage", label: "Plot Instruction size — with image (px)", min: 16, max: 60 }

];


function renderAdminUISettings() {

    appState.currentView = "admin-ui-settings";

    const current = loadUISettings();

    renderPage(`

        <section class="home-screen admin-ui-settings-screen">

            <div class="home-card" style="max-width: 700px;">

                <button
                    id="uiSettingsBack"
                    class="start-button print-button admin-back-button">

                    BACK TO ADMIN

                </button>

                <h2>UI Settings</h2>

                <p>

                    Adjusts how large exam text is allowed to grow, for this
                    machine/projector only. Changes apply immediately — no
                    reload, no effect on any other machine.

                </p>

                <div class="selector-grid">

                    ${UI_SETTING_FIELDS.map(function(field){

                        return `

                            <div class="selector">

                                <label>${field.label}</label>

                                <input
                                    type="number"
                                    id="uiSetting_${field.key}"
                                    min="${field.min}"
                                    max="${field.max}"
                                    value="${current[field.key]}"
                                    style="width:100%; box-sizing:border-box;">

                            </div>

                        `;

                    }).join("")}

                </div>

                <div class="home-actions">

                    <button id="saveUISettingsBtn" class="start-button">SAVE SETTINGS</button>

                    <button id="resetUISettingsBtn" class="start-button print-button">RESET TO DEFAULTS</button>

                    <button id="previewUISettingsBtn" class="start-button print-button">PREVIEW SAMPLE QUESTION</button>

                </div>

                <div id="uiSettingsStatus" class="rebuild-status rebuild-status--idle" style="display:none;"></div>

            </div>

            <!-- Same shape/CSS as js/views/admin-rebuild.js's live preview —
                 a full-viewport overlay, not a renderPage() navigation, so
                 the settings form underneath is never lost. -->
            <div id="editorPreviewModal" class="editor-preview-modal" style="display:none;">

                <div class="editor-preview-modal-header">

                    <div class="editor-preview-level-toggle">
                        <label><input type="radio" name="previewLevel" value="pg" checked> PG</label>
                        <label><input type="radio" name="previewLevel" value="ug"> UG</label>
                    </div>

                    <button type="button" id="closePreviewBtn" class="start-button print-button">CLOSE PREVIEW</button>

                </div>

                <section class="exam-screen" id="editorPreviewContent"></section>

            </div>

        </section>

    `);

    document.getElementById("uiSettingsBack").onclick = renderAdminScreen;

    const statusEl = document.getElementById("uiSettingsStatus");

    function setStatus(kind, text) {

        statusEl.style.display = "block";

        statusEl.className = "rebuild-status rebuild-status--" + kind;

        statusEl.textContent = text;

    }

    function readFormValues() {

        const values = {};

        UI_SETTING_FIELDS.forEach(function(field){

            const raw = Number(document.getElementById("uiSetting_" + field.key).value);

            values[field.key] = isNaN(raw) ? UI_SETTING_DEFAULTS[field.key] : raw;

        });

        return values;

    }

    function refillForm(values) {

        UI_SETTING_FIELDS.forEach(function(field){

            document.getElementById("uiSetting_" + field.key).value = values[field.key];

        });

    }

    document.getElementById("saveUISettingsBtn").onclick = function(){

        saveUISettings(readFormValues());

        setStatus("ok", "Saved — applied immediately on this machine.");

    };

    document.getElementById("resetUISettingsBtn").onclick = function(){

        resetUISettings();

        refillForm(UI_SETTING_DEFAULTS);

        setStatus("ok", "Reset to defaults.");

    };

    // ------------------------------------------------------------
    // Preview — a real question (the first image-bearing Biostatistics
    // one, so Plot Instruction is visible) rendered at whatever's
    // currently SAVED (uiSettings, applied live via CSS custom
    // properties + getUISetting() — see js/ui-settings.js), not the
    // form's possibly-unsaved values. Unlike Rebuild Data's preview
    // (which previews a genuinely unsaved draft row), settings here
    // apply immediately on Save, so there's no draft/commit gap to
    // bridge — Save first, then Preview shows the real effect.
    // ------------------------------------------------------------

    const sampleQuestion =
        appData.questions.biostatistics.find(
            q => q.Item_Type === "Question" && q.Image_File
        ) ||
        appData.questions.biostatistics.find(
            q => q.Item_Type === "Question"
        );

    const previewModal = document.getElementById("editorPreviewModal");

    function refreshPreview() {

        const level =
            document.querySelector('input[name="previewLevel"]:checked').value;

        const content = document.getElementById("editorPreviewContent");

        content.innerHTML =
            buildWrittenPreviewHTML(sampleQuestion, "biostatistics", level);

        fitTwoBandLayout(!!content.querySelector(".question-image"));

    }

    document.getElementById("previewUISettingsBtn").onclick = function(){

        if (!sampleQuestion) {

            setStatus("error", "No Biostatistics question available to preview.");

            return;

        }

        previewModal.style.display = "flex";

        refreshPreview();

    };

    document.getElementById("closePreviewBtn").onclick = function(){

        previewModal.style.display = "none";

    };

    Array.from(document.querySelectorAll('input[name="previewLevel"]')).forEach(function(radio){

        radio.addEventListener("change", function(){

            if (previewModal.style.display !== "none") refreshPreview();

        });

    });

}

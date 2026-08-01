// ============================================================
// Community Medicine Examination System
// Home Screen
// Version 1.0
// ============================================================

function renderHome() {

    renderPage(`

        <section class="home-screen">

            <div class="home-card">

                <h2>Setup Examination</h2>

                <p>Select one question from each section.</p>

                <div class="selector">

                    <label>Examination Level</label>

                    <select id="examLevel">
                        <option value="UG">Undergraduate</option>
                        <option value="PG">Postgraduate</option>
                    </select>

                </div>

                <div class="selector">

                    <label>Clinical Case</label>

                    <select id="clinical"></select>

                </div>

                <div class="selector">

                    <label>Epidemiology</label>

                    <select id="epidemiology"></select>

                </div>

                <div class="selector">

                    <label>Biostatistics</label>

                    <select id="biostatistics"></select>

                </div>

                <div class="selector">

                    <label>OSPE</label>

                    <select id="ospe"></select>

                </div>

                <div class="selector">

                    <label>Spotter Set</label>

                    <select id="spotter"></select>

                </div>

                <button
                    id="startExam"
                    class="start-button">

                    START EXAM

                </button>

            </div>

        </section>

    `);

    populateQuestionDropdowns();

    document
        .getElementById("startExam")
        .addEventListener("click", startExam);

}

function populateQuestionDropdowns() {

    const sections = [

        "clinical",

        "epidemiology",

        "biostatistics",

        "ospe",

        "spotter"

    ];

    sections.forEach(function(section){

        const select =
            document.getElementById(section);

        if(!select) return;

        select.innerHTML = "";

        const total =
            appData.questions[section].length;

        for(let i=1;i<=total;i++){

            const option =
                document.createElement("option");

            option.value = i;

            option.textContent = i;

            select.appendChild(option);

        }

    });

}
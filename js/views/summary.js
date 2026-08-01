
// ============================================================
// Community Medicine Examination System
// Summary Screen
// ============================================================

function renderSummary() {

    appState.currentView = "summary";

    stopSectionTimer();

    stopOverallTimer();

    renderPage(`

        <section class="summary-screen">

            <div class="summary-card">

                <h1>

                    Examination Completed

                </h1>

                <hr>

                <table class="summary-table">

                    <tr>

                        <th>

                            Examination Level

                        </th>

                        <td>

                            ${appState.examLevel}

                        </td>

                    </tr>

                    <tr>

                        <th>

                            Clinical Case

                        </th>

                        <td>

                            ${appState.exam.clinical}

                        </td>

                    </tr>

                    <tr>

                        <th>

                            Epidemiology

                        </th>

                        <td>

                            ${appState.exam.epidemiology}

                        </td>

                    </tr>

                    <tr>

                        <th>

                            Biostatistics

                        </th>

                        <td>

                            ${appState.exam.biostatistics}

                        </td>

                    </tr>

                    <tr>

                        <th>

                            OSPE

                        </th>

                        <td>

                            ${appState.exam.ospe}

                        </td>

                    </tr>

                    <tr>

                        <th>

                            Spotter Set

                        </th>

                        <td>

                            ${appState.exam.spotter}

                        </td>

                    </tr>

                    <tr>

                        <th>

                            Total Time

                        </th>

                        <td>

                            ${formatTime(
                                appState.timer.overall
                            )}

                        </td>

                    </tr>

                </table>

                <div class="summary-buttons">

                    <button
                        id="restartExam">

                        Restart Examination

                    </button>

                    <button
                        id="closeExam">

                        Exit

                    </button>

                </div>

            </div>

        </section>

    `);

    document
        .getElementById("restartExam")
        .onclick = restartExam;

    document
        .getElementById("closeExam")
        .onclick = function () {

            location.reload();

        };

}



// ============================================================
// Restart
// ============================================================

function restartExam() {

    resetTimers();

    appState.currentSection = 0;

    renderHome();

}
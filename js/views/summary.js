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

                            ${
                                appState.exam.spotter === "random"
                                    ? "Random"
                                    : appState.exam.spotter
                            }

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
                        id="printExam">

                        Print / Save PDF

                    </button>

                    <button
                        id="closeExam">

                        End Exam

                    </button>

                </div>

            </div>

        </section>

    `);

    document
        .getElementById("printExam")
        .onclick = printExamToPDF;

    document
        .getElementById("closeExam")
        .onclick = function () {

            window.close();

            // Browsers only allow script-driven window.close()
            // on a tab/window that was itself opened by script;
            // for a normally-navigated tab it's silently ignored,
            // so fall back to telling the examiner to close it.

            setTimeout(function () {

                renderPage(`

                    <section class="home-screen">

                        <div class="home-card">

                            <h2>Examination Ended</h2>

                            <p>You may now close this window/tab.</p>

                        </div>

                    </section>

                `);

            }, 200);

        };

}

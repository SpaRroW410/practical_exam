// ============================================================
// Community Medicine Examination System
// Access Screen
// Version 1.0
// ============================================================


// ------------------------------------------------------------
// Render Access Screen
// ------------------------------------------------------------

function renderPasswordScreen() {

    appState.currentView = "password";

    renderPage(`

        <section class="home-screen">

            <div class="home-card">

                <h2>Restricted Access</h2>

                <p>Enter the access code to continue.</p>

                <div class="selector">

                    <label>Access Code</label>

                    <input
                        type="password"
                        id="accessCode"
                        autocomplete="off"
                        style="width:100%; padding:10px; box-sizing:border-box; font-size:16px;">

                </div>

                <p
                    id="accessError"
                    style="color:#c0392b; display:none;">

                    Incorrect code. Please try again.

                </p>

                <button
                    id="accessSubmit"
                    class="start-button">

                    ENTER

                </button>

            </div>

        </section>

    `);

    const input = document.getElementById("accessCode");

    const button = document.getElementById("accessSubmit");

    const error = document.getElementById("accessError");

    function attemptAccess() {

        if (input.value === APP_CONFIG.ACCESS_CODE) {

            renderHome();

        }

        else {

            error.style.display = "block";

            input.value = "";

            input.focus();

        }

    }

    button.onclick = attemptAccess;

    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            attemptAccess();

        }

    });

    input.focus();

}

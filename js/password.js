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

                <p style="text-align:center; margin-top:18px;">

                    <a
                        href="#"
                        id="adminLink"
                        style="color:#666; font-size:18px;">

                        Admin — Question Bank

                    </a>

                </p>

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

    document
        .getElementById("adminLink")
        .onclick = function (event) {

            event.preventDefault();

            renderAdminLogin();

        };

    input.focus();

}


// ------------------------------------------------------------
// Admin Login (question bank — separate code from ACCESS_CODE)
// ------------------------------------------------------------

function renderAdminLogin() {

    appState.currentView = "adminLogin";

    renderPage(`

        <section class="home-screen">

            <div class="home-card">

                <h2>Admin Access</h2>

                <p>Enter the admin code to open the question bank.</p>

                <div class="selector">

                    <label>Admin Code</label>

                    <input
                        type="password"
                        id="adminCode"
                        autocomplete="off"
                        style="width:100%; padding:10px; box-sizing:border-box; font-size:16px;">

                </div>

                <p
                    id="adminError"
                    style="color:#c0392b; display:none;">

                    Incorrect code. Please try again.

                </p>

                <div class="home-actions">

                    <button
                        id="adminBack"
                        class="start-button print-button">

                        BACK

                    </button>

                    <button
                        id="adminSubmit"
                        class="start-button">

                        ENTER

                    </button>

                </div>

            </div>

        </section>

    `);

    const input = document.getElementById("adminCode");

    const error = document.getElementById("adminError");

    function attemptAdmin() {

        if (input.value === APP_CONFIG.ADMIN_CODE) {

            renderAdminScreen();

        }

        else {

            error.style.display = "block";

            input.value = "";

            input.focus();

        }

    }

    document.getElementById("adminSubmit").onclick = attemptAdmin;

    document.getElementById("adminBack").onclick = renderPasswordScreen;

    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            attemptAdmin();

        }

    });

    input.focus();

}

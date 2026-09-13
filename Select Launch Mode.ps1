# ============================================================
# Community Medicine Examination System
# Launch Mode Picker (Windows)
#
# Small popup shown by "Start Exam System.bat" before it launches
# anything: lets the person at the keyboard choose Exam Mode (kiosk,
# for candidates) or Admin Mode (normal window, for prep/review) at
# launch time, instead of having to remember which .bat file to
# double-click. Exits with a distinct code the caller reads back via
# %ERRORLEVEL%: 1 = Exam Mode, 2 = Admin Mode, 0 = dialog closed
# without a choice (nothing should be launched).
# ============================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

[System.Windows.Forms.Application]::EnableVisualStyles()

$choice = 0

$form = New-Object System.Windows.Forms.Form
$form.Text = "Community Medicine Examination System"
$form.Size = New-Object System.Drawing.Size(480, 280)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.TopMost = $true

$label = New-Object System.Windows.Forms.Label
$label.Text = "How do you want to launch the Exam System?"
$label.Font = New-Object System.Drawing.Font("Segoe UI", 11)
$label.TextAlign = "MiddleCenter"
$label.Size = New-Object System.Drawing.Size(440, 40)
$label.Location = New-Object System.Drawing.Point(10, 15)
$form.Controls.Add($label)

$examButton = New-Object System.Windows.Forms.Button
$examButton.Text = "EXAM MODE`n(Kiosk - for candidates)"
$examButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$examButton.Size = New-Object System.Drawing.Size(200, 90)
$examButton.Location = New-Object System.Drawing.Point(20, 70)
$examButton.Add_Click({
    $script:choice = 1
    $form.Close()
})
$form.Controls.Add($examButton)

$adminButton = New-Object System.Windows.Forms.Button
$adminButton.Text = "ADMIN MODE`n(Normal window - for prep/review)"
$adminButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$adminButton.Size = New-Object System.Drawing.Size(200, 90)
$adminButton.Location = New-Object System.Drawing.Point(240, 70)
$adminButton.Add_Click({
    $script:choice = 2
    $form.Close()
})
$form.Controls.Add($adminButton)

$hint = New-Object System.Windows.Forms.Label
$hint.Text = "Admin Mode opens a normal, resizable window you can minimize or snap side-by-side. Exam Mode locks the screen for a timed exam (Alt+F4 to exit)."
$hint.Font = New-Object System.Drawing.Font("Segoe UI", 8)
$hint.ForeColor = [System.Drawing.Color]::DimGray
$hint.TextAlign = "MiddleCenter"
$hint.Size = New-Object System.Drawing.Size(440, 70)
$hint.Location = New-Object System.Drawing.Point(10, 170)
$form.Controls.Add($hint)

$form.AcceptButton = $examButton

[void]$form.ShowDialog()
$form.Dispose()

exit $choice

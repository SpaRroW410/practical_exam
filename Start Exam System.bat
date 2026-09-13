@echo off
setlocal enabledelayedexpansion

rem ============================================================
rem Community Medicine Examination System
rem Offline Launcher (Windows)
rem
rem Resolves its own folder via %~dp0 so this works no matter what
rem drive letter the pendrive gets assigned on a given PC. Shows a
rem small mode-picker popup first (Select Launch Mode.ps1): Exam
rem Mode continues below exactly as before; Admin Mode hands off to
rem "Start Admin Mode.bat" for a normal, minimizable/resizable
rem window suited to prep and review work instead of a locked-down
rem kiosk (see that file for details - it can also be double-clicked
rem directly to skip this picker). Tries Edge first (bundled with
rem Windows 10/11), then Chrome, then falls back to opening the
rem default browser without kiosk mode.
rem
rem Kiosk mode hides the address bar and tabs, so there is nothing
rem for a candidate to click out of during the exam. To exit,
rem press Alt+F4.
rem ============================================================

set "APPDIR=%~dp0"
set "APPFILE=%APPDIR%index.html"
set "PICKER=%APPDIR%Select Launch Mode.ps1"

if not exist "%APPFILE%" (
    echo Could not find index.html next to this launcher.
    echo Expected: %APPFILE%
    pause
    exit /b 1
)

rem --- Ask which mode to launch in ---

set "MODECHOICE=1"
set "USE_POPUP=0"

where powershell >nul 2>nul && if exist "%PICKER%" set "USE_POPUP=1"

if "%USE_POPUP%"=="1" (
    powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%PICKER%"
    set "MODECHOICE=!errorlevel!"
) else (
    echo PowerShell or the mode-picker script was not found - falling back to a text prompt.
    choice /c EA /n /m "Press E for Exam Mode (kiosk), A for Admin Mode (normal window): "
    if !errorlevel! geq 2 (set "MODECHOICE=2") else (set "MODECHOICE=1")
)

if "%MODECHOICE%"=="2" (
    call "%APPDIR%Start Admin Mode.bat"
    goto :done
)

if not "%MODECHOICE%"=="1" (
    rem Dialog closed with no choice made - exit quietly, nothing launched.
    goto :done
)

rem --- MODECHOICE=1 (Exam Mode): continue with the kiosk launch below ---

rem --- Locate Microsoft Edge ---

set "EDGE="

where msedge >nul 2>nul && set "EDGE=msedge"

if not defined EDGE if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
)

if not defined EDGE if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
)

if not defined EDGE if exist "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" (
    set "EDGE=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
)

if defined EDGE (
    echo Starting in Microsoft Edge, kiosk mode. Press Alt+F4 to exit.
    start "" "%EDGE%" --kiosk "%APPFILE%" --edge-kiosk-type=fullscreen --no-first-run --disable-session-crashed-bubble
    goto :done
)

rem --- Locate Google Chrome ---

set "CHROME="

where chrome >nul 2>nul && set "CHROME=chrome"

if not defined CHROME if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
)

if not defined CHROME if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
)

if not defined CHROME if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if defined CHROME (
    echo Starting in Google Chrome, kiosk mode. Press Alt+F4 to exit.
    start "" "%CHROME%" --kiosk "%APPFILE%" --no-first-run
    goto :done
)

rem --- Neither found: open normally, no kiosk mode ---

echo Could not find Microsoft Edge or Google Chrome installed.
echo Opening in your default browser instead ^(no kiosk / fullscreen^).
start "" "%APPFILE%"

:done
endlocal

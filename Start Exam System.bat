@echo off
setlocal enabledelayedexpansion

rem ============================================================
rem Community Medicine Examination System
rem Offline Launcher (Windows)
rem
rem Resolves its own folder via %~dp0 so this works no matter what
rem drive letter the pendrive gets assigned on a given PC. Tries
rem Edge first (bundled with Windows 10/11), then Chrome, then
rem falls back to opening the default browser without kiosk mode.
rem
rem Kiosk mode hides the address bar and tabs, so there is nothing
rem for a candidate to click out of during the exam. To exit,
rem press Alt+F4.
rem ============================================================

set "APPDIR=%~dp0"
set "APPFILE=%APPDIR%index.html"

if not exist "%APPFILE%" (
    echo Could not find index.html next to this launcher.
    echo Expected: %APPFILE%
    pause
    exit /b 1
)

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

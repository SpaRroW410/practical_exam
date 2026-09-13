@echo off
setlocal enabledelayedexpansion

rem ============================================================
rem Community Medicine Examination System
rem Admin Mode Launcher (Windows) - normal window, not kiosk
rem
rem Opens the same app as "Start Exam System.bat", but in a normal,
rem maximized browser window (title bar, minimize/restore/close)
rem instead of kiosk mode, so it can be minimized or snapped
rem side-by-side with another window using the OS's own window
rem controls. Intended for admin / question-bank prep and review
rem work - never for a candidate during a timed exam (use Exam Mode
rem in Start Exam System.bat's launch picker for that instead).
rem
rem Can be double-clicked directly, or reached via the "ADMIN MODE"
rem button in Start Exam System.bat's launch picker.
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
    echo Starting in Microsoft Edge, normal window ^(maximized, not kiosk^).
    start "" "%EDGE%" --start-maximized "%APPFILE%" --no-first-run --disable-session-crashed-bubble
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
    echo Starting in Google Chrome, normal window ^(maximized, not kiosk^).
    start "" "%CHROME%" --start-maximized "%APPFILE%" --no-first-run
    goto :done
)

rem --- Neither found: open normally, no kiosk mode ---

echo Could not find Microsoft Edge or Google Chrome installed.
echo Opening in your default browser instead.
start "" "%APPFILE%"

:done
endlocal

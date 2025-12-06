@echo off
echo Updating extension icon...

copy /Y "C:\Users\sadin\.gemini\antigravity\brain\66c9cb48-fe71-4d03-bc59-52b3f7fe642a\pokeball_glass_icon_1765046148327.png" "assets\icon.png"

if %ERRORLEVEL% EQU 0 (
    echo Icon updated successfully!
) else (
    echo Failed to update icon.
)

pause

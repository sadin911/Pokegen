@echo off
echo Setting up Gemini Showdown Visualizer...

if not exist "assets" (
    echo Creating assets directory...
    mkdir assets
)

echo Copying icon...
copy "C:\Users\sadin\.gemini\antigravity\brain\66c9cb48-fe71-4d03-bc59-52b3f7fe642a\pokeball_glass_icon_1765046148327.png" "assets\icon.png"

if %ERRORLEVEL% EQU 0 (
    echo Icon copied successfully!
) else (
    echo Failed to copy icon. Please check if the source file exists.
)

echo Setup complete!
pause

@echo off
echo ==============================================
echo        Pushing Project to GitHub...
echo ==============================================
echo.

echo [1/6] Initializing git repository (just in case)...
git init

echo [2/6] Adding all files to staging (forcing server directory)...
git add -f server
git add -A

echo [3/6] Committing changes...
git commit --allow-empty -m "Deploy update: unified backend and server directory"

echo [4/6] Setting main branch...
git branch -M main

echo [5/6] Connecting to GitHub repository...
git remote add origin https://github.com/SaranyaChowdary-05/FULLSTACK-PROJECT-2.git
git remote set-url origin https://github.com/SaranyaChowdary-05/FULLSTACK-PROJECT-2.git

echo [6/6] Pushing files to GitHub (force pushing to overwrite remote web uploads)...
git push -f -u origin main

echo.
echo ==============================================
echo    Process complete! 
echo ==============================================
echo.
echo If you saw an error above, please copy it or tell me what it says!
echo.
pause

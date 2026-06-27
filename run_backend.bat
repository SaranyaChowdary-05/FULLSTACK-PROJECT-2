@echo off
echo ========================================================
echo Starting Spring Boot Backend
echo ========================================================
echo Make sure you have Maven installed (mvn) or use your IDE
cd backend
echo Starting Spring Boot via HTTP on port 8080...
call mvn spring-boot:run
pause

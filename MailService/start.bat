@echo off
echo Starting PrivacyGuard MailService...
echo.
echo Service will be available at: http://localhost:3001
echo Health check: http://localhost:3001/health
echo Debug dashboard: http://localhost:3001/api/debug/health
echo.
echo Press Ctrl+C to stop the service
echo.
cd /d "%~dp0"
npm start

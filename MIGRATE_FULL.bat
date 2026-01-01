@echo off
cls
echo ================================================
echo   FULL MIGRATION - PostgreSQL Direct
echo ================================================
echo.
echo Installing pg module...
call pnpm add pg
echo.
echo ================================================
echo   Starting Migration...
echo ================================================
echo.
echo FROM: linnqtixdfjwbrixitrb (OLD)
echo TO:   peaulqbbvgzpnwshtbok (NEW)
echo.
echo Password: Vtdlv57XcKQlxtH6
echo.
echo ================================================
echo.

node migrate-pg.js

echo.
echo ================================================
echo   DONE!
echo ================================================
pause

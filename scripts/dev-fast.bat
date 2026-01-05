@echo off
echo 🚀 Starting Fast Development Mode...

echo 🧹 Cleaning cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 📦 Installing dependencies (if needed)...
npm install --prefer-offline --no-audit --no-fund

echo 🔥 Starting development server with optimizations...
set NODE_ENV=development
set NEXT_TELEMETRY_DISABLED=1
npm run dev

pause
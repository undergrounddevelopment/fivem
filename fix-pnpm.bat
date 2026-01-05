@echo off
echo Fixing pnpm store corruption...

echo Step 1: Clearing pnpm store...
pnpm store prune

echo Step 2: Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo Step 3: Removing pnpm-lock.yaml...
if exist pnpm-lock.yaml del pnpm-lock.yaml

echo Step 4: Clean install...
pnpm install

echo Fixed! You can now run: pnpm dev
pause
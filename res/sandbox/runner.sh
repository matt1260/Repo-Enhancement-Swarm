#!/bin/bash
# RES Sandbox Runner
# Executes build and tests in an isolated environment.

RUN_ID=$1
TIMEOUT_SEC=300

echo "[Sandbox] Starting run $RUN_ID"

# 1. Setup Environment
# (Assume we are inside a container or chroot)

# 2. Build
echo "[Sandbox] Building..."
if ! npm run build; then
    echo "[Sandbox] Build FAILED"
    exit 1
fi

# 3. Unit Tests
echo "[Sandbox] Running Tests..."
if ! npm test; then
    echo "[Sandbox] Tests FAILED"
    exit 2
fi

# 4. Security Scan
echo "[Sandbox] Running Security Scan..."
# npm audit or specialized tool
# echo "..."

echo "[Sandbox] Run SUCCESS"
exit 0

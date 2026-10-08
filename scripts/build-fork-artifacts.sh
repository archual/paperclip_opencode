#!/usr/bin/env bash
#
# Compiles the fork's runtime artifacts on the host for docker/Dockerfile.fork.
# The Docker build copies these outputs instead of compiling inside the image,
# because the Docker host has limited memory. Workspace packages resolve to
# TypeScript sources through the tsx loader at runtime, so only the UI bundle,
# the plugin SDK, the runner TypeScript surface, and the server need compiling.
set -euo pipefail

cd "$(dirname "$0")/.."

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=3072}"
export PAPERCLIP_BUILD_COMMIT="${PAPERCLIP_BUILD_COMMIT:-$(git rev-parse HEAD)}"

pnpm --filter @paperclipai/ui build
pnpm --filter @paperclipai/plugin-sdk build
pnpm --filter @paperclipai/paperclip-runner build:typescript

cd server
pnpm exec tsc
mkdir -p dist/onboarding-assets dist/built-ins dist/services/scripts dist/vendor/paperclip-runner
cp -R src/onboarding-assets/. dist/onboarding-assets/
cp -R src/built-ins/. dist/built-ins/
cp -R src/services/scripts/. dist/services/scripts/
cp -Rf ../packages/paperclip-runner/dist/. dist/vendor/paperclip-runner/
node scripts/write-build-stamp.mjs
test -f dist/index.js

#!/bin/bash

# Deploy script for The Design Council Webapp
# Usage: ./scripts/deploy.sh [target]
# Targets: all, auth, admin, student, rules

set -e

TARGET=${1:-all}

echo "🚀 Starting deployment..."
echo "Target: $TARGET"
echo ""

# Build all packages first
echo "📦 Building packages..."
pnpm build

# Deploy based on target
case $TARGET in
  "all")
    echo "🔥 Deploying all apps to Firebase..."
    cd firebase
    firebase deploy --only hosting
    firebase deploy --only firestore:rules
    ;;
  "auth")
    echo "🔥 Deploying Auth app..."
    cd firebase
    firebase deploy --only hosting:auth
    ;;
  "admin")
    echo "🔥 Deploying Admin app..."
    cd firebase
    firebase deploy --only hosting:admin
    ;;
  "student")
    echo "🔥 Deploying Student app..."
    cd firebase
    firebase deploy --only hosting:student
    ;;
  "rules")
    echo "🔥 Deploying Firestore rules..."
    cd firebase
    firebase deploy --only firestore:rules
    ;;
  *)
    echo "❌ Unknown target: $TARGET"
    echo "Available targets: all, auth, admin, student, rules"
    exit 1
    ;;
esac

echo ""
echo "✅ Deployment complete!"

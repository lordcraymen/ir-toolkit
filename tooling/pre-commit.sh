#!/bin/sh

# Pre-commit hook to ensure code quality
echo "🔍 Running pre-commit checks..."

# Run lint
echo "1️⃣  Linting..."
npm run lint --silent
if [ $? -ne 0 ]; then
  echo "❌ Lint failed. Please fix errors before committing."
  exit 1
fi

# Run typecheck
echo "2️⃣  Type checking..."
npm run typecheck --silent
if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Please fix errors before committing."
  exit 1
fi

# Run tests
echo "3️⃣  Testing..."
npm run test --silent
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix errors before committing."
  exit 1
fi

echo "✅ All pre-commit checks passed!"
exit 0

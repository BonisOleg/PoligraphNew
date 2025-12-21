#!/bin/bash

echo "🔍 Running pre-commit checks..."

# lint-staged обробляє тільки staged files
npx lint-staged

# Кастомні перевірки на всьому проєкті (швидкі)
ERROR_COUNT=0

# Django template tags (критично)
bash scripts/check_template_tags.sh || ((ERROR_COUNT++))

if [ $ERROR_COUNT -gt 0 ]; then
  echo ""
  echo "❌ Pre-commit checks failed!"
  echo ""
  echo "Quick fixes:"
  echo "  npm run fix:rules    # Auto-fix common issues"
  echo "  npm run lint:fix     # Fix linter issues"
  echo "  npm run check:rules  # Run full check"
  exit 1
fi

echo "✅ All pre-commit checks passed!"
exit 0



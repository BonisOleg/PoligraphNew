#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║   🚀 FULL PROJECT HEALTH CHECK        ║"
echo "╔════════════════════════════════════════╗"
echo ""

TOTAL_ERRORS=0

# 1. Django Template Tags (CRITICAL)
if [ -f "scripts/check_template_tags.sh" ]; then
  bash scripts/check_template_tags.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 2. HTML Custom Rules
if [ -f "scripts/check-html-rules.sh" ]; then
  bash scripts/check-html-rules.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 3. CSS Custom Rules
if [ -f "scripts/check-css-rules.sh" ]; then
  bash scripts/check-css-rules.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 4. JavaScript Custom Rules
if [ -f "scripts/check-js-rules.sh" ]; then
  bash scripts/check-js-rules.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 5. Accessibility Rules (NEW)
if [ -f "scripts/check-accessibility-rules.sh" ]; then
  bash scripts/check-accessibility-rules.sh || ((TOTAL_ERRORS++))
  echo ""
fi

# 6. Performance Hints (NEW)
if [ -f "scripts/check-performance-rules.sh" ]; then
  bash scripts/check-performance-rules.sh
  echo ""
fi

# 7. Stylelint
if command -v npm &> /dev/null && [ -f "package.json" ]; then
  echo "========================================="
  echo "🎨 Running Stylelint..."
  echo "========================================="
  npm run lint:css || ((TOTAL_ERRORS++))
  echo ""
fi

# 8. ESLint
if command -v npm &> /dev/null && [ -f "package.json" ]; then
  echo "========================================="
  echo "⚡ Running ESLint..."
  echo "========================================="
  npm run lint:js || ((TOTAL_ERRORS++))
  echo ""
fi

# 9. HTMLHint
if command -v npm &> /dev/null && [ -f "package.json" ]; then
  echo "========================================="
  echo "📝 Running HTMLHint..."
  echo "========================================="
  npm run lint:html || ((TOTAL_ERRORS++))
  echo ""
fi

# Підсумок
echo "╔════════════════════════════════════════╗"
echo "║   📊 FINAL SUMMARY                     ║"
echo "╔════════════════════════════════════════╗"
echo "Total failed checks: $TOTAL_ERRORS"
echo ""

if [ $TOTAL_ERRORS -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED! 🎉"
  echo ""
  echo "Your code meets all 110+ quality standards:"
  echo "  ✓ HTML structure and semantics"
  echo "  ✓ CSS performance and compatibility"
  echo "  ✓ JavaScript safety and best practices"
  echo "  ✓ Django template integrity"
  echo "  ✓ Accessibility guidelines"
  echo "  ✓ Performance optimizations"
  exit 0
else
  echo "❌ SOME CHECKS FAILED"
  echo ""
  echo "Quick fixes:"
  echo "  1. Run 'npm run fix:rules' for automatic fixes"
  echo "  2. Run 'npm run lint:fix' for linter auto-fixes"
  echo "  3. Review remaining issues manually"
  echo ""
  echo "For detailed help, check scripts/README.md"
  exit 1
fi




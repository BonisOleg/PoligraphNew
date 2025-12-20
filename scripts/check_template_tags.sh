#!/bin/bash
set -e

echo "========================================="
echo "🔖 Django Template Tags Check"
echo "========================================="

ERROR_COUNT=0

HTML_FILES=$(find templates -name "*.html" 2>/dev/null || echo "")

if [ -z "$HTML_FILES" ]; then
  echo "⚠️  No template files found"
  exit 0
fi

echo ""
echo "🚫 [CRITICAL] Checking for broken Django template tags..."

# Перевірка 1: {{ на одному рядку (використовуємо perl для крос-платформенності)
BROKEN_VAR=$(echo "$HTML_FILES" | xargs perl -nle 'print "$ARGV:$.: $_" if /\{\{[^}]*\n/' 2>/dev/null || echo "")
if [ -n "$BROKEN_VAR" ]; then
  echo "❌ Found {{ }} tags broken across lines:"
  echo "$BROKEN_VAR" | head -n 10
  ((ERROR_COUNT++))
fi

# Перевірка 2: {% на одному рядку
BROKEN_BLOCK=$(echo "$HTML_FILES" | xargs perl -nle 'print "$ARGV:$.: $_" if /\{%[^%]*\n.*?%\}/' 2>/dev/null || echo "")
if [ -n "$BROKEN_BLOCK" ]; then
  echo "❌ Found {% %} tags broken across lines:"
  echo "$BROKEN_BLOCK" | head -n 10
  ((ERROR_COUNT++))
fi

if [ $ERROR_COUNT -eq 0 ]; then
  echo "✅ All Django template tags are on single lines"
fi

echo ""
echo "========================================="
echo "📊 Django Template Summary"
echo "========================================="
echo "Errors: $ERROR_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ Django template check FAILED"
  echo ""
  echo "🔧 How to fix:"
  echo "   - Keep {{ variable }} on one line"
  echo "   - Keep {% tag %} on one line"
  echo "   - Use {% with %} for complex expressions"
  exit 1
else
  echo "✅ Django template check PASSED"
  exit 0
fi


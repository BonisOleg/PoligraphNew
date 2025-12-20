#!/bin/bash
set -e

echo "========================================="
echo "🎨 CSS Custom Rules Check"
echo "========================================="

ERROR_COUNT=0
WARNING_COUNT=0

CSS_FILES=$(find static/css -name "*.css" ! -name "normalize.css" 2>/dev/null || echo "")

if [ -z "$CSS_FILES" ]; then
  echo "⚠️  No CSS files found"
  exit 0
fi

# Правило 1: 100vh fallback
echo ""
echo "📐 [Rule 1/12] Checking 100vh fallback..."
VH_ISSUES=$(echo "$CSS_FILES" | while read -r file; do
  grep -n '100vh' "$file" | while IFS=: read -r linenum line; do
    context=$(sed -n "$((linenum-1)),$((linenum+2))p" "$file")
    if ! echo "$context" | grep -qE '100dvh|Fallback'; then
      echo "$file:$linenum: $line"
    fi
  done
done)

if [ -n "$VH_ISSUES" ]; then
  echo "❌ Found 100vh without 100dvh fallback:"
  echo "$VH_ISSUES"
  ((ERROR_COUNT++))
else
  echo "✅ All 100vh declarations have fallback"
fi

# Правило 2: safe-area-inset usage
echo ""
echo "📱 [Rule 2/12] Checking safe-area-inset usage..."
SAFE_AREA=$(echo "$CSS_FILES" | xargs grep -c 'env(safe-area-inset-' | grep -v ':0$' || echo "")
if [ -z "$SAFE_AREA" ]; then
  echo "⚠️  No safe-area-inset usage (may need for iOS notch)"
  ((WARNING_COUNT++))
else
  echo "✅ safe-area-inset is used"
fi

# Правило 3: font-size в rem
echo ""
echo "🔤 [Rule 3/12] Checking font-size units..."
PX_FONTS=$(echo "$CSS_FILES" | xargs grep -n 'font-size:.*px' || echo "")
if [ -n "$PX_FONTS" ]; then
  echo "⚠️  font-size in px (recommend rem for accessibility):"
  echo "$PX_FONTS" | head -n 5
  ((WARNING_COUNT++))
else
  echo "✅ All font-sizes use rem"
fi

# Правило 4: flex shorthand
echo ""
echo "📦 [Rule 4/12] Checking flex shorthand..."
FLEX_ISSUES=$(echo "$CSS_FILES" | xargs grep -nE 'flex:\s*1\s*;' || echo "")
if [ -n "$FLEX_ISSUES" ]; then
  echo "❌ Found 'flex: 1;' without explicit flex-basis:"
  echo "$FLEX_ISSUES"
  ((ERROR_COUNT++))
else
  echo "✅ All flex shorthands are explicit"
fi

# Правило 5: hover в media query
echo ""
echo "🖱️  [Rule 5/12] Checking hover effects..."
UNCHECKED_HOVERS=$(echo "$CSS_FILES" | while read -r file; do
  awk '
    /@media.*\(hover: hover\)/ { in_media=1; next }
    /^}/ { if (in_media && --brace_count == 0) in_media=0 }
    /@media.*\(hover: hover\)/ { brace_count++ }
    /:hover/ { if (!in_media) print FILENAME":"NR":"$0 }
  ' "$file"
done)

if [ -n "$UNCHECKED_HOVERS" ]; then
  echo "⚠️  :hover outside @media (hover: hover):"
  echo "$UNCHECKED_HOVERS" | head -n 3
  ((WARNING_COUNT++))
else
  echo "✅ All :hover in @media (hover: hover)"
fi

# Правило 6: overscroll-behavior
echo ""
echo "📜 [Rule 6/12] Checking overscroll-behavior..."
OVERSCROLL=$(echo "$CSS_FILES" | xargs grep -c 'overscroll-behavior' | grep -v ':0$' || echo "")
if [ -z "$OVERSCROLL" ]; then
  echo "⚠️  No overscroll-behavior (recommend on body)"
  ((WARNING_COUNT++))
else
  echo "✅ overscroll-behavior found"
fi

# Правило 7: !important (ігноруємо коментарі)
echo ""
echo "🚫 [Rule 7/12] Checking for !important..."
# Використовуємо awk щоб ігнорувати коментарі (/* */ та //)
IMPORTANT=$(echo "$CSS_FILES" | xargs awk '
  /\/\*/ { in_comment=1; next }
  /\*\// { in_comment=0; next }
  /\/\// { next }
  !in_comment && /!important/ { print FILENAME":"NR":"$0 }
' || echo "")
if [ -n "$IMPORTANT" ]; then
  echo "❌ !important found (forbidden):"
  echo "$IMPORTANT"
  ((ERROR_COUNT++))
else
  echo "✅ No !important"
fi

# Правило 8: backdrop-filter prefix
echo ""
echo "🌫️  [Rule 8/12] Checking backdrop-filter prefix..."
BACKDROP_NO_PREFIX=$(echo "$CSS_FILES" | xargs grep -n 'backdrop-filter:' | while IFS=: read -r file line content; do
  prev_line=$((line - 1))
  prev_content=$(sed -n "${prev_line}p" "$file")
  if ! echo "$prev_content" | grep -q '\-webkit-backdrop-filter'; then
    echo "$file:$line:$content"
  fi
done)

if [ -n "$BACKDROP_NO_PREFIX" ]; then
  echo "⚠️  backdrop-filter without -webkit- prefix:"
  echo "$BACKDROP_NO_PREFIX"
  ((WARNING_COUNT++))
else
  echo "✅ backdrop-filter has prefix"
fi

# Правило 9: touch-action
echo ""
echo "👆 [Rule 9/12] Checking touch-action: manipulation..."
TOUCH_ACTION=$(echo "$CSS_FILES" | xargs grep -c 'touch-action: manipulation' | grep -v ':0$' || echo "")
if [ -z "$TOUCH_ACTION" ]; then
  echo "⚠️  No touch-action: manipulation (recommend for buttons/links)"
  ((WARNING_COUNT++))
else
  echo "✅ touch-action: manipulation found"
fi

# Правило 10: text-wrap для заголовків (NEW)
echo ""
echo "📝 [Rule 10/12] Checking text-wrap for headings..."
TEXT_WRAP=$(echo "$CSS_FILES" | xargs grep -c 'text-wrap: balance' | grep -v ':0$' || echo "")
if [ -z "$TEXT_WRAP" ]; then
  echo "ℹ️  No text-wrap: balance (optional for better typography)"
else
  echo "✅ text-wrap: balance found"
fi

# Правило 11: color-scheme (NEW)
echo ""
echo "🎨 [Rule 11/12] Checking color-scheme..."
COLOR_SCHEME=$(echo "$CSS_FILES" | xargs grep -c 'color-scheme' | grep -v ':0$' || echo "")
if [ -z "$COLOR_SCHEME" ]; then
  echo "ℹ️  No color-scheme defined (optional for dark mode support)"
else
  echo "✅ color-scheme found"
fi

# Правило 12: scrollbar-gutter (NEW)
echo ""
echo "📏 [Rule 12/12] Checking scrollbar-gutter..."
SCROLLBAR_GUTTER=$(echo "$CSS_FILES" | xargs grep -c 'scrollbar-gutter' | grep -v ':0$' || echo "")
if [ -z "$SCROLLBAR_GUTTER" ]; then
  echo "ℹ️  No scrollbar-gutter: stable (optional for layout stability)"
else
  echo "✅ scrollbar-gutter found"
fi

# Підсумок
echo ""
echo "========================================="
echo "📊 CSS Rules Summary"
echo "========================================="
echo "Errors: $ERROR_COUNT"
echo "Warnings: $WARNING_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ CSS rules check FAILED"
  exit 1
else
  echo "✅ CSS rules check PASSED"
  exit 0
fi


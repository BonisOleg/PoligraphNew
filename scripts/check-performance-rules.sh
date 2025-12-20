#!/bin/bash
set -e

echo "========================================="
echo "⚡ Performance Rules Check"
echo "========================================="

WARNING_COUNT=0

HTML_FILES=$(find templates -name "*.html" 2>/dev/null || echo "")
CSS_FILES=$(find static/css -name "*.css" ! -name "normalize.css" 2>/dev/null || echo "")
JS_FILES=$(find static/js -name "*.js" 2>/dev/null || echo "")

# Правило 1: loading="lazy" для images
echo ""
echo "🖼️  [Rule 1/5] Checking images for loading=\"lazy\"..."
IMG_NO_LAZY=$(echo "$HTML_FILES" | xargs grep -n '<img' | grep -v 'loading=' || echo "")
if [ -n "$IMG_NO_LAZY" ]; then
  echo "ℹ️  Images without loading=\"lazy\" (consider for off-screen images):"
  echo "$IMG_NO_LAZY" | head -n 3
  ((WARNING_COUNT++))
else
  echo "✅ Images have lazy loading"
fi

# Правило 2: will-change в CSS (не перебільшувати)
echo ""
echo "🎬 [Rule 2/5] Checking will-change usage..."
if [ -n "$CSS_FILES" ]; then
  WILL_CHANGE=$(echo "$CSS_FILES" | xargs grep -n 'will-change' || echo "")
  if [ -n "$WILL_CHANGE" ]; then
    COUNT=$(echo "$WILL_CHANGE" | wc -l)
    if [ $COUNT -gt 5 ]; then
      echo "⚠️  Too many will-change declarations ($COUNT) - use sparingly"
      ((WARNING_COUNT++))
    else
      echo "✅ will-change used appropriately"
    fi
  else
    echo "ℹ️  No will-change (consider for animations)"
  fi
fi

# Правило 3: Низькопродуктивні CSS animations
echo ""
echo "🎨 [Rule 3/5] Checking for low-performance animations..."
if [ -n "$CSS_FILES" ]; then
  BAD_ANIMATIONS=$(echo "$CSS_FILES" | xargs grep -nE 'animation.*\s+(width|height|top|left|margin|padding)' || echo "")
  if [ -n "$BAD_ANIMATIONS" ]; then
    echo "⚠️  Animations on layout properties (use transform/opacity):"
    echo "$BAD_ANIMATIONS" | head -n 3
    ((WARNING_COUNT++))
  else
    echo "✅ Animations use transform/opacity"
  fi
fi

# Правило 4: preconnect/dns-prefetch
echo ""
echo "🌐 [Rule 4/5] Checking for preconnect/dns-prefetch..."
PRECONNECT=$(echo "$HTML_FILES" | xargs grep -c 'rel="preconnect\|rel="dns-prefetch' | grep -v ':0$' || echo "")
if [ -z "$PRECONNECT" ]; then
  echo "ℹ️  No preconnect/dns-prefetch (consider for CDN/fonts)"
else
  echo "✅ Resource hints found"
fi

# Правило 5: async/defer для scripts
echo ""
echo "📜 [Rule 5/5] Checking script loading strategy..."
BLOCKING_SCRIPTS=$(echo "$HTML_FILES" | xargs grep -n '<script src=' | grep -v 'defer\|async' || echo "")
if [ -n "$BLOCKING_SCRIPTS" ]; then
  echo "⚠️  Blocking scripts found:"
  echo "$BLOCKING_SCRIPTS"
  ((WARNING_COUNT++))
else
  echo "✅ All scripts non-blocking"
fi

# Підсумок
echo ""
echo "========================================="
echo "📊 Performance Summary"
echo "========================================="
echo "Hints: $WARNING_COUNT"
echo "✅ Performance check complete"
exit 0


#!/bin/bash
set -e

echo "========================================="
echo "♿ Accessibility Rules Check"
echo "========================================="

ERROR_COUNT=0
WARNING_COUNT=0

HTML_FILES=$(find templates -name "*.html" 2>/dev/null || echo "")
CSS_FILES=$(find static/css -name "*.css" ! -name "normalize.css" 2>/dev/null || echo "")

if [ -z "$HTML_FILES" ]; then
  echo "⚠️  No HTML files found"
  exit 0
fi

# Правило 1: img без alt
echo ""
echo "🖼️  [Rule 1/10] Checking images for alt attributes..."
IMG_NO_ALT=$(echo "$HTML_FILES" | xargs grep -n '<img' | grep -v 'alt=' || echo "")
if [ -n "$IMG_NO_ALT" ]; then
  echo "❌ Images without alt attribute:"
  echo "$IMG_NO_ALT"
  ((ERROR_COUNT++))
else
  echo "✅ All images have alt attributes"
fi

# Правило 2: Touch target size в CSS
echo ""
echo "👆 [Rule 2/10] Checking touch target sizes (min 44px)..."
if [ -n "$CSS_FILES" ]; then
  # Шукаємо кнопки/лінки з розміром менше 44px
  SMALL_TARGETS=$(echo "$CSS_FILES" | xargs grep -nE '(button|\.btn|a\[|\.link).*\{' -A 5 | grep -E 'min-(height|width):\s*(1|2|3)[0-9]px' || echo "")
  if [ -n "$SMALL_TARGETS" ]; then
    echo "⚠️  Potential small touch targets (< 44px):"
    echo "$SMALL_TARGETS" | head -n 5
    ((WARNING_COUNT++))
  else
    echo "✅ No obvious small touch targets"
  fi
fi

# Правило 3: Buttons без aria-label (icon-only)
echo ""
echo "🔘 [Rule 3/10] Checking icon-only buttons..."
ICON_BUTTONS=$(echo "$HTML_FILES" | xargs grep -n '<button' | grep -v '>' | grep -v 'aria-label=' || echo "")
if [ -n "$ICON_BUTTONS" ]; then
  echo "⚠️  Buttons that may need aria-label:"
  echo "$ICON_BUTTONS" | head -n 3
  ((WARNING_COUNT++))
else
  echo "✅ Buttons have labels"
fi

# Правило 4: Modals без role="dialog"
echo ""
echo "💬 [Rule 4/10] Checking modals for role=\"dialog\"..."
MODALS=$(echo "$HTML_FILES" | xargs grep -n 'class=".*modal' || echo "")
if [ -n "$MODALS" ]; then
  MODALS_NO_ROLE=$(echo "$MODALS" | while IFS=: read -r file line content; do
    if ! sed -n "${line}p" "$file" | grep -q 'role="dialog"'; then
      echo "$file:$line"
    fi
  done)
  
  if [ -n "$MODALS_NO_ROLE" ]; then
    echo "⚠️  Modals without role=\"dialog\":"
    echo "$MODALS_NO_ROLE"
    ((WARNING_COUNT++))
  else
    echo "✅ All modals have role=\"dialog\""
  fi
else
  echo "✅ No modals found"
fi

# Правило 5: aria-live для динамічного контенту
echo ""
echo "🔄 [Rule 5/10] Checking for aria-live on dynamic content..."
ARIA_LIVE=$(echo "$HTML_FILES" | xargs grep -c 'aria-live=' | grep -v ':0$' || echo "")
HTMX_TARGETS=$(echo "$HTML_FILES" | xargs grep -c 'hx-target=' | grep -v ':0$' || echo "")

if [ -n "$HTMX_TARGETS" ] && [ -z "$ARIA_LIVE" ]; then
  echo "⚠️  HTMX targets found but no aria-live attributes"
  ((WARNING_COUNT++))
else
  echo "✅ Dynamic content has aria-live or not needed"
fi

# Правило 6: Inputs без label
echo ""
echo "📝 [Rule 6/10] Checking inputs for labels..."
INPUTS_NO_LABEL=$(echo "$HTML_FILES" | xargs grep -n '<input' | while IFS=: read -r file line content; do
  input_id=$(echo "$content" | grep -oP 'id="\K[^"]+' || echo "")
  if [ -n "$input_id" ]; then
    if ! grep -q "for=\"$input_id\"" "$file"; then
      echo "$file:$line (id=$input_id has no matching label)"
    fi
  else
    # Немає id взагалі
    echo "$file:$line (input without id/label)"
  fi
done)

if [ -n "$INPUTS_NO_LABEL" ]; then
  echo "⚠️  Inputs without proper labels:"
  echo "$INPUTS_NO_LABEL" | head -n 5
  ((WARNING_COUNT++))
else
  echo "✅ All inputs have labels"
fi

# Правило 7: Focus indicators в CSS
echo ""
echo "🎯 [Rule 7/10] Checking for focus indicators..."
if [ -n "$CSS_FILES" ]; then
  FOCUS_VISIBLE=$(echo "$CSS_FILES" | xargs grep -c ':focus-visible' | grep -v ':0$' || echo "")
  FOCUS=$(echo "$CSS_FILES" | xargs grep -c ':focus' | grep -v ':0$' || echo "")
  
  if [ -z "$FOCUS" ] && [ -z "$FOCUS_VISIBLE" ]; then
    echo "⚠️  No :focus or :focus-visible styles found"
    ((WARNING_COUNT++))
  else
    echo "✅ Focus indicators defined"
  fi
fi

# Правило 8: lang атрибут
echo ""
echo "🌐 [Rule 8/10] Checking html lang attribute..."
LANG_ATTR=$(echo "$HTML_FILES" | xargs grep -n '<html' | grep 'lang=' || echo "")
if [ -z "$LANG_ATTR" ]; then
  echo "⚠️  No lang attribute in <html> tag"
  ((WARNING_COUNT++))
else
  echo "✅ html has lang attribute"
fi

# Правило 9: Color contrast hint
echo ""
echo "🎨 [Rule 9/10] Color contrast reminder..."
echo "ℹ️  Remember to check color contrast ≥4.5:1 (use tools like Contrast Checker)"

# Правило 10: Keyboard navigation
echo ""
echo "⌨️  [Rule 10/10] Keyboard navigation reminder..."
echo "ℹ️  Remember to test Tab navigation, Enter/Space on buttons"

# Підсумок
echo ""
echo "========================================="
echo "📊 Accessibility Summary"
echo "========================================="
echo "Errors: $ERROR_COUNT"
echo "Warnings: $WARNING_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ Accessibility check FAILED"
  exit 1
else
  echo "✅ Accessibility check PASSED"
  exit 0
fi



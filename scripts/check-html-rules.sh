#!/bin/bash
set -e

echo "========================================="
echo "🔍 HTML Custom Rules Check"
echo "========================================="

ERROR_COUNT=0
WARNING_COUNT=0

HTML_FILES=$(find templates -name "*.html" 2>/dev/null || echo "")

if [ -z "$HTML_FILES" ]; then
  echo "⚠️  No HTML files found in templates/"
  exit 0
fi

# Правило 1: viewport meta
echo ""
echo "📱 [Rule 1/7] Checking viewport meta attributes..."
VIEWPORT_ISSUES=$(echo "$HTML_FILES" | xargs grep -l 'name="viewport"' | while read -r file; do
  if ! grep -q 'viewport-fit=cover' "$file" || ! grep -q 'interactive-widget=resizes-content' "$file"; then
    echo "$file"
  fi
done)

if [ -n "$VIEWPORT_ISSUES" ]; then
  echo "❌ Viewport meta tags missing required attributes:"
  echo "$VIEWPORT_ISSUES"
  echo "   Required: viewport-fit=cover, interactive-widget=resizes-content"
  ((ERROR_COUNT++))
else
  echo "✅ All viewport meta tags are correct"
fi

# Правило 2: inline styles
echo ""
echo "🎨 [Rule 2/7] Checking for inline styles..."
INLINE_STYLES=$(echo "$HTML_FILES" | xargs grep -n 'style="' || echo "")
if [ -n "$INLINE_STYLES" ]; then
  echo "❌ Inline styles found (forbidden):"
  echo "$INLINE_STYLES"
  ((ERROR_COUNT++))
else
  echo "✅ No inline styles detected"
fi

# Правило 3: inline event handlers
echo ""
echo "🔧 [Rule 3/7] Checking for inline event handlers..."
INLINE_HANDLERS=$(echo "$HTML_FILES" | xargs grep -nE 'on(click|load|error|submit|change|input|focus|blur|keydown|keyup|mouseover|mouseout|touchstart|touchend)=' || echo "")
if [ -n "$INLINE_HANDLERS" ]; then
  echo "❌ Inline event handlers found (forbidden):"
  echo "$INLINE_HANDLERS"
  ((ERROR_COUNT++))
else
  echo "✅ No inline event handlers detected"
fi

# Правило 4: inputmode для tel
echo ""
echo "📞 [Rule 4/7] Checking inputmode for tel/number inputs..."
TEL_INPUTS=$(echo "$HTML_FILES" | xargs grep -n 'type="tel"' | grep -v 'inputmode="tel"' || echo "")
NUMBER_INPUTS=$(echo "$HTML_FILES" | xargs grep -n 'type="number"' | grep -vE 'inputmode="(decimal|numeric)"' || echo "")

if [ -n "$TEL_INPUTS" ]; then
  echo "⚠️  Inputs with type=\"tel\" missing inputmode=\"tel\":"
  echo "$TEL_INPUTS"
  ((WARNING_COUNT++))
fi

if [ -n "$NUMBER_INPUTS" ]; then
  echo "⚠️  Inputs with type=\"number\" missing inputmode:"
  echo "$NUMBER_INPUTS"
  ((WARNING_COUNT++))
fi

if [ -z "$TEL_INPUTS" ] && [ -z "$NUMBER_INPUTS" ]; then
  echo "✅ All tel/number inputs have correct inputmode"
fi

# Правило 5: video tags
echo ""
echo "🎬 [Rule 5/7] Checking video tags..."
VIDEO_TAGS=$(echo "$HTML_FILES" | xargs grep -n '<video' || echo "")
if [ -n "$VIDEO_TAGS" ]; then
  while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    linenum=$(echo "$line" | cut -d: -f2)
    content=$(echo "$line" | cut -d: -f3-)
    
    issues=""
    echo "$content" | grep -q 'poster=' || issues="${issues}poster "
    echo "$content" | grep -q 'playsinline' || issues="${issues}playsinline "
    echo "$content" | grep -q 'muted' || issues="${issues}muted "
    
    if [ -n "$issues" ]; then
      echo "⚠️  $file:$linenum missing: $issues"
      ((WARNING_COUNT++))
    fi
  done <<< "$VIDEO_TAGS"
else
  echo "✅ No video tags found"
fi

# Правило 6: script defer/async
echo ""
echo "📜 [Rule 6/7] Checking script tags for defer/async..."
SCRIPT_TAGS=$(echo "$HTML_FILES" | xargs grep -n '<script src=' | grep -v 'defer\|async' || echo "")
if [ -n "$SCRIPT_TAGS" ]; then
  echo "⚠️  Script tags without defer/async:"
  echo "$SCRIPT_TAGS"
  ((WARNING_COUNT++))
else
  echo "✅ All external scripts have defer/async"
fi

# Правило 7: autocomplete для forms
echo ""
echo "📝 [Rule 7/7] Checking autocomplete attributes..."
EMAIL_INPUTS=$(echo "$HTML_FILES" | xargs grep -n 'type="email"' | grep -v 'autocomplete=' || echo "")
TEL_INPUTS_AC=$(echo "$HTML_FILES" | xargs grep -n 'type="tel"' | grep -v 'autocomplete=' || echo "")

if [ -n "$EMAIL_INPUTS" ] || [ -n "$TEL_INPUTS_AC" ]; then
  echo "⚠️  Form inputs missing autocomplete attribute (recommended for UX)"
  [ -n "$EMAIL_INPUTS" ] && echo "   Email inputs: $(echo "$EMAIL_INPUTS" | wc -l) instances"
  [ -n "$TEL_INPUTS_AC" ] && echo "   Tel inputs: $(echo "$TEL_INPUTS_AC" | wc -l) instances"
  ((WARNING_COUNT++))
else
  echo "✅ Form inputs have autocomplete attributes"
fi

# Підсумок
echo ""
echo "========================================="
echo "📊 HTML Rules Summary"
echo "========================================="
echo "Errors: $ERROR_COUNT"
echo "Warnings: $WARNING_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ HTML custom rules check FAILED"
  exit 1
else
  echo "✅ HTML custom rules check PASSED"
  exit 0
fi


#!/bin/bash
set -e

echo "========================================="
echo "🔧 Automatic Rules Fixes"
echo "========================================="

FIXED_COUNT=0

HTML_FILES=$(find templates -name "*.html" 2>/dev/null || echo "")
CSS_FILES=$(find static/css -name "*.css" ! -name "normalize.css" 2>/dev/null || echo "")

# Fix 1: viewport meta (додати viewport-fit та interactive-widget)
echo ""
echo "📱 [Fix 1/6] Updating viewport meta..."
if [ -n "$HTML_FILES" ]; then
  echo "$HTML_FILES" | while read -r file; do
    if grep -q 'name="viewport"' "$file"; then
      # Перевіряємо чи вже є потрібні атрибути
      if ! grep -q 'viewport-fit=cover' "$file"; then
        # Додаємо viewport-fit=cover перед закриваючою лапкою
        sed -i.bak 's/\(name="viewport" content="[^"]*\)"/\1, viewport-fit=cover"/' "$file"
        echo "   ✓ Added viewport-fit=cover to $file"
        ((FIXED_COUNT++))
      fi
      
      if ! grep -q 'interactive-widget=resizes-content' "$file"; then
        sed -i.bak 's/\(name="viewport" content="[^"]*\)"/\1, interactive-widget=resizes-content"/' "$file"
        echo "   ✓ Added interactive-widget to $file"
        ((FIXED_COUNT++))
      fi
    fi
  done
fi

# Fix 2: Видалити inline style=""
echo ""
echo "🎨 [Fix 2/6] Removing inline styles..."
if [ -n "$HTML_FILES" ]; then
  BEFORE=$(echo "$HTML_FILES" | xargs grep -c 'style="' | grep -v ':0$' | wc -l)
  echo "$HTML_FILES" | xargs sed -i.bak 's/ style="[^"]*"//g'
  AFTER=$(echo "$HTML_FILES" | xargs grep -c 'style="' | grep -v ':0$' | wc -l || echo "0")
  REMOVED=$((BEFORE - AFTER))
  if [ $REMOVED -gt 0 ]; then
    echo "✅ Removed $REMOVED inline style attributes"
    ((FIXED_COUNT++))
  fi
fi

# Fix 3: Додати inputmode="tel"
echo ""
echo "📞 [Fix 3/6] Adding inputmode to tel inputs..."
if [ -n "$HTML_FILES" ]; then
  echo "$HTML_FILES" | xargs sed -i.bak 's/<input type="tel"/<input type="tel" inputmode="tel"/g'
  echo "✅ Added inputmode to tel inputs"
  ((FIXED_COUNT++))
fi

# Fix 4: flex: 1; → flex: 1 0 0;
echo ""
echo "📦 [Fix 4/6] Fixing flex shorthand..."
if [ -n "$CSS_FILES" ]; then
  BEFORE=$(echo "$CSS_FILES" | xargs grep -cE 'flex:\s*1\s*;' | grep -v ':0$' | wc -l || echo "0")
  echo "$CSS_FILES" | xargs sed -i.bak -E 's/flex:\s*1\s*;/flex: 1 0 0;/g'
  AFTER=$(echo "$CSS_FILES" | xargs grep -cE 'flex:\s*1\s*;' | grep -v ':0$' | wc -l || echo "0")
  FIXED=$((BEFORE - AFTER))
  if [ $FIXED -gt 0 ]; then
    echo "✅ Fixed $FIXED flex shorthand declarations"
    ((FIXED_COUNT++))
  fi
fi

# Fix 5: Додати alt="" до images без alt (NEW)
echo ""
echo "🖼️  [Fix 5/6] Adding empty alt to decorative images..."
if [ -n "$HTML_FILES" ]; then
  echo "$HTML_FILES" | xargs sed -i.bak 's/<img\([^>]*\)>/<img\1 alt="">/g'
  # Видалити дублікати alt
  echo "$HTML_FILES" | xargs sed -i.bak 's/alt="[^"]*" alt=""/alt=""/g'
  echo "✅ Added alt attributes (review and update with proper descriptions)"
  ((FIXED_COUNT++))
fi

# Fix 6: Додати autocomplete до email/tel inputs (NEW)
echo ""
echo "📝 [Fix 6/6] Adding autocomplete to form inputs..."
if [ -n "$HTML_FILES" ]; then
  # email inputs
  echo "$HTML_FILES" | xargs sed -i.bak 's/<input type="email"/<input type="email" autocomplete="email"/g'
  # tel inputs
  echo "$HTML_FILES" | xargs sed -i.bak 's/<input type="tel"/<input type="tel" autocomplete="tel"/g'
  echo "✅ Added autocomplete attributes"
  ((FIXED_COUNT++))
fi

# Видалити .bak файли
echo ""
echo "🧹 Cleaning up backup files..."
find . -name "*.bak" -delete

echo ""
echo "========================================="
echo "📊 Fixes Summary"
echo "========================================="
echo "Total fixes applied: $FIXED_COUNT"
echo "✅ Auto-fix complete"
echo ""
echo "⚠️  IMPORTANT: Review changes before committing!"
echo "   Some fixes may need manual review (e.g. alt text)"


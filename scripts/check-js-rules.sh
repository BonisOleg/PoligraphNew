#!/bin/bash
set -e

echo "========================================="
echo "⚡ JavaScript Custom Rules Check"
echo "========================================="

ERROR_COUNT=0
WARNING_COUNT=0

JS_FILES=$(find static/js -name "*.js" 2>/dev/null || echo "")

if [ -z "$JS_FILES" ]; then
  echo "⚠️  No JavaScript files found"
  exit 0
fi

# Правило 1: var заборонений
echo ""
echo "🚫 [Rule 1/8] Checking for var usage..."
VAR_USAGE=$(echo "$JS_FILES" | xargs grep -nE '\bvar\s+' || echo "")
if [ -n "$VAR_USAGE" ]; then
  echo "❌ 'var' found (use const/let):"
  echo "$VAR_USAGE"
  ((ERROR_COUNT++))
else
  echo "✅ No 'var' usage"
fi

# Правило 2: pageshow event
echo ""
echo "🔄 [Rule 2/8] Checking for pageshow event listener..."
PAGESHOW=$(echo "$JS_FILES" | xargs grep -c "addEventListener.*pageshow" | grep -v ':0$' || echo "")
if [ -z "$PAGESHOW" ]; then
  echo "⚠️  No 'pageshow' listener (needed for bfcache)"
  ((WARNING_COUNT++))
else
  echo "✅ pageshow listener found"
fi

# Правило 3: strict mode
echo ""
echo "🔒 [Rule 3/8] Checking for strict mode..."
STRICT=$(echo "$JS_FILES" | xargs grep -c "'use strict'" | grep -v ':0$' || echo "")
IIFE=$(echo "$JS_FILES" | xargs grep -c '(function()' | grep -v ':0$' || echo "")

if [ -z "$STRICT" ] && [ -z "$IIFE" ]; then
  echo "⚠️  No 'use strict' or IIFE"
  ((WARNING_COUNT++))
else
  echo "✅ Code uses strict mode or IIFE"
fi

# Правило 4: eval заборонений
echo ""
echo "🚨 [Rule 4/8] Checking for eval()..."
EVAL_USAGE=$(echo "$JS_FILES" | xargs grep -nE '\beval\s*\(' || echo "")
if [ -n "$EVAL_USAGE" ]; then
  echo "❌ eval() found (forbidden for security):"
  echo "$EVAL_USAGE"
  ((ERROR_COUNT++))
else
  echo "✅ No eval() usage"
fi

# Правило 5: HTMX integration (розширена перевірка)
echo ""
echo "🔗 [Rule 5/8] Checking HTMX integration..."
HTMX_AFTER_SWAP=$(echo "$JS_FILES" | xargs grep -c 'htmx:afterSwap' | grep -v ':0$' || echo "")
HTMX_CONFIG=$(echo "$JS_FILES" | xargs grep -c 'htmx:configRequest' | grep -v ':0$' || echo "")
HTMX_SEND_ERROR=$(echo "$JS_FILES" | xargs grep -c 'htmx:sendError' | grep -v ':0$' || echo "")
HTMX_RESPONSE_ERROR=$(echo "$JS_FILES" | xargs grep -c 'htmx:responseError' | grep -v ':0$' || echo "")

if [ -n "$HTMX_AFTER_SWAP" ] || [ -n "$HTMX_CONFIG" ]; then
  echo "✅ HTMX event listeners found:"
  [ -n "$HTMX_AFTER_SWAP" ] && echo "   - htmx:afterSwap ✓"
  [ -n "$HTMX_CONFIG" ] && echo "   - htmx:configRequest ✓"
  [ -n "$HTMX_SEND_ERROR" ] && echo "   - htmx:sendError ✓" || echo "   - htmx:sendError ⚠️ missing"
  [ -n "$HTMX_RESPONSE_ERROR" ] && echo "   - htmx:responseError ✓" || echo "   - htmx:responseError ⚠️ missing"
  
  if [ -z "$HTMX_SEND_ERROR" ] || [ -z "$HTMX_RESPONSE_ERROR" ]; then
    ((WARNING_COUNT++))
  fi
else
  echo "ℹ️  No HTMX integration detected"
fi

# Правило 6: scrollend замість scroll + debounce (NEW)
echo ""
echo "📜 [Rule 6/8] Checking for scrollend event..."
SCROLL_LISTENER=$(echo "$JS_FILES" | xargs grep -c "addEventListener.*scroll" | grep -v ':0$' || echo "")
SCROLLEND=$(echo "$JS_FILES" | xargs grep -c "addEventListener.*scrollend" | grep -v ':0$' || echo "")

if [ -n "$SCROLL_LISTENER" ] && [ -z "$SCROLLEND" ]; then
  echo "ℹ️  Using 'scroll' event (consider 'scrollend' for better performance)"
elif [ -n "$SCROLLEND" ]; then
  echo "✅ Using modern 'scrollend' event"
else
  echo "✅ No scroll listeners"
fi

# Правило 7: Pointer Events API (NEW)
echo ""
echo "🖱️  [Rule 7/8] Checking for Pointer Events API..."
TOUCH_EVENTS=$(echo "$JS_FILES" | xargs grep -cE 'addEventListener.*(touchstart|touchend|touchmove)' | grep -v ':0$' || echo "")
POINTER_EVENTS=$(echo "$JS_FILES" | xargs grep -cE 'addEventListener.*(pointerdown|pointerup|pointermove)' | grep -v ':0$' || echo "")

if [ -n "$TOUCH_EVENTS" ] && [ -z "$POINTER_EVENTS" ]; then
  echo "ℹ️  Using Touch Events (consider Pointer Events for broader device support)"
elif [ -n "$POINTER_EVENTS" ]; then
  echo "✅ Using Pointer Events API"
else
  echo "✅ No touch/pointer listeners"
fi

# Правило 8: event.persisted check (NEW)
echo ""
echo "🔄 [Rule 8/8] Checking event.persisted in pageshow..."
if [ -n "$PAGESHOW" ]; then
  PERSISTED_CHECK=$(echo "$JS_FILES" | xargs grep -c 'event.persisted\|e.persisted' | grep -v ':0$' || echo "")
  if [ -z "$PERSISTED_CHECK" ]; then
    echo "⚠️  pageshow listener exists but no event.persisted check"
    ((WARNING_COUNT++))
  else
    echo "✅ event.persisted check found"
  fi
else
  echo "⏭️  Skipped (no pageshow listener)"
fi

# Підсумок
echo ""
echo "========================================="
echo "📊 JavaScript Rules Summary"
echo "========================================="
echo "Errors: $ERROR_COUNT"
echo "Warnings: $WARNING_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
  echo "❌ JavaScript rules check FAILED"
  exit 1
else
  echo "✅ JavaScript rules check PASSED"
  exit 0
fi


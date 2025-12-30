# Scripts Documentation

## Overview
Automated code quality checks for PolygraphNew project. This system enforces 110+ rules covering HTML, CSS, JavaScript, Django templates, accessibility, and performance.

## Scripts

### check-html-rules.sh
Checks 7 HTML rules:
1. Viewport meta with viewport-fit=cover and interactive-widget=resizes-content
2. No inline styles
3. No inline event handlers
4. inputmode for tel/number inputs
5. Video tags with poster, playsinline, muted
6. Script tags with defer/async
7. Autocomplete attributes for forms

### check-css-rules.sh
Checks 12 CSS rules:
1. 100vh fallback to 100dvh
2. safe-area-inset usage
3. font-size in rem (not px)
4. flex: 1 0 0; (not flex: 1;)
5. :hover in @media (hover: hover)
6. overscroll-behavior
7. No !important
8. backdrop-filter with -webkit- prefix
9. touch-action: manipulation
10. text-wrap: balance
11. color-scheme
12. scrollbar-gutter

### check-js-rules.sh
Checks 8 JavaScript rules:
1. No var (use const/let)
2. pageshow event listener for bfcache
3. strict mode or IIFE
4. No eval()
5. HTMX integration (afterSwap, configRequest, sendError, responseError)
6. scrollend event (preferred over scroll)
7. Pointer Events API (preferred over Touch Events)
8. event.persisted check in pageshow

### check_template_tags.sh
**CRITICAL**: Django templates must not break tags across lines:
- `{{ variable }}` must be on one line
- `{% tag %}` must be on one line
- Use `{% with %}` for complex expressions

### check-accessibility-rules.sh
Checks 10 accessibility rules:
1. Touch targets ≥44px
2. alt attributes for images
3. aria-label for icon-only buttons
4. role="dialog" for modals
5. aria-live for dynamic content
6. label for all inputs
7. Focus indicators visible
8. lang attribute in html
9. Color contrast reminder
10. Keyboard navigation reminder

### check-performance-rules.sh
Performance hints (does not block commit):
1. loading="lazy" for images
2. will-change usage (not too many)
3. Low-performance animations (width/height vs transform/opacity)
4. preconnect/dns-prefetch
5. async/defer for scripts

### fix-rules.sh
Auto-fixes common issues:
1. Updates viewport meta
2. Removes inline styles
3. Adds inputmode to tel inputs
4. Fixes flex: 1 → flex: 1 0 0
5. Adds alt="" to images (review needed)
6. Adds autocomplete to form inputs

### check-all-rules.sh
Wrapper that runs all checks sequentially:
1. Django template tags
2. HTML custom rules
3. CSS custom rules
4. JavaScript custom rules
5. Accessibility rules
6. Performance hints
7. Stylelint
8. ESLint
9. HTMLHint

### pre-commit-hook.sh
Git hook logic:
- Runs lint-staged (only staged files)
- Runs Django template check (critical)
- Blocks commit if errors found

## Usage

### Run all checks
```bash
npm run check:rules
```

### Run specific check
```bash
npm run check:html
npm run check:css
npm run check:js
npm run check:django
npm run check:a11y
npm run check:perf
```

### Auto-fix
```bash
npm run fix:rules
npm run lint:fix
```

## Troubleshooting

### Pre-commit hook blocks commit
1. Run `npm run check:rules` to see all issues
2. Run `npm run fix:rules` for auto-fixes
3. Fix remaining issues manually
4. Try commit again

### False positives
Edit the specific script to adjust rules.

### Skip hook (emergency only)
```bash
git commit --no-verify
```
**Warning**: Only use if absolutely necessary!

## Adding new rules

1. Edit appropriate script
2. Test on sample files
3. Update this README
4. Commit changes




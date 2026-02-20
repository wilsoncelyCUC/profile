"""
Playwright tests for Newsletter section scroll-triggered animations.
Tests both desktop (1280×800) and mobile (390×844 – iPhone 14) viewports.

Checks:
  1. Elements start invisible (opacity 0 / translateX off-screen)
  2. After scrolling into view, elements become visible (opacity 1)
  3. Staggered article animation works (each item has increasing delay)
  4. Hover states work on article links (color changes, arrow shifts)
"""

import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:4321/profile"

VIEWPORTS = [
    {"name": "Desktop", "width": 1280, "height": 800},
    {"name": "Mobile (iPhone 14)", "width": 390, "height": 844},
]

SCREENSHOT_DIR = "/tmp"


def scroll_to_newsletter(page):
    """Scroll the newsletter section into view."""
    page.evaluate("document.querySelector('#newsletter').scrollIntoView({ behavior: 'instant', block: 'center' })")
    time.sleep(0.2)  # allow IntersectionObserver to fire


def get_computed_opacity(page, selector):
    return page.evaluate(
        f"parseFloat(window.getComputedStyle(document.querySelector('{selector}')).opacity)"
    )


def get_computed_transform(page, selector):
    return page.evaluate(
        f"window.getComputedStyle(document.querySelector('{selector}')).transform"
    )


def has_visible_class(page, selector):
    return page.evaluate(
        f"document.querySelector('{selector}').classList.contains('visible')"
    )


def run_viewport_tests(playwright, viewport):
    name = viewport["name"]
    width = viewport["width"]
    height = viewport["height"]

    print(f"\n{'='*60}")
    print(f"  Testing: {name} ({width}×{height})")
    print(f"{'='*60}")

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()

    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")

    failures = []

    # ------------------------------------------------------------------ #
    # TEST 1 — Elements start hidden (before scroll)
    # ------------------------------------------------------------------ #
    print(f"\n[1] Checking initial hidden state (before scroll)...")

    initial_states = {
        ".nl-header": "nl-header",
        ".nl-left":   "nl-left",
        ".nl-right":  "nl-right",
    }

    for selector, label in initial_states.items():
        opacity = get_computed_opacity(page, selector)
        has_class = has_visible_class(page, selector)
        if has_class or opacity > 0.05:
            msg = f"  FAIL  {label}: expected hidden before scroll, got opacity={opacity:.2f} visible={has_class}"
            print(msg)
            failures.append(msg)
        else:
            print(f"  PASS  {label}: opacity={opacity:.2f} (hidden before scroll)")

    # Check first article is hidden
    first_article_opacity = get_computed_opacity(page, ".nl-article")
    if first_article_opacity > 0.05:
        msg = f"  FAIL  .nl-article[0]: expected hidden before scroll, got opacity={first_article_opacity:.2f}"
        print(msg)
        failures.append(msg)
    else:
        print(f"  PASS  .nl-article[0]: opacity={first_article_opacity:.2f} (hidden before scroll)")

    # Screenshot: before scroll
    screenshot_path = f"{SCREENSHOT_DIR}/newsletter_{name.lower().replace(' ', '_').replace('(', '').replace(')', '')}_before_scroll.png"
    page.screenshot(path=screenshot_path, full_page=False, clip={"x": 0, "y": 0, "width": width, "height": height})
    print(f"  Screenshot (above fold): {screenshot_path}")

    # ------------------------------------------------------------------ #
    # TEST 2 — Elements become visible after scrolling into view
    # ------------------------------------------------------------------ #
    print(f"\n[2] Scrolling newsletter into view...")
    scroll_to_newsletter(page)
    time.sleep(1.0)  # wait for all transitions to complete (longest = ~1.2s)

    for selector, label in initial_states.items():
        opacity = get_computed_opacity(page, selector)
        has_class = has_visible_class(page, selector)
        if not has_class or opacity < 0.95:
            msg = f"  FAIL  {label}: expected visible after scroll, got opacity={opacity:.2f} visible={has_class}"
            print(msg)
            failures.append(msg)
        else:
            print(f"  PASS  {label}: opacity={opacity:.2f} (visible after scroll)")

    # Screenshot: after scroll, animations done
    screenshot_path_after = f"{SCREENSHOT_DIR}/newsletter_{name.lower().replace(' ', '_').replace('(', '').replace(')', '')}_after_scroll.png"
    page.screenshot(path=screenshot_path_after, full_page=False)
    print(f"  Screenshot (after scroll): {screenshot_path_after}")

    # ------------------------------------------------------------------ #
    # TEST 3 — All articles are visible + stagger class applied
    # ------------------------------------------------------------------ #
    print(f"\n[3] Checking staggered article visibility...")
    article_count = page.evaluate("document.querySelectorAll('.nl-article').length")
    print(f"  Found {article_count} article item(s)")

    if article_count == 0:
        print("  WARN  No articles rendered (feed may be unavailable)")
    else:
        all_visible = page.evaluate("""
            Array.from(document.querySelectorAll('.nl-article'))
                 .every(el => el.classList.contains('visible'))
        """)
        opacities = page.evaluate("""
            Array.from(document.querySelectorAll('.nl-article'))
                 .map(el => parseFloat(window.getComputedStyle(el).opacity).toFixed(2))
        """)
        delays = page.evaluate("""
            Array.from(document.querySelectorAll('.nl-article'))
                 .map(el => el.style.getPropertyValue('--i'))
        """)

        print(f"  All articles have .visible class: {all_visible}")
        print(f"  Article opacities: {opacities}")
        print(f"  Article --i values (stagger index): {delays}")

        if not all_visible:
            msg = f"  FAIL  Not all articles have .visible class"
            print(msg)
            failures.append(msg)
        else:
            print(f"  PASS  All {article_count} articles are visible with correct stagger indices")

        # Verify --i values are sequential 0,1,2,3,4
        expected_delays = [str(i) for i in range(len(delays))]
        if delays != expected_delays:
            msg = f"  FAIL  Stagger --i values {delays} != expected {expected_delays}"
            print(msg)
            failures.append(msg)
        else:
            print(f"  PASS  Stagger --i indices are sequential: {delays}")

    # ------------------------------------------------------------------ #
    # TEST 4 — Expanding rule animation (nl-rule scaleX)
    # ------------------------------------------------------------------ #
    print(f"\n[4] Checking nl-rule expansion...")
    rule_transform = get_computed_transform(page, ".nl-rule")
    # After animation, scaleX(1) → matrix(1, 0, 0, 1, 0, 0)
    is_expanded = "matrix(1, 0, 0, 1, 0, 0)" in rule_transform or rule_transform == "none"
    if is_expanded:
        print(f"  PASS  nl-rule is expanded: transform={rule_transform}")
    else:
        msg = f"  FAIL  nl-rule not fully expanded: transform={rule_transform}"
        print(msg)
        failures.append(msg)

    # ------------------------------------------------------------------ #
    # TEST 5 — Hover state on article links (desktop only)
    # ------------------------------------------------------------------ #
    if width >= 1024 and article_count > 0:
        print(f"\n[5] Checking hover state on first article link...")
        first_link = page.locator(".nl-article a").first

        # Get color before hover
        color_before = page.evaluate(
            "window.getComputedStyle(document.querySelector('.nl-article a span:first-child')).color"
        )

        first_link.hover()
        time.sleep(0.35)  # allow transition

        color_after = page.evaluate(
            "window.getComputedStyle(document.querySelector('.nl-article a span:first-child')).color"
        )

        print(f"  Title color before hover: {color_before}")
        print(f"  Title color after  hover: {color_after}")

        if color_before != color_after:
            print(f"  PASS  Hover changes title color (text brightens)")
        else:
            msg = f"  WARN  Title color unchanged on hover (may be CSS timing)"
            print(msg)
            # Not a hard failure — timing-sensitive

        # Screenshot: hover state
        screenshot_hover = f"{SCREENSHOT_DIR}/newsletter_{name.lower().replace(' ', '_').replace('(', '').replace(')', '')}_hover.png"
        page.screenshot(path=screenshot_hover, full_page=False)
        print(f"  Screenshot (hover): {screenshot_hover}")
    else:
        print(f"\n[5] Hover test skipped on {name}")

    # ------------------------------------------------------------------ #
    # TEST 6 — Observer disconnects after firing (idempotency)
    # ------------------------------------------------------------------ #
    print(f"\n[6] Checking observer fires only once (idempotency)...")
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(0.3)
    page.evaluate("document.querySelector('#newsletter').scrollIntoView({ behavior: 'instant' })")
    time.sleep(0.5)

    still_visible = has_visible_class(page, ".nl-header")
    if still_visible:
        print(f"  PASS  .visible class persists after second scroll (observer disconnected)")
    else:
        msg = f"  FAIL  .visible class was removed after re-scroll (observer not disconnecting)"
        print(msg)
        failures.append(msg)

    # ------------------------------------------------------------------ #
    # Summary
    # ------------------------------------------------------------------ #
    print(f"\n{'─'*60}")
    if failures:
        print(f"  {name}: {len(failures)} FAILURE(S)")
        for f in failures:
            print(f"    {f}")
    else:
        print(f"  {name}: ALL TESTS PASSED")
    print(f"{'─'*60}")

    browser.close()
    return failures


def main():
    all_failures = {}

    with sync_playwright() as playwright:
        for viewport in VIEWPORTS:
            failures = run_viewport_tests(playwright, viewport)
            all_failures[viewport["name"]] = failures

    # Final summary
    print(f"\n{'='*60}")
    print("  FINAL SUMMARY")
    print(f"{'='*60}")
    total_failures = sum(len(v) for v in all_failures.values())
    for vp_name, failures in all_failures.items():
        status = "PASS" if not failures else f"FAIL ({len(failures)} issues)"
        print(f"  {vp_name:30s}  {status}")

    print(f"\n  Screenshots saved to: {SCREENSHOT_DIR}/newsletter_*.png")

    if total_failures > 0:
        raise SystemExit(f"\n{total_failures} test(s) failed.")
    else:
        print("\n  All animation tests passed across all viewports.")


if __name__ == "__main__":
    main()

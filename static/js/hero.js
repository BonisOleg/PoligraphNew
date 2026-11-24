/**
 * Homepage hero. Layout matches Figma statically; this file only
 * re-hooks after HTMX swaps so later enhancements have a stable init.
 */
(function () {
  "use strict";

  function initHero() {
    return document.querySelector("[data-hero-section]");
  }

  function onReady() {
    initHero();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  document.body.addEventListener("htmx:afterSwap", (event) => {
    const target = event.detail && event.detail.target;
    if (target && target.id === "main") {
      initHero();
    }
  });
})();

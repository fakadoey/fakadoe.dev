/**
 * Deep Water — Scroll Depth Color Transition
 * 
 * Listens to scroll position and mathematically interpolates the background
 * color from surface navy (#1a3a52) to abyssal dark (#0c0e14).
 * 
 * This file is the SOURCE — it gets minified by Terser into depth.min.js
 * so client-side users cannot easily read the logic.
 */
(function () {
  'use strict';

  var surface = [26, 58, 82];   // #1a3a52 — Deep navy surface
  var abyss = [12, 14, 20];     // #0c0e14 — Abyssal dark

  var root = document.documentElement;
  var indicator = null;
  var ticking = false;

  function updateDepth() {
    var scrollMax = root.scrollHeight - window.innerHeight;
    var depth = scrollMax > 0 ? Math.min(window.scrollY / scrollMax, 1) : 0;

    // Interpolate RGB values between surface and abyss
    var r = Math.round(surface[0] + (abyss[0] - surface[0]) * depth);
    var g = Math.round(surface[1] + (abyss[1] - surface[1]) * depth);
    var b = Math.round(surface[2] + (abyss[2] - surface[2]) * depth);

    root.style.setProperty('--bg-depth', 'rgb(' + r + ',' + g + ',' + b + ')');

    // Update depth indicator text
    if (!indicator) {
      indicator = document.getElementById('depth-indicator');
    }
    if (indicator) {
      var pct = Math.round(depth * 100);
      indicator.textContent = pct + '% depth';
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateDepth);
      ticking = true;
    }
  }

  // Event listeners with passive flag for scroll performance
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    ticking = false;
    onScroll();
  });

  // Initial depth calculation
  updateDepth();
})();

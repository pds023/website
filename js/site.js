/* ============================================================================
   philippefontaine.eu — behaviour
   Vanilla, dependency-free, progressive enhancement.
   Everything below is optional: the page is fully readable without it.
   ========================================================================= */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function on(el, type, fn, opts) { if (el) el.addEventListener(type, fn, opts || false); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------- theme */

  var STORAGE_KEY = 'pf-theme';
  var media = window.matchMedia('(prefers-color-scheme: light)');

  function storedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f8f8' : '#0b0f14');
    $$('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'light'));
    });
  }

  applyTheme(root.getAttribute('data-theme') || (media.matches ? 'light' : 'dark'));

  $$('.theme-toggle').forEach(function (btn) {
    on(btn, 'click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode */ }
    });
  });

  // Follow the OS while the visitor has not made an explicit choice.
  var onSchemeChange = function (e) {
    if (!storedTheme()) applyTheme(e.matches ? 'light' : 'dark');
  };
  if (media.addEventListener) media.addEventListener('change', onSchemeChange);
  else if (media.addListener) media.addListener(onSchemeChange);

  /* ------------------------------------------------------------- scrollspy */

  var nav = $('.nav');
  var navLinks = $$('.nav__list a[href^="#"]');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function stickyNavHeight() {
    if (!nav) return 0;
    return getComputedStyle(nav).position === 'sticky' ? nav.getBoundingClientRect().height : 0;
  }

  function syncScrollPadding() {
    root.style.scrollPaddingTop = (stickyNavHeight() + 16) + 'px';
  }

  var activeId = null;

  function syncActive() {
    if (!sections.length) return;

    var threshold = stickyNavHeight() + window.innerHeight * 0.22;
    var current = sections[0];
    var bestTop = -Infinity;

    sections.forEach(function (section) {
      var top = section.getBoundingClientRect().top;
      if (top <= threshold && top > bestTop) { bestTop = top; current = section; }
    });

    // At the very bottom the last section may never cross the band.
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }

    if (current.id === activeId) return;
    activeId = current.id;

    navLinks.forEach(function (link) {
      var isCurrent = link.getAttribute('href') === '#' + activeId;
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
        // Keep the active pill in view inside the horizontal mobile bar.
        var list = link.closest('.nav__list');
        if (list && list.scrollWidth > list.clientWidth) {
          var target = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
          list.scrollTo({ left: Math.max(0, target), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* -------------------------------------------------------------- back to top */

  var toTop = $('.to-top');

  function syncToTop() {
    if (!toTop) return;
    toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.75);
  }

  on(toTop, 'click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    var first = navLinks[0];
    if (first) first.focus({ preventScroll: true });
  });

  /* ------------------------------------------------- scroll / resize loop */

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      syncActive();
      syncToTop();
      ticking = false;
    });
  }

  function syncLayout() {
    activeId = null;
    syncScrollPadding();
    onScroll();
  }

  on(window, 'scroll', onScroll, { passive: true });
  on(window, 'resize', syncLayout);
  if (document.fonts) document.fonts.ready.then(syncLayout);

  syncScrollPadding();
  syncActive();
  syncToTop();

  /* ------------------------------------------------------------- deep links */

  function syncHash() {
    $$('a[hreflang]').forEach(function (link) {
      if (link.origin === window.location.origin) link.hash = window.location.hash;
    });

    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch (e) { return; }
    var target = id && document.getElementById(id);
    if (!target) return;

    var details = target.closest('details');
    while (details) {
      details.open = true;
      details = details.parentElement && details.parentElement.closest('details');
    }

    requestAnimationFrame(function () {
      syncScrollPadding();
      target.scrollIntoView({ block: 'start' });
      onScroll();
    });
  }

  $$('details').forEach(function (details) {
    on(details, 'toggle', syncLayout);
  });
  on(window, 'hashchange', syncHash);
  syncHash();

  /* --------------------------------------------------------------- printing */

  var printDetails = [];
  on(window, 'beforeprint', function () {
    $$('details:not([open])').forEach(function (details) {
      printDetails.push(details);
      details.open = true;
    });
  });
  on(window, 'afterprint', function () {
    printDetails.forEach(function (details) { details.open = false; });
    printDetails = [];
    syncLayout();
  });

  /* ------------------------------------------------------------------ misc */

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();

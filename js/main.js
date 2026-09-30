/* Chef Angelo Guida - vanilla JS, no dependencies */
(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  // Gallery filter
  var buttons = document.querySelectorAll('[data-filter]');
  var items = document.querySelectorAll('[data-category]');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      items.forEach(function (it) {
        it.hidden = !(f === 'all' || it.getAttribute('data-category') === f);
      });
    });
  });

  // Placeholder-link guard: hrefs still starting with "[" show a note
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="["]');
    if (!a) return;
    e.preventDefault();
    var next = a.nextElementSibling;
    if (next && next.classList.contains('soon-note')) return;
    var note = document.createElement('span');
    note.className = 'soon-note';
    note.setAttribute('role', 'status');
    note.textContent = 'Link coming soon';
    a.insertAdjacentElement('afterend', note);
    setTimeout(function () { if (note.parentNode) note.parentNode.removeChild(note); }, 4000);
  });

  // Body padding when sticky bar is present (mobile only)
  var bar = document.querySelector('.sticky-book');
  function pad() {
    if (!bar) return;
    var visible = window.getComputedStyle(bar).display !== 'none';
    document.body.style.paddingBottom = visible ? bar.offsetHeight + 'px' : '';
  }
  pad();
  window.addEventListener('resize', pad);
})();

(function () {
  'use strict';

  // R6 — shown by default in the HTML; also the last resort if anything below throws.
  var FALLBACK = "You’re doing okay. That’s enough for today.";

  // R5 — curated set. Order is fixed; "today" is a deterministic pick from it, not a fetch.
  // R9 note: kept thoughts are encoded by index, so this list is APPEND-ONLY.
  // Reordering or removing entries invalidates links people have already saved.
  var AFFIRMATIONS = [
    "You don’t have to have it figured out today.",
    "Rest is not something you have to earn.",
    "You are allowed to move slower than you think you should.",
    "One honest step counts more than ten perfect ones.",
    "You can be proud of yourself and still have work to do.",
    "Nothing is wrong with you for needing a break.",
    "You’ve survived every hard day so far. That’s not nothing.",
    "It’s okay to want things to be easier.",
    "You don’t owe anyone constant progress.",
    "Today can be small and still be enough.",
    "You’re allowed to change your mind.",
    "Being tired isn’t a character flaw.",
    "You can start again without explaining why you stopped.",
    "Not every day has to feel like growth to count.",
    "You’re doing better than the voice in your head says.",
    "It’s fine to need reminding of things you already know.",
    "You can care about this and still take it slow.",
    "Some days, showing up is the whole job.",
    "You’re not behind. There was never a schedule.",
    "You can hold two things: this is hard, and you’re okay.",
    "Whatever you did today was done by someone trying.",
    "You don’t need permission to rest, but here it is anyway.",
    "You’re allowed to take up space without a reason.",
    "This moment doesn’t need to be productive to matter."
  ];

  var B36 = 36;

  function hash(str) {
    // djb2 — deterministic, stable across sessions/devices for the same date string.
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function localDateKey() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function shuffled(n) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(i);
    for (var j = arr.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = arr[j]; arr[j] = arr[k]; arr[k] = tmp;
    }
    return arr;
  }

  /* ---------- R9: the URL is the store ---------- */

  // Each kept index is two base36 chars, so the set survives content growth to 1295 items.
  function encodeKept(list) {
    var out = '';
    for (var i = 0; i < list.length; i++) {
      out += list[i].toString(B36).padStart(2, '0');
    }
    return out;
  }

  function decodeKept(raw) {
    var list = [];
    if (!raw || raw.length % 2 !== 0) return list;
    for (var i = 0; i < raw.length; i += 2) {
      var n = parseInt(raw.slice(i, i + 2), B36);
      // Garbage, or an index from a future/older content set: drop it silently (R6 spirit).
      if (isNaN(n) || n < 0 || n >= AFFIRMATIONS.length) continue;
      if (list.indexOf(n) === -1) list.push(n);
    }
    return list;
  }

  function readKeptFromUrl() {
    var m = /(?:^|&)kept=([a-z0-9]*)/i.exec(window.location.hash.replace(/^#/, ''));
    return m ? decodeKept(m[1]) : [];
  }

  function writeKeptToUrl(list) {
    var hash = list.length ? '#kept=' + encodeKept(list) : '';
    var url = window.location.pathname + window.location.search + hash;
    try {
      window.history.replaceState(null, '', url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- app ---------- */

  function init() {
    var el = document.getElementById('affirmation');
    var btnAnother = document.getElementById('another-btn');
    var btnKeep = document.getElementById('keep-btn');
    var btnReview = document.getElementById('review-btn');
    var reviewNav = document.getElementById('review-nav');
    var btnPrev = document.getElementById('prev-btn');
    var btnNext = document.getElementById('next-btn');
    var counter = document.getElementById('counter');
    var btnCopy = document.getElementById('copy-btn');
    var btnDone = document.getElementById('done-btn');
    var linkNote = document.getElementById('link-note');
    var todayControls = document.getElementById('today-controls');

    if (!el || !AFFIRMATIONS.length) return; // fallback text already in the DOM

    var kept = readKeptFromUrl();
    var reviewing = false;
    var reviewPos = 0;
    var swapping = false;

    var todayIndex = hash(localDateKey()) % AFFIRMATIONS.length;

    // R2 — cycling order: every index once, today's pick first, reshuffled on wrap.
    var order = shuffled(AFFIRMATIONS.length);
    order.splice(order.indexOf(todayIndex), 1);
    order.unshift(todayIndex);
    var cursor = 0;

    function currentIndex() {
      return reviewing ? kept[reviewPos] : order[cursor];
    }

    function paint() {
      var idx = currentIndex();
      if (typeof idx !== 'number') return;

      el.textContent = AFFIRMATIONS[idx];

      var isKept = kept.indexOf(idx) !== -1;
      btnKeep.setAttribute('aria-pressed', isKept ? 'true' : 'false');
      btnKeep.querySelector('span').textContent = reviewing ? 'Remove' : (isKept ? 'Kept' : 'Keep');
      btnKeep.setAttribute('aria-label', reviewing
        ? 'Remove this thought from your kept thoughts'
        : (isKept ? 'Kept. Select to remove from your kept thoughts' : 'Keep this thought'));

      // R8 — the review entry point stays hidden until something is kept.
      btnReview.hidden = reviewing || kept.length === 0;
      if (!btnReview.hidden) {
        btnReview.querySelector('span').textContent = 'Kept thoughts (' + kept.length + ')';
      }

      btnAnother.hidden = reviewing;
      reviewNav.hidden = !reviewing;
      linkNote.hidden = !reviewing;

      if (reviewing) {
        counter.textContent = (reviewPos + 1) + ' / ' + kept.length;
        btnPrev.disabled = kept.length < 2;
        btnNext.disabled = kept.length < 2;
      }

      document.body.classList.toggle('is-reviewing', reviewing);
    }

    function swapTo(fn) {
      if (swapping) return;
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { fn(); paint(); return; }

      swapping = true;
      el.classList.add('is-swapping');
      window.setTimeout(function () {
        fn();
        paint();
        el.classList.remove('is-swapping');
        swapping = false;
      }, 150);
    }

    /* ---- R2: another ---- */
    btnAnother.addEventListener('click', function () {
      swapTo(function () {
        cursor++;
        if (cursor >= order.length) {
          var last = order[order.length - 1];
          do { order = shuffled(AFFIRMATIONS.length); } while (order[0] === last);
          cursor = 0;
        }
      });
    });

    /* ---- R7: keep / remove ---- */
    btnKeep.addEventListener('click', function () {
      // Mid-swap the displayed text and the cursor disagree; keeping then hits the outgoing thought.
      if (swapping) return;
      var idx = currentIndex();
      if (typeof idx !== 'number') return;

      var at = kept.indexOf(idx);
      var next = kept.slice();
      if (at === -1) next.push(idx); else next.splice(at, 1);

      // Negative path: if the URL can't be updated, don't claim the thought was kept.
      var before = kept;
      kept = next;
      if (!writeKeptToUrl(kept)) { kept = before; paint(); return; }

      if (reviewing) {
        // Removing the last kept thought returns to today rather than an empty screen.
        if (kept.length === 0) { swapTo(function () { reviewing = false; }); return; }
        if (reviewPos >= kept.length) reviewPos = kept.length - 1;
        swapTo(function () {});
        return;
      }
      paint();
    });

    /* ---- R8: review ---- */
    btnReview.addEventListener('click', function () {
      if (!kept.length) return;
      swapTo(function () { reviewing = true; reviewPos = 0; });
    });

    btnDone.addEventListener('click', function () {
      swapTo(function () { reviewing = false; });
    });

    function step(delta) {
      if (!reviewing || kept.length < 2) return;
      swapTo(function () {
        reviewPos = (reviewPos + delta + kept.length) % kept.length;
      });
    }

    btnPrev.addEventListener('click', function () { step(-1); });
    btnNext.addEventListener('click', function () { step(1); });

    document.addEventListener('keydown', function (e) {
      if (!reviewing) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'Escape') { e.preventDefault(); swapTo(function () { reviewing = false; }); }
    });

    /* ---- R9: copy link ---- */
    var copyResetTimer;
    btnCopy.addEventListener('click', function () {
      var label = btnCopy.querySelector('span');
      var url = window.location.href;

      function done(ok) {
        label.textContent = ok ? 'Link copied' : 'Copy from the address bar';
        window.clearTimeout(copyResetTimer);
        copyResetTimer = window.setTimeout(function () {
          label.textContent = 'Copy link';
        }, 2400);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });

    // Opening a shared kept-link while the page is already loaded only changes the hash,
    // so re-read it. Our own replaceState calls don't fire this event.
    window.addEventListener('hashchange', function () {
      var incoming = readKeptFromUrl();
      if (encodeKept(incoming) === encodeKept(kept)) return;
      kept = incoming;
      if (reviewing && !kept.length) reviewing = false;
      if (reviewPos >= kept.length) reviewPos = 0;
      paint();
    });

    todayControls.hidden = false;
    paint();
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (e) {
    // Anything above failing leaves the pre-rendered fallback affirmation on screen — never blank.
  }
})();

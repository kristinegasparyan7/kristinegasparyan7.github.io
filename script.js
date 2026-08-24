(function () {
  'use strict';

  var C = window.OGT_CONTENT || {};
  var TAGS = C.affirmations || [];
  var AFFIRMATIONS = TAGS.map(function (a) { return a.t; });
  var FEELINGS = C.feelings || [];
  var CONTEXTS = C.contexts || [];

  var STORE_KEY = 'ogt.v1';
  var HISTORY_LIMIT = 60; // R12 — bounded so history stays readable
  var B36 = 36;

  /* ---------- utilities ---------- */

  function hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function labelFor(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].label;
    return null;
  }

  /* ---------- storage (R12) — device-only, never fatal ---------- */

  var storageOk = true;

  function loadStore() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || !Array.isArray(parsed.checkins)) return { checkins: [] };
      return parsed;
    } catch (e) {
      storageOk = false;
      return { checkins: [] };
    }
  }

  function saveStore(store) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      // Private browsing, storage disabled, or quota. The visit still works.
      storageOk = false;
      return false;
    }
  }

  /* ---------- kept thoughts (R9) — the URL is the store ---------- */

  function encodeKept(list) {
    var out = '';
    for (var i = 0; i < list.length; i++) out += list[i].toString(B36).padStart(2, '0');
    return out;
  }

  function decodeKept(raw) {
    var list = [];
    if (!raw || raw.length % 2 !== 0) return list;
    for (var i = 0; i < raw.length; i += 2) {
      var n = parseInt(raw.slice(i, i + 2), B36);
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
    var h = list.length ? '#kept=' + encodeKept(list) : '';
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search + h);
      return true;
    } catch (e) { return false; }
  }

  /* ---------- matching (R11) ---------- */

  // Ranked pool: everything the feeling fits, best matches first. Scoring
  // feeling=2 / context=1 lets a situation break ties without ever outranking
  // the feeling, and guarantees the pool is bigger than one item.
  function buildPool(feeling, context, seed) {
    var scored = [];
    for (var i = 0; i < TAGS.length; i++) {
      var t = TAGS[i];
      var s = (t.f.indexOf(feeling) !== -1 ? 2 : 0) + (t.c.indexOf(context) !== -1 ? 1 : 0);
      if (s > 0) scored.push({ i: i, s: s, j: hash(seed + ':' + i) });
    }
    // Unknown ids matched nothing: fall back to the whole set (R11 negative path).
    if (!scored.length) {
      for (var k = 0; k < TAGS.length; k++) scored.push({ i: k, s: 0, j: hash(seed + ':' + k) });
    }
    scored.sort(function (a, b) { return b.s - a.s || a.j - b.j; });
    return scored.map(function (o) { return o.i; });
  }

  /* ---------- app ---------- */

  function init() {
    var el = document.getElementById('affirmation');
    if (!el || !AFFIRMATIONS.length) return; // fallback text stays on screen

    var d = {
      checkin: document.getElementById('checkin'),
      stepLabel: document.getElementById('step-label'),
      question: document.getElementById('question'),
      options: document.getElementById('options'),
      checkinBack: document.getElementById('checkin-back'),
      thoughtView: document.getElementById('thought-view'),
      meta: document.getElementById('meta'),
      controls: document.getElementById('today-controls'),
      another: document.getElementById('another-btn'),
      keep: document.getElementById('keep-btn'),
      review: document.getElementById('review-btn'),
      history: document.getElementById('history-btn'),
      reviewNav: document.getElementById('review-nav'),
      prev: document.getElementById('prev-btn'),
      next: document.getElementById('next-btn'),
      counter: document.getElementById('counter'),
      copy: document.getElementById('copy-btn'),
      done: document.getElementById('done-btn'),
      linkNote: document.getElementById('link-note'),
      historyView: document.getElementById('history-view'),
      historyList: document.getElementById('history-list'),
      historyNote: document.getElementById('history-note'),
      clear: document.getElementById('clear-btn'),
      historyDone: document.getElementById('history-done')
    };

    var store = loadStore();
    var kept = readKeptFromUrl();
    var today = dateKey();

    var todayCheckin = null;
    for (var i = store.checkins.length - 1; i >= 0; i--) {
      if (store.checkins[i].d === today) { todayCheckin = store.checkins[i]; break; }
    }

    var mode = todayCheckin ? 'thought' : 'checkin'; // checkin | thought | review | history
    var step = 1;
    var draftFeeling = null;
    var pool = [];
    var cursor = 0;
    var reviewPos = 0;
    var swapping = false;
    var clearArmed = false;
    var clearTimer;

    if (todayCheckin) {
      pool = buildPool(todayCheckin.f, todayCheckin.c, today + todayCheckin.f + todayCheckin.c);
      var at = pool.indexOf(todayCheckin.i);
      cursor = at === -1 ? 0 : at;
    }

    function currentIndex() {
      if (mode === 'review') return kept[reviewPos];
      return pool.length ? pool[cursor] : 0;
    }

    /* ---- rendering ---- */

    function renderOptions() {
      var list = step === 1 ? FEELINGS : CONTEXTS;
      d.stepLabel.textContent = 'Step ' + step + ' of 2';
      d.question.textContent = step === 1 ? 'How are you feeling?' : 'What is affecting you?';
      d.checkinBack.hidden = step === 1;
      d.options.textContent = '';

      list.forEach(function (opt) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'option';
        b.textContent = opt.label;
        b.addEventListener('click', function () { choose(opt.id); });
        d.options.appendChild(b);
      });

      var first = d.options.querySelector('.option');
      if (first) first.focus();
    }

    function renderHistory() {
      d.historyList.textContent = '';
      store.checkins.slice().reverse().forEach(function (c) {
        var li = document.createElement('li');
        li.className = 'history-row';

        var when = document.createElement('span');
        when.className = 'history-date';
        when.textContent = c.d === today ? 'Today' : c.d;

        var what = document.createElement('span');
        what.className = 'history-what';
        what.textContent = (labelFor(FEELINGS, c.f) || c.f) + ' · ' + (labelFor(CONTEXTS, c.c) || c.c);

        li.appendChild(when);
        li.appendChild(what);
        d.historyList.appendChild(li);
      });

      if (!storageOk) {
        d.historyNote.hidden = false;
        d.historyNote.textContent = 'This browser is blocking storage, so check-ins from this visit will not be saved.';
      } else {
        d.historyNote.hidden = true;
      }
    }

    function renderMeta() {
      if (!todayCheckin || mode !== 'thought') { d.meta.hidden = true; return; }
      d.meta.hidden = false;
      d.meta.textContent = '';

      var span = document.createElement('span');
      span.textContent = (labelFor(FEELINGS, todayCheckin.f) || '') + ' · ' + (labelFor(CONTEXTS, todayCheckin.c) || '');

      var redo = document.createElement('button');
      redo.type = 'button';
      redo.className = 'meta-btn';
      redo.textContent = 'change';
      redo.setAttribute('aria-label', 'Change how you are feeling today');
      redo.addEventListener('click', restartCheckin);

      d.meta.appendChild(span);
      d.meta.appendChild(redo);
    }

    function paint() {
      d.checkin.hidden = mode !== 'checkin';
      d.thoughtView.hidden = mode === 'checkin' || mode === 'history';
      d.historyView.hidden = mode !== 'history';
      document.body.classList.toggle('is-reviewing', mode === 'review');
      document.body.classList.toggle('is-history', mode === 'history');

      if (mode === 'checkin') { renderOptions(); return; }
      if (mode === 'history') { renderHistory(); return; }

      var idx = currentIndex();
      if (typeof idx !== 'number') return;
      el.textContent = AFFIRMATIONS[idx];

      renderMeta();

      var isKept = kept.indexOf(idx) !== -1;
      d.keep.setAttribute('aria-pressed', isKept ? 'true' : 'false');
      d.keep.querySelector('span').textContent = mode === 'review' ? 'Remove' : (isKept ? 'Kept' : 'Keep');
      d.keep.setAttribute('aria-label', mode === 'review'
        ? 'Remove this thought from your kept thoughts'
        : (isKept ? 'Kept. Select to remove from your kept thoughts' : 'Keep this thought'));

      d.review.hidden = mode === 'review' || kept.length === 0;
      if (!d.review.hidden) d.review.querySelector('span').textContent = 'Kept thoughts (' + kept.length + ')';

      d.history.hidden = mode === 'review' || store.checkins.length === 0;

      d.another.hidden = mode === 'review';
      d.reviewNav.hidden = mode !== 'review';
      d.linkNote.hidden = mode !== 'review';

      if (mode === 'review') {
        d.counter.textContent = (reviewPos + 1) + ' / ' + kept.length;
        d.prev.disabled = kept.length < 2;
        d.next.disabled = kept.length < 2;
      }

      d.controls.hidden = false;
    }

    function swapTo(fn) {
      if (swapping) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { fn(); paint(); return; }
      swapping = true;
      el.classList.add('is-swapping');
      window.setTimeout(function () {
        fn(); paint();
        el.classList.remove('is-swapping');
        swapping = false;
      }, 150);
    }

    /* ---- R10: check-in ---- */

    function choose(id) {
      if (step === 1) {
        draftFeeling = id;
        step = 2;
        renderOptions();
        return;
      }

      pool = buildPool(draftFeeling, id, today + draftFeeling + id);
      cursor = 0;
      todayCheckin = { d: today, f: draftFeeling, c: id, i: pool[0] };

      // one record per day — redoing today replaces it rather than stacking
      store.checkins = store.checkins.filter(function (c) { return c.d !== today; });
      store.checkins.push(todayCheckin);
      if (store.checkins.length > HISTORY_LIMIT) store.checkins = store.checkins.slice(-HISTORY_LIMIT);
      saveStore(store);

      mode = 'thought';
      step = 1;
      paint();
    }

    function restartCheckin() {
      mode = 'checkin';
      step = 1;
      draftFeeling = null;
      paint();
    }

    d.checkinBack.addEventListener('click', function () {
      if (step === 2) { step = 1; renderOptions(); }
    });

    /* ---- R2: another ---- */
    d.another.addEventListener('click', function () {
      swapTo(function () {
        cursor++;
        if (cursor >= pool.length) cursor = 0;
      });
    });

    /* ---- R7: keep / remove ---- */
    d.keep.addEventListener('click', function () {
      if (swapping) return;
      var idx = currentIndex();
      if (typeof idx !== 'number') return;

      var at = kept.indexOf(idx);
      var next = kept.slice();
      if (at === -1) next.push(idx); else next.splice(at, 1);

      var before = kept;
      kept = next;
      if (!writeKeptToUrl(kept)) { kept = before; paint(); return; }

      if (mode === 'review') {
        if (!kept.length) { swapTo(function () { mode = 'thought'; }); return; }
        if (reviewPos >= kept.length) reviewPos = kept.length - 1;
        swapTo(function () {});
        return;
      }
      paint();
    });

    /* ---- R8: review kept ---- */
    d.review.addEventListener('click', function () {
      if (!kept.length) return;
      swapTo(function () { mode = 'review'; reviewPos = 0; });
    });

    d.done.addEventListener('click', function () {
      swapTo(function () { mode = 'thought'; });
    });

    function stepReview(delta) {
      if (mode !== 'review' || kept.length < 2) return;
      swapTo(function () { reviewPos = (reviewPos + delta + kept.length) % kept.length; });
    }

    d.prev.addEventListener('click', function () { stepReview(-1); });
    d.next.addEventListener('click', function () { stepReview(1); });

    document.addEventListener('keydown', function (e) {
      if (mode !== 'review') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepReview(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepReview(1); }
      else if (e.key === 'Escape') { e.preventDefault(); swapTo(function () { mode = 'thought'; }); }
    });

    /* ---- R9: copy link ---- */
    var copyTimer;
    d.copy.addEventListener('click', function () {
      var label = d.copy.querySelector('span');
      function done(ok) {
        label.textContent = ok ? 'Link copied' : 'Copy from the address bar';
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(function () { label.textContent = 'Copy link'; }, 2400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(function () { done(true); }, function () { done(false); });
      } else { done(false); }
    });

    /* ---- R12: history ---- */
    function disarmClear() {
      clearArmed = false;
      window.clearTimeout(clearTimer);
      d.clear.querySelector('span').textContent = 'Clear history';
    }

    d.history.addEventListener('click', function () {
      mode = 'history';
      disarmClear();
      paint();
    });

    d.historyDone.addEventListener('click', function () {
      mode = 'thought';
      disarmClear();
      paint();
    });

    // two-step confirm rather than a modal — clearing cannot be undone
    d.clear.addEventListener('click', function () {
      if (!clearArmed) {
        clearArmed = true;
        d.clear.querySelector('span').textContent = 'Tap again to clear';
        clearTimer = window.setTimeout(disarmClear, 4000);
        return;
      }
      disarmClear();
      store.checkins = [];
      saveStore(store);
      todayCheckin = null;
      restartCheckin();
    });

    /* ---- shared kept-links opened without a reload ---- */
    window.addEventListener('hashchange', function () {
      var incoming = readKeptFromUrl();
      if (encodeKept(incoming) === encodeKept(kept)) return;
      kept = incoming;
      if (mode === 'review' && !kept.length) mode = 'thought';
      if (reviewPos >= kept.length) reviewPos = 0;
      paint();
    });

    paint();
  }

  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch (e) {
    // Fallback affirmation is already in the DOM — never a blank page (R6).
  }
})();

(function () {
  'use strict';

  var C = window.OGT_CONTENT || {};
  var TAGS = C.affirmations || [];
  var FEELINGS = C.feelings || [];
  var CONTEXTS = C.contexts || [];
  var PROMPTS = C.prompts || [];
  var LANGS = C.languages || [{ id: 'en', label: 'EN' }];

  var lang = 'en';
  function T(key) { return ((C.ui || {})[lang] || {})[key] || ((C.ui || {}).en || {})[key] || ''; }
  function textOf(item) { return (item && (item[lang] || item.en)) || ''; }
  function affirmationText(i) { return textOf(TAGS[i]); }

  var STORE_KEY = 'ogt.v1';
  var HISTORY_LIMIT = 60; // R12 — bounded so history stays readable
  var GRATITUDE_DAYS = 30; // R13 — bounded the same way
  var GRATITUDE_SLOTS = 5;
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
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return textOf(list[i]);
    return null;
  }

  /* ---------- storage (R12) — device-only, never fatal ---------- */

  var storageOk = true;

  function loadStore() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || !Array.isArray(parsed.checkins)) return { checkins: [], gratitude: {}, seen: [] };
      if (!parsed.gratitude || typeof parsed.gratitude !== 'object') parsed.gratitude = {};
      if (!Array.isArray(parsed.seen)) {
        // First run under R14: past check-ins record what was already shown.
        parsed.seen = [];
        for (var m = 0; m < parsed.checkins.length; m++) {
          var pi = parsed.checkins[m].i;
          if (typeof pi === 'number' && parsed.seen.indexOf(pi) === -1) parsed.seen.push(pi);
        }
      }
      return parsed;
    } catch (e) {
      storageOk = false;
      return { checkins: [], gratitude: {}, seen: [] };
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
      if (isNaN(n) || n < 0 || n >= TAGS.length) continue;
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

  // Every affirmation ranked against the check-in, best match first.
  // Scoring feeling=2 / context=1 lets a situation break ties without ever
  // outranking the feeling. Score 0 means no match at all, kept at the back
  // so R14 can still reach it once the matching ones are used up.
  function rankAll(feeling, context, seed) {
    var scored = [];
    for (var i = 0; i < TAGS.length; i++) {
      var t = TAGS[i];
      var sc = (t.f.indexOf(feeling) !== -1 ? 2 : 0) + (t.c.indexOf(context) !== -1 ? 1 : 0);
      scored.push({ i: i, s: sc, j: hash(seed + ':' + i) });
    }
    scored.sort(function (a, b) { return b.s - a.s || a.j - b.j; });
    return scored;
  }

  /* ---------- gratitude (R13) ---------- */

  // Five prompts per day, rotated deterministically so the same day always
  // asks the same things but consecutive days differ.
  function promptsForDay(key) {
    if (PROMPTS.length <= GRATITUDE_SLOTS) return PROMPTS.slice();
    var start = hash(key) % PROMPTS.length;
    var out = [];
    for (var i = 0; i < GRATITUDE_SLOTS; i++) out.push(PROMPTS[(start + i) % PROMPTS.length]);
    return out;
  }

  /* ---------- app ---------- */

  function init() {
    var el = document.getElementById('affirmation');
    if (!el || !TAGS.length) return; // fallback text stays on screen

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
      crumbs: document.getElementById('crumbs'),
      crumbHome: document.getElementById('crumb-home'),
      crumbCurrent: document.getElementById('crumb-current'),
      linkNote: document.getElementById('link-note'),
      historyView: document.getElementById('history-view'),
      historyList: document.getElementById('history-list'),
      historyNote: document.getElementById('history-note'),
      clear: document.getElementById('clear-btn'),
      navRow: document.getElementById('nav-row'),
      thoughtActions: document.getElementById('thought-actions'),
      gratitude: document.getElementById('gratitude-btn'),
      gratitudeView: document.getElementById('gratitude-view'),
      gratitudeList: document.getElementById('gratitude-list'),
      savedNote: document.getElementById('saved-note'),
      topbar: document.getElementById('topbar'),
      langSwitch: document.getElementById('lang-switch'),
      themeBtn: document.getElementById('theme-btn'),
      historyHead: document.getElementById('history-head'),
      historyTitle: document.getElementById('history-title'),
      gratitudeTitle: document.getElementById('gratitude-title'),
      gratitudeIntro: document.getElementById('gratitude-intro')
    };

    var store = loadStore();
    lang = store.lang && (C.ui || {})[store.lang] ? store.lang : 'en';
    var theme = store.theme === 'light' || store.theme === 'dark'
      ? store.theme
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

    var kept = readKeptFromUrl();
    var today = dateKey();

    var todayCheckin = null;
    for (var i = store.checkins.length - 1; i >= 0; i--) {
      if (store.checkins[i].d === today) { todayCheckin = store.checkins[i]; break; }
    }

    var mode = todayCheckin ? 'thought' : 'checkin'; // checkin | thought | review | history
    var step = 1;
    var draftFeeling = null;

    var reviewPos = 0;
    var swapping = false;
    var clearArmed = false;
    var clearTimer;

    function currentIndex() {
      if (mode === 'review') return kept[reviewPos];
      return todayCheckin && typeof todayCheckin.i === 'number' ? todayCheckin.i : 0;
    }

    /* ---- R14: never show the same affirmation twice ---- */

    function markSeen(i) {
      if (store.seen.indexOf(i) === -1) store.seen.push(i);
    }

    // Best unseen match. Falls back to an unseen non-match rather than
    // repeating — never-repeat outranks match quality. When the whole set
    // has been seen the list resets and the cycle starts over.
    function pickUnseen(feeling, context) {
      var ranked = rankAll(feeling, context, today + feeling + context);
      var i;

      for (i = 0; i < ranked.length; i++) {
        if (ranked[i].s > 0 && store.seen.indexOf(ranked[i].i) === -1) return ranked[i].i;
      }
      for (i = 0; i < ranked.length; i++) {
        if (store.seen.indexOf(ranked[i].i) === -1) return ranked[i].i;
      }

      store.seen = [];
      return ranked.length ? ranked[0].i : 0;
    }

    /* ---- rendering ---- */

    function applyTheme() {
      document.documentElement.setAttribute('data-theme', theme);
      d.themeBtn.setAttribute('aria-label', theme === 'dark' ? T('themeToLight') : T('themeToDark'));
    }

    function renderLangSwitch() {
      d.langSwitch.setAttribute('aria-label', T('langLabel'));
      d.langSwitch.textContent = '';
      LANGS.forEach(function (l) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'lang-opt' + (l.id === lang ? ' is-active' : '');
        b.textContent = l.label;
        b.setAttribute('aria-pressed', l.id === lang ? 'true' : 'false');
        b.setAttribute('lang', l.id);
        b.addEventListener('click', function () {
          if (l.id === lang) return;
          lang = l.id;
          store.lang = lang;
          saveStore(store);
          document.documentElement.lang = lang;
          applyStrings();
          paint();
        });
        d.langSwitch.appendChild(b);
      });
    }

    // every string that isn't rendered inside paint()
    function applyStrings() {
      document.documentElement.lang = lang;
      document.title = 'OneGoodThought \u2014 ' + T('title');

      var nodes = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].textContent = T(nodes[i].getAttribute('data-i18n'));
      }

      d.crumbHome.textContent = T('home');
      d.another.querySelector('span').textContent = T('another');
      d.another.setAttribute('aria-label', T('anotherLabel'));
      d.checkinBack.querySelector('span').textContent = T('back');
      d.copy.querySelector('span').textContent = T('copyLink');
      d.review.querySelector('span').textContent = T('keptThoughts');
      d.history.querySelector('span').textContent = T('howIveBeen');
      d.historyTitle.textContent = T('howYouveBeen');
      d.gratitudeTitle.textContent = T('fiveGood');
      d.gratitudeIntro.textContent = T('gratitudeIntro');
      d.linkNote.textContent = T('linkNote');
      d.clear.querySelector('span').textContent = T('clear');
      d.prev.setAttribute('aria-label', T('prevKept'));
      d.next.setAttribute('aria-label', T('nextKept'));

      renderLangSwitch();
      applyTheme();
    }

    function renderOptions() {
      var list = step === 1 ? FEELINGS : CONTEXTS;
      d.stepLabel.textContent = T('step').replace('{n}', step);
      d.question.textContent = step === 1 ? T('q1') : T('q2');
      d.checkinBack.hidden = step === 1;
      d.options.textContent = '';

      list.forEach(function (opt) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'option';
        b.textContent = textOf(opt);
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
        when.textContent = c.d === today ? T('today') : c.d;

        var felt = document.createElement('span');
        felt.className = 'history-felt';
        felt.textContent = labelFor(FEELINGS, c.f) || c.f;

        var about = document.createElement('span');
        about.className = 'history-about';
        about.textContent = labelFor(CONTEXTS, c.c) || c.c;

        li.appendChild(when);
        li.appendChild(felt);
        li.appendChild(about);
        d.historyList.appendChild(li);
      });

      if (!storageOk) {
        d.historyNote.hidden = false;
        d.historyNote.textContent = T('storageBlocked');
      } else {
        d.historyNote.hidden = true;
      }
    }

    function gratitudeAnswers() {
      var a = store.gratitude[today];
      if (!Array.isArray(a)) a = [];
      while (a.length < GRATITUDE_SLOTS) a.push('');
      return a.slice(0, GRATITUDE_SLOTS);
    }

    var saveTimer;
    function saveGratitude(answers) {
      store.gratitude[today] = answers;

      // keep only the most recent days so the store stays bounded
      var keys = Object.keys(store.gratitude).sort();
      while (keys.length > GRATITUDE_DAYS) delete store.gratitude[keys.shift()];

      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(function () {
        var ok = saveStore(store);
        d.savedNote.textContent = ok ? T('saved') : T('notSaved');
        window.setTimeout(function () {
          if (d.savedNote.textContent === T('saved')) d.savedNote.textContent = '';
        }, 1800);
      }, 400);
    }

    function renderGratitude() {
      var prompts = promptsForDay(today);
      var answers = gratitudeAnswers();
      d.gratitudeList.textContent = '';
      d.savedNote.textContent = '';

      prompts.forEach(function (prompt, i) {
        var li = document.createElement('li');
        li.className = 'g-row';
        li.style.setProperty('--i', i);
        if (answers[i]) li.classList.add('is-filled');

        var label = document.createElement('label');
        label.className = 'g-prompt';
        label.setAttribute('for', 'g' + i);
        label.textContent = textOf(prompt);

        var input = document.createElement('input');
        input.className = 'g-input';
        input.id = 'g' + i;
        input.type = 'text';
        input.maxLength = 90;
        input.autocomplete = 'off';
        input.value = answers[i] || '';

        input.addEventListener('input', function () {
          answers[i] = input.value;
          li.classList.toggle('is-filled', !!input.value.trim());
          saveGratitude(answers);
        });

        li.appendChild(label);
        li.appendChild(input);
        d.gratitudeList.appendChild(li);
      });
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
      redo.textContent = T('change');
      redo.setAttribute('aria-label', T('changeLabel'));
      redo.addEventListener('click', restartCheckin);

      d.meta.appendChild(span);
      d.meta.appendChild(redo);
    }

    function paint() {
      var CRUMB = { review: T('keptThoughts'), history: T('howYouveBeen'), gratitude: T('fiveGood') };
      d.crumbs.hidden = !CRUMB[mode];
      if (CRUMB[mode]) d.crumbCurrent.textContent = CRUMB[mode];

      d.checkin.hidden = mode !== 'checkin';
      d.thoughtView.hidden = mode === 'checkin' || mode === 'history' || mode === 'gratitude';
      d.historyView.hidden = mode !== 'history';
      d.gratitudeView.hidden = mode !== 'gratitude';
      document.body.classList.toggle('is-reviewing', mode === 'review');
      document.body.classList.toggle('is-history', mode === 'history');
      document.body.classList.toggle('is-gratitude', mode === 'gratitude');

      if (mode === 'checkin') { renderOptions(); return; }
      if (mode === 'history') { renderHistory(); return; }
      if (mode === 'gratitude') { renderGratitude(); return; }

      var idx = currentIndex();
      if (typeof idx !== 'number') return;
      el.textContent = affirmationText(idx);

      renderMeta();

      // review gets one coherent action row instead of a stray button above it
      if (mode === 'review') {
        if (d.keep.parentNode !== d.reviewNav) d.reviewNav.insertBefore(d.keep, d.copy);
      } else if (d.keep.parentNode !== d.thoughtActions) {
        d.thoughtActions.appendChild(d.keep);
      }

      var isKept = kept.indexOf(idx) !== -1;
      if (mode === 'review') {
        // everything here is already kept, so the toggle state carries no
        // information — it is a destructive action, and must not look primary
        d.keep.className = 'btn btn--nav btn--danger keep';
        d.keep.removeAttribute('aria-pressed');
        d.keep.querySelector('span').textContent = T('remove');
        d.keep.setAttribute('aria-label', T('removeLabel'));
      } else {
        d.keep.className = 'btn btn--secondary keep';
        d.keep.setAttribute('aria-pressed', isKept ? 'true' : 'false');
        d.keep.querySelector('span').textContent = isKept ? T('kept') : T('keep');
        d.keep.setAttribute('aria-label', isKept ? T('keptLabel') : T('keepLabel'));
      }

      d.review.hidden = mode === 'review' || kept.length === 0;
      if (!d.review.hidden) d.review.querySelector('span').textContent = T('keptThoughts') + ' (' + kept.length + ')';

      d.history.hidden = mode === 'review' || store.checkins.length === 0;
      d.gratitude.hidden = mode === 'review'; // R13 — otherwise always available

      // no orphan rule when every destination in the row is hidden
      d.navRow.hidden = d.gratitude.hidden && d.review.hidden && d.history.hidden;

      d.another.hidden = mode === 'review';
      d.thoughtActions.hidden = mode === 'review';
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

      var picked = pickUnseen(draftFeeling, id);
      markSeen(picked);
      todayCheckin = { d: today, f: draftFeeling, c: id, i: picked };

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
      if (!todayCheckin) return;
      swapTo(function () {
        var next = pickUnseen(todayCheckin.f, todayCheckin.c);
        markSeen(next);
        todayCheckin.i = next;
        saveStore(store);
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

    function goHome() {
      if (mode === 'gratitude') { window.clearTimeout(saveTimer); saveStore(store); }
      disarmClear();
      if (mode === 'review') { swapTo(function () { mode = 'thought'; }); return; }
      mode = 'thought';
      paint();
    }

    d.crumbHome.addEventListener('click', goHome);

    function stepReview(delta) {
      if (mode !== 'review' || kept.length < 2) return;
      swapTo(function () { reviewPos = (reviewPos + delta + kept.length) % kept.length; });
    }

    d.prev.addEventListener('click', function () { stepReview(-1); });
    d.next.addEventListener('click', function () { stepReview(1); });

    document.addEventListener('keydown', function (e) {
      // Escape backs out of any sub-view, matching the breadcrumb
      if (e.key === 'Escape' && (mode === 'review' || mode === 'history' || mode === 'gratitude')) {
        e.preventDefault();
        goHome();
        return;
      }
      if (mode !== 'review') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepReview(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepReview(1); }
    });

    /* ---- R9: copy link ---- */
    var copyTimer;
    d.copy.addEventListener('click', function () {
      var label = d.copy.querySelector('span');
      function done(ok) {
        label.textContent = ok ? T('copied') : T('copyFail');
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(function () { label.textContent = T('copyLink'); }, 2400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(function () { done(true); }, function () { done(false); });
      } else { done(false); }
    });

    /* ---- R12: history ---- */
    function disarmClear() {
      clearArmed = false;
      window.clearTimeout(clearTimer);
      d.clear.querySelector('span').textContent = T('clear');
    }

    d.history.addEventListener('click', function () {
      mode = 'history';
      disarmClear();
      paint();
    });

    // two-step confirm rather than a modal — clearing cannot be undone
    d.clear.addEventListener('click', function () {
      if (!clearArmed) {
        clearArmed = true;
        d.clear.querySelector('span').textContent = T('clearArm');
        clearTimer = window.setTimeout(disarmClear, 4000);
        return;
      }
      disarmClear();
      store.checkins = [];
      saveStore(store);
      todayCheckin = null;
      restartCheckin();
    });

    /* ---- R13: five good things ---- */
    d.gratitude.addEventListener('click', function () {
      mode = 'gratitude';
      paint();
      var first = d.gratitudeList.querySelector('.g-input');
      if (first) first.focus();
    });

    d.themeBtn.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      store.theme = theme;
      saveStore(store);
      applyTheme();
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

    d.topbar.hidden = false;
    applyStrings();
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

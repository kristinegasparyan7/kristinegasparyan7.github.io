(function () {
  'use strict';

  // R6 — shown by default in the HTML; also the last resort if anything below throws.
  var FALLBACK = "You’re doing okay. That’s enough for today.";

  // R5 — curated set. Order is fixed; "today" is a deterministic pick from it, not a fetch.
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
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
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

  function init() {
    var el = document.getElementById('affirmation');
    var btn = document.getElementById('another-btn');
    if (!el || !AFFIRMATIONS.length) return; // fallback text already in the DOM

    var todayIndex = hash(localDateKey()) % AFFIRMATIONS.length;

    // R2 — cycling order for "Another": every index once, today's pick first,
    // reshuffled on wrap so it never repeats across the seam either.
    var order = shuffled(AFFIRMATIONS.length);
    var todayPos = order.indexOf(todayIndex);
    order.splice(todayPos, 1);
    order.unshift(todayIndex);
    var cursor = 0;

    function render(text) {
      el.textContent = text;
    }

    render(AFFIRMATIONS[order[cursor]]);

    if (!btn || AFFIRMATIONS.length < 2) {
      if (btn) btn.style.display = 'none';
      return;
    }

    var swapping = false;

    btn.addEventListener('click', function () {
      if (swapping) return;
      swapping = true;

      cursor++;
      if (cursor >= order.length) {
        var last = order[order.length - 1];
        do {
          order = shuffled(AFFIRMATIONS.length);
        } while (order[0] === last);
        cursor = 0;
      }

      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        render(AFFIRMATIONS[order[cursor]]);
        swapping = false;
        return;
      }

      el.classList.add('is-swapping');
      window.setTimeout(function () {
        render(AFFIRMATIONS[order[cursor]]);
        el.classList.remove('is-swapping');
        swapping = false;
      }, 150);
    });
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

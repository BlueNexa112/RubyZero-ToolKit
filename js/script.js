/* ==========================================================
   ToolKit — Main Script (FIXED)
   - Mendukung `item.kind` per-item (apk / game)
   - Search, filter, counter, empty-state
   - Haptic feedback ringan
   ========================================================== */

(function (window, document) {
  'use strict';

  var ToolKit = {};

  /* ---------- UTIL ---------- */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Bangun URL: apk/apk{id}.html atau game/game{id}.html */
  function buildHref(kind, id) {
    var folder = (kind === 'game') ? 'game' : 'apk';
    var file   = (kind === 'game') ? 'game' : 'apk';
    return folder + '/' + file + id + '.html';
  }

  /* Kartu item — sekarang menghormati data.kind */
  function itemHTML(data, index, defaultKind) {
    var id        = data.id;
    var kind      = data.kind || defaultKind;   // <-- FIX utama
    var name      = esc(data.name);
    var desc      = esc(data.desc);
    var icon      = esc(data.icon || '📦');
    var cat       = esc(data.cat || data.tag || '');
    var tone      = esc(data.tone || 'cyan');
    var href      = buildHref(kind, id);
    var num       = ('0' + (index + 1)).slice(-2);

    return '' +
      '<a class="item tone-' + tone + '" href="' + href + '"' +
         ' data-name="' + name.toLowerCase() + '"' +
         ' data-cat="' + cat + '">' +
        '<span class="item-num">' + num + '</span>' +
        '<span class="item-icon">' + icon + '</span>' +
        '<span class="item-body">' +
          '<span class="item-name">' + name + '</span>' +
          '<span class="item-desc">' + desc + '</span>' +
          (cat ? '<span class="item-tag">' + cat + '</span>' : '') +
        '</span>' +
        '<span class="item-go" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
               'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="m9 6 6 6-6 6"/>' +
          '</svg>' +
        '</span>' +
      '</a>';
  }

  /* ---------- RENDER ---------- */
  ToolKit.render = function (selector, data, defaultKind) {
    var el = document.querySelector(selector);
    if (!el || !Array.isArray(data)) return;

    el.innerHTML = data.map(function (item, i) {
      return itemHTML(item, i, defaultKind);
    }).join('');
  };

  /* ---------- SEARCH + FILTER ---------- */
  ToolKit.bindSearch = function (inputSel, chipSel, listSel, countSel, emptySel) {
    var input   = document.querySelector(inputSel);
    var chipBox = document.querySelector(chipSel);
    var list    = document.querySelector(listSel);
    var counter = document.querySelector(countSel);
    var empty   = document.querySelector(emptySel);
    if (!list) return;

    var state = { q: '', cat: 'all' };

    function apply() {
      var items   = list.querySelectorAll('.item');
      var visible = 0;

      items.forEach(function (node) {
        var name = node.getAttribute('data-name') || '';
        var cat  = node.getAttribute('data-cat')  || '';
        var okQ  = !state.q   || name.indexOf(state.q) !== -1;
        var okC  = state.cat === 'all' || cat === state.cat;
        var show = okQ && okC;

        node.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (counter) counter.textContent = visible + ' item';
      if (empty)   empty.hidden = visible !== 0;
    }

    if (input) {
      input.addEventListener('input', function () {
        state.q = this.value.trim().toLowerCase();
        apply();
      });
    }

    if (chipBox) {
      chipBox.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;

        chipBox.querySelectorAll('.chip').forEach(function (c) {
          c.classList.remove('active');
        });
        chip.classList.add('active');

        state.cat = chip.getAttribute('data-cat') || 'all';
        apply();
      });
    }

    apply();
  };

  /* ---------- HAPTIC ---------- */
  ToolKit.tap = function (ms) {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms || 8); } catch (e) {}
    }
  };

  document.addEventListener('click', function (e) {
    var t = e.target.closest('.btn, .icon-btn, .nav-item, .nav-card, .chip, .item');
    if (t) ToolKit.tap(8);
  }, { passive: true });

  /* Cegah zoom dengan dua jari */
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  window.ToolKit = ToolKit;

})(window, document);
/*
 * SALTGLASS engine: state, rules, rendering, saving. No dependencies.
 * Story data lives in story.js (window.STORY).
 */
(function () {
  'use strict';

  var STORY = window.STORY;
  var SAVE_KEY = 'saltglass.save.v1';
  var META_KEY = 'saltglass.meta.v1';
  var STAT_LABEL = { grit: 'GRIT', wits: 'WITS', charm: 'CHARM' };
  var KEY_LABEL = { dosesuit: 'Sealed dose-suit', passphrase: 'The passphrase', cell: 'Charged power cell' };
  var ALLY_LABEL = { tallymen: 'The Tallymen (Brinetown)', choir: 'The Choir of the Warm Hymn', rustwrights: 'The Rustwrights (Patience)' };
  var FLAG_LABEL = {
    logbook: 'Read Odalys\'s logbook',
    gear: 'Took gear from the locker',
    triangulated: 'Found the signal bearing',
    debt: 'You owe the Tallymen',
    stole: 'Took the suit from the ledger room',
    unsuited: 'Went down the Deepwell unsuited',
    heard_tape: 'Heard the first Keeper\'s tape',
    heard_loop: 'Heard the crossroads loop',
    rw_toured: 'Toured the Rustwright workshop',
    warned: 'Warned the Choir',
    pump: 'Choir pump: ',
    gearbox: 'Patience gearbox: fixed',
    door: 'Blast door: ',
    suit: 'Suit bought outright',
    pim: 'Pim: '
  };
  var reduceMotion = false;
  try {
    reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { reduceMotion = false; }

  var S = null;            // live game state
  var typer = null;        // active typewriter: { skip: fn }
  var armedNew = false;    // "New Game" pressed once while a save exists
  var endingIds = Object.keys(STORY.nodes).filter(function (id) { return STORY.nodes[id].ending; });

  function $(id) { return document.getElementById(id); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function maxHp(s) { return 10 + (s.stats.grit || 0); }

  /* ---------- storage (every call guarded; the game works without it) ---------- */

  function readSave() {
    try {
      var raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (d && d.state && STORY.nodes[d.state.node]) return d.state;
    } catch (e) { /* storage unavailable or corrupt */ }
    return null;
  }
  function writeSave() {
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, state: S })); } catch (e) { /* ignore */ }
  }
  function clearSave() {
    try { window.localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  }
  function readMeta() {
    try {
      var raw = window.localStorage.getItem(META_KEY);
      var d = raw ? JSON.parse(raw) : {};
      if (d && typeof d === 'object') { d.endings = d.endings || {}; return d; }
    } catch (e) { /* ignore */ }
    return { endings: {} };
  }
  function writeMeta(m) {
    try { window.localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) { /* ignore */ }
  }
  function endingsFound() {
    var m = readMeta();
    return endingIds.filter(function (id) { return !!m.endings[id]; }).length;
  }

  /* ---------- state rules ---------- */

  function newState() {
    return {
      node: STORY.start,
      stats: { grit: 0, wits: 0, charm: 0 },
      hp: 10, glow: 0, scrip: 12,
      inv: [], keys: [], allies: {}, flags: {},
      counters: { ammo: 0 }, notes: [], roll: ''
    };
  }

  function applyEffects(s, e) {
    if (!e) return;
    if (e.stats) {
      var wasFull = s.hp >= maxHp(s);
      Object.keys(e.stats).forEach(function (k) { s.stats[k] = (s.stats[k] || 0) + e.stats[k]; });
      if (wasFull) s.hp = maxHp(s);
    }
    if (e.hp) s.hp = clamp(s.hp + e.hp, 0, maxHp(s));
    if (e.glow) s.glow = clamp(s.glow + e.glow, 0, 10);
    if (e.scrip) s.scrip = Math.max(0, s.scrip + e.scrip);
    if (e.add) e.add.forEach(function (i) { s.inv.push(i); });
    if (e.remove) e.remove.forEach(function (i) {
      var at = s.inv.indexOf(i);
      if (at >= 0) s.inv.splice(at, 1);
    });
    if (e.keys) e.keys.forEach(function (k) { if (s.keys.indexOf(k) < 0) s.keys.push(k); });
    if (e.allies) e.allies.forEach(function (a) { s.allies[a] = true; });
    if (e.flags) Object.keys(e.flags).forEach(function (f) { s.flags[f] = e.flags[f]; });
    if (e.counters) Object.keys(e.counters).forEach(function (c) {
      s.counters[c] = Math.max(0, (s.counters[c] || 0) + e.counters[c]);
    });
    if (e.note && s.notes.indexOf(e.note) < 0) s.notes.push(e.note);
  }

  function condMet(c, s) {
    if (c.stat !== undefined) return (s.stats[c.stat] || 0) >= c.min;
    if (c.item !== undefined) return s.inv.indexOf(c.item) >= 0;
    if (c.flag !== undefined) return !!s.flags[c.flag];
    if (c.notFlag !== undefined) return !s.flags[c.notFlag];
    if (c.ally !== undefined) return !!s.allies[c.ally];
    if (c.key !== undefined) return s.keys.indexOf(c.key) >= 0;
    if (c.notKey !== undefined) return s.keys.indexOf(c.notKey) < 0;
    if (c.keysAtLeast !== undefined) return s.keys.length >= c.keysAtLeast;
    if (c.minScrip !== undefined) return s.scrip >= c.minScrip;
    if (c.counter !== undefined) return (s.counters[c.counter] || 0) >= c.min;
    if (c.maxGlow !== undefined) return s.glow <= c.maxGlow;
    return true;
  }

  function reqList(r) { return !r ? [] : Array.isArray(r) ? r : [r]; }

  // Returns the reason a choice is locked, or null when it is available.
  function unmetWhy(requires, s) {
    var list = reqList(requires);
    for (var i = 0; i < list.length; i++) {
      if (!condMet(list[i], s)) return list[i].why || 'not available yet';
    }
    return null;
  }

  function nodeText(node, s) {
    return typeof node.text === 'function' ? node.text(s) : node.text;
  }

  /* ---------- navigation ---------- */

  function goto(id) {
    var node = STORY.nodes[id];
    if (!node) { return; }
    S.node = id;
    applyEffects(S, node.onEnter);
    if (S.hp <= 0) S.node = STORY.deaths.hp;
    else if (S.glow >= 10) S.node = STORY.deaths.glow;
    writeSave();
    renderNode();
  }

  function choose(i) {
    if (typer) { typer.skip(); return; }
    var node = STORY.nodes[S.node];
    var c = node && node.choices && node.choices[i];
    if (!c || unmetWhy(c.requires, S)) return;

    applyEffects(S, c.effects);
    var target = c.to;
    S.roll = '';
    if (c.check) {
      var k = c.check;
      var d1 = 1 + Math.floor(Math.random() * 6);
      var d2 = 1 + Math.floor(Math.random() * 6);
      var mod = S.stats[k.stat] || 0;
      var total = d1 + d2 + mod;
      var ok = total >= k.dc;
      S.roll = STAT_LABEL[k.stat] + ' check: ' + d1 + '+' + d2 + ' +' + mod + ' = ' + total +
        ' vs ' + k.dc + ' — ' + (ok ? 'success' : 'failure');
      applyEffects(S, ok ? k.successEffects : k.failEffects);
      target = ok ? k.success : k.fail;
    } else if (c.random) {
      target = c.random[Math.floor(Math.random() * c.random.length)];
    }
    goto(target);
  }

  /* ---------- rendering ---------- */

  function cancelTyping() {
    if (typer) { typer.cancel(); typer = null; }
  }

  // Quick typewriter reveal. Any key or click calls skip(); reduced motion shows at once.
  function typeParagraphs(paras, done) {
    var box = $('text');
    box.innerHTML = '';
    var els = paras.map(function () {
      var p = document.createElement('p');
      box.appendChild(p);
      return p;
    });
    if (reduceMotion) {
      paras.forEach(function (t, i) { els[i].textContent = t; });
      done();
      return;
    }
    var pi = 0, ci = 0, timer = null, finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      typer = null;
      done();
    }
    typer = {
      skip: function () {
        if (finished) return;
        paras.forEach(function (t, i) { els[i].textContent = t; });
        finish();
      },
      cancel: function () { finished = true; clearTimeout(timer); }
    };
    function tick() {
      for (var n = 0; n < 3; n++) {
        if (finished) return;
        if (pi >= paras.length) { finish(); return; }
        ci++;
        els[pi].textContent = paras[pi].slice(0, ci);
        if (ci >= paras[pi].length) { pi++; ci = 0; }
      }
      timer = setTimeout(tick, 16);
    }
    tick();
  }

  function renderNode() {
    var node = STORY.nodes[S.node];
    cancelTyping();
    $('scene-title').textContent = node.title || '';
    $('roll').textContent = S.roll || '';
    $('choices').innerHTML = '';
    $('ending-banner').hidden = !node.ending;
    if (node.ending) {
      markEnding(S.node);
      $('ending-banner').textContent = 'ENDING: ' + node.title.toUpperCase() +
        '   ·   Endings found ' + endingsFound() + ' / ' + endingIds.length;
    }
    updateHud();
    var body = String(nodeText(node, S));
    var paras = body.split(/\n\s*\n/).filter(function (p) { return p.trim().length > 0; });
    typeParagraphs(paras, function () { renderChoices(node); });
  }

  function renderChoices(node) {
    var list = $('choices');
    list.innerHTML = '';
    if (node.ending || !node.choices || !node.choices.length) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.textContent = 'Return to the title';
      b.addEventListener('click', showTitle);
      li.appendChild(b);
      list.appendChild(li);
      return;
    }
    node.choices.forEach(function (c, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice';
      var why = unmetWhy(c.requires, S);

      var key = document.createElement('span');
      key.className = 'key';
      key.textContent = String(i + 1);
      btn.appendChild(key);

      if (c.check) {
        var tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = '[' + STAT_LABEL[c.check.stat] + ' ' + c.check.dc + ']';
        btn.appendChild(tag);
      }
      var label = document.createElement('span');
      label.className = 'label';
      label.textContent = c.label;
      btn.appendChild(label);

      if (why) {
        btn.disabled = true;
        btn.classList.add('locked');
        var w = document.createElement('span');
        w.className = 'why';
        w.textContent = why;
        btn.appendChild(w);
      } else {
        btn.addEventListener('click', function () { choose(i); });
      }
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function markEnding(id) {
    var m = readMeta();
    if (!m.endings[id]) {
      m.endings[id] = true;
      writeMeta(m);
    }
  }

  function updateHud() {
    if (!S) return;
    $('hud-hp').textContent = 'HP ' + S.hp + '/' + maxHp(S);
    $('hud-glow').textContent = 'GLOW ' + S.glow + '/10';
    $('hud-scrip').textContent = 'SCRIP ' + S.scrip;
    $('hud-stats').textContent = 'GRIT ' + S.stats.grit + '  WITS ' + S.stats.wits + '  CHARM ' + S.stats.charm;
    if (!$('journal').hidden) renderJournal();
  }

  function addLine(parent, tag, text, cls) {
    var el = document.createElement(tag);
    el.textContent = text;
    if (cls) el.className = cls;
    parent.appendChild(el);
    return el;
  }

  function section(body, title) {
    var sec = document.createElement('section');
    sec.className = 'jsec';
    addLine(sec, 'h3', title);
    body.appendChild(sec);
    return sec;
  }

  function renderJournal() {
    var body = $('journal-body');
    body.innerHTML = '';
    var s = S;

    var you = section(body, 'You');
    addLine(you, 'p', 'HP ' + s.hp + ' of ' + maxHp(s) + '   Glow ' + s.glow + ' of 10   Scrip ' + s.scrip);
    addLine(you, 'p', 'Grit ' + s.stats.grit + ', Wits ' + s.stats.wits + ', Charm ' + s.stats.charm);

    var inv = section(body, 'Pack');
    var counts = {};
    s.inv.forEach(function (i) { counts[i] = (counts[i] || 0) + 1; });
    var invKeys = Object.keys(counts);
    if (!invKeys.length && !s.counters.ammo) addLine(inv, 'p', 'Nothing much.');
    invKeys.forEach(function (i) {
      var txt = i === 'revolver' ? 'THE ARGUMENT, ' + (s.counters.ammo || 0) + ' rounds' :
        (i === 'tonic' ? 'Tonic x' + counts[i] : 'Toolkit');
      addLine(inv, 'p', txt);
    });

    var keys = section(body, 'Keys');
    if (!s.keys.length) addLine(keys, 'p', 'None yet. Two of three open the stairs.');
    s.keys.forEach(function (k) { addLine(keys, 'p', KEY_LABEL[k] || k); });

    var allies = section(body, 'Allies');
    var any = false;
    Object.keys(ALLY_LABEL).forEach(function (a) {
      if (s.allies[a]) { any = true; addLine(allies, 'p', ALLY_LABEL[a]); }
    });
    if (s.flags.custodian === true) { any = true; addLine(allies, 'p', 'CUSTODIAN-7 walks with you'); }
    if (!any) addLine(allies, 'p', 'No one yet.');

    var ledger = section(body, 'Ledger and loose ends');
    var lines = [];
    Object.keys(FLAG_LABEL).forEach(function (f) {
      var v = s.flags[f];
      if (!v) return;
      if (f === 'pim') lines.push('Pim: ' + v);
      else if (f === 'pump') lines.push('Choir pump: ' + v);
      else if (f === 'door') lines.push('Blast door: ' + v);
      else lines.push(FLAG_LABEL[f]);
    });
    if (!lines.length) addLine(ledger, 'p', 'Nothing owed, nothing settled.');
    lines.forEach(function (l) { addLine(ledger, 'p', l); });

    var notes = section(body, 'Notes');
    if (!s.notes.length) addLine(notes, 'p', 'No notes yet.');
    s.notes.forEach(function (n) { addLine(notes, 'p', '- ' + n); });
  }

  /* ---------- screens ---------- */

  function showTitle() {
    cancelTyping();
    armedNew = false;
    $('game').hidden = true;
    $('journal').hidden = true;
    $('title').hidden = false;
    var hasSave = !!readSave();
    $('btn-continue').disabled = !hasSave;
    $('btn-new').textContent = 'New Game';
    $('endings-count').textContent = 'Endings found ' + endingsFound() + ' / ' + endingIds.length;
    $('btn-new').focus();
  }

  function showGame() {
    $('title').hidden = true;
    $('game').hidden = false;
    $('ending-banner').hidden = true;
  }

  function startNew() {
    if (readSave() && !armedNew) {
      armedNew = true;
      $('btn-new').textContent = 'Overwrite the saved game? Click again';
      return;
    }
    armedNew = false;
    clearSave();
    S = newState();
    showGame();
    goto(S.node);
  }

  function continueGame() {
    var saved = readSave();
    if (!saved) return;
    S = saved;
    showGame();
    renderNode();
  }

  function toggleJournal(force) {
    var j = $('journal');
    var show = typeof force === 'boolean' ? force : j.hidden;
    j.hidden = !show;
    if (show) renderJournal();
  }

  /* ---------- wiring ---------- */

  function init() {
    if (!STORY || !STORY.nodes) {
      $('title').hidden = true;
      $('fatal').hidden = false;
      return;
    }
    $('title-art-sub').textContent = STORY.subtitle;
    $('btn-new').addEventListener('click', startNew);
    $('btn-continue').addEventListener('click', continueGame);
    $('btn-journal').addEventListener('click', function () { toggleJournal(); });
    $('btn-journal-close').addEventListener('click', function () { toggleJournal(false); });
    $('btn-menu').addEventListener('click', function () { if (S) writeSave(); showTitle(); });
    $('text').addEventListener('click', function () { if (typer) typer.skip(); });

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if ($('game').hidden) return;
      if (typer) { typer.skip(); e.preventDefault(); return; }
      if (e.key === 'j' || e.key === 'J') { toggleJournal(); return; }
      if (e.key === 'Escape') { toggleJournal(false); return; }
      if (/^[1-9]$/.test(e.key)) choose(parseInt(e.key, 10) - 1);
    });

    showTitle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

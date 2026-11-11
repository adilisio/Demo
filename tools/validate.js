#!/usr/bin/env node
'use strict';
/*
 * Structural checks for story.js. No dependencies.
 *   node tools/validate.js
 * Exits 1 on any failure.
 */
var path = require('path');
var STORY = require(path.join(__dirname, '..', 'story.js'));

var errors = [];
function fail(msg) { errors.push(msg); }

var nodes = STORY.nodes || {};
var ids = Object.keys(nodes);
var deaths = STORY.deaths || {};
var KNOWN_EFFECTS = ['hp', 'glow', 'scrip', 'stats', 'add', 'remove', 'keys', 'allies', 'flags', 'counters', 'note'];
var COND_TYPES = ['stat', 'item', 'flag', 'notFlag', 'ally', 'key', 'notKey', 'keysAtLeast', 'minScrip', 'counter', 'maxGlow'];
var STATS = ['grit', 'wits', 'charm'];

function asList(r) { return !r ? [] : Array.isArray(r) ? r : [r]; }
function condType(c) { return COND_TYPES.filter(function (t) { return Object.prototype.hasOwnProperty.call(c, t); })[0]; }
function has(id) { return Object.prototype.hasOwnProperty.call(nodes, id); }

// Every effects object a node can apply (on entry, on a choice, or on a check outcome).
function effectsOf(node) {
  var out = [];
  if (node.onEnter) out.push(node.onEnter);
  (node.choices || []).forEach(function (c) {
    if (c.effects) out.push(c.effects);
    if (c.check) {
      if (c.check.successEffects) out.push(c.check.successEffects);
      if (c.check.failEffects) out.push(c.check.failEffects);
    }
  });
  return out;
}

// What the whole story can produce, and how much stat is possible.
var produced = { flags: {}, items: {}, keys: {}, allies: {}, counters: {} };
var statMax = { grit: 0, wits: 0, charm: 0 };
ids.forEach(function (id) {
  effectsOf(nodes[id]).forEach(function (e) {
    Object.keys(e).forEach(function (k) {
      if (KNOWN_EFFECTS.indexOf(k) < 0) fail(id + ': unknown effect key "' + k + '"');
    });
    Object.keys(e.flags || {}).forEach(function (f) { if (e.flags[f]) produced.flags[f] = true; });
    (e.add || []).forEach(function (i) { produced.items[i] = true; });
    (e.keys || []).forEach(function (k) { produced.keys[k] = true; });
    (e.allies || []).forEach(function (a) { produced.allies[a] = true; });
    Object.keys(e.counters || {}).forEach(function (c) { if (e.counters[c] > 0) produced.counters[c] = true; });
    Object.keys(e.stats || {}).forEach(function (s) {
      if (e.stats[s] > 0) statMax[s] = (statMax[s] || 0) + e.stats[s];
    });
  });
});

// Structural checks per node.
ids.forEach(function (id) {
  var n = nodes[id];
  if (typeof n.title !== 'string' || !n.title) fail(id + ': missing title');
  if (!(typeof n.text === 'string' || typeof n.text === 'function')) fail(id + ': text must be a string or function');
  if (n.ending) {
    if (n.choices && n.choices.length) fail(id + ': ending node has choices');
    return;
  }
  if (!n.choices || !n.choices.length) { fail(id + ': non-ending node has no choices (dead end)'); return; }

  var alwaysAvailable = n.choices.some(function (c) { return asList(c.requires).length === 0; });
  if (!alwaysAvailable) fail(id + ': no choice without requirements (dead end when conditions unmet)');

  n.choices.forEach(function (c, i) {
    var where = id + ' choice ' + (i + 1);
    if (!c.label || typeof c.label !== 'string') fail(where + ': missing label');
    var kinds = ['to', 'random', 'check'].filter(function (k) { return c[k] !== undefined; });
    if (kinds.length !== 1) fail(where + ': needs exactly one of to / random / check');
    if (c.to !== undefined && !has(c.to)) fail(where + ': target "' + c.to + '" does not exist');
    if (c.random) {
      if (!Array.isArray(c.random) || !c.random.length) fail(where + ': random must be a non-empty array');
      (c.random || []).forEach(function (t) { if (!has(t)) fail(where + ': random target "' + t + '" does not exist'); });
    }
    if (c.check) {
      var k = c.check;
      if (STATS.indexOf(k.stat) < 0) fail(where + ': bad check stat "' + k.stat + '"');
      if (typeof k.dc !== 'number') fail(where + ': check dc must be a number');
      if (!has(k.success)) fail(where + ': success target "' + k.success + '" does not exist');
      if (!has(k.fail)) fail(where + ': fail target "' + k.fail + '" does not exist');
    }
    asList(c.requires).forEach(function (r) {
      var t = condType(r);
      if (!t) { fail(where + ': unknown requirement ' + JSON.stringify(r)); return; }
      var ok = true, why = '';
      if (t === 'flag') { ok = !!produced.flags[r.flag]; why = 'flag ' + r.flag; }
      if (t === 'item') { ok = !!produced.items[r.item]; why = 'item ' + r.item; }
      if (t === 'key') { ok = !!produced.keys[r.key]; why = 'key ' + r.key; }
      if (t === 'ally') { ok = !!produced.allies[r.ally]; why = 'ally ' + r.ally; }
      if (t === 'counter') { ok = !!produced.counters[r.counter]; why = 'counter ' + r.counter; }
      if (t === 'keysAtLeast') { ok = Object.keys(produced.keys).length >= r.keysAtLeast; why = 'keysAtLeast ' + r.keysAtLeast; }
      if (t === 'stat') { ok = (statMax[r.stat] || 0) >= r.min; why = 'stat ' + r.stat + ' ' + r.min; }
      if (!ok) fail(where + ': requirement can never be satisfied (' + why + ' is never produced)');
    });
  });
});

// Death edges: any effect that can drop HP to 0 or push glow to 10.
function succ(id) {
  var out = new Set();
  var n = nodes[id];
  (n.choices || []).forEach(function (c) {
    if (c.to) out.add(c.to);
    (c.random || []).forEach(function (t) { out.add(t); });
    if (c.check) { out.add(c.check.success); out.add(c.check.fail); }
  });
  effectsOf(n).forEach(function (e) {
    if (e.hp < 0 && deaths.hp) out.add(deaths.hp);
    if (e.glow > 0 && deaths.glow) out.add(deaths.glow);
  });
  return out;
}

if (!has(STORY.start)) fail('start node "' + STORY.start + '" does not exist');
if (!has(deaths.hp) || !has(deaths.glow)) fail('deaths.hp / deaths.glow must name existing nodes');

// Reachability from the start (requirements ignored: a static over-approximation).
var seen = new Set([STORY.start]);
var queue = [STORY.start];
while (queue.length) {
  var cur = queue.shift();
  succ(cur).forEach(function (t) {
    if (!has(t)) return;
    if (!seen.has(t)) { seen.add(t); queue.push(t); }
  });
}
var unreachable = ids.filter(function (id) { return !seen.has(id); });
unreachable.forEach(function (id) { fail('node "' + id + '" is unreachable from the start'); });

var endings = ids.filter(function (id) { return nodes[id].ending; });
endings.forEach(function (id) {
  if (!seen.has(id)) fail('ending "' + id + '" is not reachable');
});

// Word counts over several synthetic states, so text functions are exercised.
function baseState() {
  return { node: STORY.start, stats: { grit: 0, wits: 0, charm: 0 }, hp: 10, glow: 0, scrip: 12,
    inv: [], keys: [], allies: {}, flags: {}, counters: { ammo: 0 }, notes: [], roll: '' };
}
var variants = {};
variants.default = baseState();
variants.rich = baseState();
(function () {
  var r = variants.rich;
  Object.keys(produced.flags).forEach(function (f) { r.flags[f] = true; });
  r.flags.pim = 'freed';
  r.flags.door = 'opened';
  r.stats = { grit: 5, wits: 5, charm: 5 };
  r.keys = Object.keys(produced.keys);
  Object.keys(produced.allies).forEach(function (a) { r.allies[a] = true; });
  r.inv = Object.keys(produced.items);
  r.counters.ammo = 3;
})();
variants.poor = baseState();
(function () {
  var p = variants.poor;
  p.flags = { pim: 'abandoned', custodian: 'refused' };
  p.scrip = 0;
})();

function wordsOf(text) { return String(text).split(/\s+/).filter(Boolean).length; }
function textFor(node, state) { return typeof node.text === 'function' ? node.text(state) : node.text; }

var totalWords = 0;
var report = [];
ids.forEach(function (id) {
  var n = nodes[id];
  var counts = Object.keys(variants).map(function (v) {
    var st = JSON.parse(JSON.stringify(variants[v]));
    return wordsOf(textFor(n, st));
  });
  totalWords += counts[0];
  var min = Math.min.apply(null, counts), max = Math.max.apply(null, counts);
  var lo, hi, kind;
  if (n.ending && n.death) { lo = 40; hi = 120; kind = 'death ending'; }
  else if (n.ending) { lo = 120; hi = 200; kind = 'ending'; }
  else { lo = 60; hi = 140; kind = 'scene'; }
  report.push({ id: id, words: counts[0], min: min, max: max });
  if (min < lo || max > hi) {
    fail(id + ': ' + kind + ' is ' + min + '-' + max + ' words, expected ' + lo + '-' + hi);
  }
});

// Output
var storyEndings = endings.filter(function (id) { return !nodes[id].death; });
var deathEndings = endings.filter(function (id) { return nodes[id].death; });
console.log('SALTGLASS validation');
console.log('  nodes:           ' + ids.length);
console.log('  endings:         ' + endings.length + ' (' + storyEndings.length + ' story, ' + deathEndings.length + ' death)');
console.log('  reachable:       ' + seen.size + ' / ' + ids.length);
console.log('  total words:     ' + totalWords + ' (default state)');
console.log('  endings list:');
endings.forEach(function (id) {
  var r = report.filter(function (x) { return x.id === id; })[0];
  console.log('    - ' + nodes[id].title + ' [' + id + '] ' + r.min + '-' + r.max + ' words');
});
console.log('  scene word range: ' + Math.min.apply(null, report.filter(function (r) { return !nodes[r.id].ending; }).map(function (r) { return r.min; })) +
  ' to ' + Math.max.apply(null, report.filter(function (r) { return !nodes[r.id].ending; }).map(function (r) { return r.max; })));

if (errors.length) {
  console.log('\nFAILED (' + errors.length + ')');
  errors.forEach(function (e) { console.log('  ! ' + e); });
  process.exit(1);
}
console.log('\nOK: all checks passed');

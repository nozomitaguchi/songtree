import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const nodes = new Map();
function node(selector) {
  if (!nodes.has(selector)) nodes.set(selector, {
    dataset: {}, value: '', hidden: false, disabled: false, paused: true,
    handlers: new Map(), playCalls: 0, style: {},
    addEventListener(name, fn) { this.handlers.set(name, fn); },
    pause() { this.paused = true; },
    load() {},
    removeAttribute(name) { delete this[name]; },
    async play() { this.paused = false; this.playCalls += 1; },
  });
  return nodes.get(selector);
}
const imageLoads=new Map();
class MockImage { set src(url){this.url=url;imageLoads.set(url,this);} async decode(){} }
const context = vm.createContext({
  Image: MockImage,
  URL, console,
  document: { querySelector: node, querySelectorAll: () => [], body: { classList: { add() {}, remove() {} } } },
  window: { addEventListener() {} },
  ResizeObserver: class { observe() {} },
  fixtureTracks: JSON.parse(await readFile('dist/tracks.json', 'utf8')),
  fixtureEvents: JSON.parse(await readFile('dist/history.json', 'utf8')),
});
const source = (await readFile('dist/app.js', 'utf8')).replace(/init\(\);\s*$/, '');
vm.runInContext(source, context);
vm.runInContext('tracks=fixtureTracks;events=fixtureEvents;renderedRows=makeRows();', context);
const run = code => vm.runInContext(code, context);
assert.equal(run('playableTracks().length'), 20);
assert.equal(run('playableTracks()[0].id'), 'kataguruma');
assert.equal(run('playableTracks().at(-1).id'), 'moonbow');

run('selectTrack(playableTracks()[0]);');
assert.equal(node('#previous-track').disabled, true);
assert.equal(node('#next-track').disabled, false);
run('advanceTrack(1);');
assert.equal(run('selected.id'), 'tengoku-ga-umareta-hi');
assert.equal(node('#audio').paused, false);
assert.equal(node('#playing-title').textContent, '天国が生まれた日');
run('advanceTrack(-1);');
assert.equal(run('selected.id'), 'kataguruma');

// Interleaved units must follow the visible tree, rather than JSON order or branch.
run("selectTrack(tracks.find(t=>t.id==='white-trip'));");
node('#audio').handlers.get('ended')();
assert.equal(run('selected.id'), 'kochobai');
assert.equal(node('#audio').paused, false);

assert.deepEqual(Array.from(run("playableTracks().filter(t=>t.historyEventId==='patalp').map(t=>t.id)")), ['supira','dokomadega-boku','hanabi','ai-no-uta','kochobai','machiawase','taisetsu-na-hito-e']);

// The final track stops, and missing registered audio is skipped.
run('selectTrack(playableTracks().at(-1));');
const plays = node('#audio').playCalls;
node('#audio').handlers.get('ended')();
assert.equal(run('selected.id'), 'moonbow');
assert.equal(node('#next-track').disabled, true);
assert.equal(node('#audio').playCalls, plays);
run("tracks.find(t=>t.id==='tengoku-ga-umareta-hi').audioSrc=null;renderedRows=makeRows();selectTrack(playableTracks()[0]);advanceTrack(1);");
assert.equal(run('selected.id'), 'monochrome');
console.log('PASS: playlist order, unit interleaving, previous/next, ended transition, boundaries and missing audio');

// A slow earlier request must never replace the jacket of a newer selection.
const jacket=node('#detail-jacket');
run("setJacket('#detail-jacket',{title:'Slow',jacketDisplayUrl:'slow.webp'});");
assert.equal(jacket.style.visibility,'hidden');
assert.equal(jacket.src,undefined);
run("setJacket('#detail-jacket',{title:'Fast',jacketDisplayUrl:'fast.webp'});");
imageLoads.get('fast.webp').onload();
await new Promise(resolve=>setImmediate(resolve));
assert.equal(jacket.src,'fast.webp');
assert.equal(jacket.style.visibility,'visible');
imageLoads.get('slow.webp').onload();
await new Promise(resolve=>setImmediate(resolve));
assert.equal(jacket.src,'fast.webp');
run("setJacket('#detail-jacket',{title:'Broken',jacketDisplayUrl:'broken.webp'});");
assert.equal(jacket.src,undefined);
assert.equal(jacket.style.visibility,'hidden');
imageLoads.get('broken.webp').onerror();
await new Promise(resolve=>setImmediate(resolve));
assert.equal(jacket.hidden,true);
run("setJacket('#detail-jacket',{title:'Cached',jacketDisplayUrl:'fast.webp'});");
await new Promise(resolve=>setImmediate(resolve));
assert.equal(jacket.src,'fast.webp');
assert.equal(jacket.alt,'Cachedのジャケット');
console.log('PASS: loading hides previous jacket, stale requests, failures and cached selection');

// The requested adjacency applies across the full tree, including other units.
const visibleIds=Array.from(run("playableTracks().map(t=>t.id)"));
assert.equal(visibleIds[visibleIds.indexOf('machiawase')+1], 'taisetsu-na-hito-e');
assert.ok(visibleIds.indexOf('dokomadega-boku')<visibleIds.indexOf('hanabi'));
assert.ok(visibleIds.indexOf('dokomadega-boku')<visibleIds.indexOf('ai-no-uta'));

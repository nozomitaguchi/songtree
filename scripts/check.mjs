import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const tracks=JSON.parse(await readFile('dist/tracks.json','utf8'));
const history=JSON.parse(await readFile('dist/history.json','utf8'));
assert.equal(new Set(tracks.map(t=>t.id)).size,tracks.length,'duplicate track id');
for(const t of tracks){assert.ok(t.title);assert.equal(typeof t.lyricsByOwner,'boolean');if(!t.lyricsByOwner)assert.equal(t.lyrics,null,'non-owner lyrics must never be shipped');}
assert.equal(new Set(history.map(e=>e.id)).size,history.length,'duplicate event id');
assert.equal(history[0].year,1985);
assert.ok(history.filter(e=>e.dating==='unknown').every(e=>e.year===null),'unknown dates must stay unknown');
assert.ok(history.filter(e=>e.dating==='inferred').every(e=>e.period.includes('仮')),'inferred dates must be labeled');
const html=await readFile('dist/index.html','utf8');
for(const path of ['app.js','styles.css'])assert.ok(html.includes(path));
console.log('PASS: syntax, unique IDs, lyric omission, inferred and unknown dates');

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

// Verify the static pages consumed by crawlers, including nested asset resolution.
for(const track of tracks){
 const page=await readFile(`dist/songs/${track.id}/index.html`,'utf8');
 assert.ok(page.includes(`<link rel="canonical" href="https://nozomitaguchi.github.io/songtree/songs/${track.id}/">`),'song canonical URL');
 assert.ok(page.includes('<base href="/songtree/">'),'nested pages must resolve assets at the site root');
 assert.ok(page.indexOf('<base ')<page.indexOf('src="app.js'),'base must precede script preload');
 assert.ok(page.indexOf('<base ')<page.indexOf('href="styles.css'),'base must precede stylesheet preload');
 assert.ok(!page.includes('noindex'),'public songs must be indexable');
 assert.ok(page.includes('property="og:title"'),'song share metadata must exist before JS');
 assert.ok(page.includes(track.title),'static song title');
 assert.ok(track.jacketUrl, 'every song needs a jacket');
 const display = await readFile(`dist/${track.jacketDisplayUrl}`);
 assert.equal(display.subarray(8,12).toString(), 'WEBP');
 assert.ok(display.length < 40000, 'display jacket must stay lightweight');
 const imageUrl = new URL(track.jacketUrl, 'https://nozomitaguchi.github.io/songtree/').href;
 assert.ok(page.includes(`property="og:image" content="${imageUrl}"`), 'song-specific Open Graph jacket');
 assert.ok(page.includes(`name="twitter:image" content="${imageUrl}"`), 'song-specific Twitter jacket');
 if (!track.jacketUrl.startsWith('https://')) {
  const bytes = await readFile(`dist/${track.jacketUrl}`);
  assert.equal(bytes.subarray(1,4).toString(), 'PNG', 'local jacket must be PNG');
  assert.equal(bytes.readUInt32BE(16), track.jacketWidth, 'jacket width');
  assert.equal(bytes.readUInt32BE(20), track.jacketHeight, 'jacket height');
 }
 if(!track.lyricsByOwner)assert.ok(!page.includes('<h2>歌詞</h2>'),'non-owner lyrics must not appear in static fallback');
}
console.log('PASS: 21 static song URLs, canonical metadata, nested assets and lyric privacy');

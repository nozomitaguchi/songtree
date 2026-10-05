import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const site = 'https://nozomitaguchi.github.io/songtree/';
const cover = 'https://nozomitaguchi.github.io/assets/songtree-cover-ipad.png';
const description = 'nozomitaguchiが作ってきた曲を、枝分かれする年表でたどる音楽サイト。音源・歌詞・Production notesを収録。';
const tracks = JSON.parse(await readFile(new URL('tracks.json', root), 'utf8'));
const source = await readFile(new URL('index.html', root), 'utf8');
const template = source.replace(/<!-- SEO START -->[\s\S]*?<!-- SEO END -->/g, '')
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<noscript data-seo>[\s\S]*?<\/noscript>/g, '');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const trackUrl = t => `${site}songs/${encodeURIComponent(t.id)}/`;
const creator = { '@type': 'Person', name: 'nozomitaguchi', url: 'https://nozomitaguchi.github.io/' };

function render(track) {
  const url = track ? trackUrl(track) : site;
  const title = track ? `${track.title} | Songtree` : 'Songtree | nozomitaguchiの曲の年表';
  const image = track?.jacketUrl ? new URL(track.jacketUrl, site).href : cover;
  const imageWidth = track?.jacketWidth || 1672;
  const imageHeight = track?.jacketHeight || 941;
  const imageAlt = track?.jacketUrl ? `${track.title}のジャケット` : 'iPadに表示されたSongtreeとギター';
  const summary = track ? `${track.title} — nozomitaguchiの曲。音源${track.lyricsByOwner ? '・歌詞' : ''}${track.notesThen || track.notesNow ? '・Production notes' : ''}をSongtreeで。` : description;
  const entity = track ? {
    '@type': 'MusicComposition', name: track.title, url, image, composer: creator,
    ...(track.lyricsByOwner ? { lyricist: creator } : {}),
    ...(track.audioSrc ? { recordedAs: { '@type': 'MusicRecording', name: track.title, associatedMedia: { '@type': 'AudioObject', contentUrl: new URL(track.audioSrc, site).href, encodingFormat: 'audio/mpeg' } } } : {}),
  } : {
    '@type': 'WebSite', name: 'Songtree', url, description, author: creator,
    mainEntity: { '@type': 'ItemList', itemListElement: tracks.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.title, url: trackUrl(t) })) },
  };
  const metadata = `<!-- SEO START -->
<base href="/songtree/">
${track?.jacketDisplayUrl ? `<link rel="preload" as="image" href="${escape(track.jacketDisplayUrl)}">` : ''}
<title>${escape(title)}</title>
<meta name="description" content="${escape(summary)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="author" content="nozomitaguchi">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="alternate icon" href="assets/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<meta property="og:site_name" content="Songtree">
<meta property="og:type" content="website">
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(summary)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="${imageWidth}">
<meta property="og:image:height" content="${imageHeight}">
<meta property="og:image:alt" content="${escape(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@nozomitaguchi">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(summary)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${escape(imageAlt)}">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...entity }).replaceAll('<', '\\u003c')}</script>
<!-- SEO END -->`;
  const fallback = track
    ? `<h1>${escape(track.title)}</h1>${track.jacketUrl ? `<img src="${escape(track.jacketDisplayUrl || track.jacketUrl)}" alt="${escape(imageAlt)}" width="240" height="240">` : ''}<p>${escape(summary)}</p>${track.audioSrc ? `<audio controls src="${escape(track.audioSrc)}"></audio>` : ''}${track.lyricsByOwner && track.lyrics ? `<h2>歌詞</h2><pre>${escape(track.lyrics)}</pre>` : ''}${track.notesThen || track.notesNow ? `<h2>Production notes</h2><p>${escape([track.notesThen, track.notesNow].filter(Boolean).join('\n\n'))}</p>` : ''}<a href="${site}">Songtree</a>`
    : `<h1>Songtree</h1><p>${escape(description)}</p><ul>${tracks.map(t => `<li><a href="${trackUrl(t)}">${escape(t.title)}</a></li>`).join('')}</ul>`;
  return template.replace('<head>', `<head>${metadata}`).replace('</body>', `<noscript data-seo><main>${fallback}</main></noscript></body>`);
}

await rm(new URL('songs/', root), { recursive: true, force: true });
await writeFile(new URL('index.html', root), render(null));
for (const track of tracks) {
  const dir = new URL(`songs/${track.id}/`, root);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), render(track));
}
await writeFile(new URL('sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[site, ...tracks.map(trackUrl)].map(url => `<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>\n`);
await writeFile(new URL('site.webmanifest', root), JSON.stringify({ name: 'Songtree', short_name: 'Songtree', lang: 'ja', start_url: '/songtree/', scope: '/songtree/', display: 'browser', background_color: '#fafaf7', theme_color: '#f4f0e7', icons: [{ src: 'assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2));
console.log(`Generated homepage, ${tracks.length} song pages, sitemap and manifest.`);

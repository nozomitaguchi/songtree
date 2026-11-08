import { readFile } from 'node:fs/promises';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: false, breaks: true });
const contentRoot = new URL('../content/songs/', import.meta.url);

async function readMarkdown(trackId, filename) {
  try {
    return await readFile(new URL(`${trackId}/${filename}`, contentRoot), 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function renderSongContent(tracks) {
  const content = Object.create(null);
  for (const track of tracks) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(track.id)) {
      throw new Error(`Invalid track ID: ${track.id}`);
    }
    const lyrics = await readMarkdown(track.id, 'lyrics.md');
    if (lyrics !== null && track.lyricsByOwner !== true) {
      throw new Error(`${track.id}: lyrics.md is only allowed for owner-written lyrics`);
    }
    const notes = await readMarkdown(track.id, 'production-notes.md');
    content[track.id] = {
      lyrics: markdown.render(lyrics ?? ''),
      notes: markdown.render(notes ?? ''),
    };
  }
  return content;
}

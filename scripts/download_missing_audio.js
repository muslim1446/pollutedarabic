#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const missing = [
  'book', 'exam', 'test', 'grade', 'class', 'course', 'degree', 'student', 'teacher',
  'school', 'paper', 'study', 'project', 'report', 'task', 'history', 'science', 'result',
  'analysis', 'evidence', 'theory', 'research', 'concept', 'method', 'data', 'structure',
  'section', 'source', 'context', 'factor', 'issue', 'policy', 'process', 'require',
  'specific', 'author', 'chapter', 'conclude', 'define', 'focus', 'major', 'publish',
  'survey', 'valid'
];

async function resolveCommonsUrl(word) {
  const variations = [
    `File:en-us-${word}.ogg`,
    `File:En-us-${word}.ogg`,
    `File:en-uk-${word}.ogg`,
    `File:En-uk-${word}.ogg`,
    `File:LL-Q1860_(eng)-Vealhurl-${word}.wav`,
    `File:LL-Q1860_(eng)-Simple58757-${word}.wav`,
    `File:LL-Q1860_(eng)-Backun-${word}.wav`,
    `File:LL-Q1860_(eng)-Grendelkhan-${word}.wav`
  ];
  for (const v of variations) {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(v)}&prop=imageinfo&iiprop=url&format=json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'AcousticEar/1.0 (academic audio trainer)' } });
      const data = await res.json();
      const pages = data.query?.pages || {};
      for (const id in pages) {
        if (pages[id].imageinfo?.[0]?.url) {
          return pages[id].imageinfo[0].url;
        }
      }
    } catch {}
  }

  // Try Wiktionary parse for audio file name
  try {
    const wiktUrl = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&format=json`;
    const res = await fetch(wiktUrl, { headers: { 'User-Agent': 'AcousticEar/1.0 (academic audio trainer)' } });
    if (res.ok) {
      const data = await res.json();
      const wikitext = data.parse?.wikitext?.['*'] || '';
      const audioMatches = [...wikitext.matchAll(/\{\{audio\|en\|([^|}]+)(?:\|([^}]+))?\}\}/gi)];
      for (const m of audioMatches) {
        const file = m[1].trim();
        const fUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent('File:' + file)}&prop=imageinfo&iiprop=url&format=json`;
        const fRes = await fetch(fUrl, { headers: { 'User-Agent': 'AcousticEar/1.0' } });
        const fData = await fRes.json();
        const pages = fData.query?.pages || {};
        for (const id in pages) {
          if (pages[id].imageinfo?.[0]?.url) {
            return pages[id].imageinfo[0].url;
          }
        }
      }
    }
  } catch {}

  return null;
}

async function downloadWord(word) {
  const targetMp3 = path.join('public/audio', `${word}.mp3`);
  if (fs.existsSync(targetMp3) && fs.statSync(targetMp3).size > 1000) {
    return true;
  }
  const directUrl = await resolveCommonsUrl(word);
  if (!directUrl) {
    console.warn(`[Not found on commons]: ${word}`);
    return false;
  }
  try {
    const res = await fetch(directUrl, { headers: { 'User-Agent': 'AcousticEar/1.0' } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = path.extname(new URL(directUrl).pathname).toLowerCase() || '.ogg';
    const tempFile = path.join('public/audio', `${word}_temp${ext}`);
    fs.writeFileSync(tempFile, buf);
    execSync(`ffmpeg -y -v quiet -i "${tempFile}" -c:a libmp3lame -b:a 128k -ar 44100 "${targetMp3}"`);
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    const ok = fs.existsSync(targetMp3) && fs.statSync(targetMp3).size > 1000;
    if (ok) {
      console.log(`[Downloaded & Converted]: ${word} (${fs.statSync(targetMp3).size} bytes)`);
    }
    return ok;
  } catch (e) {
    console.error(`Error downloading ${word}:`, e.message);
    return false;
  }
}

async function run() {
  console.log(`Downloading ${missing.length} missing audio files...`);
  let count = 0;
  for (const w of missing) {
    const ok = await downloadWord(w);
    if (ok) count++;
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`Downloaded ${count} / ${missing.length} audio files`);
}

run();

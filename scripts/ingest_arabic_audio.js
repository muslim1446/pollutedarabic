#!/usr/bin/env node
/**
 * Arabic Human-Audio Ingestion Pipeline for Acoustic Ear (MSA, v3.0.0)
 * ============================================================================
 * Mirrors scripts/ingest_audio.js in STRUCTURE (fetchWithRetry -> scrape ->
 * resolveCommonsUrl -> downloadAndConvert via ffmpeg -> pMap pool). Only the
 * LANGUAGE sources changed: English Wiktionary/Commons -> Arabic ones.
 *
 * Where Arabic human speech comes from (all researched, see README §6):
 *  1. English Wiktionary Arabic entries: {{audio|ar|FILE}} + {{IPA|ar|...}} and
 *     the auto-IPA template {{ar-pr}} (scraped from page wikitext).
 *  2. Wikimedia Commons full-text search (namespace 6) for "<word> arabic
 *     pronunciation" — catches Lingua Libre uploads, whose file names embed
 *     speaker + QID and cannot be guessed (e.g. LL-Q... (ara)-...-WORD.wav).
 *     Category:Lingua Libre pronunciation-ara holds ~13,742 such files (plus
 *     arz 995, ary 1,857, arq 623 for dialects — MSA `ara` preferred here).
 *  3. Anything still missing is left for scripts/generate_all_audio_edge.py
 *     (Edge ar-SA-ZariyahNeural), which SKIPS files this script already filled.
 *
 * Usage: node scripts/ingest_arabic_audio.js [--max N] [--level A1]
 * Writes MP3s to public/audio/{ascii-id}.mp3 (matching vocabulary.json v3
 * audioUrls) and prints a coverage report. Never rewrites vocabulary.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT_DIR, 'public', 'data', '..', 'audio');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const VOCAB_PATH = path.join(DATA_DIR, 'vocabulary.json');

const USER_AGENT = 'AcousticEarTrainer/1.0 (mailto:dev@acousticear.internal; arabic acoustic trainer)';
const args = process.argv.slice(2);
const MAX = Number((args.find((a) => a.startsWith('--max=')) || '--max=0').split('=')[1] || 0);
const LEVEL = (args.find((a) => a.startsWith('--level=')) || '--level=').split('=')[1] || '';

fs.mkdirSync(AUDIO_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 4, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000),
        headers: { 'User-Agent': USER_AGENT, ...(options.headers || {}) }
      });
      if (res.ok) return res;
      if (res.status === 404) return null;
      if (res.status === 429) {
        const waitTime = backoff * Math.pow(2, i);
        console.warn(`[429 Rate Limit] Backing off ${waitTime}ms on ${url}`);
        await sleep(waitTime);
        continue;
      }
    } catch (err) {
      if (i === retries - 1) return null;
      await sleep(backoff * Math.pow(2, i));
    }
  }
  return null;
}

// Scrape Arabic audio filename + IPA from an English Wiktionary entry.
// Arabic entries use {{audio|ar|FILE}}, {{IPA|ar|/.../}} and the {{ar-pr}} auto
// template (regional |ph= lines + <a:FILE> inline audio markers).
async function scrapeArabicWiktionary(word) {
  try {
    const url = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&format=json`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    const data = await res.json();
    const wikitext = data.parse?.wikitext?.['*'] || '';
    if (!wikitext || !/==\s*Arabic\s*==/.test(wikitext)) return null;

    const audioMatches = [...wikitext.matchAll(/\{\{audio\|ar\|([^|}]+)(?:\|([^}]+))?\}\}/gi)];
    const inlineAudios = [...wikitext.matchAll(/<a:([^>]+)>/gi)].map((m) => m[1].trim());
    let audioFile = null;
    if (audioMatches.length > 0) {
      audioFile = audioMatches[0][1].trim();
    } else if (inlineAudios.length > 0) {
      audioFile = inlineAudios[0].replace(/#/g, word);
    }

    const ipaMatches = [...wikitext.matchAll(/\{\{IPA\|ar\|([^}]+)\}\}/gi)];
    let ipa = '';
    if (ipaMatches.length > 0) {
      const rawIpa = ipaMatches[0][1].split('|')[0].trim();
      ipa = rawIpa.startsWith('/') || rawIpa.startsWith('[') ? rawIpa : `/${rawIpa}/`;
    }

    return { audioFile, ipa };
  } catch (err) {
    return null;
  }
}

// Fallback: Commons full-text file search for volunteered Arabic recordings
// (Lingua Libre ara/arz/ary uploads, Shtooka legacy files like Ar-WORD.ogg).
async function searchCommonsArabic(word) {
  try {
    const q = `${word} arabic pronunciation`;
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=12&format=json`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    const data = await res.json();
    const hits = data.query?.search || [];
    for (const h of hits) {
      const title = h.title || '';
      if (!/\.((ogg)|(wav)|(mp3)|(flac))$/i.test(title)) continue;
      if (title.includes(word)) return title.replace(/^File:/, '');
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function resolveCommonsUrl(audioFile) {
  if (!audioFile) return null;
  try {
    const fileName = audioFile.startsWith('File:') ? audioFile : `File:${audioFile}`;
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    const data = await res.json();
    const pages = data.query?.pages || {};
    for (const id in pages) {
      if (pages[id].imageinfo?.[0]?.url) return pages[id].imageinfo[0].url;
    }
  } catch (err) {
    // ignore
  }
  return null;
}

function needsFile(p) {
  return !fs.existsSync(p) || fs.statSync(p).size < 1000;
}

async function downloadAndConvert(directUrl, targetMp3Path, tempBaseName) {
  const res = await fetchWithRetry(directUrl);
  if (!res) return false;
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = path.extname(new URL(directUrl).pathname).toLowerCase() || '.ogg';
  const tempPath = path.join(AUDIO_DIR, `${tempBaseName}_temp${ext}`);
  fs.writeFileSync(tempPath, buffer);
  try {
    // Same normalization as the English pipeline + explicit mono (-ac 1).
    execSync(`ffmpeg -y -v quiet -i "${tempPath}" -c:a libmp3lame -b:a 128k -ar 44100 -ac 1 "${targetMp3Path}"`);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return fs.existsSync(targetMp3Path) && fs.statSync(targetMp3Path).size > 1000;
  } catch (e) {
    if (fs.existsSync(tempPath)) {
      try {
        fs.renameSync(tempPath, targetMp3Path);
        return true;
      } catch {
        // fallback
      }
    }
    return false;
  }
}

async function pMap(items, mapper, concurrency = 2) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => mapper(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);
    if (executing.size >= concurrency) await Promise.race(executing);
    await sleep(250);
  }
  return Promise.allSettled(results);
}

async function main() {
  const dataset = JSON.parse(fs.readFileSync(VOCAB_PATH, 'utf8'));
  let words = dataset.words || [];
  if (LEVEL) words = words.filter((w) => w.level === LEVEL);
  // Human audio matters most for minimal pairs (voice-heterogeneity confound is
  // documented in README §6.7); general vocab is attempted opportunistically.
  words = [...words.filter((w) => w.category === 'minimal_pair'), ...words.filter((w) => w.category !== 'minimal_pair')];
  if (MAX > 0) words = words.slice(0, MAX);

  console.log(`Arabic human-audio ingest: ${words.length} words${LEVEL ? ` (level ${LEVEL})` : ''}.`);
  let found = 0;
  let converted = 0;
  let skipped = 0;

  await pMap(words, async (w) => {
    const target = path.join(AUDIO_DIR, path.basename(w.audioUrl || ''));
    if (!target || !needsFile(target)) {
      skipped++;
      return;
    }
    const word = w.diacritized || w.word;
    let file = null;
    const scraped = await scrapeArabicWiktionary(word);
    if (scraped?.audioFile) file = scraped.audioFile;
    if (!file) {
      // Retry unvocalized (Wiktionary page titles usually lack tashkeel).
      const plain = word.replace(/[ً-ٰٟ]/g, '');
      if (plain !== word) {
        const s2 = await scrapeArabicWiktionary(plain);
        if (s2?.audioFile) file = s2.audioFile;
      }
    }
    if (!file) file = await searchCommonsArabic(word.replace(/[ً-ٰٟ]/g, ''));
    if (!file) return;
    found++;
    const direct = await resolveCommonsUrl(file);
    if (!direct) return;
    const ok = await downloadAndConvert(direct, target, path.basename(target, '.mp3'));
    if (ok) {
      converted++;
      console.log(`[human] ${word} <- ${file}`);
    }
  }, 2);

  console.log('===========================================================');
  console.log(`INGEST DONE: ${converted} human MP3s written, ${found - converted} resolved-but-failed, ${skipped} already present.`);
  console.log('Remainder -> python scripts/generate_all_audio_edge.py (EDGE_VOICE=ar-SA-ZariyahNeural).');
}

main().catch((e) => {
  console.error('ingest_arabic_audio failed:', e);
  process.exit(1);
});

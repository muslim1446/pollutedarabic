#!/usr/bin/env node
/**
 * Real Human Audio Ingestion Pipeline for Acoustic Ear
 * Fetches native English speaker recordings from Wikimedia Commons & Wiktionary,
 * extracts phonetic IPA and part-of-speech metadata, converts/normalizes audio to MP3 via ffmpeg,
 * and builds public/data/vocabulary.json and public/audio/{word}.mp3.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT_DIR, 'public', 'audio');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const VOCAB_PATH = path.join(DATA_DIR, 'vocabulary.json');

const USER_AGENT = 'AcousticEarTrainer/1.0 (mailto:dev@acousticear.internal; language acoustic trainer)';

// Ensure directories exist
fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

// Curated high-impact word list targeting real-world degraded scenarios:
// - Minimal pairs (numbers: 13-19 vs 30-90, consonants: s/f, t/th, b/p, l/r, vowels: i/ee, etc.)
// - Numbers & Currency
// - Dates, Days & Times
// - Travel, Transit, Flights, Trains & Announcements
// - Emergency & Vital Communications
// - Daily High-Frequency Action Words
const WORD_DEFINITIONS = [
  // --- MINIMAL PAIRS (Crucial phoneme distinctions under bandpass degradation) ---
  { word: 'fifteen', pairWord: 'fifty', targetPhoneme: '/tiːn/ vs /ti/', category: 'minimal_pair' },
  { word: 'fifty', pairWord: 'fifteen', targetPhoneme: '/ti/ vs /tiːn/', category: 'minimal_pair' },
  { word: 'thirteen', pairWord: 'thirty', targetPhoneme: '/tiːn/ vs /ti/', category: 'minimal_pair' },
  { word: 'thirty', pairWord: 'thirteen', targetPhoneme: '/ti/ vs /tiːn/', category: 'minimal_pair' },
  { word: 'fourteen', pairWord: 'forty', targetPhoneme: '/tiːn/ vs /ti/', category: 'minimal_pair' },
  { word: 'forty', pairWord: 'fourteen', targetPhoneme: '/ti/ vs /tiːn/', category: 'minimal_pair' },
  { word: 'sixteen', pairWord: 'sixty', targetPhoneme: '/tiːn/ vs /ti/', category: 'minimal_pair' },
  { word: 'sixty', pairWord: 'sixteen', targetPhoneme: '/ti/ vs /tiːn/', category: 'minimal_pair' },
  { word: 'seventeen', pairWord: 'seventy', targetPhoneme: '/tiːn/ vs /ti/', category: 'minimal_pair' },
  { word: 'seventy', pairWord: 'seventeen', targetPhoneme: '/ti/ vs /tiːn/', category: 'minimal_pair' },
  { word: 'eighteen', pairWord: 'eighty', targetPhoneme: '/tiːn/ vs /ti/', category: 'minimal_pair' },
  { word: 'eighty', pairWord: 'eighteen', targetPhoneme: '/ti/ vs /tiːn/', category: 'minimal_pair' },
  { word: 'nineteen', pairWord: 'ninety', targetPhoneme: '/tiːn/ vs /ti/', category: 'minimal_pair' },
  { word: 'ninety', pairWord: 'nineteen', targetPhoneme: '/ti/ vs /tiːn/', category: 'minimal_pair' },

  { word: 'sail', pairWord: 'fail', targetPhoneme: '/s/ vs /f/', category: 'minimal_pair' },
  { word: 'fail', pairWord: 'sail', targetPhoneme: '/f/ vs /s/', category: 'minimal_pair' },
  { word: 'tin', pairWord: 'thin', targetPhoneme: '/t/ vs /θ/', category: 'minimal_pair' },
  { word: 'thin', pairWord: 'tin', targetPhoneme: '/θ/ vs /t/', category: 'minimal_pair' },
  { word: 'tree', pairWord: 'three', targetPhoneme: '/tr/ vs /θr/', category: 'minimal_pair' },
  { word: 'three', pairWord: 'tree', targetPhoneme: '/θr/ vs /tr/', category: 'minimal_pair' },
  { word: 'ship', pairWord: 'sheep', targetPhoneme: '/ɪ/ vs /iː/', category: 'minimal_pair' },
  { word: 'sheep', pairWord: 'ship', targetPhoneme: '/iː/ vs /ɪ/', category: 'minimal_pair' },
  { word: 'sit', pairWord: 'seat', targetPhoneme: '/ɪ/ vs /iː/', category: 'minimal_pair' },
  { word: 'seat', pairWord: 'sit', targetPhoneme: '/iː/ vs /ɪ/', category: 'minimal_pair' },
  { word: 'bad', pairWord: 'bed', targetPhoneme: '/æ/ vs /e/', category: 'minimal_pair' },
  { word: 'bed', pairWord: 'bad', targetPhoneme: '/e/ vs /æ/', category: 'minimal_pair' },
  { word: 'bat', pairWord: 'bet', targetPhoneme: '/æ/ vs /e/', category: 'minimal_pair' },
  { word: 'bet', pairWord: 'bat', targetPhoneme: '/e/ vs /æ/', category: 'minimal_pair' },
  { word: 'pin', pairWord: 'pen', targetPhoneme: '/ɪ/ vs /e/', category: 'minimal_pair' },
  { word: 'pen', pairWord: 'pin', targetPhoneme: '/e/ vs /ɪ/', category: 'minimal_pair' },
  { word: 'bin', pairWord: 'bean', targetPhoneme: '/ɪ/ vs /iː/', category: 'minimal_pair' },
  { word: 'bean', pairWord: 'bin', targetPhoneme: '/iː/ vs /ɪ/', category: 'minimal_pair' },
  { word: 'pull', pairWord: 'pool', targetPhoneme: '/ʊ/ vs /uː/', category: 'minimal_pair' },
  { word: 'pool', pairWord: 'pull', targetPhoneme: '/uː/ vs /ʊ/', category: 'minimal_pair' },
  { word: 'full', pairWord: 'fool', targetPhoneme: '/ʊ/ vs /uː/', category: 'minimal_pair' },
  { word: 'fool', pairWord: 'full', targetPhoneme: '/uː/ vs /ʊ/', category: 'minimal_pair' },
  { word: 'cheap', pairWord: 'chip', targetPhoneme: '/iː/ vs /ɪ/', category: 'minimal_pair' },
  { word: 'chip', pairWord: 'cheap', targetPhoneme: '/ɪ/ vs /iː/', category: 'minimal_pair' },
  { word: 'price', pairWord: 'prize', targetPhoneme: '/s/ vs /z/', category: 'minimal_pair' },
  { word: 'prize', pairWord: 'price', targetPhoneme: '/z/ vs /s/', category: 'minimal_pair' },
  { word: 'fan', pairWord: 'van', targetPhoneme: '/f/ vs /v/', category: 'minimal_pair' },
  { word: 'van', pairWord: 'fan', targetPhoneme: '/v/ vs /f/', category: 'minimal_pair' },
  { word: 'wet', pairWord: 'wait', targetPhoneme: '/e/ vs /eɪ/', category: 'minimal_pair' },
  { word: 'wait', pairWord: 'wet', targetPhoneme: '/eɪ/ vs /e/', category: 'minimal_pair' },
  { word: 'heart', pairWord: 'hard', targetPhoneme: '/t/ vs /d/', category: 'minimal_pair' },
  { word: 'hard', pairWord: 'heart', targetPhoneme: '/d/ vs /t/', category: 'minimal_pair' },
  { word: 'light', pairWord: 'right', targetPhoneme: '/l/ vs /r/', category: 'minimal_pair' },
  { word: 'right', pairWord: 'light', targetPhoneme: '/r/ vs /l/', category: 'minimal_pair' },
  { word: 'vest', pairWord: 'west', targetPhoneme: '/v/ vs /w/', category: 'minimal_pair' },
  { word: 'west', pairWord: 'vest', targetPhoneme: '/w/ vs /v/', category: 'minimal_pair' },
  { word: 'vine', pairWord: 'wine', targetPhoneme: '/v/ vs /w/', category: 'minimal_pair' },
  { word: 'wine', pairWord: 'vine', targetPhoneme: '/w/ vs /v/', category: 'minimal_pair' },
  { word: 'sink', pairWord: 'think', targetPhoneme: '/s/ vs /θ/', category: 'minimal_pair' },
  { word: 'think', pairWord: 'sink', targetPhoneme: '/θ/ vs /s/', category: 'minimal_pair' },
  { word: 'pass', pairWord: 'path', targetPhoneme: '/s/ vs /θ/', category: 'minimal_pair' },
  { word: 'path', pairWord: 'pass', targetPhoneme: '/θ/ vs /s/', category: 'minimal_pair' },
  { word: 'mouse', pairWord: 'mouth', targetPhoneme: '/s/ vs /θ/', category: 'minimal_pair' },
  { word: 'mouth', pairWord: 'mouse', targetPhoneme: '/θ/ vs /s/', category: 'minimal_pair' },
  { word: 'coat', pairWord: 'boat', targetPhoneme: '/k/ vs /b/', category: 'minimal_pair' },
  { word: 'boat', pairWord: 'coat', targetPhoneme: '/b/ vs /k/', category: 'minimal_pair' },
  { word: 'gate', pairWord: 'date', targetPhoneme: '/ɡ/ vs /d/', category: 'minimal_pair' },
  { word: 'date', pairWord: 'gate', targetPhoneme: '/d/ vs /ɡ/', category: 'minimal_pair' },
  { word: 'cap', pairWord: 'cup', targetPhoneme: '/æ/ vs /ʌ/', category: 'minimal_pair' },
  { word: 'cup', pairWord: 'cap', targetPhoneme: '/ʌ/ vs /æ/', category: 'minimal_pair' },
  { word: 'rice', pairWord: 'rise', targetPhoneme: '/s/ vs /z/', category: 'minimal_pair' },
  { word: 'rise', pairWord: 'rice', targetPhoneme: '/z/ vs /s/', category: 'minimal_pair' },
  { word: 'peace', pairWord: 'peas', targetPhoneme: '/s/ vs /z/', category: 'minimal_pair' },
  { word: 'peas', pairWord: 'peace', targetPhoneme: '/z/ vs /s/', category: 'minimal_pair' },
  { word: 'clock', pairWord: 'cloak', targetPhoneme: '/ɒ/ vs /oʊ/', category: 'minimal_pair' },
  { word: 'cloak', pairWord: 'clock', targetPhoneme: '/oʊ/ vs /ɒ/', category: 'minimal_pair' },

  // --- NUMBERS & QUANTITIES (High-frequency confusion over radio/intercom) ---
  { word: 'zero', category: 'number' },
  { word: 'one', category: 'number' },
  { word: 'two', category: 'number' },
  { word: 'four', category: 'number' },
  { word: 'five', category: 'number' },
  { word: 'six', category: 'number' },
  { word: 'seven', category: 'number' },
  { word: 'eight', category: 'number' },
  { word: 'nine', category: 'number' },
  { word: 'ten', category: 'number' },
  { word: 'eleven', category: 'number' },
  { word: 'twelve', category: 'number' },
  { word: 'twenty', category: 'number' },
  { word: 'hundred', category: 'number' },
  { word: 'thousand', category: 'number' },
  { word: 'million', category: 'number' },
  { word: 'first', category: 'number' },
  { word: 'second', category: 'number' },
  { word: 'third', category: 'number' },
  { word: 'tenth', category: 'number' },
  { word: 'twelfth', category: 'number' },

  // --- DATES, DAYS & TIMES ---
  { word: 'monday', category: 'date_time' },
  { word: 'tuesday', category: 'date_time' },
  { word: 'wednesday', category: 'date_time' },
  { word: 'thursday', category: 'date_time' },
  { word: 'friday', category: 'date_time' },
  { word: 'saturday', category: 'date_time' },
  { word: 'sunday', category: 'date_time' },
  { word: 'january', category: 'date_time' },
  { word: 'february', category: 'date_time' },
  { word: 'march', category: 'date_time' },
  { word: 'april', category: 'date_time' },
  { word: 'may', category: 'date_time' },
  { word: 'june', category: 'date_time' },
  { word: 'july', category: 'date_time' },
  { word: 'august', category: 'date_time' },
  { word: 'september', category: 'date_time' },
  { word: 'october', category: 'date_time' },
  { word: 'november', category: 'date_time' },
  { word: 'december', category: 'date_time' },
  { word: 'morning', category: 'date_time' },
  { word: 'afternoon', category: 'date_time' },
  { word: 'evening', category: 'date_time' },
  { word: 'midnight', category: 'date_time' },
  { word: 'noon', category: 'date_time' },
  { word: 'today', category: 'date_time' },
  { word: 'tomorrow', category: 'date_time' },
  { word: 'yesterday', category: 'date_time' },
  { word: 'quarter', category: 'date_time' },
  { word: 'half', category: 'date_time' },
  { word: 'past', category: 'date_time' },
  { word: 'schedule', category: 'date_time' },

  // --- TRAVEL, TRANSIT & PUBLIC ADDRESS (PA) VOCABULARY ---
  { word: 'airport', category: 'travel_transit' },
  { word: 'flight', category: 'travel_transit' },
  { word: 'terminal', category: 'travel_transit' },
  { word: 'ticket', category: 'travel_transit' },
  { word: 'passport', category: 'travel_transit' },
  { word: 'security', category: 'travel_transit' },
  { word: 'boarding', category: 'travel_transit' },
  { word: 'luggage', category: 'travel_transit' },
  { word: 'baggage', category: 'travel_transit' },
  { word: 'claim', category: 'travel_transit' },
  { word: 'track', category: 'travel_transit' },
  { word: 'train', category: 'travel_transit' },
  { word: 'station', category: 'travel_transit' },
  { word: 'platform', category: 'travel_transit' },
  { word: 'subway', category: 'travel_transit' },
  { word: 'bus', category: 'travel_transit' },
  { word: 'transfer', category: 'travel_transit' },
  { word: 'connection', category: 'travel_transit' },
  { word: 'delayed', category: 'travel_transit' },
  { word: 'cancelled', category: 'travel_transit' },
  { word: 'passenger', category: 'travel_transit' },
  { word: 'announcement', category: 'travel_transit' },
  { word: 'arrival', category: 'travel_transit' },
  { word: 'departure', category: 'travel_transit' },
  { word: 'concourse', category: 'travel_transit' },
  { word: 'elevator', category: 'travel_transit' },
  { word: 'escalator', category: 'travel_transit' },

  // --- EMERGENCY & CRITICAL INSTRUCTIONS ---
  { word: 'emergency', category: 'emergency' },
  { word: 'exit', category: 'emergency' },
  { word: 'doctor', category: 'emergency' },
  { word: 'hospital', category: 'emergency' },
  { word: 'police', category: 'emergency' },
  { word: 'help', category: 'emergency' },
  { word: 'danger', category: 'emergency' },
  { word: 'caution', category: 'emergency' },
  { word: 'warning', category: 'emergency' },
  { word: 'fire', category: 'emergency' },
  { word: 'alarm', category: 'emergency' },
  { word: 'stop', category: 'emergency' },
  { word: 'safe', category: 'emergency' },

  // --- DAILY CONVERSATION VERBS & NOUNS (Telephone & Intercom contexts) ---
  { word: 'water', category: 'nouns' },
  { word: 'coffee', category: 'nouns' },
  { word: 'bill', category: 'nouns' },
  { word: 'check', category: 'nouns' },
  { word: 'order', category: 'nouns' },
  { word: 'table', category: 'nouns' },
  { word: 'room', category: 'nouns' },
  { word: 'hotel', category: 'nouns' },
  { word: 'card', category: 'nouns' },
  { word: 'cash', category: 'nouns' },
  { word: 'key', category: 'nouns' },
  { word: 'phone', category: 'nouns' },
  { word: 'address', category: 'nouns' },
  { word: 'name', category: 'nouns' },
  { word: 'street', category: 'nouns' },
  { word: 'avenue', category: 'nouns' },
  { word: 'number', category: 'nouns' },
  { word: 'question', category: 'nouns' },
  { word: 'answer', category: 'nouns' },
  { word: 'message', category: 'nouns' },
  { word: 'office', category: 'nouns' },
  { word: 'door', category: 'nouns' },
  { word: 'desk', category: 'nouns' },
  { word: 'manager', category: 'nouns' },
  { word: 'receipt', category: 'nouns' },

  { word: 'spell', category: 'daily_verbs' },
  { word: 'repeat', category: 'daily_verbs' },
  { word: 'understand', category: 'daily_verbs' },
  { word: 'listen', category: 'daily_verbs' },
  { word: 'speak', category: 'daily_verbs' },
  { word: 'call', category: 'daily_verbs' },
  { word: 'confirm', category: 'daily_verbs' },
  { word: 'arrive', category: 'daily_verbs' },
  { word: 'leave', category: 'daily_verbs' },
  { word: 'follow', category: 'daily_verbs' },
  { word: 'enter', category: 'daily_verbs' },
  { word: 'return', category: 'daily_verbs' },
  { word: 'remember', category: 'daily_verbs' },
  { word: 'notice', category: 'daily_verbs' },
  { word: 'deliver', category: 'daily_verbs' }
];

// Rich scenarios for Mode C: Comprehension Under Stress
const STRESS_SCENARIOS = [
  {
    id: 'sc-1',
    scenario: 'Airport Gate Change Announcement',
    transcript: 'Attention all passengers on flight two fourteen: your gate has changed to gate fifty.',
    targetWord: 'fifty',
    question: 'What is the new gate number for flight 214?',
    options: ['Gate 15', 'Gate 50', 'Gate 5', 'Gate 14'],
    correctOption: 'Gate 50',
    audioUrl: '/audio/fifty.mp3',
    audioFallbackWord: 'fifty',
    contextDescription: 'Listen through PA reverberation to identify the departure gate.'
  },
  {
    id: 'sc-2',
    scenario: 'Train Station Platform Advisory',
    transcript: 'The express train to Manchester is arriving on track fourteen, not forty.',
    targetWord: 'fourteen',
    question: 'Which track is the express train arriving on?',
    options: ['Track 40', 'Track 14', 'Track 4', 'Track 44'],
    correctOption: 'Track 14',
    audioUrl: '/audio/fourteen.mp3',
    audioFallbackWord: 'fourteen',
    contextDescription: 'High ambient noise and station reverberation obscure the critical track number.'
  },
  {
    id: 'sc-3',
    scenario: 'Hotel Intercom Check-in',
    transcript: 'Front desk here: your reservation is confirmed for room nineteen on the second floor.',
    targetWord: 'nineteen',
    question: 'What room number was assigned to the guest?',
    options: ['Room 90', 'Room 19', 'Room 9', 'Room 99'],
    correctOption: 'Room 19',
    audioUrl: '/audio/nineteen.mp3',
    audioFallbackWord: 'nineteen',
    contextDescription: 'Scratchy front desk intercom with packet dropouts.'
  },
  {
    id: 'sc-4',
    scenario: 'Emergency Medical Dispatch',
    transcript: 'Paramedic team responding: please confirm if the patient has a weak heart.',
    targetWord: 'heart',
    question: 'What organ was the emergency dispatcher asking to confirm?',
    options: ['Hard', 'Heart', 'Head', 'Hurt'],
    correctOption: 'Heart',
    audioUrl: '/audio/heart.mp3',
    audioFallbackWord: 'heart',
    contextDescription: 'Walkie-talkie overdrive distortion and narrow telephone bandwidth.'
  },
  {
    id: 'sc-5',
    scenario: 'Aviation Flight Deck Radio',
    transcript: 'Tower, this is flight seven eighteen requesting immediate permission to sail through the storm corridor.',
    targetWord: 'sail',
    question: 'What action was cleared by the air traffic controller?',
    options: ['Fail', 'Sail', 'Scale', 'Fall'],
    correctOption: 'Sail',
    audioUrl: '/audio/sail.mp3',
    audioFallbackWord: 'sail',
    contextDescription: 'Cellular jitter and 300Hz-3400Hz telephone bandpass cutting off sibilants.'
  },
  {
    id: 'sc-6',
    scenario: 'Courier Delivery Intercom',
    transcript: 'Delivery buzzer: Package arriving for unit thirty, please buzz the gate.',
    targetWord: 'thirty',
    question: 'Which apartment unit is receiving the delivery package?',
    options: ['Unit 13', 'Unit 30', 'Unit 3', 'Unit 33'],
    correctOption: 'Unit 30',
    audioUrl: '/audio/thirty.mp3',
    audioFallbackWord: 'thirty',
    contextDescription: 'Loud street traffic SNR (+0 dB) and narrow intercom distortion.'
  },
  {
    id: 'sc-7',
    scenario: 'Subway Transfer Announcement',
    transcript: 'Subway public address: transfer here for the green line to terminal station.',
    targetWord: 'station',
    question: 'What destination was announced for the transfer?',
    options: ['Section', 'Station', 'Stadium', 'Stall'],
    correctOption: 'Station',
    audioUrl: '/audio/station.mp3',
    audioFallbackWord: 'station',
    contextDescription: 'Convolver reverb and low SNR (+5 dB) over subway rail rumble.'
  },
  {
    id: 'sc-8',
    scenario: 'Emergency Exit Direction',
    transcript: 'Attention in the building: please proceed calmly toward the north emergency exit.',
    targetWord: 'emergency',
    question: 'What type of exit was designated in the alarm message?',
    options: ['Escalator', 'Elevator', 'Emergency', 'Entry'],
    correctOption: 'Emergency',
    audioUrl: '/audio/emergency.mp3',
    audioFallbackWord: 'emergency',
    contextDescription: 'PA system overdrive clipping and high noise level.'
  }
];

// Helper: sleep with exponential backoff
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 4, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': USER_AGENT,
          ...(options.headers || {})
        }
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

// Extract Wiktionary audio filename & IPA
async function scrapeWiktionary(word) {
  try {
    const url = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&format=json`;
    const res = await fetchWithRetry(url);
    if (!res) return null;
    const data = await res.json();
    const wikitext = data.parse?.wikitext?.['*'] || '';

    // Find audio templates
    const audioMatches = [...wikitext.matchAll(/\{\{audio\|en\|([^|}]+)(?:\|([^}]+))?\}\}/gi)];
    let audioFile = null;
    if (audioMatches.length > 0) {
      // Prioritize US or UK pronunciation
      const usMatch = audioMatches.find(m => /us|american/i.test(m[1]) || /us|american/i.test(m[2] || ''));
      audioFile = (usMatch ? usMatch[1] : audioMatches[0][1]).trim();
    }

    // Find IPA
    const ipaMatches = [...wikitext.matchAll(/\{\{IPA\|en\|([^}]+)\}\}/gi)];
    let ipa = '';
    if (ipaMatches.length > 0) {
      const rawIpa = ipaMatches[0][1];
      ipa = rawIpa.split('|')[0].trim();
      if (!ipa.startsWith('/') && !ipa.startsWith('[')) {
        ipa = `/${ipa}/`;
      }
    }

    // Find part of speech
    let partOfSpeech = 'noun';
    if (/===\s*Verb\s*===/i.test(wikitext)) partOfSpeech = 'verb';
    else if (/===\s*Numeral\s*===/i.test(wikitext)) partOfSpeech = 'numeral';
    else if (/===\s*Adjective\s*===/i.test(wikitext)) partOfSpeech = 'adjective';
    else if (/===\s*Adverb\s*===/i.test(wikitext)) partOfSpeech = 'adverb';
    else if (/===\s*Noun\s*===/i.test(wikitext)) partOfSpeech = 'noun';

    return { audioFile, ipa, partOfSpeech };
  } catch (err) {
    return null;
  }
}

// Resolve direct Wikimedia Commons audio URL
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
      if (pages[id].imageinfo?.[0]?.url) {
        return pages[id].imageinfo[0].url;
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

// Download and convert to MP3
async function downloadAndConvert(directUrl, targetMp3Path, tempBaseName) {
  const res = await fetchWithRetry(directUrl);
  if (!res) return false;
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = path.extname(new URL(directUrl).pathname).toLowerCase() || '.ogg';
  const tempPath = path.join(AUDIO_DIR, `${tempBaseName}_temp${ext}`);
  fs.writeFileSync(tempPath, buffer);

  try {
    // Convert to normalized MP3 (128kbps, 44100Hz, stereo/mono)
    execSync(`ffmpeg -y -v quiet -i "${tempPath}" -c:a libmp3lame -b:a 128k -ar 44100 "${targetMp3Path}"`);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return fs.existsSync(targetMp3Path) && fs.statSync(targetMp3Path).size > 1000;
  } catch (e) {
    // If ffmpeg fails, fallback to keeping original if it's already audio
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

// Concurrent worker pool
async function pMap(items, mapper, concurrency = 5) {
  const results = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => mapper(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log('=====================================================');
  console.log('  ACOUSTIC EAR: Real Human Audio Ingestion Pipeline  ');
  console.log('=====================================================');
  console.log(`Ingesting ${WORD_DEFINITIONS.length} curated vocabulary entries...`);

  // Load existing metadata if available
  let existingVocab = [];
  if (fs.existsSync(VOCAB_PATH)) {
    try {
      const raw = fs.readFileSync(VOCAB_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      existingVocab = parsed.words || [];
    } catch {
      existingVocab = [];
    }
  }
  const existingMap = new Map(existingVocab.map(w => [w.word.toLowerCase(), w]));

  let processedCount = 0;
  let downloadedCount = 0;

  const results = await pMap(WORD_DEFINITIONS, async (def) => {
    const wordKey = def.word.toLowerCase();
    const targetMp3 = path.join(AUDIO_DIR, `${wordKey}.mp3`);
    const alreadyDownloaded = fs.existsSync(targetMp3) && fs.statSync(targetMp3).size > 1000;

    let meta = existingMap.get(wordKey) || null;
    let success = alreadyDownloaded;

    if (!meta || !meta.ipa || !alreadyDownloaded) {
      // Fetch Wiktionary info
      const wikt = await scrapeWiktionary(def.word);
      let audioFile = wikt?.audioFile;
      let ipa = wikt?.ipa || '';
      let pos = def.category === 'number' ? 'numeral' : (wikt?.partOfSpeech || 'noun');

      if (!audioFile) {
        audioFile = `en-us-${wordKey}.ogg`;
      }

      let directUrl = await resolveCommonsUrl(audioFile);
      if (!directUrl && !audioFile.startsWith('En-us-')) {
        // Try capitalized
        directUrl = await resolveCommonsUrl(`En-us-${wordKey}.ogg`);
      }
      if (!directUrl) {
        // Try lowercase
        directUrl = await resolveCommonsUrl(`en-us-${wordKey}.ogg`);
      }

      if (directUrl && !alreadyDownloaded) {
        success = await downloadAndConvert(directUrl, targetMp3, wordKey);
        if (success) {
          downloadedCount++;
          await sleep(250);
        }
      } else if (alreadyDownloaded) {
        success = true;
      }

      meta = {
        id: `vocab-${wordKey}`,
        word: def.word,
        ipa: ipa || `/${wordKey}/`,
        partOfSpeech: pos,
        category: def.category,
        pairWord: def.pairWord,
        targetPhoneme: def.targetPhoneme,
        audioUrl: `/audio/${wordKey}.mp3`,
        distractors: def.pairWord ? [def.pairWord] : undefined
      };
    } else {
      success = true;
    }

    processedCount++;
    if (processedCount % 10 === 0 || processedCount === WORD_DEFINITIONS.length) {
      console.log(`[Progress] Processed ${processedCount}/${WORD_DEFINITIONS.length} words (Downloaded: ${downloadedCount} new audio files)`);
    }

    return meta && success ? meta : null;
  }, 2);

  const successfulWords = results.filter(Boolean);

  // Generate complete structured dataset
  const finalDataset = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalWords: successfulWords.length,
    words: successfulWords,
    scenarios: STRESS_SCENARIOS
  };

  fs.writeFileSync(VOCAB_PATH, JSON.stringify(finalDataset, null, 2), 'utf8');
  console.log('-----------------------------------------------------');
  console.log(`Ingestion completed successfully!`);
  console.log(`Output:`);
  console.log(`- Audio directory: ${AUDIO_DIR} (${fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3')).length} files)`);
  console.log(`- Vocabulary JSON: ${VOCAB_PATH} (${successfulWords.length} entries + ${STRESS_SCENARIOS.length} scenarios)`);
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('Fatal ingestion pipeline error:', err);
  process.exit(1);
});

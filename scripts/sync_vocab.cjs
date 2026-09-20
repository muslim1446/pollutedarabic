const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT_DIR, 'public', 'audio');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const VOCAB_PATH = path.join(DATA_DIR, 'vocabulary.json');

// Import WORD_DEFINITIONS and STRESS_SCENARIOS from ingest_audio.js
const ingestCode = fs.readFileSync(path.join(__dirname, 'ingest_audio.js'), 'utf8');

// Extract WORD_DEFINITIONS
const wordDefsMatch = ingestCode.match(/const WORD_DEFINITIONS = (\[[\s\S]*?\]);/);
const scenariosMatch = ingestCode.match(/const STRESS_SCENARIOS = (\[[\s\S]*?\]);/);

if (!wordDefsMatch || !scenariosMatch) {
  console.error('Could not extract word definitions from ingest script');
  process.exit(1);
}

// Safely evaluate definition arrays
const WORD_DEFINITIONS = eval(wordDefsMatch[1]);
const STRESS_SCENARIOS = eval(scenariosMatch[1]);

// Read all existing MP3 files
const audioFiles = new Set(
  fs.readdirSync(AUDIO_DIR)
    .filter(f => f.endsWith('.mp3'))
    .map(f => f.replace('.mp3', '').toLowerCase())
);

console.log(`Found ${audioFiles.size} audio MP3 files in ${AUDIO_DIR}`);

// Read existing vocabulary.json for any pre-scraped IPA
let existingMap = new Map();
if (fs.existsSync(VOCAB_PATH)) {
  try {
    const existing = JSON.parse(fs.readFileSync(VOCAB_PATH, 'utf8'));
    (existing.words || []).forEach(w => existingMap.set(w.word.toLowerCase(), w));
  } catch (e) {}
}

const words = [];
for (const def of WORD_DEFINITIONS) {
  const wordLower = def.word.toLowerCase();
  if (audioFiles.has(wordLower)) {
    const existing = existingMap.get(wordLower);
    words.push({
      id: `vocab-${wordLower}`,
      word: def.word,
      ipa: existing?.ipa || `/${wordLower}/`,
      partOfSpeech: existing?.partOfSpeech || (def.category === 'number' ? 'numeral' : 'noun'),
      category: def.category,
      pairWord: def.pairWord,
      targetPhoneme: def.targetPhoneme,
      audioUrl: `/audio/${wordLower}.mp3`,
      distractors: def.pairWord ? [def.pairWord] : undefined
    });
  }
}

const dataset = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  totalWords: words.length,
  words: words,
  scenarios: STRESS_SCENARIOS
};

fs.writeFileSync(VOCAB_PATH, JSON.stringify(dataset, null, 2), 'utf8');
console.log(`Successfully synced ${words.length} verified words into ${VOCAB_PATH}`);

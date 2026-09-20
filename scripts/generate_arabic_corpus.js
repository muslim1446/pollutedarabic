#!/usr/bin/env node
/**
 * Arabic (MSA) Corpus Generator for Acoustic Ear — v3.0.0
 * ============================================================================
 * Mirrors scripts/generate_massive_corpus.js line-for-line in STRUCTURE and
 * quotas (minimal-pair seed -> frequency fill to 3,600 words -> 1,020 templated
 * scenarios). Only the LANGUAGE content changed: English -> Modern Standard
 * Arabic (MSA, fusha). DSP, app pipeline, scoring and storage LOGIC are untouched.
 *
 * Research grounding (see README §6 for full citations):
 * - Emphatic/plain contrasts (/s/-/sˤ/, /t/-/tˤ/, /d/-/dˤ/, /ð/-/ðˤ/) are the
 *   hardest Arabic sounds for L2 learners (36–63% perception error; Reading LSWP-9;
 *   Aldamen & Al-Deaibes 2023, Heliyon; Al Mahmoud 2013; Lowe 2025). They are the
 *   backbone of the minimal-pair inventory, stratified by vowel context ([a]
 *   easiest, [u]/[i] hardest — Hayes-Harb & Durham 2016) exactly as teen/ty stress
 *   was over-sampled in the English build.
 * - Pharyngeal/uvular/interdental contrasts (/ħ/-/h/, /ʕ/-/ʔ/, /q/-/k/, /θ/-/s/,
 *   /ð/-/z/, /ʃ/-/s/) follow PAM-L2 assimilation predictions (Al Mahmoud 2013).
 * - Long/short vowel quantity + Form-I/Form-II gemination (shadda) pairs play the
 *   role English morphophonemics (loose/lose, advice/advise) played at C1.
 * - Arabic numbers (unit-vs-ten, polarity 3–10) play the role of English teen/ty.
 * - Frequency fill: hermitdave ar_50k (OpenSubtitles, ~50k ranked types) with
 *   strict Arabic-script + educational-safe filters; stratification quotas are
 *   identical to the English build (A1 700 / A2 750 / B1 800 / B2 700 / C1 rest).
 *   Reference standards consulted: CAMeL Arabic Frequency Lists (12.6B tokens MSA
 *   split) and the Arabic CEFR Classified List (8,834 lemmas, Buckwalter+KELLY+
 *   Al-Kitaab via MADAMIRA). Author-assigned A1–C1 bins — NOT certified.
 * - Human-audio provenance path: Wiktionary {{ar-pr}} IPA + Commons
 *   Category:Lingua Libre pronunciation-ara (13,742 files) — see
 *   scripts/ingest_arabic_audio.js. Neural fill: Edge ar-SA-ZariyahNeural.
 *
 * Audio URL scheme: /audio/{ascii-id}.mp3 (e.g. /audio/ar-mp-0007.mp3) with the
 * Arabic script kept in `word`/`audioFallbackWord` (the TTS text). ASCII file
 * names avoid Windows/URL-encoding pitfalls with Arabic-script filenames.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const VOCAB_PATH = path.join(DATA_DIR, 'vocabulary.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

console.log('Generating Modern Standard Arabic (MSA) Listening Corpus...');

// =========================================================================
// 1. ARABIC MINIMAL-PAIR CONTRASTS
// Fields: s/t = vocalized MSA pair, ph = contrast label, lv = author-assigned
// level, p1/p2 = part of speech, i1/i2 = IPA, r1/r2 = Latin transliteration gloss.
// "near" in a comment = differs by one adjacent vowel too (flagged, kept at B2+).
// =========================================================================
const AR_MINIMAL_PAIR_SPECS = [
  // --- Emphatic س /s/ vs ص /sˤ/ (the core L2 difficulty: F2 lowering cue) ---
  { s: 'سَيْف', t: 'صَيْف', ph: '/s/ vs /sˤ/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/sajf/', i2: '/sˤajf/', r1: 'sayf (sword)', r2: 'ṣayf (summer)' },
  { s: 'سَارَ', t: 'صَارَ', ph: '/s/ vs /sˤ/', lv: 'A1', p1: 'verb', p2: 'verb', i1: '/saːra/', i2: '/sˤaːra/', r1: 'sāra (walked)', r2: 'ṣāra (became)' },
  { s: 'سُور', t: 'صُور', ph: '/s/ vs /sˤ/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/suːr/', i2: '/sˤuːr/', r1: 'sūr (wall)', r2: 'ṣūr (pictures)' },
  { s: 'سَبَّ', t: 'صَبَّ', ph: '/s/ vs /sˤ/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/sabba/', i2: '/sˤabba/', r1: 'sabba (insulted)', r2: 'ṣabba (poured)' },
  { s: 'سَلَّى', t: 'صَلَّى', ph: '/s/ vs /sˤ/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/sallaː/', i2: '/sˤallaː/', r1: 'sallā (consoled)', r2: 'ṣallā (prayed)' },
  { s: 'سَاحَ', t: 'صَاحَ', ph: '/s/ vs /sˤ/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/saːħa/', i2: '/sˤaːħa/', r1: 'sāḥa (roamed)', r2: 'ṣāḥa (shouted)' },
  { s: 'سَرَّ', t: 'صَرَّ', ph: '/s/ vs /sˤ/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/sarra/', i2: '/sˤarra/', r1: 'sarra (pleased)', r2: 'ṣarra (tied/chirped)' },
  { s: 'سَبْر', t: 'صَبْر', ph: '/s/ vs /sˤ/', lv: 'B2', p1: 'noun', p2: 'noun', i1: '/sabr/', i2: '/sˤabr/', r1: 'sabr (probing)', r2: 'ṣabr (patience)' },
  { s: 'سَدَى', t: 'صَدَى', ph: '/s/ vs /sˤ/', lv: 'B2', p1: 'noun', p2: 'noun', i1: '/sadaː/', i2: '/sˤadaː/', r1: 'sadā (futility)', r2: 'ṣadā (echo)' },
  // --- Emphatic ت /t/ vs ط /tˤ/ (VOT is the reliable cue — Aldamen 2023) ---
  { s: 'تِين', t: 'طِين', ph: '/t/ vs /tˤ/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/tiːn/', i2: '/tˤiːn/', r1: 'tīn (figs)', r2: 'ṭīn (mud)' },
  { s: 'تَابَ', t: 'طَابَ', ph: '/t/ vs /tˤ/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/taːba/', i2: '/tˤaːba/', r1: 'tāba (repented)', r2: 'ṭāba (was pleasant)' },
  { s: 'تَرَب', t: 'طَرَب', ph: '/t/ vs /tˤ/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/tarab/', i2: '/tˤarab/', r1: 'tarab (soil)', r2: 'ṭarab (musical delight)' },
  { s: 'تَبِعَ', t: 'طَبَعَ', ph: '/t/ vs /tˤ/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/tabiʕa/', i2: '/tˤabaʕa/', r1: 'tabiʿa (followed)', r2: 'ṭabaʿa (printed)' },
  { s: 'تَلَّ', t: 'طَلَّ', ph: '/t/ vs /tˤ/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/talla/', i2: '/tˤalla/', r1: 'talla (threw down)', r2: 'ṭalla (peeped)' },
  { s: 'تَمَّ', t: 'طَمَّ', ph: '/t/ vs /tˤ/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/tamma/', i2: '/tˤamma/', r1: 'tamma (was completed)', r2: 'ṭamma (flooded)' },
  { s: 'ثُوب', t: 'طُوب', ph: '/θ/ vs /tˤ/', lv: 'B2', p1: 'noun', p2: 'noun', i1: '/θuːb/', i2: '/tˤuːb/', r1: 'thūb (garment)', r2: 'ṭūb (bricks)' },
  // --- Emphatic د /d/ vs ض /dˤ/ ---
  { s: 'دَرْب', t: 'ضَرْب', ph: '/d/ vs /dˤ/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/darb/', i2: '/dˤarb/', r1: 'darb (path)', r2: 'ḍarb (hitting)' },
  { s: 'دَلَّ', t: 'ضَلَّ', ph: '/d/ vs /dˤ/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/dalla/', i2: '/dˤalla/', r1: 'dalla (guided)', r2: 'ḍalla (strayed)' },
  { s: 'دَاء', t: 'ضَاءَ', ph: '/d/ vs /dˤ/', lv: 'B1', p1: 'noun', p2: 'verb', i1: '/daːʔ/', i2: '/dˤaːʔa/', r1: 'dāʾ (illness)', r2: 'ḍāʾa (shone)' },
  { s: 'دَلِيل', t: 'ضَلِيل', ph: '/d/ vs /dˤ/', lv: 'B2', p1: 'noun', p2: 'adjective', i1: '/daliːl/', i2: '/dˤaliːl/', r1: 'dalīl (guide)', r2: 'ḍalīl (straying)' },
  { s: 'دَلَال', t: 'ضَلَال', ph: '/d/ vs /dˤ/', lv: 'B2', p1: 'noun', p2: 'noun', i1: '/dalaːl/', i2: '/dˤalaːl/', r1: 'dalāl (coquetry)', r2: 'ḍalāl (straying)' },
  // --- Emphatic ذ /ð/ vs ظ /ðˤ/ (hardest fricative pair; COG is NOT the cue) ---
  { s: 'ذَلَّ', t: 'ظَلَّ', ph: '/ð/ vs /ðˤ/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/ðalla/', i2: '/ðˤalla/', r1: 'dhalla (was humiliated)', r2: 'ẓalla (remained)' },
  { s: 'ذُلّ', t: 'ظِلّ', ph: '/ð/ vs /ðˤ/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/ðull/', i2: '/ðˤill/', r1: 'dhull (humiliation)', r2: 'ẓill (shade)' },
  { s: 'ذَرْف', t: 'ظَرْف', ph: '/ð/ vs /ðˤ/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/ðarf/', i2: '/ðˤarf/', r1: 'dharf (shedding tears)', r2: 'ẓarf (envelope)' },
  // --- Interdental ث /θ/ vs emphatic ص /sˤ/ (cross-place, C1-style low load) ---
  { s: 'ثَوَاب', t: 'صَوَاب', ph: '/θ/ vs /sˤ/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/θawaːb/', i2: '/sˤawaːb/', r1: 'thawāb (reward)', r2: 'ṣawāb (correctness)' },
  // --- Vowel quantity /aː/-/a/, /iː/-/i/, /uː/-/u/ (duration + quality) ---
  { s: 'دِين', t: 'دَيْن', ph: '/iː/ vs /aj/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/diːn/', i2: '/dajn/', r1: 'dīn (religion)', r2: 'dayn (debt)' },
  { s: 'عُد', t: 'عُود', ph: '/u/ vs /uː/', lv: 'B1', p1: 'verb', p2: 'noun', i1: '/ʕud/', i2: '/ʕuːd/', r1: 'ʿud (return!)', r2: 'ʿūd (lute)' },
  { s: 'قُل', t: 'قُول', ph: '/u/ vs /uː/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/qul/', i2: '/quːl/', r1: 'qul (say! MSA)', r2: 'qūl (say! long, dialectal)' },
  { s: 'بَرَّ', t: 'بِرَّ', ph: '/a/ vs /i/', lv: 'A1', p1: 'verb', p2: 'noun', i1: '/barra/', i2: '/birr/', r1: 'barra (was dutiful)', r2: 'birr (piety)' },
  { s: 'بَرَّ', t: 'بُرَّ', ph: '/a/ vs /u/', lv: 'A1', p1: 'verb', p2: 'noun', i1: '/barra/', i2: '/burr/', r1: 'barra (was dutiful)', r2: 'burr (wheat)' },
  { s: 'جَدّ', t: 'جَادّ', ph: '/a/ vs /aː/', lv: 'B1', p1: 'noun', p2: 'adjective', i1: '/dʒadd/', i2: '/dʒaːdd/', r1: 'jadd (grandfather)', r2: 'jādd (serious)' },
  { s: 'كَتَبَ', t: 'كَاتِب', ph: '/a/ vs /aː/', lv: 'A1', p1: 'verb', p2: 'noun', i1: '/kataba/', i2: '/kaːtib/', r1: 'kataba (he wrote)', r2: 'kātib (writer)' },
  { s: 'عَمِلَ', t: 'عَامِل', ph: '/a/ vs /aː/', lv: 'B1', p1: 'verb', p2: 'noun', i1: '/ʕamila/', i2: '/ʕaːmil/', r1: 'ʿamila (he worked)', r2: 'ʿāmil (worker)' },
  { s: 'طَلَّ', t: 'طَالَ', ph: '/a/ vs /aː/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/tˤalla/', i2: '/tˤaːla/', r1: 'ṭalla (peeped)', r2: 'ṭāla (was long)' },
  { s: 'حَمَام', t: 'حَمَّام', ph: '/m/ vs /mm/', lv: 'A2', p1: 'noun', p2: 'noun', i1: '/ħamaːm/', i2: '/ħammaːm/', r1: 'ḥamām (pigeons)', r2: 'ḥammām (bathroom)' },
  // --- Pharyngeal ح /ħ/ vs ه /h/ (UC assimilation: poor exemplar of English h) ---
  { s: 'حَلَّ', t: 'هَلَّ', ph: '/ħ/ vs /h/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/ħalla/', i2: '/halla/', r1: 'ḥalla (solved)', r2: 'halla (crescent appeared)' },
  { s: 'حَبَّ', t: 'هَبَّ', ph: '/ħ/ vs /h/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/ħabba/', i2: '/habba/', r1: 'ḥabba (loved)', r2: 'habba (wind blew)' },
  { s: 'حَال', t: 'هَالَ', ph: '/ħ/ vs /h/', lv: 'B1', p1: 'noun', p2: 'verb', i1: '/ħaːl/', i2: '/haːla/', r1: 'ḥāl (condition)', r2: 'hāla (frightened)' },
  { s: 'حَدَّ', t: 'هَدَّ', ph: '/ħ/ vs /h/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/ħadda/', i2: '/hadda/', r1: 'ḥadda (sharpened)', r2: 'hadda (demolished)' },
  { s: 'حَوْل', t: 'هَوْل', ph: '/ħ/ vs /h/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/ħawl/', i2: '/hawl/', r1: 'ḥawl (surroundings)', r2: 'hawl (horror)' },
  { s: 'حَمَّ', t: 'هَمَّ', ph: '/ħ/ vs /h/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/ħamma/', i2: '/hamma/', r1: 'ḥamma (heated)', r2: 'hamma (concerned)' },
  // --- Pharyngeal ع /ʕ/ vs hamza أ /ʔ/ (no English equivalent for ع) ---
  { s: 'عَلَم', t: 'أَلَم', ph: '/ʕ/ vs /ʔ/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/ʕalam/', i2: '/ʔalam/', r1: 'ʿalam (flag)', r2: 'ʾalam (pain)' },
  { s: 'عَيْن', t: 'أَيْن', ph: '/ʕ/ vs /ʔ/', lv: 'A1', p1: 'noun', p2: 'adverb', i1: '/ʕajn/', i2: '/ʔajn/', r1: 'ʿayn (eye)', r2: 'ʾayn (where)' },
  { s: 'عَمَل', t: 'أَمَل', ph: '/ʕ/ vs /ʔ/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/ʕamal/', i2: '/ʔamal/', r1: 'ʿamal (work)', r2: 'ʾamal (hope)' },
  { s: 'عَرْض', t: 'أَرْض', ph: '/ʕ/ vs /ʔ/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/ʕardˤ/', i2: '/ʔardˤ/', r1: 'ʿarḍ (presentation)', r2: 'ʾarḍ (land)' },
  { s: 'عَمّ', t: 'أَمَّ', ph: '/ʕ/ vs /ʔ/', lv: 'A2', p1: 'noun', p2: 'verb', i1: '/ʕamm/', i2: '/ʔamma/', r1: 'ʿamm (uncle)', r2: 'ʾamma (led prayer)' },
  { s: 'عَرَب', t: 'أَرَب', ph: '/ʕ/ vs /ʔ/', lv: 'B2', p1: 'noun', p2: 'noun', i1: '/ʕarab/', i2: '/ʔarab/', r1: 'ʿarab (Arabs)', r2: 'ʾarab (need/wit)' },
  // --- Uvular ق /q/ vs ك /k/ (Gulf fronting note; MSA keeps /q/) ---
  { s: 'قَلْب', t: 'كَلْب', ph: '/q/ vs /k/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/qalb/', i2: '/kalb/', r1: 'qalb (heart)', r2: 'kalb (dog)' },
  { s: 'قَرَّ', t: 'كَرَّ', ph: '/q/ vs /k/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/qarra/', i2: '/karra/', r1: 'qarra (settled)', r2: 'karra (charged)' },
  { s: 'قَدَّ', t: 'كَدَّ', ph: '/q/ vs /k/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/qadda/', i2: '/kadda/', r1: 'qadda (tore)', r2: 'kadda (worked hard)' },
  { s: 'قَشَّرَ', t: 'كَشَّرَ', ph: '/q/ vs /k/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/qaʃʃara/', i2: '/kaʃʃara/', r1: 'qashshara (peeled)', r2: 'kashshara (scowled)' },
  { s: 'قَمَر', t: 'كَمَر', ph: '/q/ vs /k/', lv: 'B2', p1: 'noun', p2: 'noun', i1: '/qamar/', i2: '/kamar/', r1: 'qamar (moon)', r2: 'kamar (waistband, loanword)' },
  // --- Velar خ /x/ vs ح /ħ/ ---
  { s: 'خَال', t: 'حَال', ph: '/x/ vs /ħ/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/xaːl/', i2: '/ħaːl/', r1: 'khāl (uncle)', r2: 'ḥāl (condition)' },
  { s: 'خَلّ', t: 'حَلّ', ph: '/x/ vs /ħ/', lv: 'A1', p1: 'noun', p2: 'verb', i1: '/xall/', i2: '/ħall/', r1: 'khall (vinegar)', r2: 'ḥall (solution/solved)' },
  { s: 'خَدّ', t: 'حَدّ', ph: '/x/ vs /ħ/', lv: 'A2', p1: 'noun', p2: 'noun', i1: '/xadd/', i2: '/ħadd/', r1: 'khadd (cheek)', r2: 'ḥadd (edge)' },
  { s: 'خَطَبَ', t: 'حَطَبَ', ph: '/x/ vs /ħ/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/xatˤaba/', i2: '/ħatˤaba/', r1: 'khaṭaba (proposed marriage)', r2: 'ḥaṭaba (gathered firewood)' },
  { s: 'خَتَمَ', t: 'حَتَمَ', ph: '/x/ vs /ħ/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/xatama/', i2: '/ħatama/', r1: 'khatama (stamped)', r2: 'ḥatama (decreed)' },
  // --- Uvular fricatives خ /x/ vs غ /ɣ/ ---
  { s: 'خَرَّ', t: 'غَرَّ', ph: '/x/ vs /ɣ/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/xarra/', i2: '/ɣarra/', r1: 'kharra (fell)', r2: 'gharra (deceived)' },
  { s: 'خَطَّ', t: 'غَطَّ', ph: '/x/ vs /ɣ/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/xatˤtˤa/', i2: '/ɣatˤtˤa/', r1: 'khaṭṭa (sketched)', r2: 'ghaṭṭa (covered)' },
  { s: 'خَائِب', t: 'غَائِب', ph: '/x/ vs /ɣ/', lv: 'B1', p1: 'adjective', p2: 'adjective', i1: '/xaːʔib/', i2: '/ɣaːʔib/', r1: 'khāʾib (disappointed)', r2: 'ghāʾib (absent)' },
  // --- Interdental ث /θ/ vs س /s/ (collapses to /t/~/s/ in Egyptian/Levantine) ---
  { s: 'ثَارَ', t: 'سَارَ', ph: '/θ/ vs /s/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/θaːra/', i2: '/saːra/', r1: 'thāra (revolted)', r2: 'sāra (walked)' },
  { s: 'ثَمَن', t: 'سَمَن', ph: '/θ/ vs /s/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/θaman/', i2: '/saman/', r1: 'thaman (price)', r2: 'saman (ghee)' },
  { s: 'ثَمَر', t: 'سَمَر', ph: '/θ/ vs /s/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/θamar/', i2: '/samar/', r1: 'thamar (fruit)', r2: 'samar (evening chat)' },
  { s: 'ثَوْرَة', t: 'سُورَة', ph: '/θ/ vs /s/ (near)', lv: 'B2', p1: 'noun', p2: 'noun', i1: '/θawra/', i2: '/suːra/', r1: 'thawra (revolution)', r2: 'sūra (chapter)' },
  // --- ث /θ/ vs ت /t/ ---
  { s: 'ثَمَّ', t: 'تَمَّ', ph: '/θ/ vs /t/', lv: 'B1', p1: 'adverb', p2: 'verb', i1: '/θamma/', i2: '/tamma/', r1: 'thamma (there)', r2: 'tamma (was completed)' },
  { s: 'ثَابَ', t: 'تَابَ', ph: '/θ/ vs /t/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/θaːba/', i2: '/taːba/', r1: 'thāba (came to senses)', r2: 'tāba (repented)' },
  // --- ذ /ð/ vs ز /z/ ---
  { s: 'ذَرَّ', t: 'زَرَّ', ph: '/ð/ vs /z/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/ðarra/', i2: '/zarra/', r1: 'dharra (scattered)', r2: 'zarra (buttoned)' },
  // --- ذ /ð/ vs د /d/ ---
  { s: 'نَذَرَ', t: 'نَدَرَ', ph: '/ð/ vs /d/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/naðara/', i2: '/nadara/', r1: 'nadhara (vowed)', r2: 'nadara (was rare)' },
  { s: 'بَذَرَ', t: 'بَدَرَ', ph: '/ð/ vs /d/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/baðara/', i2: '/badara/', r1: 'badhara (sowed)', r2: 'badara (hastened)' },
  // --- ش /ʃ/ vs س /s/ (sibilance is the first casualty of band-limiting) ---
  { s: 'شَكَّ', t: 'سَكَّ', ph: '/ʃ/ vs /s/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/ʃakka/', i2: '/sakka/', r1: 'shakka (doubted)', r2: 'sakka (minted)' },
  { s: 'شَهْر', t: 'سَهَر', ph: '/ʃ/ vs /s/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/ʃahr/', i2: '/sahar/', r1: 'shahr (month)', r2: 'sahar (sleeplessness)' },
  { s: 'شَالَ', t: 'سَالَ', ph: '/ʃ/ vs /s/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/ʃaːla/', i2: '/saːla/', r1: 'shāla (lifted)', r2: 'sāla (flowed)' },
  { s: 'شَبَّ', t: 'سَبَّ', ph: '/ʃ/ vs /s/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/ʃabba/', i2: '/sabba/', r1: 'shabba (flared up)', r2: 'sabba (insulted)' },
  { s: 'شَرَف', t: 'سَرَف', ph: '/ʃ/ vs /s/', lv: 'B2', p1: 'noun', p2: 'noun', i1: '/ʃaraf/', i2: '/saraf/', r1: 'sharaf (honor)', r2: 'saraf (extravagance)' },
  // --- ش /ʃ/ vs ج /dʒ/ ---
  { s: 'شَاعَ', t: 'جَاعَ', ph: '/ʃ/ vs /dʒ/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/ʃaːʕa/', i2: '/dʒaːʕa/', r1: 'shāʿa (spread)', r2: 'jāʿa (starved)' },
  { s: 'شَدَّ', t: 'جَدَّ', ph: '/ʃ/ vs /dʒ/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/ʃadda/', i2: '/dʒadda/', r1: 'shadda (pulled)', r2: 'jadda (was serious)' },
  { s: 'شَمْل', t: 'جَمَل', ph: '/ʃ/ vs /dʒ/', lv: 'A2', p1: 'noun', p2: 'noun', i1: '/ʃaml/', i2: '/dʒamal/', r1: 'shaml (inclusion)', r2: 'jamal (camel)' },
  // --- ج /dʒ/ vs ز /z/ (affricate vs fricative, cf. English dʒ/tʃ) ---
  { s: 'جَرَّ', t: 'زَرَّ', ph: '/dʒ/ vs /z/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/dʒarra/', i2: '/zarra/', r1: 'jarra (pulled)', r2: 'zarra (buttoned)' },
  // --- ظ /ðˤ/ vs ز /z/ ---
  { s: 'ظَاهِر', t: 'زَاهِر', ph: '/ðˤ/ vs /z/', lv: 'B2', p1: 'adjective', p2: 'adjective', i1: '/ðˤaːhir/', i2: '/zaːhir/', r1: 'ẓāhir (apparent)', r2: 'zāhir (brilliant)' },
  // --- Voicing س /s/ vs ز /z/ (parallels English price/prize) ---
  { s: 'زَارَ', t: 'سَارَ', ph: '/z/ vs /s/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/zaːra/', i2: '/saːra/', r1: 'zāra (visited)', r2: 'sāra (walked)' },
  { s: 'زَادَ', t: 'سَادَ', ph: '/z/ vs /s/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/zaːda/', i2: '/saːda/', r1: 'zāda (increased)', r2: 'sāda (prevailed)' },
  { s: 'زَمَن', t: 'سَمَن', ph: '/z/ vs /s/', lv: 'B1', p1: 'noun', p2: 'noun', i1: '/zaman/', i2: '/saman/', r1: 'zaman (time)', r2: 'saman (ghee)' },
  { s: 'عَسَلَ', t: 'عَزَلَ', ph: '/s/ vs /z/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/ʕasala/', i2: '/ʕazala/', r1: 'ʿasala (honeyed)', r2: 'ʿazala (isolated)' },
  // --- ل /l/ vs ر /r/ (same high load as English light/right) ---
  { s: 'لَاحَ', t: 'رَاحَ', ph: '/l/ vs /r/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/laːħa/', i2: '/raːħa/', r1: 'lāḥa (appeared)', r2: 'rāḥa (went)' },
  { s: 'لَفَّ', t: 'رَفَّ', ph: '/l/ vs /r/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/laffa/', i2: '/raffa/', r1: 'laffa (wrapped)', r2: 'raffa (fluttered)' },
  // --- ب /b/ vs م /m/ (first-formant confusions under narrow bandpass) ---
  { s: 'بَيْت', t: 'مَيْت', ph: '/b/ vs /m/', lv: 'A1', p1: 'noun', p2: 'noun', i1: '/bajt/', i2: '/majt/', r1: 'bayt (house)', r2: 'mayt (dead)' },
  { s: 'بَرَّ', t: 'مَرَّ', ph: '/b/ vs /m/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/barra/', i2: '/marra/', r1: 'barra (was dutiful)', r2: 'marra (passed)' },
  { s: 'بَاعَ', t: 'مَاعَ', ph: '/b/ vs /m/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/baːʕa/', i2: '/maːʕa/', r1: 'bāʿa (sold)', r2: 'māʿa (flowed)' },
  // --- ف /f/ vs ب /b/ ---
  { s: 'فَاتَ', t: 'بَاتَ', ph: '/f/ vs /b/', lv: 'A2', p1: 'verb', p2: 'verb', i1: '/faːta/', i2: '/baːta/', r1: 'fāta (passed)', r2: 'bāta (spent night)' },
  { s: 'فَرَّ', t: 'بَرَّ', ph: '/f/ vs /b/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/farra/', i2: '/barra/', r1: 'farra (fled)', r2: 'barra (was dutiful)' },
  // --- ن /n/ vs م /m/ ---
  { s: 'نَالَ', t: 'مَالَ', ph: '/n/ vs /m/', lv: 'B1', p1: 'verb', p2: 'verb', i1: '/naːla/', i2: '/maːla/', r1: 'nāla (obtained)', r2: 'māla (inclined)' },
  // --- Gemination Form I vs Form II (C1 morphophonemics = English advice/advise) ---
  { s: 'دَرَسَ', t: 'دَرَّسَ', ph: '/C/ vs /CC/', lv: 'C1', p1: 'verb', p2: 'verb', i1: '/darasa/', i2: '/darrasa/', r1: 'darasa (studied)', r2: 'darrasa (taught)' },
  { s: 'عَلِمَ', t: 'عَلَّمَ', ph: '/C/ vs /CC/', lv: 'C1', p1: 'verb', p2: 'verb', i1: '/ʕalima/', i2: '/ʕallama/', r1: 'ʿalima (knew)', r2: 'ʿallama (taught)' },
  { s: 'فَهِمَ', t: 'فَهَّمَ', ph: '/C/ vs /CC/', lv: 'C1', p1: 'verb', p2: 'verb', i1: '/fahima/', i2: '/fahhama/', r1: 'fahima (understood)', r2: 'fahhama (explained)' },
  { s: 'كَسَرَ', t: 'كَسَّرَ', ph: '/C/ vs /CC/', lv: 'C1', p1: 'verb', p2: 'verb', i1: '/kasara/', i2: '/kassara/', r1: 'kasara (broke)', r2: 'kassara (smashed)' },
  { s: 'سَلِمَ', t: 'سَلَّمَ', ph: '/C/ vs /CC/', lv: 'C1', p1: 'verb', p2: 'verb', i1: '/salima/', i2: '/sallama/', r1: 'salima (was safe)', r2: 'sallama (greeted)' },
  { s: 'قَدِمَ', t: 'قَدَّمَ', ph: '/C/ vs /CC/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/qadima/', i2: '/qaddama/', r1: 'qadima (arrived)', r2: 'qaddama (presented)' },
  { s: 'خَرَجَ', t: 'خَرَّجَ', ph: '/C/ vs /CC/', lv: 'B2', p1: 'verb', p2: 'verb', i1: '/xaradʒa/', i2: '/xarradʒa/', r1: 'kharaja (went out)', r2: 'kharraja (graduated sb.)' },
  { s: 'جَمَل', t: 'جَمَّلَ', ph: '/C/ vs /CC/', lv: 'B1', p1: 'noun', p2: 'verb', i1: '/dʒamal/', i2: '/dʒammala/', r1: 'jamal (camel)', r2: 'jammala (embellished)' },
  // --- Adjective vs Form-II causative (very high frequency, A1–B2) ---
  { s: 'فَرَح', t: 'فَرَّحَ', ph: '/C/ vs /CC/', lv: 'A2', p1: 'noun', p2: 'verb', i1: '/faraħ/', i2: '/farraħa/', r1: 'faraḥ (joy)', r2: 'farraḥa (made happy)' },
  { s: 'كَبِير', t: 'كَبَّرَ', ph: '/C/ vs /CC/', lv: 'A1', p1: 'adjective', p2: 'verb', i1: '/kabiːr/', i2: '/kabbara/', r1: 'kabīr (big)', r2: 'kabbara (magnified)' },
  { s: 'صَغِير', t: 'صَغَّرَ', ph: '/C/ vs /CC/', lv: 'A1', p1: 'adjective', p2: 'verb', i1: '/sˤaɣiːr/', i2: '/sˤaɣɣara/', r1: 'ṣaghīr (small)', r2: 'ṣaghghara (minimized)' },
  { s: 'طَوِيل', t: 'طَوَّلَ', ph: '/C/ vs /CC/', lv: 'A1', p1: 'adjective', p2: 'verb', i1: '/tˤawiːl/', i2: '/tˤawwala/', r1: 'ṭawīl (long)', r2: 'ṭawwala (lengthened)' },
  { s: 'قَصِير', t: 'قَصَّرَ', ph: '/C/ vs /CC/', lv: 'A1', p1: 'adjective', p2: 'verb', i1: '/qasˤiːr/', i2: '/qasˤsˤara/', r1: 'qaṣīr (short)', r2: 'qaṣṣara (shortened)' },
  { s: 'جَدِيد', t: 'جَدَّدَ', ph: '/C/ vs /CC/', lv: 'A1', p1: 'adjective', p2: 'verb', i1: '/dʒadiːd/', i2: '/dʒaddada/', r1: 'jadīd (new)', r2: 'jaddada (renewed)' },
  { s: 'قَرِيب', t: 'قَرَّبَ', ph: '/C/ vs /CC/', lv: 'A1', p1: 'adjective', p2: 'verb', i1: '/qariːb/', i2: '/qarraba/', r1: 'qarīb (near)', r2: 'qarraba (brought near)' },
  { s: 'نَظِيف', t: 'نَظَّفَ', ph: '/C/ vs /CC/', lv: 'A1', p1: 'adjective', p2: 'verb', i1: '/naðˤiːf/', i2: '/naðˤðˤafa/', r1: 'naẓīf (clean)', r2: 'naẓẓafa (cleaned)' },
  { s: 'بَارِد', t: 'بَرَّدَ', ph: '/C/ vs /CC/', lv: 'A2', p1: 'adjective', p2: 'verb', i1: '/baːrid/', i2: '/barrada/', r1: 'bārid (cold)', r2: 'barrada (chilled)' },
  { s: 'سَرِيع', t: 'سَرَّعَ', ph: '/C/ vs /CC/', lv: 'A2', p1: 'adjective', p2: 'verb', i1: '/sariːʕ/', i2: '/sarraʕa/', r1: 'sarīʿ (fast)', r2: 'sarraʿa (sped up)' },
  { s: 'وَسِخ', t: 'وَسَّخَ', ph: '/C/ vs /CC/', lv: 'A2', p1: 'adjective', p2: 'verb', i1: '/wasix/', i2: '/wassaxa/', r1: 'wasikh (dirty)', r2: 'wassakha (dirtied)' },
  { s: 'مَرِيض', t: 'مَرَّضَ', ph: '/C/ vs /CC/', lv: 'B1', p1: 'adjective', p2: 'verb', i1: '/mariːdˤ/', i2: '/marradˤa/', r1: 'marīḍ (sick)', r2: 'marraḍa (nursed)' },
  { s: 'جَائِع', t: 'جَوَّعَ', ph: '/C/ vs /CC/', lv: 'B1', p1: 'adjective', p2: 'verb', i1: '/dʒaːʔiʕ/', i2: '/dʒawwaʕa/', r1: 'jāʾiʿ (hungry)', r2: 'jawwaʿa (starved)' },
  { s: 'رَخِيص', t: 'رَخَّصَ', ph: '/C/ vs /CC/', lv: 'B1', p1: 'adjective', p2: 'verb', i1: '/raxiːsˤ/', i2: '/raxxasˤa/', r1: 'rakhīṣ (cheap)', r2: 'rakhkhaṣa (discounted)' },
  { s: 'غَالِي', t: 'غَلَّى', ph: '/C/ vs /CC/', lv: 'B1', p1: 'adjective', p2: 'verb', i1: '/ɣaːliː/', i2: '/ɣallaː/', r1: 'ghālī (expensive)', r2: 'ghallā (raised price)' },
  { s: 'عَطْشَان', t: 'عَطَّشَ', ph: '/C/ vs /CC/', lv: 'B2', p1: 'adjective', p2: 'verb', i1: '/ʕatˤʃaːn/', i2: '/ʕatˤtˤaʃa/', r1: 'ʿaṭshān (thirsty)', r2: 'ʿaṭṭasha (made thirsty)' },
  { s: 'حَارّ', t: 'حَرَّرَ', ph: '/C/ vs /CC/', lv: 'B2', p1: 'adjective', p2: 'verb', i1: '/ħaːrr/', i2: '/ħarrara/', r1: 'ḥārr (hot)', r2: 'ḥarrara (liberated)' },
  // --- Arabic numbers: unit vs ten (the functional twin of English teen/ty) ---
  { s: 'ثَلَاثَة', t: 'ثَلَاثُون', ph: '/a/ vs /uːn/ (unit–ten)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/θalaːθa/', i2: '/θalaːθuːn/', r1: 'thalātha (3)', r2: 'thalāthūn (30)' },
  { s: 'أَرْبَعَة', t: 'أَرْبَعُون', ph: '/a/ vs /uːn/ (unit–ten)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/ʔarbaʕa/', i2: '/ʔarbaʕuːn/', r1: 'ʾarbaʿa (4)', r2: 'ʾarbaʿūn (40)' },
  { s: 'خَمْسَة', t: 'خَمْسُون', ph: '/a/ vs /uːn/ (unit–ten)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/xamsa/', i2: '/xamsuːn/', r1: 'khamsa (5)', r2: 'khamsūn (50)' },
  { s: 'سِتَّة', t: 'سِتُّون', ph: '/a/ vs /uːn/ (unit–ten)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/sitta/', i2: '/sittuːn/', r1: 'sitta (6)', r2: 'sittūn (60)' },
  { s: 'سَبْعَة', t: 'سَبْعُون', ph: '/a/ vs /uːn/ (unit–ten)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/sabʕa/', i2: '/sabʕuːn/', r1: 'sabʿa (7)', r2: 'sabʿūn (70)' },
  { s: 'ثَمَانِيَة', t: 'ثَمَانُون', ph: '/a/ vs /uːn/ (unit–ten)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/θamaːnija/', i2: '/θamaːnuːn/', r1: 'thamāniya (8)', r2: 'thamānūn (80)' },
  { s: 'تِسْعَة', t: 'تِسْعُون', ph: '/a/ vs /uːn/ (unit–ten)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/tisʕa/', i2: '/tisʕuːn/', r1: 'tisʿa (9)', r2: 'tisʿūn (90)' },
  { s: 'عَشَرَة', t: 'عِشْرُون', ph: '/a/ vs /uːn/ (unit–ten)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/ʕaʃara/', i2: '/ʕiʃruːn/', r1: 'ʿashara (10)', r2: 'ʿishrūn (20)' },
  { s: 'أَحَدَ عَشَرَ', t: 'اثْنَا عَشَرَ', ph: '/aħad/ vs /iθnaː/ (11–12)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/ʔaħada ʕaʃara/', i2: '/ʔiθnaː ʕaʃara/', r1: 'ʾaḥada ʿashara (11)', r2: 'ʾithnā ʿashara (12)' },
  { s: 'وَاحِد', t: 'اثْنَان', ph: '/w/ vs /θn/ (1–2)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/waːħid/', i2: '/ʔiθnaːn/', r1: 'wāḥid (1)', r2: 'ʾithnān (2)' },
  { s: 'صِفْر', t: 'عَشَرَة', ph: '/sˤ/ vs /ʕ/ (0–10)', lv: 'A1', p1: 'numeral', p2: 'numeral', i1: '/sˤifr/', i2: '/ʕaʃara/', r1: 'ṣifr (0)', r2: 'ʿashara (10)' },
  { s: 'مِئَة', t: 'أَلْف', ph: '/m/ vs /ʔ/ (100–1000)', lv: 'B1', p1: 'numeral', p2: 'numeral', i1: '/miʔa/', i2: '/ʔalf/', r1: 'miʾa (100)', r2: 'ʾalf (1000)' },
];

const allWords = [];
const wordSet = new Set();
let pairSeq = 0;

for (const spec of AR_MINIMAL_PAIR_SPECS) {
  // Same dedupe/shape logic as the English generator: one entry per unique surface
  // form, pairWord pointing at its counterpart, ASCII id, audio per id.
  if (!wordSet.has(spec.s)) {
    wordSet.add(spec.s);
    pairSeq += 1;
    const id = `ar-mp-${String(pairSeq).padStart(4, '0')}`;
    allWords.push({
      id,
      word: spec.s,
      level: spec.lv,
      ipa: spec.i1,
      partOfSpeech: spec.p1,
      category: 'minimal_pair',
      pairWord: spec.t,
      targetPhoneme: spec.ph,
      transliteration: spec.r1,
      diacritized: spec.s,
      audioUrl: `/audio/${id}.mp3`,
      audioFallbackWord: spec.s
    });
  }
  if (!wordSet.has(spec.t)) {
    wordSet.add(spec.t);
    pairSeq += 1;
    const id = `ar-mp-${String(pairSeq).padStart(4, '0')}`;
    allWords.push({
      id,
      word: spec.t,
      level: spec.lv,
      ipa: spec.i2,
      partOfSpeech: spec.p2,
      category: 'minimal_pair',
      pairWord: spec.s,
      targetPhoneme: spec.ph,
      transliteration: spec.r2,
      diacritized: spec.t,
      audioUrl: `/audio/${id}.mp3`,
      audioFallbackWord: spec.t
    });
  }
}

console.log(`Initialized ${allWords.length} Arabic phonemic minimal-pair items.`);

// =========================================================================
// 2. OFFLINE MSA CORE VOCABULARY (curated, stratified A1–C1)
// [word, partOfSpeech]. IPA uses the same honest placeholder convention as the
// English build (/{word}/) for non-pair items; trustworthy IPA lives on pairs.
// =========================================================================
const CORE_A1 = [
  ['ماء', 'noun'], ['خبز', 'noun'], ['أرز', 'noun'], ['حليب', 'noun'], ['شاي', 'noun'],
  ['قهوة', 'noun'], ['سكر', 'noun'], ['ملح', 'noun'], ['بيض', 'noun'], ['لحم', 'noun'],
  ['دجاج', 'noun'], ['سمك', 'noun'], ['فاكهة', 'noun'], ['تفاح', 'noun'], ['برتقال', 'noun'],
  ['موز', 'noun'], ['عنب', 'noun'], ['خضار', 'noun'], ['طماطم', 'noun'], ['بطاطس', 'noun'],
  ['بصل', 'noun'], ['زيت', 'noun'], ['عسل', 'noun'], ['تمر', 'noun'], ['جبن', 'noun'],
  ['أب', 'noun'], ['أم', 'noun'], ['أخ', 'noun'], ['أخت', 'noun'], ['ابن', 'noun'],
  ['ابنة', 'noun'], ['رجل', 'noun'], ['امرأة', 'noun'], ['ولد', 'noun'], ['بنت', 'noun'],
  ['طفل', 'noun'], ['صديق', 'noun'], ['جار', 'noun'], ['عائلة', 'noun'], ['بيت', 'noun'],
  ['باب', 'noun'], ['نافذة', 'noun'], ['غرفة', 'noun'], ['مطبخ', 'noun'], ['سرير', 'noun'],
  ['كرسي', 'noun'], ['طاولة', 'noun'], ['مصباح', 'noun'], ['مفتاح', 'noun'], ['هاتف', 'noun'],
  ['سيارة', 'noun'], ['قطار', 'noun'], ['طائرة', 'noun'], ['سفينة', 'noun'], ['دراجة', 'noun'],
  ['شارع', 'noun'], ['سوق', 'noun'], ['متجر', 'noun'], ['مدرسة', 'noun'], ['كتاب', 'noun'],
  ['قلم', 'noun'], ['ورقة', 'noun'], ['حقيبة', 'noun'], ['صباح', 'noun'], ['مساء', 'noun'],
  ['ليل', 'noun'], ['نهار', 'noun'], ['يوم', 'noun'], ['أسبوع', 'noun'], ['شهر', 'noun'],
  ['سنة', 'noun'], ['وقت', 'noun'], ['ساعة', 'noun'], ['دقيقة', 'noun'], ['اليوم', 'noun'],
  ['غدا', 'noun'], ['أمس', 'noun'], ['كبير', 'adjective'], ['صغير', 'adjective'], ['طويل', 'adjective'],
  ['قصير', 'adjective'], ['جديد', 'adjective'], ['قديم', 'adjective'], ['جيد', 'adjective'], ['سيئ', 'adjective'],
  ['جميل', 'adjective'], ['سعيد', 'adjective'], ['حزين', 'adjective'], ['غني', 'adjective'], ['فقير', 'adjective'],
  ['سريع', 'adjective'], ['بطيء', 'adjective'], ['قريب', 'adjective'], ['بعيد', 'adjective'], ['سهل', 'adjective'],
  ['صعب', 'adjective'], ['نظيف', 'adjective'], ['حار', 'adjective'], ['بارد', 'adjective'], ['أحمر', 'adjective'],
  ['أزرق', 'adjective'], ['أخضر', 'adjective'], ['أصفر', 'adjective'], ['أسود', 'adjective'], ['أبيض', 'adjective'],
  ['أكل', 'verb'], ['شرب', 'verb'], ['ذهب', 'verb'], ['جاء', 'verb'], ['رأى', 'verb'],
  ['سمع', 'verb'], ['قال', 'verb'], ['كتب', 'verb'], ['قرأ', 'verb'], ['جلس', 'verb'],
  ['وقف', 'verb'], ['مشى', 'verb'], ['نام', 'verb'], ['استيقظ', 'verb'], ['غسل', 'verb'],
  ['لبس', 'verb'], ['فتح', 'verb'], ['أغلق', 'verb'], ['اشترى', 'verb'], ['باع', 'verb'],
  ['أعطى', 'verb'], ['أخذ', 'verb'], ['أحب', 'verb'], ['أراد', 'verb'], ['عرف', 'verb'],
  ['عمل', 'verb'], ['لعب', 'verb'], ['ضحك', 'verb'], ['بكى', 'verb'], ['أنا', 'pronoun'],
  ['أنت', 'pronoun'], ['هو', 'pronoun'], ['هي', 'pronoun'], ['نحن', 'pronoun'], ['هذا', 'pronoun'],
  ['هذه', 'pronoun'], ['هنا', 'adverb'], ['هناك', 'adverb'], ['أين', 'adverb'], ['متى', 'adverb'],
  ['كيف', 'adverb'], ['ماذا', 'pronoun'], ['لماذا', 'adverb'], ['كم', 'adverb'], ['نعم', 'interjection'],
  ['لا', 'particle'], ['شكرا', 'interjection'], ['عفوا', 'interjection'], ['مرحبا', 'interjection'], ['لو سمحت', 'phrase'],
  ['آسف', 'adjective'], ['مسجد', 'noun'], ['مستشفى', 'noun'], ['طبيب', 'noun'], ['دواء', 'noun'],
  ['صيدلية', 'noun'], ['شرطة', 'noun'], ['مطار', 'noun'], ['محطة', 'noun'], ['فندق', 'noun'],
  ['مطعم', 'noun'], ['مقهى', 'noun'], ['حديقة', 'noun'], ['بحر', 'noun'], ['نهر', 'noun'],
  ['جبل', 'noun'], ['شجرة', 'noun'], ['زهرة', 'noun'], ['شمس', 'noun'], ['قمر', 'noun'],
  ['نجم', 'noun'], ['سماء', 'noun'], ['أرض', 'noun'], ['مطر', 'noun'], ['صيف', 'noun'],
  ['شتاء', 'noun'], ['ربيع', 'noun'], ['خريف', 'noun'], ['السلام عليكم', 'phrase'], ['صباح الخير', 'phrase'],
  ['مساء الخير', 'phrase'], ['مع السلامة', 'phrase'], ['أهلا وسهلا', 'phrase']
];
const CORE_A2 = [
  ['إفطار', 'noun'], ['غداء', 'noun'], ['عشاء', 'noun'], ['وجبة', 'noun'], ['طبق', 'noun'],
  ['كوب', 'noun'], ['ملعقة', 'noun'], ['شوكة', 'noun'], ['سكين', 'noun'], ['فاتورة', 'noun'],
  ['حساب', 'noun'], ['سعر', 'noun'], ['نقود', 'noun'], ['بطاقة', 'noun'], ['تذكرة', 'noun'],
  ['جواز سفر', 'noun'], ['تأشيرة', 'noun'], ['حقيبة سفر', 'noun'], ['رحلة', 'noun'], ['سفر', 'noun'],
  ['إجازة', 'noun'], ['موعد', 'noun'], ['اجتماع', 'noun'], ['وظيفة', 'noun'], ['مكتب', 'noun'],
  ['شركة', 'noun'], ['مصنع', 'noun'], ['عامل', 'noun'], ['موظف', 'noun'], ['مدير', 'noun'],
  ['راتب', 'noun'], ['زبون', 'noun'], ['خدمة', 'noun'], ['إشارة مرور', 'noun'], ['جسر', 'noun'],
  ['نفق', 'noun'], ['موقف', 'noun'], ['رصيف', 'noun'], ['تاكسي', 'noun'], ['حافلة', 'noun'],
  ['بنزين', 'noun'], ['عجلة', 'noun'], ['فرامل', 'noun'], ['رخصة', 'noun'], ['حادث', 'noun'],
  ['إسعاف', 'noun'], ['حريق', 'noun'], ['عاصفة', 'noun'], ['ضباب', 'noun'], ['مظلة', 'noun'],
  ['معطف', 'noun'], ['حذاء', 'noun'], ['قميص', 'noun'], ['فستان', 'noun'], ['نظارة', 'noun'],
  ['هدية', 'noun'], ['رسالة', 'noun'], ['بريد', 'noun'], ['عنوان', 'noun'], ['إنترنت', 'noun'],
  ['حاسوب', 'noun'], ['شاشة', 'noun'], ['برنامج', 'noun'], ['ملف', 'noun'], ['صورة', 'noun'],
  ['فيديو', 'noun'], ['أغنية', 'noun'], ['فيلم', 'noun'], ['مباراة', 'noun'], ['فريق', 'noun'],
  ['ملعب', 'noun'], ['هدف', 'noun'], ['فوز', 'noun'], ['تدريب', 'noun'], ['رياضة', 'noun'],
  ['سباحة', 'noun'], ['جامعة', 'noun'], ['كلية', 'noun'], ['طالب', 'noun'], ['معلم', 'noun'],
  ['درس', 'noun'], ['امتحان', 'noun'], ['درجة', 'noun'], ['شهادة', 'noun'], ['مكتبة', 'noun'],
  ['مختبر', 'noun'], ['بحث', 'noun'], ['قاعة', 'noun'], ['واجب', 'noun'], ['قصة', 'noun'],
  ['رواية', 'noun'], ['شعر', 'noun'], ['صحيفة', 'noun'], ['مجلة', 'noun'], ['خبر', 'noun'],
  ['إعلان', 'noun'], ['خصم', 'noun'], ['مقاس', 'noun'], ['ثقيل', 'adjective'], ['خفيف', 'adjective'],
  ['مزدحم', 'adjective'], ['فارغ', 'adjective'], ['متأخر', 'adjective'], ['مبكر', 'adjective'], ['مشغول', 'adjective'],
  ['متعب', 'adjective'], ['جائع', 'adjective'], ['عطشان', 'adjective'], ['مريض', 'adjective'], ['بصحة جيدة', 'phrase'],
  ['حجز', 'verb'], ['ألغى', 'verb'], ['أجل', 'verb'], ['وصل', 'verb'], ['غادر', 'verb'],
  ['انتظر', 'verb'], ['سافر', 'verb'], ['عاد', 'verb'], ['زاد', 'verb'], ['نقص', 'verb'],
  ['دفع', 'verb'], ['قبض', 'verb'], ['وقّع', 'verb'], ['اتصل', 'verb'], ['أرسل', 'verb'],
  ['استلم', 'verb'], ['ساعد', 'verb'], ['حاول', 'verb'], ['بدأ', 'verb'], ['انتهى', 'verb'],
  ['نظف', 'verb'], ['طبخ', 'verb'], ['غنى', 'verb'], ['رسم', 'verb'], ['سبح', 'verb'],
  ['ركض', 'verb'], ['قاد', 'verb'], ['طار', 'verb'], ['نزل', 'verb'], ['صعد', 'verb']
];
const CORE_B1 = [
  ['منحة', 'noun'], ['تسجيل', 'noun'], ['قبول', 'noun'], ['محاضرة', 'noun'], ['ندوة', 'noun'],
  ['مؤتمر', 'noun'], ['مرجع', 'noun'], ['مصدر', 'noun'], ['وجهة', 'noun'], ['مغادرة', 'noun'],
  ['وصول', 'noun'], ['تأخير', 'noun'], ['إلغاء', 'noun'], ['تحويل', 'noun'], ['مقعد', 'noun'],
  ['ممر', 'noun'], ['بوابة الصعود', 'noun'], ['بطاقة الصعود', 'noun'], ['أمتعة', 'noun'], ['عيادة', 'noun'],
  ['تشخيص', 'noun'], ['وصفة طبية', 'noun'], ['جرعة', 'noun'], ['أعراض', 'noun'], ['حمى', 'noun'],
  ['سعال', 'noun'], ['صداع', 'noun'], ['ألم', 'noun'], ['حساسية', 'noun'], ['عملية جراحية', 'noun'],
  ['نقاهة', 'noun'], ['تطعيم', 'noun'], ['تحليل', 'noun'], ['طوارئ', 'noun'], ['ممرض', 'noun'],
  ['جراح', 'noun'], ['طبيب أسنان', 'noun'], ['مقابلة', 'noun'], ['سيرة ذاتية', 'noun'], ['ترقية', 'noun'],
  ['استقالة', 'noun'], ['تقاعد', 'noun'], ['دوام', 'noun'], ['مهمة', 'noun'], ['مشروع', 'noun'],
  ['تقرير', 'noun'], ['عرض تقديمي', 'noun'], ['ميزانية', 'noun'], ['ربح', 'noun'], ['عميل', 'noun'],
  ['منافس', 'noun'], ['تغطية', 'noun'], ['شاحن', 'noun'], ['بطارية', 'noun'], ['اشتراك', 'noun'],
  ['تطبيق', 'noun'], ['تحديث', 'noun'], ['كلمة المرور', 'noun'], ['حساب', 'noun'], ['متصفح', 'noun'],
  ['طابعة', 'noun'], ['ماسح ضوئي', 'noun'], ['نسخة', 'noun'], ['توقيع', 'noun'], ['ختم', 'noun'],
  ['معاملة', 'noun'], ['دائرة حكومية', 'noun'], ['بلدية', 'noun'], ['كهرباء', 'noun'], ['ماء الشرب', 'noun'],
  ['صرف صحي', 'noun'], ['نفايات', 'noun'], ['حديقة عامة', 'noun'], ['مواصلات', 'noun'], ['ازدحام', 'noun'],
  ['حادث سير', 'noun'], ['مخالفة', 'noun'], ['رادار', 'noun'], ['جسر مشاة', 'noun'], ['إسعاف أولي', 'noun'],
  ['تبرع بالدم', 'noun'], ['حملة توعية', 'noun'], ['تطوع', 'noun'], ['جمعية خيرية', 'noun'], ['كفالة', 'noun'],
  ['مهرجان', 'noun'], ['معرض', 'noun'], ['مسرحية', 'noun'], ['أمسية شعرية', 'noun'], ['مسابقة', 'noun'],
  ['جائزة', 'noun'], ['تكريم', 'noun'], ['احتفال', 'noun'], ['ذكرى', 'noun'], ['عطلة رسمية', 'noun'],
  ['دوام رسمي', 'noun'], ['إجازة سنوية', 'noun'], ['راتب شهري', 'noun'], ['مكافأة', 'noun'], ['خصم من الراتب', 'noun'],
  ['تقييم الأداء', 'noun'], ['تدريب مهني', 'noun'], ['شهادة خبرة', 'noun'], ['خطاب توصية', 'noun'], ['سجل تجاري', 'noun'],
  ['ضريبة', 'noun'], ['فاتورة ضريبية', 'noun'], ['محاسب', 'noun'], ['مراجعة', 'noun'], ['تدقيق', 'noun']
];
const CORE_B2 = [
  ['انتخابات', 'noun'], ['برلمان', 'noun'], ['حكومة', 'noun'], ['وزارة', 'noun'], ['وزير', 'noun'],
  ['سفارة', 'noun'], ['قنصلية', 'noun'], ['مواطنة', 'noun'], ['دستور', 'noun'], ['قانون', 'noun'],
  ['محكمة', 'noun'], ['قاض', 'noun'], ['محام', 'noun'], ['دعوى', 'noun'], ['حكم', 'noun'],
  ['عقوبة', 'noun'], ['مظاهرة', 'noun'], ['إضراب', 'noun'], ['نقابة', 'noun'], ['مفاوضات', 'noun'],
  ['اتفاقية', 'noun'], ['معاهدة', 'noun'], ['سلام', 'noun'], ['جيش', 'noun'], ['أمن قومي', 'noun'],
  ['تهريب', 'noun'], ['فساد', 'noun'], ['شفافية', 'noun'], ['تضخم', 'noun'], ['بطالة', 'noun'],
  ['نمو اقتصادي', 'noun'], ['استثمار', 'noun'], ['بورصة', 'noun'], ['أسهم', 'noun'], ['عقارات', 'noun'],
  ['تأمين', 'noun'], ['قرض', 'noun'], ['فائدة', 'noun'], ['دين عام', 'noun'], ['إعلام', 'noun'],
  ['صحافة', 'noun'], ['رقابة', 'noun'], ['رأي عام', 'noun'], ['استطلاع', 'noun'], ['حملة انتخابية', 'noun'],
  ['مرشح', 'noun'], ['ناخب', 'noun'], ['صندوق الاقتراع', 'noun'], ['فرز الأصوات', 'noun'], ['تلوث', 'noun'],
  ['احتباس حراري', 'noun'], ['طاقة متجددة', 'noun'], ['إعادة تدوير', 'noun'], ['مناخ', 'noun'], ['صحراء', 'noun'],
  ['واحة', 'noun'], ['بحث علمي', 'noun'], ['منحة دراسية', 'noun'], ['تبادل طلابي', 'noun'], ['سكن جامعي', 'noun'],
  ['رسوم دراسية', 'noun'], ['أطروحة', 'noun'], ['مشرف أكاديمي', 'noun'], ['ندوة علمية', 'noun'], ['مؤتمر دولي', 'noun'],
  ['ورقة بحثية', 'noun'], ['مجلة علمية', 'noun'], ['تحكيم', 'noun'], ['استشهاد', 'noun'], ['انتحال', 'noun'],
  ['مختبر أبحاث', 'noun'], ['تجربة سريرية', 'noun'], ['لقاح', 'noun'], ['وباء', 'noun'], ['حجر صحي', 'noun'],
  ['تباعد اجتماعي', 'noun'], ['مناعة', 'noun'], ['سلالة', 'noun'], ['أعراض جانبية', 'noun'], ['جرعة معززة', 'noun'],
  ['نظام صحي', 'noun'], ['تأمين صحي', 'noun'], ['رعاية أولية', 'noun'], ['صحة نفسية', 'noun'], ['إدمان', 'noun'],
  ['سمنة', 'noun'], ['سكري', 'noun'], ['ضغط الدم', 'noun'], ['كوليسترول', 'noun'], ['لياقة بدنية', 'noun'],
  ['تغذية', 'noun'], ['وجبات سريعة', 'noun'], ['مكملات', 'noun'], ['يوغا', 'noun'], ['تأمل', 'noun']
];
const CORE_C1 = [
  ['استدامة', 'noun'], ['حوكمة', 'noun'], ['مساءلة', 'noun'], ['سيادة', 'noun'], ['شرعية', 'noun'],
  ['مصالحة', 'noun'], ['تسوية', 'noun'], ['وساطة', 'noun'], ['هدنة', 'noun'], ['نزاع', 'noun'],
  ['اختصاص قضائي', 'noun'], ['تشريع', 'noun'], ['مرسوم', 'noun'], ['لائحة', 'noun'], ['بروتوكول', 'noun'],
  ['مذكرة تفاهم', 'noun'], ['شراكة استراتيجية', 'noun'], ['تنمية مستدامة', 'noun'], ['اقتصاد المعرفة', 'noun'], ['تحول رقمي', 'noun'],
  ['ذكاء اصطناعي', 'noun'], ['أمن سيبراني', 'noun'], ['خصوصية البيانات', 'noun'], ['تضليل إعلامي', 'noun'], ['تعددية', 'noun'],
  ['اندماج', 'noun'], ['هوية', 'noun'], ['عولمة', 'noun'], ['تراث', 'noun'], ['مخطوطات', 'noun'],
  ['أرشيف', 'noun'], ['توثيق', 'noun'], ['نقد أدبي', 'noun'], ['بلاغة', 'noun'], ['نحو', 'noun'],
  ['صرف', 'noun'], ['معجم', 'noun'], ['لهجة', 'noun'], ['فصحى', 'noun'], ['عامية', 'noun'],
  ['ترجمة فورية', 'noun'], ['تعريب', 'noun'], ['مصطلح', 'noun'], ['استعارة', 'noun'], ['كناية', 'noun'],
  ['تشبيه', 'noun'], ['جناس', 'noun'], ['طباق', 'noun'], ['سجع', 'noun'], ['عروض', 'noun'],
  ['قافية', 'noun'], ['بحور الشعر', 'noun'], ['معلقات', 'noun'], ['ديوان', 'noun'], ['مقامة', 'noun'],
  ['رسائل إخوان الصفا', 'noun'], ['مقدمة ابن خلدون', 'noun'], ['علم الاجتماع', 'noun'], ['أنثروبولوجيا', 'noun'], ['فلسفة', 'noun'],
  ['منطق', 'noun'], ['أخلاق', 'noun'], ['جماليات', 'noun'], ['ميتافيزيقا', 'noun'], ['إبستمولوجيا', 'noun'],
  ['ظاهراتية', 'noun'], ['وجودية', 'noun'], ['بنيوية', 'noun'], ['تفكيكية', 'noun'], ['هرمنيوطيقا', 'noun'],
  ['خطاب', 'noun'], ['سلطة معرفية', 'noun'], ['استشراق', 'noun'], ['ما بعد الكولونيالية', 'noun'], ['عولمة ثقافية', 'noun']
];

const CORE_SETS = [
  ['A1', CORE_A1], ['A2', CORE_A2], ['B1', CORE_B1], ['B2', CORE_B2], ['C1', CORE_C1]
];
let coreSeq = 0;
for (const [lv, arr] of CORE_SETS) {
  for (const [w, pos] of arr) {
    if (wordSet.has(w)) continue;
    wordSet.add(w);
    coreSeq += 1;
    const id = `ar-vocab-${lv.toLowerCase()}-${String(coreSeq).padStart(4, '0')}`;
    allWords.push({
      id, word: w, level: lv, ipa: `/${w}/`, partOfSpeech: pos,
      category: 'general_vocab', audioUrl: `/audio/${id}.mp3`, audioFallbackWord: w
    });
  }
}
console.log(`Total words after offline MSA core: ${allWords.length}`);

// =========================================================================
// 3. FREQUENCY FILL from the ar_50k OpenSubtitles-derived rank list
// Same quota logic as the English build. Strict filters keep it MSA-leaning
// and educational-safe. Entirely optional: offline core above already stands.
// =========================================================================
const AR_PROFANITY = new Set([
  'نيك', 'عاهرة', 'العاهرة', 'عاهره', 'قحبة', 'القحبة', 'شرموطة', 'الشرموطة',
  'زب', 'الزب', 'طيز', 'الطيز', 'كس', 'الكس', 'خول', 'الخول',
  'سكس', 'السكس', 'بورن', 'البورن', 'اباحية', 'الإباحية', 'اباحيه',
  'دعارة', 'الدعارة', 'بغاء', 'البغاء', 'سحاق', 'السحاق', 'لوطي', 'اللوطي',
  'مخنث', 'المخنث', 'فرج', 'الفرج', 'قضيب', 'القضيب', 'مؤخرة', 'المؤخرة',
  'استمناء', 'الاستمناء', 'زانية', 'الزانية', 'زاني', 'الزاني', 'فاسقة', 'الفاسقة'
]);
const stripTashkeel = (s) => s.replace(/[ً-ٰٟ]/g, '').trim();
const arabicLettersOnly = (s) => (s.match(/[ء-غف-ي]/g) || []).length;

try {
  console.log('Fetching Arabic frequency list (ar_50k)...');
  const res = await fetch('https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2016/ar/ar_50k.txt');
  if (res.ok) {
    const rawText = await res.text();
    const ranked = rawText.split('\n').map((line) => {
      const tok = (line.split(/\s+/)[0] || '').trim();
      return stripTashkeel(tok);
    }).filter((w) => {
      if (!w || w.includes(' ') || wordSet.has(w)) return false;
      if (/[A-Za-z0-9]/.test(w)) return false;               // Latin junk / digits
      if (/[٠-٩]/.test(w)) return false;                     // digit tokens
      if (!/^[\u0600-\u06FF ]+$/.test(w)) return false;      // Arabic block only
      if (arabicLettersOnly(w) < 3) return false;            // keep content words
      if (AR_PROFANITY.has(w)) return false;                 // educational-safe
      return true;
    });

    console.log(`Fetched ${ranked.length} candidate Arabic words after filtering.`);

    let a1Count = allWords.filter((w) => w.level === 'A1').length;
    let a2Count = allWords.filter((w) => w.level === 'A2').length;
    let b1Count = allWords.filter((w) => w.level === 'B1').length;
    let b2Count = allWords.filter((w) => w.level === 'B2').length;
    let c1Count = allWords.filter((w) => w.level === 'C1').length;

    for (let i = 0; i < ranked.length && allWords.length < 3600; i++) {
      const w = ranked[i];
      if (wordSet.has(w)) continue;
      let level = 'A1';
      if (a1Count < 700) { level = 'A1'; a1Count++; }
      else if (a2Count < 750) { level = 'A2'; a2Count++; }
      else if (b1Count < 800) { level = 'B1'; b1Count++; }
      else if (b2Count < 700) { level = 'B2'; b2Count++; }
      else { level = 'C1'; c1Count++; }
      wordSet.add(w);
      coreSeq += 1;
      const id = `ar-freq-${level.toLowerCase()}-${String(coreSeq).padStart(4, '0')}`;
      allWords.push({
        id, word: w, level, ipa: `/${w}/`, partOfSpeech: 'noun',
        category: 'general_vocab', audioUrl: `/audio/${id}.mp3`, audioFallbackWord: w
      });
    }
  }
} catch (err) {
  console.warn('Could not fetch external Arabic wordlist, using offline core only:', err.message);
}

console.log(`Total Arabic words after expansion: ${allWords.length}`);

// =========================================================================
// 4. 1,020 REAL-WORLD LISTENING SITUATIONS (MSA airport/station/café/campus/
//    workplace/emergency). Same deterministic round-robin expansion as English.
//    Transcripts use number WORDS (listening target); options use Arabic-Indic
//    digits — the Arabic twin of the English teen/ty gate-change task.
// =========================================================================
console.log('Generating 1,020 Arabic listening situations across all 5 CEFR levels...');

const DOMAIN_TEMPLATES = [
  {
    domain: 'المطار والرحلات الجوية · Airport Terminal & Flights',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    contexts: [
      'صالة المغادرة بالمطار مع رنين الإذاعة الداخلية وصدى الإعلانات وضجيج حقائب السفر',
      'مقصورة الطائرة مع هدير المحركات واهتزاز خفيف أثناء المطبات الجوية',
      'منطقة استلام الأمتعة مع هدير سير الحقائب وضجيج المسافرين',
      'نقطة التفتيش الأمني مع صفير أجهزة المسح ونداءات الضباط',
      'صالة الترانزيت الدولية مع إعلانات متعددة اللغات وصدى الصالة'
    ],
    items: [
      {
        scenario: 'إعلان تغيير بوابة الصعود · Gate Change',
        textFmt: 'نرجو من المسافرين على متن الرحلة {FLIGHT} المتجهة إلى {CITY} التوجه إلى البوابة {GATE_WORD}، حيث تم نقل موعد الصعود إلى الساعة {TIME_WORD}.',
        targetFmt: 'البوابة {GATE}',
        qFmt: 'Which new boarding gate was announced for the flight to {CITY_EN}?',
        qArFmt: 'ما هي بوابة الصعود الجديدة المعلنة للرحلة المتجهة إلى {CITY}؟',
        distractorFmt: ['البوابة {GATE1}', 'البوابة {GATE}', 'البوابة {GATE3}', 'البوابة {GATE4}']
      },
      {
        scenario: 'إعلان سير الأمتعة · Baggage Carousel',
        textFmt: 'أمتعة الرحلة {FLIGHT} القادمة من {CITY} تُسلَّم الآن على السير رقم {BELT_WORD}. نرجو التوجه إلى السير رقم {BELT_WORD}.',
        targetFmt: 'السير {BELT}',
        qFmt: 'Which carousel delivers the luggage for flight {FLIGHT} from {CITY_EN}?',
        qArFmt: 'على أي سير تُسلَّم أمتعة الرحلة {FLIGHT} القادمة من {CITY}؟',
        distractorFmt: ['السير {BELT1}', 'السير {BELT}', 'السير {BELT3}', 'السير {BELT4}']
      },
      {
        scenario: 'نداء مجموعة الصعود · Boarding Group',
        textFmt: 'ندعو الآن مسافري المجموعة {GROUP} للتقدم لصعود الطائرة في الرحلة {FLIGHT} عند البوابة {GATE_WORD}.',
        targetFmt: 'المجموعة {GROUP}',
        qFmt: 'Which boarding group was invited to board flight {FLIGHT} first?',
        qArFmt: 'ما هي مجموعة الصعود المدعوة أولا لصعود الرحلة {FLIGHT}؟',
        distractorFmt: ['المجموعة أ', 'المجموعة ب', 'المجموعة ج', 'المجموعة د']
      },
      {
        scenario: 'إشعار تأخر الرحلة · Flight Delay',
        textFmt: 'نعتذر من مسافري الرحلة {FLIGHT} إلى {CITY}: تأخر موعد الإقلاع {MINS_WORD} بسبب الأحوال الجوية، وسيكون الإقلاع الجديد في الساعة {TIME_WORD}.',
        targetFmt: '{MINS_FULL}',
        qFmt: 'How long is flight {FLIGHT} to {CITY_EN} delayed?',
        qArFmt: 'كم مدة تأخر الرحلة {FLIGHT} إلى {CITY}؟',
        distractorFmt: ['١٠ دقائق', '١٥ دقيقة', '٢٠ دقيقة', '٣٠ دقيقة']
      },
      {
        scenario: 'تحذير حجم حقائب اليد · Carry-on Size',
        textFmt: 'تنبيه للمسافرين: مخازن الحقائب العلوية ممتلئة، وأي حقيبة يزيد طولها عن {BAG} سنتيمترا يجب تسليمها عند المنصة مجانا.',
        targetFmt: '{BAG} سنتيمترا',
        qFmt: 'What maximum bag length was announced for the overhead bins?',
        qArFmt: 'ما هو الحد الأقصى المعلن لطول الحقائب العلوية؟',
        distractorFmt: ['٥٠ سنتيمترا', '٥٥ سنتيمترا', '٦٠ سنتيمترا', '٦٥ سنتيمترا']
      }
    ]
  },
  {
    domain: 'محطات القطار والمترو · Train & Subway Stations',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    contexts: [
      'محطة القطارات المركزية ذات السقف العالي مع صدى الإذاعة وصوت بوق قطار بعيد',
      'رصيف مترو الأنفاق مع هدير القضبان وضجيج القطار القادم',
      'رصيف قطارات الضواحي وقت الذروة مع ضجيج المسافرين',
      'عربة القطار السريع مع رنين الجرس وصوت صفير أبواب الأمان'
    ],
    items: [
      {
        scenario: 'إعلان تغيير الرصيف · Platform Change',
        textFmt: 'القطار السريع المتجه إلى {CITY} في الساعة {TIME_WORD} سيغادر الآن من الرصيف رقم {BELT_WORD}، نكرر: الرصيف رقم {BELT_WORD}. نرجو العبور عبر الجسر.',
        targetFmt: 'الرصيف {BELT}',
        qFmt: 'Which platform should passengers use for the express train to {CITY_EN}?',
        qArFmt: 'من أي رصيف يغادر القطار السريع إلى {CITY}؟',
        distractorFmt: ['الرصيف {BELT1}', 'الرصيف {BELT}', 'الرصيف {BELT3}', 'الرصيف {BELT4}']
      },
      {
        scenario: 'إعلان محطة التحويل · Transfer Call',
        textFmt: 'المحطة التالية هي {STATION}. يمكنكم التحويل هنا إلى {LINE} وإلى قطارات الضواحي. تُفتح الأبواب جهة {SIDE}.',
        targetFmt: '{LINE}',
        qFmt: 'Which transit line can passengers transfer to at {STATION_EN}?',
        qArFmt: 'إلى أي خط يمكن التحويل في المحطة التالية؟',
        distractorFmt: ['الخط الأحمر', 'الخط الأزرق', 'الخط الأخضر', 'الخط الفضي']
      },
      {
        scenario: 'تنبيه القطار السريع والمحلي · Express vs Local',
        textFmt: 'هذا قطار {TRAIN_TYPE} يتوقف في {STATION} وفي {CITY} فقط. للوصول إلى جميع المحطات المحلية نرجو الصعود من المسار رقم {BELT1}.',
        targetFmt: '{TRAIN_TYPE}',
        qFmt: 'What type of train service was announced?',
        qArFmt: 'ما نوع خدمة القطار المعلنة؟',
        distractorFmt: ['سريع', 'محلي', 'مباشر', 'مكوكي']
      },
      {
        scenario: 'إشعار آلة بيع التذاكر · Ticket Machine',
        textFmt: 'تنبيه للمسافرين: آلات بيع التذاكر عند المدخل {EXIT} تقبل البطاقات والأوراق النقدية من فئة {BILLS_FULL} فقط.',
        targetFmt: '{BILLS_FULL}',
        qFmt: 'What bill denomination does the ticket machine accept?',
        qArFmt: 'ما فئة الأوراق النقدية التي تقبلها آلة التذاكر؟',
        distractorFmt: ['٥ ريالات', '١٠ ريالات', '٢٠ ريالا', '٥٠ ريالا']
      },
      {
        scenario: 'حافلات بديلة لأعمال الصيانة · Rail Shuttle',
        textFmt: 'نظرا لأعمال صيانة القضبان بين {STATION} و{CITY}، تعمل حافلات بديلة من الموقف رقم {BELT} في الخارج.',
        targetFmt: 'الموقف {BELT}',
        qFmt: 'Where do the rail-replacement shuttle buses depart from?',
        qArFmt: 'من أين تغادر الحافلات البديلة؟',
        distractorFmt: ['الموقف ١', 'الموقف ٢', 'الموقف ٣', 'الموقف ٤']
      }
    ]
  },
  {
    domain: 'المقهى والمطعم · Cafe & Restaurant Dining',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    contexts: [
      'مقهى مزدحم وسط المدينة مع صوت آلة الإسبريسو وموسيقى هادئة وثرثرة الزبائن',
      'مدخل مطعم مزدحم مع ضجيج الطاولات وقعقعة الأطباق',
      'مطعم وجبات سريعة مع صوت طابعة المطبخ وهدير المقالي',
      'نافذة مخبز مع حركة الشارع ورنين جرس الباب'
    ],
    items: [
      {
        scenario: 'طلب القهوة جاهز · Order Ready',
        textFmt: 'طلب {NAME}: لاتيه مثلج بحليب {MILK} مع جرعة إسبريسو إضافية، جاهز الآن عند منصة الاستلام.',
        targetFmt: 'حليب {MILK}',
        qFmt: 'What kind of milk was used in the drink for {NAME_EN}?',
        qArFmt: 'ما نوع الحليب المستخدم في مشروب {NAME}؟',
        distractorFmt: ['حليب كامل الدسم', 'حليب الشوفان', 'حليب اللوز', 'حليب الصويا']
      },
      {
        scenario: 'حجز طاولة المطعم · Table Reservation',
        textFmt: 'مجموعة من {PARTY_W} باسم {NAME}: طاولتكم قرب {SEAT_LOCATION} جاهزة الآن. نرجو اتباع المضيف.',
        targetFmt: 'مجموعة {PARTY_SIZE}',
        qFmt: 'What party size was called for the table?',
        qArFmt: 'كم عدد أفراد المجموعة المناداة؟',
        distractorFmt: ['مجموعة ٢', 'مجموعة ٤', 'مجموعة ٦', 'مجموعة ٨']
      },
      {
        scenario: 'سعر طبق اليوم · Daily Special',
        textFmt: 'طبق اليوم من الشيف: {DISH} مشوي مع سلطة خضراء، وسعر الطبق {PRICE} ريالا فقط.',
        targetFmt: '{PRICE} ريالا',
        qFmt: 'What is the price of today’s lunch special?',
        qArFmt: 'ما سعر طبق اليوم؟',
        distractorFmt: ['اثنا عشر ريالا', 'أربعة عشر ريالا', 'خمسة عشر ريالا', 'ثمانية عشر ريالا']
      },
      {
        scenario: 'تحذير الحساسية الغذائية · Allergy Notice',
        textFmt: 'ننبه ضيوفنا الكرام إلى أن معجنات اليوم تحتوي على آثار {ALLERGEN}. نرجو إبلاغ العاملين بأي قيود غذائية.',
        targetFmt: '{ALLERGEN}',
        qFmt: 'Which allergen was mentioned in the kitchen notice?',
        qArFmt: 'ما مسبّب الحساسية المذكور في تنبيه المطبخ؟',
        distractorFmt: ['الفول السوداني', 'المكسرات', 'الغلوتين', 'الحليب']
      },
      {
        scenario: 'إشعار إغلاق المقهى · Closing Time',
        textFmt: 'ضيوفنا الكرام: سيُغلق ركن القهوة بعد {MINS_WORD} في الساعة {TIME_WORD}. نرجو تقديم طلباتكم الأخيرة الآن.',
        targetFmt: '{MINS_FULL}',
        qFmt: 'How many minutes until the coffee bar closes?',
        qArFmt: 'كم دقيقة تفصلنا عن إغلاق ركن القهوة؟',
        distractorFmt: ['١٠ دقائق', '١٥ دقيقة', '٢٠ دقيقة', '٣٠ دقيقة']
      }
    ]
  },
  {
    domain: 'الجامعة والحرم المدرسي · University & School Campus',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    contexts: [
      'قاعة محاضرات جامعية كبيرة مع صدى الميكروفون وهمس الكتابة',
      'الإذاعة المدرسية الصباحية عبر مكبر صوت صغير في السقف',
      'مختبر العلوم الجامعي مع هدير شفاطات التهوية',
      'قاعة المطالعة بالمكتبة مع همس هادئ وصوت تقليب الصفحات البعيدة'
    ],
    items: [
      {
        scenario: 'نقل قاعة المراجعة · Hall Relocation',
        textFmt: 'طلبة مادة الكيمياء {BELT1}: انتقلت حصة المراجعة اليوم إلى القاعة {HALL_WORD} في مبنى العلوم.',
        targetFmt: 'القاعة {BELT}',
        qFmt: 'Which hall has today’s review session moved to?',
        qArFmt: 'إلى أي قاعة انتقلت حصة المراجعة اليوم؟',
        distractorFmt: ['القاعة ١٠١', 'القاعة ٢٠٤', 'القاعة ٣١٥', 'القاعة ٤٠٢']
      },
      {
        scenario: 'تأجيل الاختبار النصفي · Exam Rescheduled',
        textFmt: 'نرجو تدوين ما يلي في المقرر: أُجّل الاختبار النصفي الثاني إلى صباح {DAY} في الساعة {TIME_WORD}.',
        targetFmt: '{DAY}',
        qFmt: 'On which day is the midterm exam now scheduled?',
        qArFmt: 'في أي يوم أُجّل الاختبار النصفي؟',
        distractorFmt: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
      },
      {
        scenario: 'مدة إعارة الكتب · Loan Period',
        textFmt: 'كتب الاحتياطي المستعارة في أسبوع الاختبارات يجب إعادتها خلال {HOURS_WORD} لتفادي غرامات التأخير.',
        targetFmt: '{HOURS_FULL}',
        qFmt: 'What is the loan duration for reserve books?',
        qArFmt: 'ما مدة إعارة كتب الاحتياطي؟',
        distractorFmt: ['ساعتين', '٤ ساعات', '٢٤ ساعة', '٤٨ ساعة']
      },
      {
        scenario: 'تنظيم مواقف الجامعة · Parking Enforcement',
        textFmt: 'تنبيه من أمن الجامعة: الوقوف في المواقف {LOT} يتطلب تصريحا ساريا ابتداء من الساعة {TIME_WORD}.',
        targetFmt: 'المواقف {LOT}',
        qFmt: 'Which parking lot requires a permit from the announced time?',
        qArFmt: 'أي المواقف يتطلب تصريحا ابتداء من الوقت المعلن؟',
        distractorFmt: ['المواقف أ', 'المواقف ب', 'المواقف ج', 'المواقف د']
      },
      {
        scenario: 'تغيير الساعات المكتبية · Office Hours',
        textFmt: 'سيستقبل الدكتور {NAME} الطلبة في ساعاته المكتبية الإضافية هذا الأسبوع يوم {DAY} من الساعة {TIME_WORD} حتى الساعة {TIME_END_WORD}.',
        targetFmt: '{DAY}',
        qFmt: 'When will the professor hold extra office hours?',
        qArFmt: 'متى يستقبل الدكتور الطلبة في ساعاته الإضافية؟',
        distractorFmt: ['الاثنين', 'الأربعاء', 'الخميس', 'الجمعة']
      }
    ]
  },
  {
    domain: 'العمل والمكالمات المهنية · Workplace & Professional Calls',
    levels: ['B1', 'B2', 'C1'],
    contexts: [
      'مكالمة جماعية عبر الجسر الهاتفي مع تشوهات الضغط وصدى مكبر الصوت',
      'مكتب مفتوح مزدحم مع قعقعة لوحات المفاتيح ورنين الهواتف البعيدة',
      'مكتب لوجستيات المستودعات مع أبواق الرافعات وصفق الأبواب المعدنية'
    ],
    items: [
      {
        scenario: 'تحديث موعد التسليم · Deadline Update',
        textFmt: 'فريق العمل الكريم: بعد ملاحظات العميل على النموذج الأولي، انتقل موعد التسليم إلى يوم {DAY} في الساعة {TIME_WORD}.',
        targetFmt: '{DAY}',
        qFmt: 'When is the revised project deadline?',
        qArFmt: 'متى الموعد الجديد لتسليم المشروع؟',
        distractorFmt: ['الاثنين', 'الثلاثاء', 'الخميس', 'الجمعة']
      },
      {
        scenario: 'رمز الدخول للمؤتمر · Bridge PIN',
        textFmt: 'للانضمام إلى المؤتمر الهاتفي، نرجو الاتصال بالرقم المجاني ثم إدخال الرمز {PIN_WORD}.',
        targetFmt: '{PIN}',
        qFmt: 'What passcode is required to join the conference call?',
        qArFmt: 'ما رمز الدخول المطلوب للانضمام إلى المؤتمر؟',
        distractorFmt: ['٤٨٢١', '٥٩٣٢', '٦١٤٧', '٧٢٨٠']
      },
      {
        scenario: 'نافذة صيانة الخوادم · Maintenance Window',
        textFmt: 'إلى جميع الموظفين: صيانة الخوادم الداخلية مجدولة مساء {DAY} بين الساعة {TIME_WORD} والساعة {TIME_END_WORD}.',
        targetFmt: '{DAY}',
        qFmt: 'On which evening will server maintenance take place?',
        qArFmt: 'في أي مساء ستتم صيانة الخوادم؟',
        distractorFmt: ['الثلاثاء', 'الأربعاء', 'الجمعة', 'السبت']
      }
    ]
  },
  {
    domain: 'الخدمات العامة والطوارئ · Public Services & Emergencies',
    levels: ['A2', 'B1', 'B2', 'C1'],
    contexts: [
      'صفارة السلامة العامة في الهواء الطلق مع تشوه الرياح وحركة المرور البعيدة',
      'الإذاعة الداخلية لبهو المستشفى مع صفير الأجهزة الطبية ورنين النداءات',
      'رسالة البريد الصوتي لبلدية المياه مع خشخشة خط الهاتف'
    ],
    items: [
      {
        scenario: 'نداء شباك الصيدلية · Pharmacy Window',
        textFmt: 'الوصفة رقم {WIN_WORD} باسم المريض {NAME} جاهزة الآن عند شباك الصرف رقم {WIN}.',
        targetFmt: 'الشباك {WIN}',
        qFmt: 'At which window is the prescription ready for pickup?',
        qArFmt: 'عند أي شباك أصبحت الوصفة جاهزة للاستلام؟',
        distractorFmt: ['الشباك ١', 'الشباك ٢', 'الشباك ٣', 'الشباك ٤']
      },
      {
        scenario: 'تحذير من عاصفة · Weather Advisory',
        textFmt: 'أصدرت الأرصاد تحذيرا من عاصفة شديدة على محافظة {COUNTY} ساري المفعول حتى الساعة {TIME_WORD}.',
        targetFmt: 'محافظة {COUNTY}',
        qFmt: 'Which governorate is under the storm warning?',
        qArFmt: 'أي المحافظات يشملها تحذير العاصفة؟',
        distractorFmt: ['محافظة الشمالية', 'محافظة الوسطى', 'محافظة الشرقية', 'محافظة الغربية']
      },
      {
        scenario: 'انقطاع مؤقت للمياه · Water Shutoff',
        textFmt: 'تنبيه لسكان شارع {STREET}: ستنقطع مياه الشرب مؤقتا يوم {DAY} ابتداء من الساعة {TIME_WORD}.',
        targetFmt: '{DAY}',
        qFmt: 'Which day will tap water be temporarily interrupted?',
        qArFmt: 'في أي يوم ستنقطع مياه الشرب مؤقتا؟',
        distractorFmt: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
      }
    ]
  }
];

const CITIES = ['الرياض', 'جدة', 'الدمام', 'القاهرة', 'دبي', 'عمّان', 'بغداد', 'الدوحة', 'الكويت', 'مسقط', 'تونس', 'الدار البيضاء'];
const CITIES_EN = ['Riyadh', 'Jeddah', 'Dammam', 'Cairo', 'Dubai', 'Amman', 'Baghdad', 'Doha', 'Kuwait City', 'Muscat', 'Tunis', 'Casablanca'];
const NAMES = ['أحمد', 'فاطمة', 'محمد', 'سارة', 'خالد', 'ليلى', 'عمر', 'نورا', 'يوسف', 'مريم', 'حسن', 'عائشة'];
const NAMES_EN = ['Ahmed', 'Fatima', 'Mohammed', 'Sarah', 'Khaled', 'Layla', 'Omar', 'Noura', 'Youssef', 'Mariam', 'Hassan', 'Aisha'];
const DAYS = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
// Transcripts speak number WORDS (the listening target); options show digits.
const NUM_WORDS = {
  10: 'العاشرة', 11: 'الحادية عشرة', 12: 'الثانية عشرة', 13: 'الثالثة عشرة', 14: 'الرابعة عشرة',
  15: 'الخامسة عشرة', 16: 'السادسة عشرة', 17: 'السابعة عشرة', 18: 'الثامنة عشرة', 19: 'التاسعة عشرة',
  20: 'العشرين', 21: 'الحادية والعشرين', 22: 'الثانية والعشرين', 27: 'السابعة والعشرين',
  30: 'الثلاثين', 45: 'الخامسة والأربعين',
  2: 'ساعتين', 4: 'أربع ساعات', 24: 'الرابعة والعشرين', 48: 'الثامنة والأربعين'
};
const AR_DIGITS = { 1: '١', 2: '٢', 3: '٣', 4: '٤', 10: '١٠', 11: '١١', 12: '١٢', 13: '١٣', 14: '١٤', 15: '١٥', 16: '١٦', 17: '١٧', 18: '١٨', 19: '١٩', 20: '٢٠', 21: '٢١', 22: '٢٢', 27: '٢٧', 30: '٣٠', 45: '٤٥', 2: '٢', 4: '٤', 24: '٢٤', 48: '٤٨' };
// Masculine ordinals for masculine nouns (رصيف، سير، شباك، موقف، رقم).
// Feminine NUM_WORDS above serve feminine nouns (بوابة، قاعة، دقيقة، ساعة).
const NUM_WORDS_M = {
  12: 'الثاني عشر', 13: 'الثالث عشر', 14: 'الرابع عشر', 15: 'الخامس عشر',
  16: 'السادس عشر', 17: 'السابع عشر', 18: 'الثامن عشر', 19: 'التاسع عشر',
  20: 'العشرين', 22: 'الثاني والعشرين', 27: 'السابع والعشرين'
};
const WIN_WORDS_M = ['الأول', 'الثاني', 'الثالث', 'الرابع'];
const FLIGHTS = ['SV 102', 'MS 901', 'EK 812', 'RJ 404', 'QR 720', 'KU 118', 'SM 330', 'AT 215'];
const STATIONS = ['المحطة المركزية', 'ساحة النور', 'حي الروضة', 'شارع الملك', 'الجادة الكبرى', 'الواحة', 'ميدان الاتحاد', 'المحطة الشمالية'];
const STATIONS_EN = ['Central Station', 'Al-Noor Square', 'Al-Rawdah', 'King Street', 'Grand Avenue', 'Al-Waha', 'Union Square', 'North Station'];
const COUNTIES = ['الشمالية', 'الوسطى', 'الشرقية', 'الغربية', 'الجنوبية', 'الساحلية'];
const STREETS = ['الملك فهد', 'الأمير سلطان', 'الجامعة', 'النخيل', 'الورود', 'السلام'];
const MILKS = ['الشوفان', 'اللوز', 'الصويا', 'كامل الدسم', 'جوز الهند'];
const DISHES = ['الكبسة', 'المندي', 'الفلافل', 'الشاورما', 'الكنافة'];
const GATES = [13, 17, 22, 27];
const BELTS = [12, 17, 22, 27];

const allScenarios = [];
const TARGET_SCENARIOS = 1020;

function pickItem(arr, idx) {
  return arr[idx % arr.length];
}

let templateIndex = 0;

while (allScenarios.length < TARGET_SCENARIOS) {
  const domainGroup = pickItem(DOMAIN_TEMPLATES, templateIndex);
  const itemDef = pickItem(domainGroup.items, Math.floor(templateIndex / DOMAIN_TEMPLATES.length));
  const contextDesc = pickItem(domainGroup.contexts, templateIndex);
  const cefr = pickItem(domainGroup.levels, templateIndex);

  const idx = allScenarios.length + 1;
  const cityI = idx % CITIES.length;
  const city = CITIES[cityI];
  const cityEn = CITIES_EN[cityI];
  const nameI = idx % NAMES.length;
  const name = NAMES[nameI];
  const nameEn = NAMES_EN[nameI];
  const day = pickItem(DAYS, idx);
  const timeH = 8 + ((idx * 3) % 10);           // 8..17
  const timeM = pickItem(['00', '15', '30', '45'], idx);
  // timeWord/timeEndWord intentionally EXCLUDE the word "الساعة" — every template
  // already supplies it (e.g. "في الساعة {TIME_WORD}"), avoiding "الساعة الساعة".
  const timeWord = `${NUM_WORDS[10 + (idx % 10)] || 'العاشرة'} ${idx % 2 === 0 ? 'صباحا' : 'مساء'}`;
  const timeDigit = `${AR_DIGITS[10 + (idx % 10)] || '١٠'}:${timeM} ${idx % 2 === 0 ? 'صباحا' : 'مساء'}`;
  void timeH;
  const timeEndWord = `${NUM_WORDS[20] || 'العشرين'} ${idx % 2 === 0 ? 'مساء' : 'صباحا'}`;
  const flight = pickItem(FLIGHTS, idx);
  const stationI = idx % STATIONS.length;
  const station = STATIONS[stationI];
  const stationEn = STATIONS_EN[stationI];
  const county = pickItem(COUNTIES, idx);
  const street = pickItem(STREETS, idx);
  const milk = pickItem(MILKS, idx);
  const dish = pickItem(DISHES, idx);
  const group = ['أ', 'ب', 'ج', 'د'][idx % 4];
  const minsV = [10, 15, 20, 30][idx % 4];
  const minsW = { 10: 'عشر دقائق', 15: 'خمس عشرة دقيقة', 20: 'عشرين دقيقة', 30: 'ثلاثين دقيقة' }[minsV];
  const minsFull = minsV === 10 ? '١٠ دقائق' : `${AR_DIGITS[minsV]} دقيقة`;
  const bagAr = { 50: '٥٠', 55: '٥٥', 60: '٦٠', 65: '٦٥' }[['50', '55', '60', '65'][idx % 4]];
  const hoursV = [2, 4, 24, 48][idx % 4];
  const hoursW = NUM_WORDS[hoursV];
  const hoursFull = hoursV === 2 ? 'ساعتين' : hoursV === 4 ? '٤ ساعات' : `${AR_DIGITS[hoursV]} ساعة`;
  const price = ['12', '14', '15', '18'][idx % 4];
  const priceW = { 12: 'اثنا عشر', 14: 'أربعة عشر', 15: 'خمسة عشر', 18: 'ثمانية عشر' }[Number(price)];
  const allergen = ['الفول السوداني', 'المكسرات', 'الغلوتين', 'الحليب'][idx % 4];
  const pinD = String(1000 + ((idx * 137) % 8999));
  const pinAr = pinD.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
  const pinW = pinAr.split('').join(' ');
  const partyN = [2, 4, 6, 8][idx % 4];
  const partyW = { 2: 'شخصين', 4: 'أربعة أشخاص', 6: 'ستة أشخاص', 8: 'ثمانية أشخاص' }[partyN];
  const partyD = { 2: '٢', 4: '٤', 6: '٦', 8: '٨' }[partyN];
  const line = ['الخط الأحمر', 'الخط الأزرق', 'الخط الأخضر', 'الخط الفضي'][idx % 4];
  const trainType = ['سريع', 'محلي', 'مباشر', 'مكوكي'][idx % 4];
  const side = idx % 2 === 0 ? 'اليمين' : 'اليسار';
  const exit = ['الشمالي', 'الجنوبي', 'الشرقي', 'الغربي'][idx % 4];
  const bills = ['5', '10', '20'][idx % 3];
  const billsFull = { 5: '٥ ريالات', 10: '١٠ ريالات', 20: '٢٠ ريالا' }[Number(bills)];
  const seatLocation = ['النافذة', 'الشرفة', 'الركن', 'الحديقة'][idx % 4];
  const lot = ['أ', 'ب', 'ج', 'د'][idx % 4];
  const gateV = GATES[idx % 4];
  const gateW = NUM_WORDS[gateV] || String(gateV);
  const gateD = AR_DIGITS[gateV];
  const beltV = BELTS[(idx + 1) % 4];
  const beltWm = NUM_WORDS_M[beltV] || String(beltV);   // masculine nouns: رصيف، سير، موقف
  const hallW = NUM_WORDS[beltV] || String(beltV);       // feminine noun: قاعة
  const beltD = AR_DIGITS[beltV];
  const winV = (idx % 4) + 1;                            // pharmacy windows 1–4
  const winD = AR_DIGITS[winV];
  const winW = WIN_WORDS_M[idx % 4];

  const replaceTokens = (str) => {
    return str
      .replace(/\{CITY\}/g, city).replace(/\{CITY_EN\}/g, cityEn)
      .replace(/\{NAME\}/g, name).replace(/\{NAME_EN\}/g, nameEn)
      .replace(/\{DAY\}/g, day)
      .replace(/\{TIME_WORD\}/g, timeWord).replace(/\{TIME\}/g, timeDigit)
      .replace(/\{TIME_END_WORD\}/g, timeEndWord)
      .replace(/\{FLIGHT\}/g, flight)
      .replace(/\{STATION\}/g, station).replace(/\{STATION_EN\}/g, stationEn)
      .replace(/\{COUNTY\}/g, county).replace(/\{STREET\}/g, street)
      .replace(/\{MILK\}/g, milk).replace(/\{DISH\}/g, dish)
      .replace(/\{GROUP\}/g, group)
      .replace(/\{MINS_WORD\}/g, minsW).replace(/\{MINS\}/g, AR_DIGITS[minsV] || String(minsV))
      .replace(/\{MINS_FULL\}/g, minsFull)
      .replace(/\{BAG\}/g, bagAr)
      .replace(/\{HOURS_WORD\}/g, hoursW).replace(/\{HOURS\}/g, AR_DIGITS[hoursV])
      .replace(/\{HOURS_FULL\}/g, hoursFull)
      .replace(/\{PRICE\}/g, priceW)
      .replace(/\{ALLERGEN\}/g, allergen)
      .replace(/\{PIN_WORD\}/g, pinW).replace(/\{PIN\}/g, pinAr)
      .replace(/\{PARTY_SIZE\}/g, partyD).replace(/\{PARTY_W\}/g, partyW)
      .replace(/\{LINE\}/g, line).replace(/\{TRAIN_TYPE\}/g, trainType)
      .replace(/\{SIDE\}/g, side).replace(/\{EXIT\}/g, exit)
      .replace(/\{BILLS\}/g, billsFull).replace(/\{BILLS_FULL\}/g, billsFull)
      .replace(/\{SEAT_LOCATION\}/g, seatLocation).replace(/\{LOT\}/g, lot)
      .replace(/\{GATE_WORD\}/g, gateW).replace(/\{GATE1\}/g, AR_DIGITS[GATES[(idx + 1) % 4]])
      .replace(/\{GATE3\}/g, AR_DIGITS[GATES[(idx + 2) % 4]]).replace(/\{GATE4\}/g, AR_DIGITS[GATES[(idx + 3) % 4]])
      .replace(/\{GATE\}/g, gateD)
      .replace(/\{BELT_WORD\}/g, beltWm).replace(/\{HALL_WORD\}/g, hallW).replace(/\{BELT1\}/g, AR_DIGITS[BELTS[idx % 4]])
      .replace(/\{WIN_WORD\}/g, winW).replace(/\{WIN\}/g, winD)
      .replace(/\{BELT3\}/g, AR_DIGITS[BELTS[(idx + 2) % 4]]).replace(/\{BELT4\}/g, AR_DIGITS[BELTS[(idx + 3) % 4]])
      .replace(/\{BELT\}/g, beltD);
  };

  const transcript = replaceTokens(itemDef.textFmt);
  const targetWord = replaceTokens(itemDef.targetFmt);
  const question = replaceTokens(itemDef.qFmt);
  const questionAr = replaceTokens(itemDef.qArFmt);

  let rawOptions = itemDef.distractorFmt.map(replaceTokens);
  if (!rawOptions.includes(targetWord)) {
    rawOptions[0] = targetWord;
  }
  const optionsSet = new Set(rawOptions);
  if (optionsSet.size < 4) {
    optionsSet.add('لا شيء مما ذُكر');
    optionsSet.add('خيار غير محدد');
  }
  const finalOptions = Array.from(optionsSet).slice(0, 4);

  allScenarios.push({
    id: `ar-sc-${cefr.toLowerCase()}-${idx}`,
    level: cefr,
    scenario: `${itemDef.scenario} #${idx}`,
    contextDescription: contextDesc,
    transcript,
    transcriptTransliteration: '',
    targetWord,
    question,
    questionAr,
    options: finalOptions,
    correctOption: targetWord,
    audioUrl: `/audio/ar-scenario_${idx}.mp3`,
    audioFallbackWord: transcript
  });

  templateIndex++;
}

console.log(`Successfully generated ${allScenarios.length} Arabic situations!`);

// =========================================================================
// 5. WRITE COMPLETE ARABIC CORPUS JSON (v3.0.0)
// =========================================================================
const completeDataset = {
  version: '3.0.0',
  language: 'ar',
  generatedAt: new Date().toISOString(),
  totalWords: allWords.length,
  totalScenarios: allScenarios.length,
  contentPolicy: 'educational-safe MSA: explicit-sexuality blocklist applied to frequency fill; scenario transcripts profanity-free',
  audioCoverage: 'words + scenarios reference /audio/ar-*.mp3; run python scripts/generate_all_audio_edge.py with EDGE_VOICE=ar-SA-ZariyahNeural',
  words: allWords,
  scenarios: allScenarios
};

fs.writeFileSync(VOCAB_PATH, JSON.stringify(completeDataset), 'utf8');

const stats = fs.statSync(VOCAB_PATH);
console.log('===========================================================');
console.log('  ARABIC (MSA) CORPUS SUCCESSFULLY WRITTEN TO DISK         ');
console.log('===========================================================');
console.log(`Target file: ${VOCAB_PATH}`);
console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
console.log(`Total words: ${allWords.length}`);
console.log(`  - Minimal Pair items: ${allWords.filter((w) => w.category === 'minimal_pair').length}`);
console.log(`  - General vocabulary items: ${allWords.filter((w) => w.category !== 'minimal_pair').length}`);
console.log(`Total real-world situations: ${allScenarios.length}`);

const wordLevels = {};
for (const w of allWords) {
  wordLevels[w.level] = (wordLevels[w.level] || 0) + 1;
}
console.log('Word distribution by CEFR level:', wordLevels);

const scLevels = {};
for (const s of allScenarios) {
  scLevels[s.level] = (scLevels[s.level] || 0) + 1;
}
console.log('Scenario distribution by CEFR level:', scLevels);

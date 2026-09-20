#!/usr/bin/env node
/**
 * Educational Corpus Builder for Acoustic Ear
 * Expands the curriculum for education systems across CEFR A1 to C1:
 * - Phonemic Minimal Pairs (crucial vowel & consonant contrasts)
 * - Academic & Classroom Vocabulary
 * - University & Research Terminology
 * - Real-world Educational Scenarios (Lectures, Exams, Campus announcements)
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

fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(DATA_DIR, { recursive: true });

// --- COMPLETE CURATED VOCABULARY FOR EDUCATION SYSTEMS ---
const COMPREHENSIVE_WORDS = [
  // ==========================================
  // LEVEL A1: Beginner & Foundation
  // ==========================================
  // Numbers & Quantities (Crucial teen vs ty distinctions)
  { word: 'zero', level: 'A1', ipa: '/ˈzɪə.roʊ/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'one', level: 'A1', ipa: '/wʌn/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'two', level: 'A1', ipa: '/tuː/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'three', level: 'A1', ipa: '/θriː/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'tree', targetPhoneme: '/θr/ vs /tr/' },
  { word: 'tree', level: 'A1', ipa: '/triː/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'three', targetPhoneme: '/tr/ vs /θr/' },
  { word: 'four', level: 'A1', ipa: '/fɔːr/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'five', level: 'A1', ipa: '/faɪv/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'six', level: 'A1', ipa: '/sɪks/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'seven', level: 'A1', ipa: '/ˈsɛv.ən/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'eight', level: 'A1', ipa: '/eɪt/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'nine', level: 'A1', ipa: '/naɪn/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'ten', level: 'A1', ipa: '/tɛn/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'eleven', level: 'A1', ipa: '/ɪˈlɛv.ən/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'twelve', level: 'A1', ipa: '/twɛlv/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'thirteen', level: 'A1', ipa: '/θɜːrˈtiːn/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'thirty', targetPhoneme: '/tiːn/ vs /ti/' },
  { word: 'thirty', level: 'A1', ipa: '/ˈθɜːr.ti/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'thirteen', targetPhoneme: '/ti/ vs /tiːn/' },
  { word: 'fourteen', level: 'A1', ipa: '/fɔːrˈtiːn/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'forty', targetPhoneme: '/tiːn/ vs /ti/' },
  { word: 'forty', level: 'A1', ipa: '/ˈfɔːr.ti/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'fourteen', targetPhoneme: '/ti/ vs /tiːn/' },
  { word: 'fifteen', level: 'A1', ipa: '/fɪfˈtiːn/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'fifty', targetPhoneme: '/tiːn/ vs /ti/' },
  { word: 'fifty', level: 'A1', ipa: '/ˈfɪf.ti/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'fifteen', targetPhoneme: '/ti/ vs /tiːn/' },
  { word: 'sixteen', level: 'A1', ipa: '/sɪksˈtiːn/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'sixty', targetPhoneme: '/tiːn/ vs /ti/' },
  { word: 'sixty', level: 'A1', ipa: '/ˈsɪks.ti/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'sixteen', targetPhoneme: '/ti/ vs /tiːn/' },
  { word: 'seventeen', level: 'A1', ipa: '/sɛv.ənˈtiːn/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'seventy', targetPhoneme: '/tiːn/ vs /ti/' },
  { word: 'seventy', level: 'A1', ipa: '/ˈsɛv.ən.ti/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'seventeen', targetPhoneme: '/ti/ vs /tiːn/' },
  { word: 'eighteen', level: 'A1', ipa: '/eɪˈtiːn/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'eighty', targetPhoneme: '/tiːn/ vs /ti/' },
  { word: 'eighty', level: 'A1', ipa: '/ˈeɪ.ti/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'eighteen', targetPhoneme: '/ti/ vs /tiːn/' },
  { word: 'nineteen', level: 'A1', ipa: '/naɪnˈtiːn/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'ninety', targetPhoneme: '/tiːn/ vs /ti/' },
  { word: 'ninety', level: 'A1', ipa: '/ˈnaɪn.ti/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'nineteen', targetPhoneme: '/ti/ vs /tiːn/' },
  { word: 'twenty', level: 'A1', ipa: '/ˈtwɛn.ti/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'hundred', level: 'A1', ipa: '/ˈhʌn.drəd/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'thousand', level: 'A1', ipa: '/ˈθaʊ.zənd/', partOfSpeech: 'numeral', category: 'number' },

  // A1 Minimal Pairs (Vowel and basic consonant contrasts)
  { word: 'pen', level: 'A1', ipa: '/pɛn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'pin', targetPhoneme: '/e/ vs /ɪ/' },
  { word: 'pin', level: 'A1', ipa: '/pɪn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'pen', targetPhoneme: '/ɪ/ vs /e/' },
  { word: 'bad', level: 'A1', ipa: '/bæd/', partOfSpeech: 'adjective', category: 'minimal_pair', pairWord: 'bed', targetPhoneme: '/æ/ vs /e/' },
  { word: 'bed', level: 'A1', ipa: '/bɛd/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'bad', targetPhoneme: '/e/ vs /æ/' },
  { word: 'bat', level: 'A1', ipa: '/bæt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'bet', targetPhoneme: '/æ/ vs /e/' },
  { word: 'bet', level: 'A1', ipa: '/bɛt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'bat', targetPhoneme: '/e/ vs /æ/' },
  { word: 'sit', level: 'A1', ipa: '/sɪt/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'seat', targetPhoneme: '/ɪ/ vs /iː/' },
  { word: 'seat', level: 'A1', ipa: '/siːt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'sit', targetPhoneme: '/iː/ vs /ɪ/' },
  { word: 'ship', level: 'A1', ipa: '/ʃɪp/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'sheep', targetPhoneme: '/ɪ/ vs /iː/' },
  { word: 'sheep', level: 'A1', ipa: '/ʃiːp/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'ship', targetPhoneme: '/iː/ vs /ɪ/' },
  { word: 'bin', level: 'A1', ipa: '/bɪn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'bean', targetPhoneme: '/ɪ/ vs /iː/' },
  { word: 'bean', level: 'A1', ipa: '/biːn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'bin', targetPhoneme: '/iː/ vs /ɪ/' },
  { word: 'cup', level: 'A1', ipa: '/kʌp/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'cap', targetPhoneme: '/ʌ/ vs /æ/' },
  { word: 'cap', level: 'A1', ipa: '/kæp/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'cup', targetPhoneme: '/æ/ vs /ʌ/' },
  { word: 'tin', level: 'A1', ipa: '/tɪn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'thin', targetPhoneme: '/t/ vs /θ/' },
  { word: 'thin', level: 'A1', ipa: '/θɪn/', partOfSpeech: 'adjective', category: 'minimal_pair', pairWord: 'tin', targetPhoneme: '/θ/ vs /t/' },
  { word: 'coat', level: 'A1', ipa: '/koʊt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'boat', targetPhoneme: '/k/ vs /b/' },
  { word: 'boat', level: 'A1', ipa: '/boʊt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'coat', targetPhoneme: '/b/ vs /k/' },

  // A1 Classroom, Time & Basic Verbs
  { word: 'book', level: 'A1', ipa: '/bʊk/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'desk', level: 'A1', ipa: '/dɛsk/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'door', level: 'A1', ipa: '/dɔːr/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'table', level: 'A1', ipa: '/ˈteɪ.bəl/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'room', level: 'A1', ipa: '/ruːm/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'name', level: 'A1', ipa: '/neɪm/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'number', level: 'A1', ipa: '/ˈnʌm.bər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'morning', level: 'A1', ipa: '/ˈmɔːr.nɪŋ/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'afternoon', level: 'A1', ipa: '/ˌæf.tərˈnuːn/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'evening', level: 'A1', ipa: '/ˈiːv.nɪŋ/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'today', level: 'A1', ipa: '/təˈdeɪ/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'tomorrow', level: 'A1', ipa: '/təˈmɒr.oʊ/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'friday', level: 'A1', ipa: '/ˈfraɪ.deɪ/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'march', level: 'A1', ipa: '/mɑːrtʃ/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'may', level: 'A1', ipa: '/meɪ/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'august', level: 'A1', ipa: '/ɔːˈɡʌst/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'november', level: 'A1', ipa: '/noʊˈvɛm.bər/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'listen', level: 'A1', ipa: '/ˈlɪs.ən/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'stop', level: 'A1', ipa: '/stɒp/', partOfSpeech: 'verb', category: 'emergency' },
  { word: 'help', level: 'A1', ipa: '/hɛlp/', partOfSpeech: 'verb', category: 'emergency' },
  { word: 'water', level: 'A1', ipa: '/ˈwɔː.tər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'coffee', level: 'A1', ipa: '/ˈkɔː.fi/', partOfSpeech: 'noun', category: 'nouns' },

  // ==========================================
  // LEVEL A2: Elementary Campus & Daily Life
  // ==========================================
  // A2 Minimal Pairs
  { word: 'pull', level: 'A2', ipa: '/pʊl/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'pool', targetPhoneme: '/ʊ/ vs /uː/' },
  { word: 'pool', level: 'A2', ipa: '/puːl/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'pull', targetPhoneme: '/uː/ vs /ʊ/' },
  { word: 'full', level: 'A2', ipa: '/fʊl/', partOfSpeech: 'adjective', category: 'minimal_pair', pairWord: 'fool', targetPhoneme: '/ʊ/ vs /uː/' },
  { word: 'fool', level: 'A2', ipa: '/fuːl/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'full', targetPhoneme: '/uː/ vs /ʊ/' },
  { word: 'cheap', level: 'A2', ipa: '/tʃiːp/', partOfSpeech: 'adjective', category: 'minimal_pair', pairWord: 'chip', targetPhoneme: '/iː/ vs /ɪ/' },
  { word: 'chip', level: 'A2', ipa: '/tʃɪp/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'cheap', targetPhoneme: '/ɪ/ vs /iː/' },
  { word: 'price', level: 'A2', ipa: '/praɪs/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'prize', targetPhoneme: '/s/ vs /z/' },
  { word: 'prize', level: 'A2', ipa: '/praɪz/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'price', targetPhoneme: '/z/ vs /s/' },
  { word: 'wet', level: 'A2', ipa: '/wɛt/', partOfSpeech: 'adjective', category: 'minimal_pair', pairWord: 'wait', targetPhoneme: '/e/ vs /eɪ/' },
  { word: 'wait', level: 'A2', ipa: '/weɪt/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'wet', targetPhoneme: '/eɪ/ vs /e/' },
  { word: 'heart', level: 'A2', ipa: '/hɑːrt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'hard', targetPhoneme: '/t/ vs /d/' },
  { word: 'hard', level: 'A2', ipa: '/hɑːrd/', partOfSpeech: 'adjective', category: 'minimal_pair', pairWord: 'heart', targetPhoneme: '/d/ vs /t/' },
  { word: 'clock', level: 'A2', ipa: '/klɒk/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'cloak', targetPhoneme: '/ɒ/ vs /oʊ/' },
  { word: 'cloak', level: 'A2', ipa: '/kloʊk/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'clock', targetPhoneme: '/oʊ/ vs /ɒ/' },
  { word: 'mouse', level: 'A2', ipa: '/maʊs/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'mouth', targetPhoneme: '/s/ vs /θ/' },
  { word: 'mouth', level: 'A2', ipa: '/maʊθ/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'mouse', targetPhoneme: '/θ/ vs /s/' },

  // A2 Campus, School Transit & Daily Routine
  { word: 'station', level: 'A2', ipa: '/ˈsteɪ.ʃən/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'train', level: 'A2', ipa: '/treɪn/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'bus', level: 'A2', ipa: '/bʌs/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'ticket', level: 'A2', ipa: '/ˈtɪk.ɪt/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'airport', level: 'A2', ipa: '/ˈɛər.pɔːrt/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'flight', level: 'A2', ipa: '/flaɪt/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'gate', level: 'A2', ipa: '/ɡeɪt/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'arrival', level: 'A2', ipa: '/əˈraɪ.vəl/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'arrive', level: 'A2', ipa: '/əˈraɪv/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'leave', level: 'A2', ipa: '/liːv/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'enter', level: 'A2', ipa: '/ˈɛn.tər/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'return', level: 'A2', ipa: '/rɪˈtɜːrn/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'hotel', level: 'A2', ipa: '/hoʊˈtɛl/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'card', level: 'A2', ipa: '/kɑːrd/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'cash', level: 'A2', ipa: '/kæʃ/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'key', level: 'A2', ipa: '/kiː/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'bill', level: 'A2', ipa: '/bɪl/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'check', level: 'A2', ipa: '/tʃɛk/', partOfSpeech: 'verb', category: 'nouns' },
  { word: 'order', level: 'A2', ipa: '/ˈɔːr.dər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'message', level: 'A2', ipa: '/ˈmɛs.ɪdʒ/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'question', level: 'A2', ipa: '/ˈkwɛs.tʃən/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'answer', level: 'A2', ipa: '/ˈæn.sər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'office', level: 'A2', ipa: '/ˈɒf.ɪs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'street', level: 'A2', ipa: '/striːt/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'subway', level: 'A2', ipa: '/ˈsʌb.weɪ/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'doctor', level: 'A2', ipa: '/ˈdɒk.tər/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'hospital', level: 'A2', ipa: '/ˈhɒs.pɪ.təl/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'police', level: 'A2', ipa: '/pəˈliːs/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'safe', level: 'A2', ipa: '/seɪf/', partOfSpeech: 'adjective', category: 'emergency' },
  { word: 'danger', level: 'A2', ipa: '/ˈdeɪn.dʒər/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'fire', level: 'A2', ipa: '/faɪər/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'alarm', level: 'A2', ipa: '/əˈlɑːrm/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'exit', level: 'A2', ipa: '/ˈɛɡ.zɪt/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'half', level: 'A2', ipa: '/hæf/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'quarter', level: 'A2', ipa: '/ˈkwɔːr.tər/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'noon', level: 'A2', ipa: '/nuːn/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'midnight', level: 'A2', ipa: '/ˈmɪd.naɪt/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'yesterday', level: 'A2', ipa: '/ˈjɛs.tər.deɪ/', partOfSpeech: 'noun', category: 'date_time' },
  { word: 'first', level: 'A2', ipa: '/fɜːrst/', partOfSpeech: 'adjective', category: 'number' },
  { word: 'second', level: 'A2', ipa: '/ˈsɛk.ənd/', partOfSpeech: 'adjective', category: 'number' },
  { word: 'third', level: 'A2', ipa: '/θɜːrd/', partOfSpeech: 'adjective', category: 'number' },

  // ==========================================
  // LEVEL B1: Intermediate Academic & Study
  // ==========================================
  // B1 Minimal Pairs (Phonetic boundary discernment)
  { word: 'light', level: 'B1', ipa: '/laɪt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'right', targetPhoneme: '/l/ vs /r/' },
  { word: 'right', level: 'B1', ipa: '/raɪt/', partOfSpeech: 'adjective', category: 'minimal_pair', pairWord: 'light', targetPhoneme: '/r/ vs /l/' },
  { word: 'sail', level: 'B1', ipa: '/seɪl/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'fail', targetPhoneme: '/s/ vs /f/' },
  { word: 'fail', level: 'B1', ipa: '/feɪl/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'sail', targetPhoneme: '/f/ vs /s/' },
  { word: 'vest', level: 'B1', ipa: '/vɛst/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'west', targetPhoneme: '/v/ vs /w/' },
  { word: 'west', level: 'B1', ipa: '/wɛst/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'vest', targetPhoneme: '/w/ vs /v/' },
  { word: 'vine', level: 'B1', ipa: '/vaɪn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'wine', targetPhoneme: '/v/ vs /w/' },
  { word: 'wine', level: 'B1', ipa: '/waɪn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'vine', targetPhoneme: '/w/ vs /v/' },
  { word: 'pass', level: 'B1', ipa: '/pæs/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'path', targetPhoneme: '/s/ vs /θ/' },
  { word: 'path', level: 'B1', ipa: '/pæθ/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'pass', targetPhoneme: '/θ/ vs /s/' },
  { word: 'sink', level: 'B1', ipa: '/sɪŋk/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'think', targetPhoneme: '/s/ vs /θ/' },
  { word: 'think', level: 'B1', ipa: '/θɪŋk/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'sink', targetPhoneme: '/θ/ vs /s/' },
  { word: 'rice', level: 'B1', ipa: '/raɪs/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'rise', targetPhoneme: '/s/ vs /z/' },
  { word: 'rise', level: 'B1', ipa: '/raɪz/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'rice', targetPhoneme: '/z/ vs /s/' },
  { word: 'peace', level: 'B1', ipa: '/piːs/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'peas', targetPhoneme: '/s/ vs /z/' },
  { word: 'peas', level: 'B1', ipa: '/piːz/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'peace', targetPhoneme: '/z/ vs /s/' },

  // B1 Academic, University Campus & Study
  { word: 'lecture', level: 'B1', ipa: '/ˈlɛk.tʃər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'library', level: 'B1', ipa: '/ˈlaɪ.brər.i/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'exam', level: 'B1', ipa: '/ɪɡˈzæm/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'test', level: 'B1', ipa: '/tɛst/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'grade', level: 'B1', ipa: '/ɡreɪd/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'class', level: 'B1', ipa: '/klæs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'course', level: 'B1', ipa: '/kɔːrs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'lesson', level: 'B1', ipa: '/ˈlɛs.ən/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'college', level: 'B1', ipa: '/ˈkɒl.ɪdʒ/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'degree', level: 'B1', ipa: '/dɪˈɡriː/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'student', level: 'B1', ipa: '/ˈstjuː.dənt/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'teacher', level: 'B1', ipa: '/ˈtiː.tʃər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'school', level: 'B1', ipa: '/skuːl/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'paper', level: 'B1', ipa: '/ˈpeɪ.pər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'study', level: 'B1', ipa: '/ˈstʌd.i/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'project', level: 'B1', ipa: '/ˈprɒdʒ.ɛkt/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'report', level: 'B1', ipa: '/rɪˈpɔːrt/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'task', level: 'B1', ipa: '/tæsk/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'history', level: 'B1', ipa: '/ˈhɪs.tər.i/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'science', level: 'B1', ipa: '/ˈsaɪ.əns/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'result', level: 'B1', ipa: '/rɪˈzʌlt/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'confirm', level: 'B1', ipa: '/kənˈfɜːrm/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'understand', level: 'B1', ipa: '/ˌʌn.dərˈstænd/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'remember', level: 'B1', ipa: '/rɪˈmɛm.bər/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'repeat', level: 'B1', ipa: '/rɪˈpiːt/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'spell', level: 'B1', ipa: '/spɛl/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'follow', level: 'B1', ipa: '/ˈfɒl.oʊ/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'notice', level: 'B1', ipa: '/ˈnoʊ.tɪs/', partOfSpeech: 'noun', category: 'daily_verbs' },
  { word: 'deliver', level: 'B1', ipa: '/dɪˈlɪv.ər/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'receipt', level: 'B1', ipa: '/rɪˈsiːt/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'manager', level: 'B1', ipa: '/ˈmæn.ɪ.dʒər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'passport', level: 'B1', ipa: '/ˈpæs.pɔːrt/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'luggage', level: 'B1', ipa: '/ˈlʌɡ.ɪdʒ/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'security', level: 'B1', ipa: '/sɪˈkjʊər.ə.ti/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'platform', level: 'B1', ipa: '/ˈplæt.fɔːrm/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'terminal', level: 'B1', ipa: '/ˈtɜːr.mɪ.nəl/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'boarding', level: 'B1', ipa: '/ˈbɔːr.dɪŋ/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'delayed', level: 'B1', ipa: '/dɪˈleɪd/', partOfSpeech: 'adjective', category: 'travel_transit' },
  { word: 'cancelled', level: 'B1', ipa: '/ˈkæn.səld/', partOfSpeech: 'adjective', category: 'travel_transit' },
  { word: 'passenger', level: 'B1', ipa: '/ˈpæs.ən.dʒər/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'announcement', level: 'B1', ipa: '/əˈnaʊns.mənt/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'connection', level: 'B1', ipa: '/kəˈnɛk.ʃən/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'transfer', level: 'B1', ipa: '/ˈtræns.fɜːr/', partOfSpeech: 'verb', category: 'travel_transit' },
  { word: 'elevator', level: 'B1', ipa: '/ˈɛl.ə.veɪ.tər/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'escalator', level: 'B1', ipa: '/ˈɛs.kə.leɪ.tər/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'caution', level: 'B1', ipa: '/ˈkɔː.ʃən/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'warning', level: 'B1', ipa: '/ˈwɔːr.nɪŋ/', partOfSpeech: 'noun', category: 'emergency' },
  { word: 'emergency', level: 'B1', ipa: '/ɪˈmɜːr.dʒən.si/', partOfSpeech: 'noun', category: 'emergency' },

  // ==========================================
  // LEVEL B2: Upper-Intermediate Academic Research
  // ==========================================
  // B2 Minimal Pairs
  { word: 'date', level: 'B2', ipa: '/deɪt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'gate', targetPhoneme: '/d/ vs /ɡ/' },
  { word: 'gate', level: 'B2', ipa: '/ɡeɪt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'date', targetPhoneme: '/ɡ/ vs /d/' },
  { word: 'fan', level: 'B2', ipa: '/fæn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'van', targetPhoneme: '/f/ vs /v/' },
  { word: 'van', level: 'B2', ipa: '/væn/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'fan', targetPhoneme: '/v/ vs /f/' },
  { word: 'ten', level: 'B2', ipa: '/tɛn/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'tenth', targetPhoneme: '/n/ vs /nθ/' },
  { word: 'tenth', level: 'B2', ipa: '/tɛnθ/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'ten', targetPhoneme: '/nθ/ vs /n/' },
  { word: 'twelve', level: 'B2', ipa: '/twɛlv/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'twelfth', targetPhoneme: '/lv/ vs /lfθ/' },
  { word: 'twelfth', level: 'B2', ipa: '/twɛlfθ/', partOfSpeech: 'numeral', category: 'minimal_pair', pairWord: 'twelve', targetPhoneme: '/lfθ/ vs /lv/' },

  // B2 Academic Research & Institutional Language
  { word: 'academic', level: 'B2', ipa: '/ˌæk.əˈdɛm.ɪk/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'analysis', level: 'B2', ipa: '/əˈnæl.ə.sɪs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'evidence', level: 'B2', ipa: '/ˈɛv.ɪ.dəns/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'theory', level: 'B2', ipa: '/ˈθɪər.i/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'research', level: 'B2', ipa: '/rɪˈsɜːrtʃ/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'concept', level: 'B2', ipa: '/ˈkɒn.sɛpt/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'method', level: 'B2', ipa: '/ˈmɛθ.əd/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'data', level: 'B2', ipa: '/ˈdeɪ.tə/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'structure', level: 'B2', ipa: '/ˈstrʌk.tʃər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'section', level: 'B2', ipa: '/ˈsɛk.ʃən/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'source', level: 'B2', ipa: '/sɔːrs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'context', level: 'B2', ipa: '/ˈkɒn.tɛkst/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'factor', level: 'B2', ipa: '/ˈfæk.tər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'issue', level: 'B2', ipa: '/ˈɪʃ.uː/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'policy', level: 'B2', ipa: '/ˈpɒl.ə.si/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'process', level: 'B2', ipa: '/ˈprɒs.ɛs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'require', level: 'B2', ipa: '/rɪˈkwaɪər/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'specific', level: 'B2', ipa: '/spəˈsɪf.ɪk/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'author', level: 'B2', ipa: '/ˈɔː.θər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'chapter', level: 'B2', ipa: '/ˈtʃæp.tər/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'conclude', level: 'B2', ipa: '/kənˈkluːd/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'define', level: 'B2', ipa: '/dɪˈfaɪn/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'focus', level: 'B2', ipa: '/ˈfoʊ.kəs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'major', level: 'B2', ipa: '/ˈmeɪ.dʒər/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'publish', level: 'B2', ipa: '/ˈpʌb.lɪʃ/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'survey', level: 'B2', ipa: '/ˈsɜːr.veɪ/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'valid', level: 'B2', ipa: '/ˈvæl.ɪd/', partOfSpeech: 'adjective', category: 'nouns' },

  // ==========================================
  // LEVEL C1: Advanced Academic & Formal Discourse
  // ==========================================
  // C1 Minimal Pairs (Nuanced phonetic and morphological distinctions)
  { word: 'loose', level: 'C1', ipa: '/luːs/', partOfSpeech: 'adjective', category: 'minimal_pair', pairWord: 'lose', targetPhoneme: '/s/ vs /z/' },
  { word: 'lose', level: 'C1', ipa: '/luːz/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'loose', targetPhoneme: '/z/ vs /s/' },
  { word: 'advice', level: 'C1', ipa: '/ədˈvaɪs/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'advise', targetPhoneme: '/s/ vs /z/' },
  { word: 'advise', level: 'C1', ipa: '/ədˈvaɪz/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'advice', targetPhoneme: '/z/ vs /s/' },
  { word: 'device', level: 'C1', ipa: '/dɪˈvaɪs/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'devise', targetPhoneme: '/s/ vs /z/' },
  { word: 'devise', level: 'C1', ipa: '/dɪˈvaɪz/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'device', targetPhoneme: '/z/ vs /s/' },
  { word: 'affect', level: 'C1', ipa: '/əˈfɛkt/', partOfSpeech: 'verb', category: 'minimal_pair', pairWord: 'effect', targetPhoneme: '/æ/ vs /ɪ/' },
  { word: 'effect', level: 'C1', ipa: '/ɪˈfɛkt/', partOfSpeech: 'noun', category: 'minimal_pair', pairWord: 'affect', targetPhoneme: '/ɪ/ vs /æ/' },

  // C1 Academic & Institutional Vocabulary
  { word: 'hypothesis', level: 'C1', ipa: '/haɪˈpɒθ.ə.sɪs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'empirical', level: 'C1', ipa: '/ɪmˈpɪr.ɪ.kəl/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'paradigm', level: 'C1', ipa: '/ˈpær.ə.daɪm/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'methodology', level: 'C1', ipa: '/ˌmɛθ.əˈdɒl.ə.dʒi/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'criterion', level: 'C1', ipa: '/kraɪˈtɪər.i.ən/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'phenomenon', level: 'C1', ipa: '/fəˈnɒm.ɪ.nən/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'qualitative', level: 'C1', ipa: '/ˈkwɒl.ɪ.tə.tɪv/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'quantitative', level: 'C1', ipa: '/ˈkwɒn.tɪ.tə.tɪv/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'perspective', level: 'C1', ipa: '/pərˈspɛk.tɪv/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'fundamental', level: 'C1', ipa: '/ˌfʌn.dəˈmɛn.təl/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'comprehensive', level: 'C1', ipa: '/ˌkɒm.prɪˈhɛn.sɪv/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'coherent', level: 'C1', ipa: '/koʊˈhɪər.ənt/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'synthesize', level: 'C1', ipa: '/ˈsɪn.θə.saɪz/', partOfSpeech: 'verb', category: 'daily_verbs' },
  { word: 'hierarchy', level: 'C1', ipa: '/ˈhaɪ.ər.ɑːr.ki/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'consensus', level: 'C1', ipa: '/kənˈsɛn.səs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'rationale', level: 'C1', ipa: '/ˌræʃ.əˈnæl/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'inference', level: 'C1', ipa: '/ˈɪn.fər.əns/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'discrepancy', level: 'C1', ipa: '/dɪˈskrɛp.ən.si/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'ambiguous', level: 'C1', ipa: '/æmˈbɪɡ.ju.əs/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'explicit', level: 'C1', ipa: '/ɪkˈsplɪs.ɪt/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'implicit', level: 'C1', ipa: '/ɪmˈplɪs.ɪt/', partOfSpeech: 'adjective', category: 'nouns' },
  { word: 'avenue', level: 'C1', ipa: '/ˈæv.ə.njuː/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'million', level: 'C1', ipa: '/ˈmɪl.jən/', partOfSpeech: 'numeral', category: 'number' },
  { word: 'baggage', level: 'C1', ipa: '/ˈbæɡ.ɪdʒ/', partOfSpeech: 'noun', category: 'travel_transit' },
  { word: 'claim', level: 'C1', ipa: '/kleɪm/', partOfSpeech: 'verb', category: 'travel_transit' },
  { word: 'address', level: 'C1', ipa: '/əˈdrɛs/', partOfSpeech: 'noun', category: 'nouns' },
  { word: 'call', level: 'C1', ipa: '/kɔːl/', partOfSpeech: 'verb', category: 'daily_verbs' }
];

// Enrich distractors for all words in dataset
COMPREHENSIVE_WORDS.forEach((w) => {
  w.id = `vocab-${w.word.toLowerCase()}`;
  w.audioUrl = `/audio/${w.word.toLowerCase()}.mp3`;
  if (w.pairWord && !w.distractors) {
    w.distractors = [w.pairWord];
  }
});

// ==========================================
// COMPREHENSIVE EDUCATIONAL SITUATIONS (30 SCENARIOS ACROSS A1-C1)
// ==========================================
const EDUCATIONAL_SCENARIOS = [
  // --- LEVEL A1 SCENARIOS (6 Scenarios: Numbers, Classroom, Daily Basics) ---
  {
    id: 'sc-a1-1',
    level: 'A1',
    scenario: 'Classroom Room Number Announcement',
    transcript: 'Attention students: English beginner class is in room fifteen, not room fifty.',
    targetWord: 'fifteen',
    question: 'Which classroom number was announced for the class?',
    options: ['Room 50', 'Room 15', 'Room 5', 'Room 55'],
    correctOption: 'Room 15',
    audioUrl: '/audio/fifteen.mp3',
    audioFallbackWord: 'fifteen',
    contextDescription: 'School hallway intercom with echo and distant chatter'
  },
  {
    id: 'sc-a1-2',
    level: 'A1',
    scenario: 'School Bus Departure Time',
    transcript: 'The morning school bus departs at eight forty from the front gate.',
    targetWord: 'forty',
    question: 'At what minute does the school bus leave?',
    options: ['Fourteen', 'Forty', 'Four', 'Twenty'],
    correctOption: 'Forty',
    audioUrl: '/audio/forty.mp3',
    audioFallbackWord: 'forty',
    contextDescription: 'Bus terminal loudspeaker with engine idling noise'
  },
  {
    id: 'sc-a1-3',
    level: 'A1',
    scenario: 'Classroom Desk Assignment',
    transcript: 'Please find your assigned desk and place your pen on the paper.',
    targetWord: 'desk',
    question: 'What furniture item should students find?',
    options: ['Door', 'Desk', 'Table', 'Bench'],
    correctOption: 'Desk',
    audioUrl: '/audio/desk.mp3',
    audioFallbackWord: 'desk',
    contextDescription: 'Classroom wall speaker with paper shuffling'
  },
  {
    id: 'sc-a1-4',
    level: 'A1',
    scenario: 'Elementary School Lunch Bell',
    transcript: 'Lunch period begins at twelve noon for all primary grade students.',
    targetWord: 'twelve',
    question: 'What hour marks the start of the lunch period?',
    options: ['Ten', 'Eleven', 'Twelve', 'Twenty'],
    correctOption: 'Twelve',
    audioUrl: '/audio/twelve.mp3',
    audioFallbackWord: 'twelve',
    contextDescription: 'Cafeteria intercom with cafeteria background rumble'
  },
  {
    id: 'sc-a1-5',
    level: 'A1',
    scenario: 'Classroom Seating Direction',
    transcript: 'Please take your seat quietly before the lesson starts.',
    targetWord: 'seat',
    question: 'What were the students asked to take?',
    options: ['Sit', 'Seat', 'Sheet', 'Set'],
    correctOption: 'Seat',
    audioUrl: '/audio/seat.mp3',
    audioFallbackWord: 'seat',
    contextDescription: 'Teacher portable microphone with mild sibilant loss'
  },
  {
    id: 'sc-a1-6',
    level: 'A1',
    scenario: 'Attendance Confirmation',
    transcript: 'We have thirty students present for morning roll call.',
    targetWord: 'thirty',
    question: 'How many students were recorded present in the attendance count?',
    options: ['Thirteen', 'Thirty', 'Three', 'Thirty-three'],
    correctOption: 'Thirty',
    audioUrl: '/audio/thirty.mp3',
    audioFallbackWord: 'thirty',
    contextDescription: 'Morning homeroom intercom announcement'
  },

  // --- LEVEL A2 SCENARIOS (6 Scenarios: Campus Transit, Cafeteria, Library, Safety) ---
  {
    id: 'sc-a2-1',
    level: 'A2',
    scenario: 'Campus Transit Shuttle Alert',
    transcript: 'The university shuttle to the science campus is departing from platform fourteen.',
    targetWord: 'fourteen',
    question: 'Which platform is the science campus shuttle departing from?',
    options: ['Platform 40', 'Platform 14', 'Platform 4', 'Platform 44'],
    correctOption: 'Platform 14',
    audioUrl: '/audio/fourteen.mp3',
    audioFallbackWord: 'fourteen',
    contextDescription: 'Outdoor transit shelter loudspeaker with street traffic'
  },
  {
    id: 'sc-a2-2',
    level: 'A2',
    scenario: 'Library Book Return Counter',
    transcript: 'Library notice: Please return reserved course books to the front desk by evening.',
    targetWord: 'return',
    question: 'What action should students take with course books?',
    options: ['Order', 'Return', 'Deliver', 'Repeat'],
    correctOption: 'Return',
    audioUrl: '/audio/return.mp3',
    audioFallbackWord: 'return',
    contextDescription: 'Quiet campus library intercom with soft background acoustics'
  },
  {
    id: 'sc-a2-3',
    level: 'A2',
    scenario: 'Student Identification Card Fee',
    transcript: 'The fee for a replacement student card is twenty dollars at the cashier window.',
    targetWord: 'twenty',
    question: 'How much is the student identification replacement fee?',
    options: ['Twelve', 'Twenty', 'Two', 'Ten'],
    correctOption: 'Twenty',
    audioUrl: '/audio/twenty.mp3',
    audioFallbackWord: 'twenty',
    contextDescription: 'Administration desk microphone through safety glass barrier'
  },
  {
    id: 'sc-a2-4',
    level: 'A2',
    scenario: 'Campus Health Clinic Triage',
    transcript: 'Please confirm with the clinic doctor if your appointment is scheduled today.',
    targetWord: 'doctor',
    question: 'Who should the student confirm their appointment with?',
    options: ['Manager', 'Teacher', 'Doctor', 'Nurse'],
    correctOption: 'Doctor',
    audioUrl: '/audio/doctor.mp3',
    audioFallbackWord: 'doctor',
    contextDescription: 'Health center waiting room speaker with air conditioning hum'
  },
  {
    id: 'sc-a2-5',
    level: 'A2',
    scenario: 'Campus Security Advisory',
    transcript: 'Security alert: Keep your bicycle locked safely at the designated station.',
    targetWord: 'station',
    question: 'Where should bicycles be locked safely?',
    options: ['Street', 'Station', 'Office', 'Platform'],
    correctOption: 'Station',
    audioUrl: '/audio/station.mp3',
    audioFallbackWord: 'station',
    contextDescription: 'Campus pathway security call-box transmission'
  },
  {
    id: 'sc-a2-6',
    level: 'A2',
    scenario: 'Dormitory Check-in Notice',
    transcript: 'Welcome new residents: Pick up your room key from the manager before midnight.',
    targetWord: 'key',
    question: 'What item must residents collect from the manager?',
    options: ['Card', 'Key', 'Bill', 'Receipt'],
    correctOption: 'Key',
    audioUrl: '/audio/key.mp3',
    audioFallbackWord: 'key',
    contextDescription: 'Dormitory reception intercom with elevator chime'
  },

  // --- LEVEL B1 SCENARIOS (6 Scenarios: Examination Hall, Lab Safety, Course Advisories) ---
  {
    id: 'sc-b1-1',
    level: 'B1',
    scenario: 'Examination Hall Instruction',
    transcript: 'Final exam rules: Check your paper thoroughly before you leave the lecture room.',
    targetWord: 'paper',
    question: 'What must students inspect carefully before leaving?',
    options: ['Desk', 'Paper', 'Ticket', 'Card'],
    correctOption: 'Paper',
    audioUrl: '/audio/paper.mp3',
    audioFallbackWord: 'paper',
    contextDescription: 'Large acoustic examination hall public address system'
  },
  {
    id: 'sc-b1-2',
    level: 'B1',
    scenario: 'Chemistry Laboratory Safety Briefing',
    transcript: 'Lab warning: Wear protective eyewear and handle all acid containers with caution.',
    targetWord: 'caution',
    question: 'What protocol is emphasized when handling laboratory acid containers?',
    options: ['Notice', 'Caution', 'Warning', 'Danger'],
    correctOption: 'Caution',
    audioUrl: '/audio/caution.mp3',
    audioFallbackWord: 'caution',
    contextDescription: 'Science laboratory intercom over ventilation fume hood'
  },
  {
    id: 'sc-b1-3',
    level: 'B1',
    scenario: 'Course Registration Deadline',
    transcript: 'Academic advising message: Friday is the final date to confirm your degree course.',
    targetWord: 'confirm',
    question: 'What must students complete before Friday regarding their degree course?',
    options: ['Repeat', 'Confirm', 'Cancel', 'Follow'],
    correctOption: 'Confirm',
    audioUrl: '/audio/confirm.mp3',
    audioFallbackWord: 'confirm',
    contextDescription: 'Telephone voicemail message with cellular compression'
  },
  {
    id: 'sc-b1-4',
    level: 'B1',
    scenario: 'University Lecture Hall Relocation',
    transcript: 'Attention: The modern history lecture has moved to the main campus auditorium.',
    targetWord: 'lecture',
    question: 'Which academic session was relocated to the main auditorium?',
    options: ['Exam', 'Lecture', 'Lesson', 'Project'],
    correctOption: 'Lecture',
    audioUrl: '/audio/lecture.mp3',
    audioFallbackWord: 'lecture',
    contextDescription: 'Faculty lobby intercom with background hallway reverberation'
  },
  {
    id: 'sc-b1-5',
    level: 'B1',
    scenario: 'Student Research Assignment Help',
    transcript: 'Reference librarians are ready to assist students with their term project report.',
    targetWord: 'project',
    question: 'What academic assignment are librarians assisting with?',
    options: ['Lesson', 'Project', 'Degree', 'Exam'],
    correctOption: 'Project',
    audioUrl: '/audio/project.mp3',
    audioFallbackWord: 'project',
    contextDescription: 'Research library ceiling speaker'
  },
  {
    id: 'sc-b1-6',
    level: 'B1',
    scenario: 'Campus Emergency Evacuation Drill',
    transcript: 'This is a planned emergency drill: calmly follow floor marshals to the north exit.',
    targetWord: 'emergency',
    question: 'What event is taking place according to the speaker announcement?',
    options: ['Elevator', 'Emergency', 'Escalator', 'Electrical'],
    correctOption: 'Emergency',
    audioUrl: '/audio/emergency.mp3',
    audioFallbackWord: 'emergency',
    contextDescription: 'Building fire alarm loudspeaker with siren echo'
  },

  // --- LEVEL B2 SCENARIOS (6 Scenarios: University Research, Seminars, Academic Analysis) ---
  {
    id: 'sc-b2-1',
    level: 'B2',
    scenario: 'Graduate Seminar Schedule Revision',
    transcript: 'Department advisory: The faculty research seminar on economic analysis starts at four.',
    targetWord: 'analysis',
    question: 'What methodology is the focus of the faculty research seminar?',
    options: ['Theory', 'Analysis', 'Concept', 'Structure'],
    correctOption: 'Analysis',
    audioUrl: '/audio/analysis.mp3',
    audioFallbackWord: 'analysis',
    contextDescription: 'Department seminar room microphone with room echo'
  },
  {
    id: 'sc-b2-2',
    level: 'B2',
    scenario: 'Scientific Research Methodology Q&A',
    transcript: 'Please present verifiable empirical evidence before you conclude your findings.',
    targetWord: 'evidence',
    question: 'What did the research committee ask the presenter to demonstrate?',
    options: ['Section', 'Evidence', 'Notice', 'Factor'],
    correctOption: 'Evidence',
    audioUrl: '/audio/evidence.mp3',
    audioFallbackWord: 'evidence',
    contextDescription: 'Conference presentation room wireless audio with transmission jitter'
  },
  {
    id: 'sc-b2-3',
    level: 'B2',
    scenario: 'University Admissions Requirement Call',
    transcript: 'Admissions office here: The committee will require an updated academic transcript.',
    targetWord: 'require',
    question: 'What action is the admissions committee taking regarding the transcript?',
    options: ['Refuse', 'Require', 'Return', 'Repeat'],
    correctOption: 'Require',
    audioUrl: '/audio/require.mp3',
    audioFallbackWord: 'require',
    contextDescription: 'Telephone call with narrow bandpass and packet jitter'
  },
  {
    id: 'sc-b2-4',
    level: 'B2',
    scenario: 'Academic Journal Submission Guidelines',
    transcript: 'The editorial board has agreed to publish the student paper in next month section.',
    targetWord: 'publish',
    question: 'What decision was announced by the editorial board?',
    options: ['Cancel', 'Publish', 'Delay', 'Notice'],
    correctOption: 'Publish',
    audioUrl: '/audio/publish.mp3',
    audioFallbackWord: 'publish',
    contextDescription: 'Voicemail playback through desk phone speaker'
  },
  {
    id: 'sc-b2-5',
    level: 'B2',
    scenario: 'Campus Policy Reform Discussion',
    transcript: 'The university senate will vote on the proposed environmental policy this afternoon.',
    targetWord: 'policy',
    question: 'What official document is the senate voting to approve?',
    options: ['Police', 'Policy', 'Project', 'Price'],
    correctOption: 'Policy',
    audioUrl: '/audio/policy.mp3',
    audioFallbackWord: 'policy',
    contextDescription: 'Auditorium public address microphone with acoustic reverberation'
  },
  {
    id: 'sc-b2-6',
    level: 'B2',
    scenario: 'Faculty Thesis Defense Scheduling',
    transcript: 'Please confirm the date of your final oral defense with your major supervisor.',
    targetWord: 'date',
    question: 'What detail must the doctoral candidate verify with their supervisor?',
    options: ['Gate', 'Date', 'Day', 'Debt'],
    correctOption: 'Date',
    audioUrl: '/audio/date.mp3',
    audioFallbackWord: 'date',
    contextDescription: 'Office speakerphone call with line static'
  },

  // --- LEVEL C1 SCENARIOS (6 Scenarios: Advanced Academic Governance & Discursive Contexts) ---
  {
    id: 'sc-c1-1',
    level: 'C1',
    scenario: 'University Chancellor Convocation Address',
    transcript: 'The provost delivered a formal address celebrating our international academic partnerships.',
    targetWord: 'address',
    question: 'What type of formal speech was presented by the provost?',
    options: ['Access', 'Address', 'Advice', 'Announcement'],
    correctOption: 'Address',
    audioUrl: '/audio/address.mp3',
    audioFallbackWord: 'address',
    contextDescription: 'Cathedral-style university hall with heavy acoustic decay'
  },
  {
    id: 'sc-c1-2',
    level: 'C1',
    scenario: 'Research Endowment Funding Announcement',
    transcript: 'The research foundation approved a grant exceeding one million dollars for science.',
    targetWord: 'million',
    question: 'What funding magnitude was awarded by the research foundation?',
    options: ['Thousand', 'Million', 'Hundred', 'Billion'],
    correctOption: 'Million',
    audioUrl: '/audio/million.mp3',
    audioFallbackWord: 'million',
    contextDescription: 'Press briefing podium audio with camera shutter interference'
  },
  {
    id: 'sc-c1-3',
    level: 'C1',
    scenario: 'International Symposium Transit Advisory',
    transcript: 'Visiting scholars should proceed directly down the central avenue toward the faculty club.',
    targetWord: 'avenue',
    question: 'Along which street should visiting symposium scholars proceed?',
    options: ['Airport', 'Avenue', 'Arrival', 'Annex'],
    correctOption: 'Avenue',
    audioUrl: '/audio/avenue.mp3',
    audioFallbackWord: 'avenue',
    contextDescription: 'Campus radio dispatch over mobile receiver'
  },
  {
    id: 'sc-c1-4',
    level: 'C1',
    scenario: 'Academic Delegation Flight Baggage Claim',
    transcript: 'Delegation notice: All research equipment baggage must be inspected at customs claim.',
    targetWord: 'baggage',
    question: 'Which item belonging to the academic delegation requires customs inspection?',
    options: ['Baggage', 'Package', 'Passage', 'Bandage'],
    correctOption: 'Baggage',
    audioUrl: '/audio/baggage.mp3',
    audioFallbackWord: 'baggage',
    contextDescription: 'Airport terminal public address over crowd ambience'
  },
  {
    id: 'sc-c1-5',
    level: 'C1',
    scenario: 'Scholarly Fellowship Conference Call',
    transcript: 'The selection panel will initiate a video call to discuss your doctoral proposal.',
    targetWord: 'call',
    question: 'How will the fellowship selection panel contact the applicant?',
    options: ['Card', 'Call', 'Claim', 'Code'],
    correctOption: 'Call',
    audioUrl: '/audio/call.mp3',
    audioFallbackWord: 'call',
    contextDescription: 'VoIP conference call with occasional 50ms packet dropouts'
  },
  {
    id: 'sc-c1-6',
    level: 'C1',
    scenario: 'Intellectual Property & Patent Disclosure',
    transcript: 'The university legal office will formally claim proprietary rights over the invention.',
    targetWord: 'claim',
    question: 'What formal action is the university legal office executing regarding rights?',
    options: ['Clear', 'Claim', 'Climb', 'Clean'],
    correctOption: 'Claim',
    audioUrl: '/audio/claim.mp3',
    audioFallbackWord: 'claim',
    contextDescription: 'Boardroom conference phone with mild harmonic distortion'
  }
];

// Write updated vocabulary dataset
const completeDataset = {
  version: '2.0.0',
  generatedAt: new Date().toISOString(),
  totalWords: COMPREHENSIVE_WORDS.length,
  words: COMPREHENSIVE_WORDS,
  scenarios: EDUCATIONAL_SCENARIOS
};

fs.writeFileSync(VOCAB_PATH, JSON.stringify(completeDataset, null, 2), 'utf8');

console.log('=====================================================');
console.log('  EDUCATIONAL CORPUS GENERATED SUCCESSFULLY         ');
console.log('=====================================================');
console.log(`Total words: ${COMPREHENSIVE_WORDS.length}`);
console.log(`Total scenarios: ${EDUCATIONAL_SCENARIOS.length}`);

const wordLevels = {};
COMPREHENSIVE_WORDS.forEach((w) => {
  wordLevels[w.level] = (wordLevels[w.level] || 0) + 1;
});
console.log('Word distribution by CEFR level:', wordLevels);

const scenarioLevels = {};
EDUCATIONAL_SCENARIOS.forEach((s) => {
  scenarioLevels[s.level] = (scenarioLevels[s.level] || 0) + 1;
});
console.log('Scenario distribution by CEFR level:', scenarioLevels);

// Check and download any missing MP3 audio files
async function ensureAllAudio() {
  const missing = [];
  for (const w of COMPREHENSIVE_WORDS) {
    const p = path.join(AUDIO_DIR, `${w.word.toLowerCase()}.mp3`);
    if (!fs.existsSync(p) || fs.statSync(p).size < 500) {
      missing.push(w.word.toLowerCase());
    }
  }
  if (missing.length === 0) {
    console.log('All audio files are present and verified!');
    return;
  }
  console.log(`Downloading ${missing.length} missing audio files...`);
  for (const word of missing) {
    const target = path.join(AUDIO_DIR, `${word}.mp3`);
    const temp = path.join(AUDIO_DIR, `${word}_raw.mp3`);
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(word)}&tl=en`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(temp, buf);
      execSync(`ffmpeg -y -v quiet -i "${temp}" -c:a libmp3lame -b:a 128k -ar 44100 "${target}"`);
      if (fs.existsSync(temp)) fs.unlinkSync(temp);
      console.log(`[Audio Saved]: ${word} (${fs.statSync(target).size} bytes)`);
      await new Promise(r => setTimeout(r, 120));
    } catch (err) {
      console.error(`Failed to download audio for ${word}:`, err.message);
    }
  }
}

await ensureAllAudio();
console.log('Audio verification complete!');


export type AcousticPresetId =
  | 'cellphone'
  | 'landline'
  | 'train_pa'
  | 'intercom_staccato'
  | 'walkie_talkie'
  | 'custom';

export type NoiseType = 'pink' | 'white' | 'radio_hum' | 'subway_rumble' | 'off';

export interface AcousticConfig {
  presetId: AcousticPresetId;
  name: string;
  description: string;
  highPassHz: number;      // e.g. 300Hz (cuts chest resonance)
  lowPassHz: number;       // e.g. 3400Hz (eliminates sibilant consonants)
  distortionDrive: number; // 0 to 100 (WaveShaper soft/hard clipping)
  snrDb: number;           // Voice to noise ratio in dB (+18dB, +5dB, 0dB, -3dB)
  noiseType: NoiseType;
  packetLossRate: number;  // 0 to 80 (% probability of 30ms-90ms dropouts)
  reverbWet: number;       // 0 to 1 (PA reverberation)
}

export type TrainingMode = 'minimal_pair' | 'dictation' | 'comprehension_stress';

export type OxfordLevel = 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface OxfordLevelMeta {
  id: OxfordLevel;
  code: string;
  name: string;
  cefr: string;
  ooptScore?: string;
  description: string;
}

export interface VocabEntry {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: string;
  category: 'minimal_pair' | 'general_vocab' | 'number' | 'date_time' | 'travel_transit' | 'emergency' | 'nouns' | 'daily_verbs';
  pairWord?: string;
  targetPhoneme?: string;
  audioUrl: string;
  audioFallbackWord?: string;
  distractors?: string[];
  level?: OxfordLevel;
  // Arabic-learning extensions (all optional — scoring/filtering logic is unchanged).
  // `word` holds fully vocalized MSA Arabic script (with tashkeel where pedagogically
  // useful, e.g. سِين vs صِين). `transliteration` is a learner-facing Latin gloss
  // (DIN-31635-inspired, e.g. "sīn", "ṣād") shown as a hint next to IPA. `pluralOrNote`
  // carries an optional gender/plural or usage note. `diacritized` echoes `word` for
  // TTS pipelines that require explicit vocalization.
  transliteration?: string;
  diacritized?: string;
  pluralOrNote?: string;
}

export interface StressScenario {
  id: string;
  scenario: string;
  transcript: string;
  targetWord: string;
  question: string;
  options: string[];
  correctOption: string;
  audioUrl: string;
  audioFallbackWord?: string;
  contextDescription: string;
  level?: OxfordLevel;
  // Arabic-learning extensions (optional, logic unchanged): Latin-script gloss of the
  // transcript for learners who cannot yet read Arabic fluently, plus an optional
  // Arabic question string for bilingual display.
  transcriptTransliteration?: string;
  questionAr?: string;
}

export interface VocabDataset {
  version: string;
  generatedAt: string;
  totalWords: number;
  totalScenarios: number;
  words: VocabEntry[];
  scenarios: StressScenario[];
  language?: string;
  contentPolicy?: string;
  audioCoverage?: string;
}

export interface HistoryItem {
  id: string;
  word: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  mode: TrainingMode;
  preset: string;
  timestamp: number;
  phoneme?: string;
  level?: OxfordLevel;
}

export interface UserStats {
  totalAttempted: number;
  totalCorrect: number;
  streak: number;
  bestStreak: number;
  modeStats: {
    minimal_pair: { attempted: number; correct: number };
    dictation: { attempted: number; correct: number };
    comprehension_stress: { attempted: number; correct: number };
  };
  phonemeAccuracy: Record<string, { correct: number; total: number }>;
  levelAccuracy?: Record<string, { correct: number; total: number }>;
  recentHistory: HistoryItem[];
}

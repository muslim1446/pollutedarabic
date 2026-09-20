import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, Volume1, ArrowRight, CornerDownLeft, CheckCircle2, AlertCircle, Gauge, VolumeX, Speech } from 'lucide-react';
import { VocabEntry, StressScenario, TrainingMode, AcousticConfig } from '../types';

interface TrainingCardProps {
  mode: TrainingMode;
  currentItem: VocabEntry | StressScenario;
  options: string[];
  config: AcousticConfig;
  isPlaying: boolean;
  isClean: boolean;
  playbackRate: number;
  onSetPlaybackRate: (rate: number) => void;
  onPlayDegraded: () => void;
  onPlayClean: () => void;
  onSubmitAnswer: (answer: string) => void;
  feedback: {
    answered: boolean;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
  } | null;
  onNext: () => void;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({
  mode,
  currentItem,
  options,
  config,
  isPlaying,
  isClean,
  playbackRate,
  onSetPlaybackRate,
  onPlayDegraded,
  onPlayClean,
  onSubmitAnswer,
  feedback,
  onNext
}) => {
  const [typedInput, setTypedInput] = useState('');
  const [showIpa, setShowIpa] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Read Aloud for Learning Disabilities, Dyslexia, and Accessibility.
  // Voice switched from en-US to ar-SA for the Arabic corpus. Playback, queueing
  // and button LOGIC are unchanged — only the utterance locale and prompt text.
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\.\—\–]/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.88;
      utterance.lang = 'ar-SA';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Focus input automatically on dictation mode
  useEffect(() => {
    setTypedInput('');
    setShowIpa(false);
    if (mode === 'dictation' && !feedback?.answered) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentItem, mode, feedback?.answered]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback?.answered) {
        if (e.key === 'Enter') {
          e.preventDefault();
          onNext();
          return;
        }
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          onPlayClean();
          return;
        }
        if (e.code === 'Space' || e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          onPlayDegraded();
          return;
        }
        return;
      }

      if (document.activeElement === inputRef.current && e.key !== 'Escape') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (typedInput.trim()) {
            onSubmitAnswer(typedInput.trim().toLowerCase());
          }
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayDegraded();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onPlayClean();
      } else if (mode !== 'dictation') {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= options.length) {
          e.preventDefault();
          onSubmitAnswer(options[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    feedback?.answered,
    onNext,
    onPlayClean,
    onPlayDegraded,
    onSubmitAnswer,
    options,
    mode,
    typedInput
  ]);

  const isStressScenario = mode === 'comprehension_stress';
  const scenario = isStressScenario ? (currentItem as StressScenario) : null;
  const vocab = !isStressScenario ? (currentItem as VocabEntry) : null;

  // Build question text for Read Aloud (spoken in Arabic via ar-SA voice above)
  const getPromptSpokenText = () => {
    if (mode === 'minimal_pair') {
      return `أي كلمة سمعت؟ الخيار الأول، ${options[0] || ''}. الخيار الثاني، ${options[1] || ''}`;
    } else if (mode === 'dictation') {
      return `اكتب ما سمعت`;
    } else if (scenario) {
      const optionsText = options.map((opt, i) => `الخيار ${i + 1}، ${opt}`).join('، ');
      return `الموقف: ${scenario.scenario}. السؤال: ${scenario.question}. ${optionsText}`;
    }
    return '';
  };

  return (
    <div
      id="training-card"
      className="w-full bg-white border border-black/[0.06] rounded-2xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-6 transition-all"
    >
      {/* Audio Playback Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Main Play Audio Button - Large Accessible Target */}
          <button
            id="play-degraded-btn"
            onClick={onPlayDegraded}
            className={`min-h-[50px] flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full font-semibold text-[15px] apple-pressable cursor-pointer select-none transition-all ${
              isPlaying && !isClean
                ? 'bg-[#0071eb] text-white border-2 border-[#007aff]'
                : 'bg-[#007aff] hover:bg-[#0071eb] text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
            }`}
          >
            <Volume2 className="w-5 h-5 stroke-[2.2]" />
            <span>{isPlaying && !isClean ? 'Playing' : 'Play Sound'}</span>
            <span className="text-[11px] font-medium opacity-80 ml-1 bg-black/15 px-2 py-0.5 rounded-full hidden sm:inline">
              Space
            </span>
          </button>

          {/* Clean Reference Button - Large Accessible Target */}
          <button
            id="play-clean-btn"
            onClick={onPlayClean}
            className={`min-h-[50px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium apple-pressable cursor-pointer transition-all border ${
              isPlaying && isClean
                ? 'bg-[#34c759] text-white border-2 border-[#34c759]'
                : 'bg-black/[0.03] hover:bg-black/[0.06] text-[#1d1d1f] border-black/[0.06]'
            }`}
            title="Listen without background noise"
          >
            <Volume1 className="w-4.5 h-4.5 text-[#34c759] stroke-[2.2]" />
            <span>Clear Audio</span>
            <span className="text-[11px] text-[#8e8e93] ml-0.5 font-normal hidden sm:inline">[C]</span>
          </button>

          {/* Read Aloud Button for Accessibility */}
          <button
            id="read-aloud-btn"
            type="button"
            onClick={() => speakText(getPromptSpokenText())}
            className={`min-h-[50px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium apple-pressable cursor-pointer transition-all border ${
              isSpeaking
                ? 'bg-[#007aff]/10 text-[#007aff] border-[#007aff]/30'
                : 'bg-black/[0.02] hover:bg-black/[0.05] text-[#1d1d1f] border-black/[0.06]'
            }`}
            title="Read question aloud with voice"
          >
            <Speech className="w-4.5 h-4.5 text-[#007aff] stroke-[2.2]" />
            <span className="hidden sm:inline">Read Aloud</span>
          </button>
        </div>

        {/* Speed Selector (Normal vs Slow) */}
        <div className="flex items-center self-end sm:self-auto gap-1 bg-black/[0.05] p-1 rounded-full border border-black/[0.04] text-xs">
          <span className="text-[11px] font-medium text-[#8e8e93] px-2.5 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-[#8e8e93]" /> Speed:
          </span>
          <button
            onClick={() => onSetPlaybackRate(1.0)}
            className={`min-h-[44px] px-3.5 py-1 rounded-full font-semibold text-xs apple-pressable transition-all cursor-pointer select-none ${
              playbackRate === 1.0
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => onSetPlaybackRate(0.8)}
            className={`min-h-[44px] px-3.5 py-1 rounded-full font-semibold text-xs apple-pressable transition-all cursor-pointer select-none ${
              playbackRate === 0.8
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Slow
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] font-semibold text-[#007aff] uppercase tracking-wider">
            {mode === 'minimal_pair'
              ? 'Similar Words'
              : mode === 'dictation'
              ? 'Type Words'
              : 'Situations'}
          </div>

          {currentItem?.level && (
            <div
              id="exercise-level-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/[0.04] text-[#1d1d1f] border border-black/[0.06]"
              title={`Level ${currentItem.level}`}
            >
              <span className="text-[10px] text-[#8e8e93] font-medium uppercase tracking-wider">
                Level
              </span>
              <span className="font-bold text-[#007aff]">
                {currentItem.level}
              </span>
            </div>
          )}
        </div>

        {mode === 'minimal_pair' && (
          <h2 className="text-xl sm:text-[22px] font-bold text-[#1d1d1f] tracking-tight">
            Which Arabic word did you hear? <span lang="ar" className="font-bold">· أيّ كلمة سمعت؟</span>
          </h2>
        )}

        {mode === 'dictation' && (
          <h2 className="text-xl sm:text-[22px] font-bold text-[#1d1d1f] tracking-tight">
            Type what you heard in Arabic: <span lang="ar" className="font-bold">· اكتب ما سمعت</span>
          </h2>
        )}

        {mode === 'comprehension_stress' && scenario && (
          <div className="p-4 bg-black/[0.02] border border-black/[0.05] rounded-xl space-y-2">
            <div className="text-xs font-semibold text-[#8e8e93] flex items-center gap-1.5">
              <span>Situation · الموقف:</span>
              <span className="text-[#1d1d1f] font-bold">{scenario.scenario}</span>
            </div>
            <p className="text-[15px] font-medium text-[#1d1d1f] leading-relaxed">
              {scenario.question}
            </p>
            {scenario.questionAr && (
              <p lang="ar" dir="rtl" className="text-[16px] font-semibold text-[#1d1d1f] leading-relaxed text-right">
                {scenario.questionAr}
              </p>
            )}
          </div>
        )}
      </div>

      {/* MODE 1: Similar Words Selection */}
      {mode === 'minimal_pair' && !feedback?.answered && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {options.map((option, idx) => {
            const keyNum = idx + 1;
            return (
              <button
                key={option}
                id={`option-btn-${option.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSubmitAnswer(option)}
                className="min-h-[88px] flex items-center justify-between p-5 bg-white hover:bg-[#007aff]/[0.03] border-2 border-black/[0.08] hover:border-[#007aff] rounded-2xl apple-pressable transition-all text-left cursor-pointer group shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(0,122,255,0.15)]"
              >
                <div>
                  <span className="text-[12px] font-medium text-[#8e8e93] group-hover:text-[#007aff] block mb-0.5">
                    Option {keyNum}
                  </span>
                  <span lang="ar" dir="rtl" className="text-2xl sm:text-[28px] font-bold text-[#1d1d1f] group-hover:text-[#007aff] tracking-tight block text-right leading-snug">
                    {option}
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#8e8e93] group-hover:text-[#007aff] border border-black/[0.08] group-hover:border-[#007aff]/30 px-3 py-1.5 rounded-full bg-black/[0.02] group-hover:bg-[#007aff]/10 transition-colors">
                  Key {keyNum}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* MODE 2: Dictation Typing Input */}
      {mode === 'dictation' && !feedback?.answered && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 bg-black/[0.02] border-2 border-black/[0.1] focus-within:border-[#007aff] focus-within:ring-2 focus-within:ring-[#007aff]/20 focus-within:bg-white rounded-2xl p-2.5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <input
              ref={inputRef}
              id="dictation-input"
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="اكتب الكلمة العربية التي سمعتها"
              autoComplete="off"
              spellCheck="false"
              lang="ar"
              dir="rtl"
              className="flex-1 bg-transparent px-3 py-2 text-base sm:text-lg font-semibold text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none min-h-[44px] text-right"
            />
            <button
              id="dictation-submit-btn"
              onClick={() => {
                if (typedInput.trim()) {
                  onSubmitAnswer(typedInput.trim().toLowerCase());
                }
              }}
              disabled={!typedInput.trim()}
              className="min-h-[48px] px-6 py-2 bg-[#007aff] hover:bg-[#0071eb] disabled:bg-black/[0.08] disabled:text-[#8e8e93] text-white font-semibold text-sm rounded-xl apple-pressable transition-all flex items-center gap-2 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
            >
              <span>Submit</span>
              <CornerDownLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8e8e93] px-1">
            {vocab?.ipa ? (
              <button
                type="button"
                onClick={() => setShowIpa(!showIpa)}
                className="text-[#007aff] hover:underline cursor-pointer font-medium min-h-[44px] flex items-center"
              >
                {showIpa
                  ? `Pronunciation: ${vocab.ipa}${vocab.transliteration ? ` · ${vocab.transliteration}` : ''}`
                  : 'Show pronunciation hint · إظهار النطق'}
              </button>
            ) : (
              <span />
            )}
            <span>Press <kbd className="px-1.5 py-0.5 bg-black/[0.05] border border-black/[0.08] rounded text-[#1d1d1f] font-semibold text-[11px]">Enter</kbd> to submit</span>
          </div>
        </div>
      )}

      {/* MODE 3: Scenarios Multiple Choice */}
      {mode === 'comprehension_stress' && !feedback?.answered && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {options.map((option, idx) => (
            <button
              key={option}
              id={`scenario-opt-${idx}`}
              onClick={() => onSubmitAnswer(option)}
              className="min-h-[72px] flex items-center justify-between p-4 bg-white hover:bg-[#007aff]/[0.03] border-2 border-black/[0.08] hover:border-[#007aff] rounded-2xl apple-pressable transition-all text-left cursor-pointer group shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
            >
              <span lang="ar" dir="rtl" className="text-[15px] font-semibold text-[#1d1d1f] group-hover:text-[#007aff] text-right leading-relaxed">
                {option}
              </span>
              <span className="text-xs font-semibold text-[#8e8e93] group-hover:text-[#007aff] px-3 py-1.5 bg-black/[0.03] rounded-full border border-black/[0.06] group-hover:border-[#007aff]/30">
                {idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* FEEDBACK PANEL - Supportive and Calm */}
      {feedback?.answered && (
        <div
          id="practice-feedback-panel"
          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
            feedback.isCorrect
              ? 'bg-[#34c759]/[0.08] border-[#34c759]/30 text-[#1d1d1f]'
              : 'bg-[#ff9500]/[0.08] border-[#ff9500]/30 text-[#1d1d1f]'
          }`}
        >
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
            <div className="flex items-start gap-3">
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-[#34c759] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-[#ff9500] shrink-0 mt-0.5" />
              )}
              <div>
                <div
                  className={`text-[13px] font-bold uppercase tracking-wider ${
                    feedback.isCorrect ? 'text-[#34c759]' : 'text-[#ff9500]'
                  }`}
                >
                  {feedback.isCorrect ? 'Great job!' : 'Good try!'}
                </div>
                <div className="text-[15px] text-[#1d1d1f] mt-0.5">
                  Correct answer:{' '}
                  <strong className="font-bold text-[#1d1d1f] text-[17px]" lang="ar" dir="auto">
                    "{feedback.correctAnswer}"
                  </strong>
                  {!feedback.isCorrect && feedback.userAnswer && (
                    <span className="text-[#6e6e73] text-sm ml-2">
                      (you chose: "{feedback.userAnswer}")
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Replay Controls */}
            <div className="flex items-center gap-2">
              <button
                id="feedback-replay-degraded"
                onClick={onPlayDegraded}
                className="min-h-[44px] px-4 py-2 bg-white hover:bg-black/[0.02] text-xs font-semibold text-[#1d1d1f] border border-black/[0.1] rounded-full apple-pressable transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                Listen Again [Space]
              </button>
              <button
                id="feedback-replay-clean"
                onClick={onPlayClean}
                className="min-h-[44px] px-4 py-2 bg-[#34c759] hover:bg-[#2fb350] text-xs font-semibold text-white rounded-full apple-pressable transition-all cursor-pointer shadow-[0_2px_6px_rgba(52,199,89,0.3)] flex items-center gap-1.5"
              >
                <Volume1 className="w-4 h-4" />
                Clear Audio [C]
              </button>
            </div>
          </div>

          {/* Continue / Next Button */}
          <div className="pt-4">
            <button
              id="next-drill-btn"
              onClick={onNext}
              className="w-full min-h-[52px] py-3 px-5 bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white font-semibold text-sm rounded-full apple-pressable transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] select-none"
            >
              <span>Next Question</span>
              <span className="text-[#8e8e93] font-normal text-xs">[Enter]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

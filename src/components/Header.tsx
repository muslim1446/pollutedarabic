import React from 'react';
import { TrainingMode, UserStats } from '../types';
import { BarChart2, Sparkles, SlidersHorizontal, Zap } from 'lucide-react';

interface HeaderProps {
  currentMode: TrainingMode;
  onSelectMode: (mode: TrainingMode) => void;
  stats: UserStats;
  onOpenStats: () => void;
  calmMode: boolean;
  onToggleCalmMode: () => void;
  turboMode: boolean;
  onToggleTurboMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  stats,
  onOpenStats,
  calmMode,
  onToggleCalmMode,
  turboMode,
  onToggleTurboMode
}) => {
  const accuracy =
    stats.totalAttempted > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
      : 0;

  return (
    <header className="w-full bg-white/90 backdrop-blur-xl border-b border-black/[0.08] sticky top-0 z-30 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:h-18 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3">
        {/* Title */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <h1 className="font-semibold text-base sm:text-[17px] tracking-tight text-[#1d1d1f]">
            Listening Practice <span lang="ar" className="text-[#8e8e93] font-medium">· العربية</span>
          </h1>
        </div>

        {/* Mode Switcher - Apple HIG Segmented Control */}
        <div
          role="tablist"
          aria-label="Practice Categories"
          className="flex items-center bg-black/[0.05] p-1 rounded-2xl border border-black/[0.04] w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0"
        >
          <button
            role="tab"
            aria-selected={currentMode === 'minimal_pair'}
            id="tab-mode-minimal-pair"
            onClick={() => onSelectMode('minimal_pair')}
            className={`min-h-[44px] px-4 py-2 text-xs sm:text-[13px] font-medium rounded-xl apple-pressable transition-all cursor-pointer select-none ${
              currentMode === 'minimal_pair'
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.06)] font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Similar Words
          </button>

          <button
            role="tab"
            aria-selected={currentMode === 'dictation'}
            id="tab-mode-dictation"
            onClick={() => onSelectMode('dictation')}
            className={`min-h-[44px] px-4 py-2 text-xs sm:text-[13px] font-medium rounded-xl apple-pressable transition-all cursor-pointer select-none ${
              currentMode === 'dictation'
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.06)] font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Type Words
          </button>

          <button
            role="tab"
            aria-selected={currentMode === 'comprehension_stress'}
            id="tab-mode-stress"
            onClick={() => onSelectMode('comprehension_stress')}
            className={`min-h-[44px] px-4 py-2 text-xs sm:text-[13px] font-medium rounded-xl apple-pressable transition-all cursor-pointer select-none ${
              currentMode === 'comprehension_stress'
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.06)] font-semibold'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Situations
          </button>
        </div>

        {/* Calm View Toggle & Progress */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Turbo Mode Switch */}
          <button
            id="turbo-mode-btn"
            type="button"
            onClick={onToggleTurboMode}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full transition-all apple-pressable cursor-pointer min-h-[44px] border ${
              turboMode
                ? 'bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/30 shadow-sm'
                : 'bg-white text-[#6e6e73] hover:text-[#1d1d1f] border-black/[0.1]'
            }`}
            title="Turbo Challenge: 3s delay then auto-play next"
          >
            <Zap className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden md:inline">
              {turboMode ? 'Turbo On' : 'Turbo'}
            </span>
          </button>

          {/* Calm View Switch (Assistive Access & Cognitive Support) */}
          <button
            id="calm-mode-btn"
            type="button"
            onClick={onToggleCalmMode}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full transition-all apple-pressable cursor-pointer min-h-[44px] border ${
              calmMode
                ? 'bg-[#34c759]/10 text-[#34c759] border-[#34c759]/30 shadow-sm'
                : 'bg-white text-[#6e6e73] hover:text-[#1d1d1f] border-black/[0.1]'
            }`}
            title="Calm View simplifies the screen and reduces extra controls"
          >
            <Sparkles className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden md:inline">
              {calmMode ? 'Calm View On' : 'Calm View'}
            </span>
          </button>

          {stats.streak > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-black/[0.04] text-[#1d1d1f] border border-black/[0.04] rounded-full text-xs font-medium min-h-[44px]">
              <span className="text-[#8e8e93]">Streak</span>
              <span className="font-semibold">{stats.streak}</span>
            </div>
          )}

          {stats.totalAttempted > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-black/[0.04] text-[#1d1d1f] rounded-full text-xs font-medium border border-black/[0.04] min-h-[44px]">
              <span className="text-[#8e8e93]">Accuracy</span>
              <span className="font-semibold text-[#007aff]">{accuracy}%</span>
              <span className="text-[#8e8e93] text-[11px]">
                ({stats.totalCorrect}/{stats.totalAttempted})
              </span>
            </div>
          )}

          <button
            id="open-stats-btn"
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1d1d1f] bg-white hover:bg-black/[0.02] border border-black/[0.1] rounded-full transition-all apple-pressable cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.04)] min-h-[44px]"
            title="View your practice score"
          >
            <BarChart2 className="w-4 h-4 text-[#007aff] stroke-[2]" />
            <span className="hidden sm:inline">Score</span>
          </button>
        </div>
      </div>
    </header>
  );
};

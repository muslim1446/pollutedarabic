import React from 'react';
import { X, Check, AlertCircle, Trash2, TrendingUp, Award } from 'lucide-react';
import { UserStats } from '../types';
import { OXFORD_LEVELS } from '../data/oxfordLevels';

interface StatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onClearStats: () => void;
}

export const StatsDrawer: React.FC<StatsDrawerProps> = ({
  isOpen,
  onClose,
  stats,
  onClearStats
}) => {
  if (!isOpen) return null;

  const overallAccuracy =
    stats.totalAttempted > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div
        id="stats-drawer"
        className="w-full max-w-md h-full bg-white/95 backdrop-blur-2xl border-l border-black/[0.08] p-6 flex flex-col shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007aff]/10 text-[#007aff] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
                Arabic Listening Progress
              </h2>
              <p className="text-xs text-[#8e8e93]">
                Your MSA practice history and scores
              </p>
            </div>
          </div>
          <button
            id="close-stats-drawer-btn"
            onClick={onClose}
            aria-label="Close score card"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#8e8e93] hover:text-[#1d1d1f] hover:bg-black/[0.05] apple-pressable transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-6 flex-1 text-sm">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-black/[0.02] p-3 rounded-2xl border border-black/[0.05] text-center">
              <span className="text-[11px] font-medium text-[#8e8e93] block">
                Accuracy
              </span>
              <div className="text-2xl font-bold text-[#007aff] mt-0.5 tracking-tight">
                {overallAccuracy}%
              </div>
              <span className="text-[10px] text-[#8e8e93]">
                {stats.totalCorrect} of {stats.totalAttempted}
              </span>
            </div>

            <div className="bg-black/[0.02] p-3 rounded-2xl border border-black/[0.05] text-center">
              <span className="text-[11px] font-medium text-[#8e8e93] block">
                Streak
              </span>
              <div className="text-2xl font-bold text-[#1d1d1f] mt-0.5 tracking-tight">
                {stats.streak}
              </div>
              <span className="text-[10px] text-[#8e8e93]">
                Best: {stats.bestStreak}
              </span>
            </div>

            <div className="bg-black/[0.02] p-3 rounded-2xl border border-black/[0.05] text-center">
              <span className="text-[11px] font-medium text-[#8e8e93] block">
                Completed
              </span>
              <div className="text-2xl font-bold text-[#1d1d1f] mt-0.5 tracking-tight">
                {stats.totalAttempted}
              </div>
              <span className="text-[10px] text-[#8e8e93]">
                Questions
              </span>
            </div>
          </div>

          {/* Practice by Category */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider">
              Accuracy by Exercise Type
            </h3>
            <div className="space-y-3 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.05]">
              {Object.entries(stats.modeStats).map(([mode, data]) => {
                const acc =
                  data.attempted > 0
                    ? Math.round((data.correct / data.attempted) * 100)
                    : 0;
                const label =
                  mode === 'minimal_pair'
                    ? 'Similar Words'
                    : mode === 'dictation'
                    ? 'Type Words'
                    : 'Situations';

                return (
                  <div key={mode} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#1d1d1f]">{label}</span>
                      <span className="font-bold text-[#1d1d1f]">
                        {acc}%{' '}
                        <span className="text-[#8e8e93] font-normal">
                          ({data.correct}/{data.attempted})
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#007aff] rounded-full transition-all duration-300"
                        style={{ width: `${acc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Practice by Level */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#007aff]" />
                <span>Accuracy by Level</span>
              </h3>
              <span className="text-[10px] text-[#8e8e93] font-medium">
                MSA · A1 to C1 Scale
              </span>
            </div>
            <div className="space-y-2.5 bg-black/[0.02] p-4 rounded-2xl border border-black/[0.05]">
              {OXFORD_LEVELS.filter((l) => l.id !== 'all').map((lvl) => {
                const data = stats.levelAccuracy?.[lvl.id] || { correct: 0, total: 0 };
                const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

                return (
                  <div key={lvl.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#1d1d1f] bg-white px-1.5 py-0.5 rounded-md border border-black/[0.08] text-[10px]">
                          {lvl.code}
                        </span>
                        <span className="font-medium text-[#1d1d1f]">{lvl.name}</span>
                      </div>
                      <span className="font-bold text-[#1d1d1f]">
                        {acc}%{' '}
                        <span className="text-[#8e8e93] font-normal">
                          ({data.correct}/{data.total})
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1d1d1f] rounded-full transition-all duration-300"
                        style={{ width: `${acc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Questions */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider">
              Recent Questions
            </h3>
            {stats.recentHistory.length === 0 ? (
              <div className="text-xs text-[#8e8e93] p-4 bg-black/[0.02] border border-black/[0.05] rounded-2xl text-center">
                Practice an Arabic exercise to see your recent questions here
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {stats.recentHistory.slice(0, 15).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.05] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {item.correct ? (
                        <Check className="w-4 h-4 text-[#34c759] stroke-[2.5]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[#ff9500] stroke-[2.5]" />
                      )}
                      <div>
                        <span className="font-semibold text-[#1d1d1f] capitalize" lang="ar" dir="auto">
                          {item.word}
                        </span>
                        {item.level && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white border border-black/[0.08] text-[#1d1d1f]">
                            {item.level}
                          </span>
                        )}
                        {!item.correct && item.userAnswer && (
                          <span className="text-[#8e8e93] ml-1.5">
                            (you chose: {item.userAnswer})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8e8e93] font-medium">
                      {item.preset}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Reset all Arabic listening scores and history?')) {
                  onClearStats();
                }
              }}
            className="min-h-[44px] px-3 flex items-center gap-1.5 text-xs text-[#8e8e93] hover:text-[#ff3b30] apple-pressable transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white font-semibold text-xs rounded-full apple-pressable transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

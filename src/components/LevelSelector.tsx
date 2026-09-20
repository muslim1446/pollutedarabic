import React from 'react';
import { OxfordLevel } from '../types';
import { OXFORD_LEVELS } from '../data/oxfordLevels';

interface LevelSelectorProps {
  currentLevel: OxfordLevel;
  onSelectLevel: (level: OxfordLevel) => void;
  itemCounts?: Record<OxfordLevel, number>;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  onSelectLevel,
  itemCounts
}) => {
  const activeLevelObj = OXFORD_LEVELS.find((l) => l.id === currentLevel);

  return (
    <div
      id="level-selector-card"
      className="w-full bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-black/[0.05]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#1d1d1f] tracking-tight">
            Difficulty Level
          </span>
          <span className="text-[11px] text-[#8e8e93]">
            MSA Arabic · A1 to C1 levels
          </span>
        </div>

        {/* Active level badge */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#8e8e93]">Level:</span>
          <span className="font-semibold text-[#1d1d1f]">
            {activeLevelObj?.name}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/20">
            {activeLevelObj?.cefr}
          </span>
        </div>
      </div>

      {/* Level Buttons Grid */}
      <div
        role="group"
        aria-label="Difficulty Level Selection"
        className="grid grid-cols-3 sm:grid-cols-6 gap-2"
      >
        {OXFORD_LEVELS.map((lvl) => {
          const isSelected = currentLevel === lvl.id;
          const count = itemCounts ? itemCounts[lvl.id] : undefined;

          return (
            <button
              key={lvl.id}
              id={`level-btn-${lvl.id}`}
              type="button"
              onClick={() => onSelectLevel(lvl.id)}
              className={`min-h-[46px] flex flex-col items-center justify-center py-2 px-2 rounded-xl text-center apple-pressable transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#007aff] text-white shadow-[0_2px_8px_rgba(0,122,255,0.28)] ring-1 ring-[#007aff]'
                  : 'bg-black/[0.03] hover:bg-black/[0.06] text-[#1d1d1f] border border-black/[0.04]'
              }`}
              title={`${lvl.name} (${lvl.cefr}) - ${lvl.description}`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[13px] font-bold ${
                    isSelected ? 'text-white' : 'text-[#1d1d1f]'
                  }`}
                >
                  {lvl.code}
                </span>
                {count !== undefined && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-black/[0.06] text-[#6e6e73]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-medium leading-tight mt-0.5 truncate max-w-full ${
                  isSelected ? 'text-white/90' : 'text-[#8e8e93]'
                }`}
              >
                {lvl.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { AcousticConfig, AcousticPresetId, NoiseType } from '../types';
import { Phone, Train, Radio, Mic, WifiOff, Sliders, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface PresetSelectorProps {
  currentConfig: AcousticConfig;
  onSelectPreset: (presetId: AcousticPresetId) => void;
  onUpdateConfig: (newConfig: AcousticConfig) => void;
  isAutoMode?: boolean;
  onToggleAutoMode?: (auto: boolean) => void;
  showAutoToggle?: boolean;
}

const PRESET_CARDS: {
  id: AcousticPresetId;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'landline',
    name: 'Phone Call',
    badge: 'Muffled',
    description: 'Slightly muffled audio, like an older telephone call',
    icon: Phone
  },
  {
    id: 'train_pa',
    name: 'Train Station',
    badge: 'Echo',
    description: 'Speaker announcement with room echo and train station sound',
    icon: Train
  },
  {
    id: 'walkie_talkie',
    name: 'Walkie-Talkie',
    badge: 'Radio',
    description: 'Two-way radio with quiet background static',
    icon: Radio
  },
  {
    id: 'intercom_staccato',
    name: 'Intercom',
    badge: 'Speaker',
    description: 'Voice sound coming through a wall speaker',
    icon: Mic
  },
  {
    id: 'cellphone',
    name: 'Weak Cell Signal',
    badge: 'Choppy',
    description: 'Occasional brief dropouts like a phone call with poor reception',
    icon: WifiOff
  },
  {
    id: 'custom',
    name: 'Custom Sound',
    badge: 'Adjustable',
    description: 'Choose your own sound clarity, noise level, and crackle',
    icon: Sliders
  }
];

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentConfig,
  onSelectPreset,
  onUpdateConfig,
  isAutoMode,
  onToggleAutoMode,
  showAutoToggle
}) => {
  const [showCustomSliders, setShowCustomSliders] = useState(false);

  const handleSliderChange = <K extends keyof AcousticConfig>(
    key: K,
    value: AcousticConfig[K]
  ) => {
    onUpdateConfig({
      ...currentConfig,
      presetId: 'custom',
      name: 'Custom',
      [key]: value
    });
  };

  return (
    <div
      id="acoustic-environments-card"
      className="w-full bg-white border border-black/[0.06] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4 transition-all"
    >
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/[0.06]">
        <div>
          <h3 className="text-base font-semibold text-[#1d1d1f] tracking-tight">
            Background Sounds
          </h3>
          <p className="text-xs text-[#8e8e93]">
            Choose what kind of background noise to listen through
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {showAutoToggle && (
            <label className="flex items-center gap-2 text-xs font-medium text-[#1d1d1f] cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAutoMode} 
                onChange={(e) => onToggleAutoMode?.(e.target.checked)}
                className="w-4 h-4 rounded border-black/[0.16] text-[#007aff] focus:ring-[#007aff]"
              />
              Auto-Select
            </label>
          )}
          <div className="text-xs font-semibold text-[#007aff] bg-[#007aff]/10 px-3 py-1.5 rounded-full border border-[#007aff]/20">
            Active: {currentConfig.name}
          </div>
        </div>
      </div>

      {/* Grid of Sound Cards */}
      <div
        role="radiogroup"
        aria-label="Background Sounds"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {PRESET_CARDS.map(({ id, name, badge, description, icon: Icon }) => {
          const isSelected = currentConfig.presetId === id;
          return (
            <button
              key={id}
              id={`preset-btn-${id}`}
              onClick={() => {
                onSelectPreset(id);
                if (id === 'custom') {
                  setShowCustomSliders(true);
                }
              }}
              className={`min-h-[88px] p-4 rounded-2xl border text-left transition-all apple-pressable cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-[#007aff]/[0.03] border-[#007aff] ring-1 ring-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.15)]'
                  : 'bg-white border-black/[0.08] hover:border-black/[0.16] hover:bg-black/[0.01]'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#007aff] text-white'
                        : 'bg-black/[0.04] text-[#6e6e73]'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-[#1d1d1f] block leading-tight">
                      {name}
                    </span>
                    <span className="text-[11px] font-medium text-[#8e8e93]">
                      {badge}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4.5 h-4.5 text-[#007aff] stroke-[2.5] shrink-0" />
                )}
              </div>

              <p className="text-xs text-[#8e8e93] leading-relaxed">
                {description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Expandable Custom Parameters Panel */}
      {(showCustomSliders || currentConfig.presetId === 'custom') && (
        <div className="mt-4 p-5 bg-black/[0.02] border border-black/[0.06] rounded-2xl space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1d1d1f] pb-3 border-b border-black/[0.06]">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#007aff]" />
              Sound Adjustments
            </span>
            <button
              onClick={() => setShowCustomSliders(false)}
              className="min-h-[44px] px-3 text-[#007aff] hover:underline font-medium cursor-pointer flex items-center"
            >
              Hide Controls
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Low-cut filter */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6e6e73] font-medium">Low Pitch (Bass)</span>
                <span className="font-semibold text-[#1d1d1f]">{currentConfig.highPassHz}</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={currentConfig.highPassHz}
                onChange={(e) =>
                  handleSliderChange('highPassHz', parseInt(e.target.value, 10))
                }
                className="w-full h-2 bg-black/[0.1] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-[#8e8e93] block">Cuts lower voice tones</span>
            </div>

            {/* High-cut filter */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6e6e73] font-medium">High Pitch (Clarity)</span>
                <span className="font-semibold text-[#1d1d1f]">{currentConfig.lowPassHz}</span>
              </div>
              <input
                type="range"
                min="1500"
                max="8000"
                step="100"
                value={currentConfig.lowPassHz}
                onChange={(e) =>
                  handleSliderChange('lowPassHz', parseInt(e.target.value, 10))
                }
                className="w-full h-2 bg-black/[0.1] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-[#8e8e93] block">Softens high tones</span>
            </div>

            {/* Noise Level */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6e6e73] font-medium">Background Noise</span>
                <span className="font-semibold text-[#1d1d1f]">Level {30 - currentConfig.snrDb}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={currentConfig.snrDb}
                onChange={(e) => handleSliderChange('snrDb', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-black/[0.1] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-[#8e8e93] block">Slide right for cleaner sound</span>
            </div>

            {/* Crackle / Distortion */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6e6e73] font-medium">Radio Crackle</span>
                <span className="font-semibold text-[#1d1d1f]">{currentConfig.distortionDrive}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={currentConfig.distortionDrive}
                onChange={(e) =>
                  handleSliderChange('distortionDrive', parseInt(e.target.value, 10))
                }
                className="w-full h-2 bg-black/[0.1] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-[#8e8e93] block">Adds scratchy radio sound</span>
            </div>
          </div>

          {/* Background Noise Type */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-black/[0.06] text-xs">
            <span className="text-[#6e6e73] font-medium">Background Type:</span>
            {[
              { type: 'off', label: 'None' },
              { type: 'pink', label: 'Cafe Chatter' },
              { type: 'white', label: 'Soft Hiss' },
              { type: 'radio_hum', label: 'Quiet Hum' },
              { type: 'subway_rumble', label: 'Low Rumble' }
            ].map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSliderChange('noiseType', type as NoiseType)}
                className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-full apple-pressable border transition-all cursor-pointer ${
                  currentConfig.noiseType === type
                    ? 'bg-[#007aff] text-white border-[#007aff] shadow-[0_1px_3px_rgba(0,122,255,0.3)] font-semibold'
                    : 'bg-white text-[#1d1d1f] border-black/[0.08] hover:bg-black/[0.03]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { AcousticConfig, AcousticPresetId } from '../types';

export const ACOUSTIC_PRESETS: Record<AcousticPresetId, AcousticConfig> = {
  cellphone: {
    presetId: 'cellphone',
    name: 'Weak Cell Signal',
    description: 'AMR-NB codec (250-3400Hz) with 20ms frame-loss concealment, digital companding, and GSM TDMA buzz.',
    highPassHz: 250,
    lowPassHz: 3400,
    distortionDrive: 14,
    snrDb: 12,
    noiseType: 'white',
    packetLossRate: 18,
    reverbWet: 0.0
  },
  landline: {
    presetId: 'landline',
    name: 'Phone Call',
    description: 'POTS voiceband (300-3400Hz, ITU-T G.712), 2kHz earcap cavity resonance, 60/120Hz mains induction, and carbon mic saturation.',
    highPassHz: 300,
    lowPassHz: 3400,
    distortionDrive: 18,
    snrDb: 22,
    noiseType: 'radio_hum',
    packetLossRate: 0,
    reverbWet: 0.02
  },
  train_pa: {
    presetId: 'train_pa',
    name: 'Train Station',
    description: 'Acoustic compression horn (450-5000Hz, 2.2kHz throat peak) with 4.5s cavernous concourse decay and sub-bass track rumble.',
    highPassHz: 450,
    lowPassHz: 5000,
    distortionDrive: 28,
    snrDb: 10,
    noiseType: 'subway_rumble',
    packetLossRate: 0,
    reverbWet: 0.65
  },
  intercom_staccato: {
    presetId: 'intercom_staccato',
    name: 'Office Intercom',
    description: '3-inch wall speaker with enclosure resonance (1.1kHz & 3.1kHz), LM386 rail clipping, and analog VOX squelch chatter.',
    highPassHz: 420,
    lowPassHz: 3800,
    distortionDrive: 38,
    snrDb: 14,
    noiseType: 'pink',
    packetLossRate: 14,
    reverbWet: 0.08
  },
  walkie_talkie: {
    presetId: 'walkie_talkie',
    name: 'Walkie-Talkie',
    description: 'Tactical narrowband FM (350-3000Hz) with transmitter pre-emphasis limiter, 2.4kHz presence boost, and squelch tail burst.',
    highPassHz: 350,
    lowPassHz: 3000,
    distortionDrive: 42,
    snrDb: 8,
    noiseType: 'white',
    packetLossRate: 6,
    reverbWet: 0.01
  },
  custom: {
    presetId: 'custom',
    name: 'Custom Settings',
    description: 'Manually adjust the sound clarity, background noise, and static.',
    highPassHz: 300,
    lowPassHz: 3400,
    distortionDrive: 20,
    snrDb: 12,
    noiseType: 'pink',
    packetLossRate: 10,
    reverbWet: 0.15
  }
};
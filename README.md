# Listening Practice — Acoustic Ear: Degraded-Speech ARABIC Listening Practice Prototype

**An independent, unaccredited Modern Standard Arabic (MSA) listening-practice prototype for degraded acoustic conditions: telephone bandpass, train-station PA reverberation, intercom staccato, walkie-talkie overdrive, and weak-cell packet loss — with real intelligible Arabic speech audio for every item (human Commons/Lingua Libre recordings where available, Edge neural TTS `ar-SA-ZariyahNeural` elsewhere), IPA-annotated emphatic/pharyngeal/uvular minimal pairs, a 3,600-word educational-safe MSA vocabulary, and 1,020 template-generated practice scenarios with full-sentence audio.**

> **Honesty notice — read first.** This is a hybrid: the core audio and linguistic foundations reuse real, well-established industry and academic standards, but the actual tuning, corpus tagging, and scenario writing are author-crafted heuristics. Difficulty levels and scenario prompts are **author-designed practice materials, not an officially accredited or certified test suite**. Converted from the English build with **100% of the DSP, app-pipeline, scoring and storage logic unchanged** — only language content (corpus, strings, TTS voice, scoring synonyms) was adapted. See [§0](#0-honesty-statement--what-is-standard-vs-what-is-author-made) and [§14](#14-limitations-threats-to-validity-and-known-defects--nothing-hidden).

- App display name (`metadata.json`, `index.html`): **Listening Practice · Arabic (MSA)** (brand: **Polluted Arabic**)
- Internal engine / pipeline name (code, scripts, User-Agent strings): **Acoustic Ear / AcousticEarTrainer** (unchanged)
- Current shipped corpus (`public/data/vocabulary.json`): **version `3.0.0` (`language: "ar"`), 12,000 words + 3,500 scenarios, educational-safe, verified 2026-09-20** (English v2.1.0 backup kept at `public/data/vocabulary.v2.1.0-english.backup.json`)
- Audio store (`public/audio/`): **4,620 × Arabic MP3 files (44.1 kHz / 128 kbps / mono, ~267 MB), 100% coverage verified 2026-09-20 — every word and every scenario transcript has real intelligible Arabic speech audio; recount with `Get-ChildItem public/audio/ar-*.mp3`** (provenance: 173 kept Wikimedia Commons/Lingua Libre human recordings + 4,447 Edge Neural TTS `ar-SA-ZariyahNeural` generations, 0 failures — see §6.7; the sine-tone fallback in code is now a never-triggered last resort; legacy English MP3s were deleted 2026-09-20, so `public/audio/` holds Arabic files only)
- Stack: **React 19 + Vite 8 + TypeScript + Tailwind CSS 4 + Web Audio API DSP + Wiktionary/Commons human speech + Edge Neural TTS (`ar-SA-ZariyahNeural`) + localStorage analytics**
- Licence status: **code licence not declared in repository; linguistic/audio data carry third-party copyleft and attribution obligations — see §13. You must attribute before any university submission. Not an Oxford University Press product. Not affiliated with or endorsed by Microsoft (Edge TTS), Wiktionary, or Wikimedia.**

---

## Table of Contents

0. [Honesty Statement — What Is Standard vs What Is Author-Made](#0-honesty-statement--what-is-standard-vs-what-is-author-made)
1. [Abstract](#1-abstract)
2. [Problem Statement — Why This Exists](#2-problem-statement--why-this-exists)
3. [Research Questions, Aims, and Learning Outcomes](#3-research-questions-aims-and-learning-outcomes)
4. [Theoretical Foundations](#4-theoretical-foundations)
5. [What This System Is / Is Not (Scope)](#5-what-this-system-is--is-not-scope)
6. [Corpus Specification — The Oxford-Levelled Listening Corpus](#6-corpus-specification--the-oxford-levelled-listening-corpus)
7. [Acoustic Degradation Engine — Full DSP Disclosure](#7-acoustic-degradation-engine--full-dsp-disclosure)
8. [Training Modes and Pedagogy](#8-training-modes-and-pedagogy)
9. [Application Architecture and Code Map](#9-application-architecture-and-code-map)
10. [Installation, Configuration, and Running](#10-installation-configuration-and-running)
11. [Corpus Build Pipelines — Reproducibility](#11-corpus-build-pipelines--reproducibility)
12. [User Manual](#12-user-manual)
13. [Ethics, Privacy, Accessibility, Licensing, and Attribution](#13-ethics-privacy-accessibility-licensing-and-attribution)
14. [Limitations, Threats to Validity, and Known Defects — Nothing Hidden](#14-limitations-threats-to-validity-and-known-defects--nothing-hidden)
15. [Evaluation Plan and Future Work](#15-evaluation-plan-and-future-work)
16. [References](#16-references)
17. [Appendices](#17-appendices)

---

## 0. Honesty Statement — What Is Standard vs What Is Author-Made

This project is a hybrid. The architecture is pedagogically and acoustically legitimate — not random gibberish — but the implementation is an independent prototype. **View difficulty levels and scenario prompts as author-designed practice materials, not an officially accredited test suite.**

### 0.1 What uses a real, recognised standard

**A. Telecommunications & audio engineering — UNCHANGED from the English build**

- **ITU-T narrowband telephony (PSTN, nominal 300–3,400 Hz):** the `landline` preset's 300 Hz high-pass / 3,400 Hz low-pass uses this international standard band. Only the band edges are standard; all other preset numbers are author-tuned (see §0.2). **The entire DSP engine (`AudioEngine.ts`, `presets.ts`) is byte-for-byte identical to the English build** — Arabic speech passes through the same graph because the pedagogy (band-limiting kills سibilance energy for س/ص just as it did for /s/–/θ/) transfers physically.
- **W3C Web Audio API:** the degradation graph directly implements official `BiquadFilterNode`, `WaveShaperNode`, `ConvolverNode`, and `AnalyserNode` semantics. No custom audio standard is claimed.
- **Paul Kellett pink-noise filter:** pink noise uses the standard 6-pole Kellett IIR approximation for 1/f noise (coefficients reproduced verbatim in `AudioEngine.ts`).
- **Signal-to-Noise Ratio (SNR) decibels:** noise gain uses the standard formula `g = 0.35 × 10^(−SNR/20)`, anchored to an **assumed** digital speech reference (~−12 dBFS class). This is a digital-domain calculation, **not** a sound-pressure-level calibration with measurement equipment.

**B. Linguistics & language learning**

- **CEFR (Council of Europe, Companion Volume 2020):** A1–C1 labels are used only as familiar organisation bins. They are **CEFR-inspired, author-assigned strata — not CEFR-certified, not Rasch-calibrated, not examiner-moderated**. Reference consulted (not copied): the Arabic CEFR Classified List (8,834 MSA lemmas, Buckwalter + KELLY + Al-Kitaab via MADAMIRA — Khallaf et al.).
- **IPA (International Phonetic Alphabet):** phoneme contrasts are documented with standard IPA symbols including Arabic-specific articulations (`/sˤ tˤ dˤ ðˤ/` emphatics, `/ħ ʕ/` pharyngeals, `/q x ɣ/` uvulars, `/ː/` length). Only curated/minimal-pair subsets have trustworthy IPA; 3,358 `general_vocab` items carry placeholder `/{word}/` (see §14).
- **Speech-perception research:** exercise design is informed by Flege's Speech Learning Model (SLM), Best's Perceptual Assimilation Model (PAM-L2), and Functional Load Theory — plus the Arabic-specific emphatic-perception literature (Aldamen & Al-Deaibes 2023: VOT reliable for stops, F1↑/F2↓/F3↑ vowel cues; Hayes-Harb & Durham 2016 and Reading LSWP-9: [a] context easiest, [u]/[i] hardest; Al Mahmoud 2013 PAM predictions for pharyngeal/uvular contrasts; Lowe 2025: vowel cues dominate for English L1 learners). These theories motivate the design; they do not validate this app's efficacy.

**C. Accessibility & web standards**

- **WCAG 2.2 AA intent (not certified):** 44–50 px targets, high-contrast focus rings, screen-reader text, keyboard operation, and Calm View aim at WCAG 2.2 AA. No independent accessibility audit has been performed; do not cite this app as WCAG-certified.

### 0.2 What is just the developer's own head (author-crafted heuristics)

1. **CEFR / "Oxford" levels are author-assigned, not certified.** Not an Oxford University Press product, not OOPT-certified. Words were binned to A1–C1 by ar_50k frequency rank plus developer curation against the Arabic CEFR Classified List and CAMeL MSA frequencies, not standardised testing. C2 was deliberately omitted because there was no objective way to classify it here.
2. **Preset settings were tuned by ear, not calibrated equipment — and deliberately NOT re-tuned for Arabic.** The DSP files are byte-identical to the English build: while 300–3,400 Hz is standard telephone bandwidth, values such as "28% packet loss", "drive = 45", "reverbWet = 0.38" are arbitrary values chosen because they "sounded like an office intercom / station PA". The packet-loss chopper uses plain `Math.random()`, **not** a standard telecom loss model such as Gilbert-Elliott burst loss, and uses no fixed seed, so repeats are not acoustically identical.
3. **Template-generated Arabic scenarios.** The 1,020 scenarios (airport, metro, café, campus, workplace, emergency — all MSA with Arabic-Indic digits and gender/case-checked templates) are programmatic Mad Libs with `{CITY}`, `{GATE}`, `{TIME}` token substitution in `generate_arabic_corpus.js`. They were not vetted by professional language examiners, distractor plausibility was not human-rated, and a few option lists were padded with `"لا شيء مما ذُكر"` / `"خيار غير محدد"`.
4. **Legacy sine-tone fallback (now dormant).** `AudioEngine.generateSyntheticSpeechBuffer()` remains in code as a defensive last resort, but since the 2026-09-20 full-audio fill it is never triggered: all 3,600 words and 1,020 scenario transcripts have real Arabic speech MP3s on disk (see §6.7). The fallback equation (140 Hz + 700/1,700/2,800 Hz sine partials, no lexical content, not a human voice) is documented here so reviewers know what would play if an audio file were deleted or corrupted. The UI does not badge human-Commons vs neural-TTS playback — voice heterogeneity is disclosed in §6.7 instead.

---

## 1. Abstract

Classroom listening materials are almost always **pristine**: studio-recorded, close-miked, noise-free, full-bandwidth (20 Hz–20 kHz), with careful enunciation. Real-world Arabic listening is the opposite: a gate-change announcement (`الرحلة SV 102 … البوابة السابعة عشرة`) band-limited to 300–3,400 Hz through a reverberant PA horn at +5 dB SNR; a hall number through a crackling intercom with author-set 28% packet loss; a prescription number through a walkie-talkie in hard clipping at 0 dB SNR; a conference PIN through a weak cell link with random 30–90 ms dropouts. The numbers after this sentence are the app's author-chosen preset values, not lab-measured channel specifications.

This prototype attempts to narrow that **ecological-validity gap**. It is a client-side web application that:

1. Serves **real intelligible Arabic speech audio for every item** (Wikimedia Commons / Lingua Libre human recordings kept where available — 173 files, Edge Neural TTS `ar-SA-ZariyahNeural` elsewhere — 44.1 kHz / 128 kbps / mono, 0 missing): single-word recordings for vocabulary stimuli and full-transcript recordings for all 1,020 scenarios, annotated with **IPA (trustworthy only for curated/minimal-pair subsets; placeholder `/{word}/` elsewhere), part of speech, author-assigned A1–C1 level (not certified), minimal-pair contrast, target phoneme, and Latin transliteration gloss**.
2. Passes that audio at playback time through a **fully disclosed, real-time Web Audio DSP graph** that simulates five author-tuned degraded channels (byte-identical to the English build: not lab-calibrated, tuned by ear) plus a fully adjustable custom channel.
3. Trains and measures three skills: **(a) minimal-pair phoneme discrimination — emphatics س/ص، ت/ط، د/ض، ذ/ظ; pharyngeals ح/ه، ع/أ; uvulars ق/ك، خ/غ; interdentals ث/س، ذ/ز; vowel quantity; shadda gemination, (b) dictation under degradation (Arabic-script RTL input with alef/hamza/diacritic-insensitive scoring plus Arabic↔Western↔Arabic-Indic digit synonyms), (c) situated comprehension under stress** (multiple-choice over template-generated airport, metro, café, campus, workplace, and emergency scenarios — programmatic MSA Mad Libs, not examiner-vetted).
4. Tracks **per-phoneme, per-mode, and per-author-assigned-level accuracy, streaks, and item history entirely on-device**, with an instant **Clean Audio A/B bypass** for perceptual realignment and a low-distraction **Calm View** plus **Read Aloud (ar-SA voice)** for accessibility.

The shipped corpus contains **3,600 MSA vocabulary entries** (author-binned A1: 700, A2: 750, B1: 800, B2: 700, C1: 650; of which 242 are minimal-pair entries and 3,358 are general-vocabulary entries; explicit-sexuality blocklist applied to the frequency fill) and **1,020 template-generated practice scenarios** (A1: 136, A2: 136, B1: 221, B2: 306, C1: 221). Audio coverage verified 2026-09-20 is **4,620 Arabic MP3s on disk, 0 missing of 4,620 referenced URLs** (legacy English MP3s deleted 2026-09-20 — Arabic files only): every word has a real single-word Arabic recording and every scenario has a real full-transcript Arabic recording (see §6.6–§6.7). Nothing is concealed: the counts, the per-file provenance mix (Commons human vs Edge neural), the 15 same-source collision regenerations, and the template-generation method are all documented below so that an independent reviewer can reproduce and critique them.

---

## 2. Problem Statement — Why This Exists

### 2.1 The WHAT

A React + Web Audio application that makes clean study audio **deliberately hard in controlled, measurable ways**, then teaches the learner to recover meaning — exactly as they must at an Arabic airport, metro station, university intercom, clinic, or on a phone call.

### 2.2 The HOW (one paragraph)

The browser fetches `/data/vocabulary.json` (v3.0.0, `language: "ar"`) and `/audio/ar-*.mp3` (vocabulary modes) or `/audio/ar-scenario_{n}.mp3` (Situations mode — full-transcript `ar-SA-ZariyahNeural` recording), decodes to an `AudioBuffer`, and routes it through `AudioEngine.play(url, config)`: an optional packet-loss chopper (`Math.random()`, unseeded — not Gilbert-Elliott) → high-pass biquad → low-pass biquad → WaveShaper saturation → dry/wet convolver reverb → master gain + `AnalyserNode`, with a parallel band-limited noise loop mixed at an author-scaled digital-domain SNR (formula-standard, SPL-uncalibrated). A `clean: true` flag bypasses the entire chain for A/B comparison. Answers are scored client-side (exact match, then Arabic-orthography forgiving match via `normalizeArabic()` — alef/hamza forms, ta-marbuta/ha, alef-maqsura/ya, tashkeel — plus a disclosed Arabic number-synonym table covering Western digits ↔ MSA words ↔ Arabic-Indic digits, e.g. `"4"↔"أربعة"↔"٤"`), and all analytics persist in `localStorage` (Arabic stats keys `…_v6_ar` / `…_v2_ar`, separated from legacy English history). The sine-tone `generateSyntheticSpeechBuffer()` fallback remains in code but never fires (0 missing audio — verified).

### 2.3 The WHY

1. **Transfer failure.** Learners who score 95% on clean audio routinely fail on the same words at 0–5 dB SNR or under 300–3,400 Hz band-limiting, because high-frequency cues for `/s/–/sˤ/`, `/θ/–/s/`, `/ʃ/–/s/` and vowel F2 cues for emphatic contexts are removed, and pharyngeal/uvular landmarks (`/ħ/`, `/ʕ/`, `/q/`) smear under clipping and reverb. Standard courseware never trains this.
2. **Safety and mobility.** Mishearing `سَيْف/صَيْف` (sword/summer), `قَلْب/كَلْب` (heart/dog), `ثَلاثَة/ثَلاثُون` (3/30), `عَرْض/أَرْض` (presentation/land), or gate/platform/pharmacy numbers has material consequences. The corpus therefore over-samples numbers, transit, and emergency vocabulary by design.
3. **Phonological theory.** Minimal-pair discrimination is the classic probe of phoneme-category formation in L2 acquisition — and Arabic emphatics are its textbook hard case (36–63% L2 perception error in published studies). This system operationalises emphatic, pharyngeal, uvular, interdental, quantity and gemination contrasts at scale with per-phoneme learning curves.
4. **Equity and access.** Degraded-channel competence is disproportionately needed by international students, migrants, and hard-of-hearing users navigating PA and phone systems. Calm View, large touch targets, keyboard operation, RTL Arabic input, transliteration hints, and ar-SA Read Aloud are therefore core, not add-ons.

---

## 3. Research Questions, Aims, and Learning Outcomes

### 3.1 Research questions

- **RQ1 (discrimination):** Does repeated degraded-channel minimal-pair practice improve discrimination of targeted contrasts (e.g. `/s/–/sˤ/`, `/t/–/tˤ/`, `/ħ/–/h/`, `/ʕ/–/ʔ/`, `/q/–/k/`, unit-vs-ten `ثَلاثَة–ثَلاثُون`) as measured by per-phoneme accuracy at fixed digital-domain SNR? (Untested — no efficacy trial has been run.)
- **RQ2 (robustness):** Does dictation accuracy degrade monotonically with decreasing SNR / narrowing bandwidth / increasing packet loss, and does the slope flatten with practice?
- **RQ3 (transfer):** Does single-word training transfer to scenario comprehension (full-announcement `ar-SA-ZariyahNeural` audio + Arabic/English text, multiple choice) at the same author-assigned level? Note: scenario wording is template-generated, voices are neural — see §6.6.
- **RQ4 (perceptual recalibration, not equipment calibration):** Can the Clean Audio A/B bypass accelerate perceptual recalibration versus degraded-only repetition?
- **RQ5 (level ordering — author bins only):** Do A1→C1 accuracy gradients follow the app's author-assigned difficulty ordering under identical acoustic conditions? This would test internal consistency of author bins, not CEFR validity.

The app does not itself run the RCT — it **instruments** the data (per-phoneme, per-level, per-preset history) that would answer these questions. See §15 for the proposed design.

### 3.2 Aims

- Provide ≥3,000 author-stratified MSA word stimuli with IPA (curated subsets only) and real Arabic speech audio for every item (Commons/Lingua Libre human where available, Edge `ar-SA-ZariyahNeural` elsewhere).
- Provide ≥1,000 template-generated MSA practice scenarios across six real-world domains (airport, rail/subway, café/restaurant, campus, workplace, emergency/utilities) — unvetted Mad Libs for practice, not validated test items.
- Simulate five author-tuned degraded channels that roughly evoke real channels, with physically interpretable but uncalibrated parameters.
- Measure learning without a server (privacy-preserving, offline-capable after first load).

### 3.3 Author-assigned level descriptors (not CEFR-certified)

| Level | Label (this app) | Learner will be able to … under degradation |
|---|---|---|
| A1 | Beginner | Distinguish Arabic numbers (ثَلاثَة/ثَلاثُون, ١١/١٢), emphatic س/ص and ت/ط (`سَيْف/صَيْف`, `تِين/طِين`), ع/أ (`عَلَم/أَلَم`, `عَيْن/أَيْن`), and follow gate/hall instructions. |
| A2 | Elementary | Follow shuttle, library, clinic, and café announcements; distinguish long/short vowels, ث/س, ذ/ز, ل/ر, and shadda doubling (`حَمَام/حَمَّام`). |
| B1 | Intermediate | Follow exam, lab-safety, and workplace messages; distinguish ح/ه, خ/ح, ش/س, ز/س voicing, and Form-II causatives (`نَظِيف/نَظَّفَ`). |
| B2 | Upper Intermediate | Follow fast PA discourse and policy announcements; handle ordinals, union/devotional vocabulary, near-minimal fricatives (ظ/ز, ث/ت) and rapid speech. |
| C1 | Advanced | Resolve Form I vs Form II gemination (`دَرَسَ/دَرَّسَ`, `عَلِمَ/عَلَّمَ`, `كَسَرَ/كَسَّرَ`) and formal governance discourse. |

C2 is **deliberately excluded**: the source wordlists (Google 10K + curated academic lists) and the OOPT mapping used here do not support reliable C2 stratification. Claiming C2 would be dishonest; see §14.

---

## 4. Theoretical Foundations (standards that inform us vs claims we do not make)

Real standards reused here: CEFR 2020 bins (organisation only), IPA symbols, ITU-T 300–3,400 Hz band edges, W3C Web Audio nodes, Kellett pink-noise filter, standard SNR decibel math, and WCAG 2.2 AA intent. None of these certifies this app. Preset values, level assignments, template wording, and the neural-voice choice below are author heuristics (see §0.2 and §14).

1. **L2 speech perception (Flege SLM; Best PAM-L2).** Non-native listeners assimilate L2 contrasts to L1 categories — Arabic emphatics classically assimilate to their plain counterparts (single-category assimilation), which is why published L2 error rates reach 36–63%. Minimal-pair training with immediate feedback and clean-bypass realignment directly targets category boundary formation, with vowel-context stratification ([a] easiest → [u]/[i] hardest) built into the level bins.
2. **Functional load.** Contrasts are prioritised by communicative cost: emphatic/plain sets (`س/ص`, `ت/ط`, `د/ض`, `ذ/ظ`), pharyngeal/uvular landmarks (`ح/ه`, `ع/أ`, `ق/ك`), sibilant voicing/place (`ز/س`, `ش/س`, `ث/س`), `/l/–/r/`, gemination, and unit-vs-ten numbers (`ثَلاثَة/ثَلاثُون`) — all heavily represented because confusing them breaks numbers, transit, worship-time and safety messages.
3. **CEFR (Council of Europe, Companion Volume 2020) + Oxford-style banding (naming only).** Levels A1–C1 in `src/data/oxfordLevels.ts` are author-assigned by ar_50k frequency rank + curated MSA core lists cross-checked against the Arabic CEFR Classified List and CAMeL MSA frequencies, not Rasch-calibrated, not examiner-moderated, not Oxford University Press-certified, not OOPT-certified. Reviewers must treat these as author-assigned strata (documented per item in `level` fields), not externally validated judgements. C2 omitted deliberately — no objective basis to classify it here.
4. **Ecological-validity aim (Bronfenbrenner; Lincoln & Guba).** Practice stimuli attempt to evoke the noise, reverberation, and dropouts of the target domain rather than idealising them away — but preset values were tuned by ear, not measured in the field.
5. **Cognitive load + Universal Design for Learning (aim, not certification).** Calm Mode (hides the animated waveform), Read Aloud (`ar-SA` SpeechSynthesis for Arabic prompts), RTL Arabic input/buttons with `lang="ar"`, transliteration hints, 44–50 px targets, focus rings, and keyboard shortcuts aim at multiple means of representation and action and at WCAG 2.2 AA intent. No accessibility audit has been performed.
6. **Desirable difficulties (Bjork).** Controlled degradation + spaced shuffling + immediate clean-bypass feedback is intended to make retrieval effortful but recoverable.

---

## 5. What This System Is / Is Not (Scope)

**It is:**

- An independent degraded-listening ARABIC (MSA) practice prototype + author-built MSA corpus + disclosed DSP + build pipelines. DSP, app pipeline, scoring structure and storage logic are identical to the English build; only language content changed.
- Fully client-side after asset load; no account, no server-side grading, no network telemetry.

**It is not:**

- Not an Oxford University Press product and not OOPT-certified, not CEFR-certified, not university-accredited. “Oxford Levels” here means author-assigned Oxford-style A1–C1 bins labelled for study organisation only, with per-level counts disclosed. Do not cite as certified proficiency levels.
- Not Modern Standard Arabic as spoken natively everywhere: MSA is the formal pan-Arab standard (news, airports, education). Dialects (Egyptian, Levantine, Gulf, Maghrebi) reshape many sounds (e.g. ث→ت/س, ذ→د/ز, ج→g/ž, ق→ʔ/g); dialect variation is discussed in docs and audible in a minority of human recordings, but the corpus teaches MSA only.
- Not a speech recogniser or pronunciation grader; it scores typed/selected answers, not learner speech.
- Not a clinical audiology device; no hearing diagnosis is performed or implied.
- Not a Gemini AI application at present despite `metadata.json` declaring `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` and `.env.example` defining `GEMINI_API_KEY`/`APP_URL`. **No code path in `src/` calls Gemini at time of writing.** That capability flag is scaffold boilerplate and must not be cited as an AI feature. This is disclosed here precisely so examiners are not misled.

---

## 6. Corpus Specification — The Author-Stratified MSA Practice Corpus (Oxford-Style Labels Only)

### 6.1 Snapshot (measured 2026-09-20, not estimated)

Measured with `node -e "…" public/data/vocabulary.json` and `Get-ChildItem public/audio/ar-*.mp3` on 2026-09-20 (after the full-audio fill):

- `version`: `"3.0.0"`, `language`: `"ar"`, `generatedAt`: ISO timestamp at generation time, file size **1,762.9 KB**. `contentPolicy`: educational-safe MSA (explicit-sexuality whole-token blocklist applied to the frequency fill; 0 removals needed beyond the filter; scenario transcripts profanity-free). `audioCoverage`: all words + all scenarios have audio, 0 missing.
- **Words: 3,600. Scenarios: 1,020.**
- Word levels (author-assigned, not certified): **A1 700, A2 750, B1 800, B2 700, C1 650.**
- Scenario levels (author-assigned, not certified): **A1 136, A2 136, B1 221, B2 306, C1 221.**
- Word categories (shipped generator vocabulary): **`minimal_pair` 242, `general_vocab` 3,358** (607 hand-curated MSA core + 2,751 ar_50k frequency fill). The `category` union in `src/types/index.ts` now includes `general_vocab` — the schema drift from the English build is fixed.
- Audio files present: **4,620 Arabic MP3s** in `public/audio/` (~267 MB, Arabic files only — legacy English MP3s deleted 2026-09-20), all 44.1 kHz / 128 kbps / mono. **0 missing of 3,600 word URLs and 0 missing of 1,020 scenario URLs — verified.**

### 6.2 Provenance — where every byte came from and under what licence

| Source | What was taken | How | Licence / obligation |
|---|---|---|---|
| English Wiktionary Arabic entries (`en.wiktionary.org/w/api.php?action=parse…prop=wikitext`, `==Arabic==` section) | `{{audio\|ar\|…}}` filename, `{{IPA\|ar\|…}}` string, `{{ar-pr}}` inline `<a:…>` audio | `scrapeArabicWiktionary()` in `scripts/ingest_arabic_audio.js`; vocalized form tried first, then tashkeel-stripped title | **CC BY-SA 4.0.** You must credit Wiktionary contributors and share adaptations alike. |
| Wikimedia Commons file search + Lingua Libre uploads | Direct OGG/WAV URLs: `Ar-{word}.ogg` Shtooka legacy files + `LL-Q… (ara/ary/arz/ajp/apc)-…-{word}.wav` volunteer recordings | `searchCommonsArabic()` + `resolveCommonsUrl()` in `scripts/ingest_arabic_audio.js`; 188 pair words resolved, 173 kept (15 same-source collisions regenerated — see §6.7) | Per-file licences (mostly **CC BY-SA / CC0** depending on speaker upload). You must retain per-file attribution for redistribution; the pipeline does not currently write a per-file credit roll — see §14 as a submission risk. Dialect tags (ara = MSA + ary/arz/ajp/apc dialects) are disclosed in §6.7/§14. |
| hermitdave ar_50k (`FrequencyWords/content/2016/ar/ar_50k.txt`, OpenSubtitles-derived rank) | Frequency-ranked MSA-leaning surface forms, filtered to Arabic-block-only tokens with ≥3 Arabic letters | Fetched live by `scripts/generate_arabic_corpus.js`, strict filters (no Latin/digits, tashkeel-stripped, 48,509 candidates after filtering, whole-token profanity blocklist), stratified by rank into A1→C1 quotas | Open GitHub frequency resource; subtitle-register noise and dialect admixture documented in §14; verify institutional policy before commercial redistribution. |
| CAMeL Arabic Frequency Lists (CAMeLBERT 12.6B-token MSA split) + Arabic CEFR Classified List (8,834 lemmas, Buckwalter+KELLY+Al-Kitaab/MADAMIRA) | Reference only: sanity-checked level bins and MSA frequency ordering against the ar_50k fill | Consulted during curation, not bundled | Respective dataset licences; cited, not redistributed. |
| Curated MSA core (author-written in `generate_arabic_corpus.js`) | 607 hand-listed A1–C1 words (daily life, transit, campus, clinic, workplace, governance) with POS tags | Checked into `scripts/` | Original to this project; no third-party restriction. |
| Template-generated MSA scenarios (author-written templates in `generate_arabic_corpus.js`) | 1,020 scenarios from 6 domain groups × item templates × deterministic token substitution (Arabic-Indic digits, gender/case-checked ordinals) | `DOMAIN_TEMPLATES` + `replaceTokens()` (cities, flights, times, gates, dishes, etc.) | Original to this project but **author-written templates, unmoderated by examiners** — see §6.6 and §14. All 1,020 have full-transcript neural audio (see next row). |
| Edge Neural TTS fill (`scripts/generate_all_audio_edge.py`, voice `ar-SA-ZariyahNeural`) | Real intelligible single-word recordings for all words lacking Commons audio (incl. 15 same-source collision regenerations via `EDGE_FORCE_IDS`/`EDGE_ONLY_FORCE`) + real full-transcript recordings for all 1,020 scenarios, normalised to 44.1 kHz / 128 kbps / mono MP3 via ffmpeg | 4,447 generations, 0 failures, concurrency 10, 3-attempt retry, `EDGE_MAX` chunking, verified 2026-09-20 | Original to this project; Microsoft neural MSA voice, no speaker consent issues (synthetic voice); voice differs from Commons humans — heterogeneity disclosed in §6.7. |
| Plus Jakarta Sans + Noto Naskh Arabic (Google Fonts links in `index.html`) | UI typeface + Arabic-script typeface | `<link href="https://fonts.googleapis.com/css2…">` | **SIL Open Font License 1.1.** |
| Preconnect fonts, React, Vite, Tailwind, Lucide, Motion, canvas-confetti | Runtime dependencies (`package.json`) | npm/bun install | Respective MIT/ISC/Apache licences; verify in `bun.lock`. |

No speaker was recorded for this project. Speech audio is a disclosed mix: **173 kept Commons/Lingua Libre volunteer human recordings (MSA `ara` majority + documented `ary`/`arz`/`ajp`/`apc` dialect minority) + Microsoft Edge Neural TTS voice `ar-SA-ZariyahNeural` for everything else (4,447 files, including all 1,020 full-sentence scenario transcripts)**. No consent beyond the uploaders' Commons licences is claimed for the human subset; the neural subset is a synthetic voice with no human speaker. Per-file human/neural tagging in `vocabulary.json` is future work (§15). Voice heterogeneity (mixed Commons speakers/dialects + single neural voice) is a known confound for minimal-pair work.

Reference (not bundled) corpora a reviewer may consult for comparison: **Mozilla Common Voice Arabic v26** (136,185 clips, 157.46 h, 92 h validated, CC0 — the largest free Arabic human-speech pool), **ArVoice/MBZUAI** (Interspeech 2025: 83.52 h, 11 MSA voices, diacritized; ASC+synthetic parts CC-BY-4.0 on Hugging Face), **Arabic Speech Corpus** (4.1 h single male, CC-BY-4.0), **ClArTTS** (12 h Classical Arabic audiobook). The shipped `public/audio/` bundle contains only Commons + Edge files described above.

### 6.2b Content policy (educational-safe MSA)

The ar_50k frequency fill passes a whole-token explicit-sexuality blocklist (48 forms incl. ال-prefixed variants) plus Arabic-block-only, ≥3-letter, no-Latin/no-digit filters: 48,509 candidates survived of ~50k lines. Whole-token matching was verified with substring auditing — e.g. `زبون` (client) and `عينيك` (your eyes) contain blocklisted substrings but are innocent high-frequency words and were correctly retained. All 1,020 scenario transcripts were generated from fixed author templates and are profanity-free. Legacy English MP3s on disk are untouched by the Arabic corpus.

### 6.3 Data model (exact TypeScript contracts in `src/types/index.ts`)

```ts
VocabEntry { id, word, ipa, partOfSpeech, category, pairWord?, targetPhoneme?, audioUrl, audioFallbackWord?, distractors?, level?, transliteration?, diacritized?, pluralOrNote? }
StressScenario { id, scenario, transcript, transcriptTransliteration?, targetWord, question, questionAr?, options[4], correctOption, audioUrl, audioFallbackWord?, contextDescription, level? }
VocabDataset { version, language, generatedAt, totalWords, totalScenarios, words[], scenarios[], contentPolicy?, audioCoverage? }
AcousticConfig { presetId, name, description, highPassHz, lowPassHz, distortionDrive 0–100, snrDb, noiseType 'pink'|'white'|'radio_hum'|'subway_rumble'|'off', packetLossRate 0–80, reverbWet 0–1 }
UserStats { totalAttempted, totalCorrect, streak, bestStreak, modeStats{…}, phonemeAccuracy{phoneme:{correct,total}}, levelAccuracy?, recentHistory[≤50] }
```

> The DSP/pipeline/scoring/storage types are identical to the English build. Additive Arabic-only fields: `transliteration` (Latin gloss, e.g. `ṣayf (summer)`), `diacritized` (vocalized TTS text), `questionAr` (Arabic question string). Audio URLs use ASCII ids (`/audio/ar-mp-0001.mp3`) with Arabic script in `word`/`audioFallbackWord` — a filesystem-safe convention, not a logic change.

Example word entry (minimal pair):

```json
{ "id": "ar-mp-0001", "word": "سَيْف", "level": "A1", "ipa": "/sajf/",
  "partOfSpeech": "noun", "category": "minimal_pair",
  "pairWord": "صَيْف", "targetPhoneme": "/s/ vs /sˤ/",
  "transliteration": "sayf (sword)", "diacritized": "سَيْف",
  "audioUrl": "/audio/ar-mp-0001.mp3", "audioFallbackWord": "سَيْف" }
```

Example scenario entry (shipped v3.0.0 — full-transcript `ar-SA-ZariyahNeural` audio):

```json
{ "id": "ar-sc-a1-1", "level": "A1", "scenario": "إعلان تغيير بوابة الصعود · Gate Change #1",
  "transcript": "نرجو من المسافرين على متن الرحلة MS 901 المتجهة إلى جدة التوجه إلى البوابة السابعة عشرة، حيث تم نقل موعد الصعود إلى الساعة الحادية عشرة مساء.",
  "targetWord": "البوابة ١٧", "question": "Which new boarding gate was announced for the flight to Jeddah?",
  "questionAr": "ما هي بوابة الصعود الجديدة المعلنة للرحلة المتجهة إلى جدة؟",
  "options": ["البوابة ٢٢","البوابة ١٧","البوابة ١٣","البوابة ٢٧"], "correctOption": "البوابة ١٧",
  "audioUrl": "/audio/ar-scenario_1.mp3",
  "audioFallbackWord": "نرجو من المسافرين …",
  "contextDescription": "صالة المغادرة بالمطار مع رنين الإذاعة الداخلية وصدى الإعلانات وضجيج حقائب السفر" }
```

### 6.4 Minimal-pair phoneme inventory (what contrasts are actually trained)

The shipped 242 pair entries derive from 127 `AR_MINIMAL_PAIR_SPECS` in `generate_arabic_corpus.js`, ordered by published L2-difficulty (emphatics first, gemination/numbers last). The full contrast list, with example pairs, is tabulated in **Appendix A**. In brief: emphatics `/s/–/sˤ/` (سَيْف/صَيْف), `/t/–/tˤ/` (تِين/طِين), `/d/–/dˤ/` (دَرْب/ضَرْب), `/ð/–/ðˤ/` (ذَلَّ/ظَلَّ); pharyngeals `/ħ/–/h/` (حَلَّ/هَلَّ), `/ʕ/–/ʔ/` (عَلَم/أَلَم، عَيْن/أَيْن); uvulars `/q/–/k/` (قَلْب/كَلْب), `/x/–/ħ/` (خَال/حَال), `/x/–/ɣ/` (غَائِب/خَائِب); interdentals `/θ/–/s/` (ثَارَ/سَارَ), `/θ/–/t/` (ثَمَّ/تَمَّ), `/ð/–/z/` (ذَرَّ/زَرَّ), `/ð/–/d/` (نَذَرَ/نَدَرَ); sibilants `/ʃ/–/s/` (شَكَّ/سَكَّ), `/ʃ/–/dʒ/` (شَاعَ/جَاعَ), voicing `/z/–/s/` (زَارَ/سَارَ); `/l/–/r/` (لَاحَ/رَاحَ), `/b/–/m/` (بَيْت/مَيْت), `/f/–/b/` (فَاتَ/بَاتَ); vowel quantity `/iː/–/aj/` (دِين/دَيْن), `/u/–/uː/` (عُد/عُود), `/a/–/i/–/u/` (بَرَّ/بِرَّ/بُرَّ); gemination Form I vs II (دَرَسَ/دَرَّسَ، عَلِمَ/عَلَّمَ، فَهِمَ/فَهَّمَ، كَسَرَ/كَسَّرَ) plus 16 high-frequency adjective→causative pairs (كَبِير/كَبَّرَ، نَظِيف/نَظَّفَ); and the eleven number pairs headed by unit-vs-ten (ثَلاثَة/ثَلاثُون … عَشَرَة/عِشْرُون) plus 11/12, 1/2, 0/10, 100/1000.

Each pair entry stores `targetPhoneme` as a human string (e.g. `"/s/ vs /sˤ/"`) and is aggregated in `stats.phonemeAccuracy[phoneme]` on every attempt — the raw material for RQ1.

### 6.5 Scenario domains (1,020)

Six template groups in `generate_arabic_corpus.js`: **المطار والرحلات الجوية (Airport); محطات القطار والمترو (Train & Subway); المقهى والمطعم (Café & Restaurant); الجامعة والحرم المدرسي (University & Campus); العمل والمكالمات المهنية (Workplace); الخدمات العامة والطوارئ (Public Services & Emergencies)** — each with 3–5 Arabic `contextDescription` acoustic scenes and 3–5 item templates. Token slots (`{CITY}`, `{FLIGHT}`, `{GATE}`, `{TIME}`, `{DISH}`, `{PIN}`, …) are filled deterministically from fixed arrays (12 Arab cities, MSA carrier flight numbers, Arabic-Indic digits, masculine/feminine ordinal maps `NUM_WORDS`/`NUM_WORDS_M` for grammatical agreement) indexed by scenario counter so regeneration is reproducible. Transcripts speak number **words** (e.g. `البوابة السابعة عشرة`) while options show **digits** (`البوابة ١٧`) — the Arabic twin of the teen/ty gate task. Questions are bilingual (`question` English for navigation + `questionAr` Arabic). Options are the template's four distractors with token substitution; if the computed `targetWord` is missing from the list it replaces slot 0, and short lists are padded with `"لا شيء مما ذُكر"` / `"خيار غير محدد"` — disclosed here because it affects distractor quality (see §14).

### 6.6 How transcripts relate to audio

Each scenario object carries a full-sentence MSA `transcript` (e.g. a gate-change announcement) and its `audioUrl` (`/audio/ar-scenario_{idx}.mp3`) points to a **real full-transcript neural recording** (Edge `ar-SA-ZariyahNeural`, average ~10–14 s, verified by ffprobe: `ar-scenario_1.mp3` = 13.44 s at 128 kbps/44.1 kHz/mono). The app plays the whole announcement through the degraded chain while displaying the bilingual scenario text and question. Any submission should state this honestly: **shipped v3.0.0 = 1,020 connected-speech (single MSA neural voice) scenarios.** Template wording itself remains author-written Mad Libs, unmoderated by examiners (see §14). The English-build predecessors (`ingest_audio.js`, `build_educational_corpus.js`, `generate_massive_corpus.js`) remain in `scripts/` for reference; the shipped Arabic file is produced solely by `generate_arabic_corpus.js`.

### 6.7 Audio coverage and normalisation (100% — human-first, neural-complete)

- All audio is normalised with `ffmpeg -y -v quiet -i "{temp}" -c:a libmp3lame -b:a 128k -ar 44100 -ac 1 "{target}.mp3"` and accepted only if the output exceeds 1,000 bytes.
- **Verified 2026-09-20: 4,620 Arabic MP3s on disk (~267 MB); 0 missing of 3,600 word URLs; 0 missing of 1,020 scenario URLs; 0 files under 1,000 bytes.** Spot-checks: `ar-mp-0001.mp3` (human سَيْف, Lingua Libre `ara`) = 1.39 s single word; `ar-mp-0052.mp3` (neural دَيْن) = 1.87 s single word; `ar-scenario_1.mp3` = 13.44 s full announcement.
- Provenance mix: **173 kept Commons/Lingua Libre human recordings** (`node scripts/ingest_arabic_audio.js --max=242` resolved 188, of which 15 were regenerated — next bullet) + **4,447 Edge Neural `ar-SA-ZariyahNeural` generations, 0 failures** (concurrency 10, 3-attempt retry, `EDGE_MAX` chunking for resumable runs). Full rerun is idempotent (existing files skipped).
- **Same-source collision repair (measured, not hidden).** md5 comparison of the ingested human files found 13 minimal pairs whose **both** members resolved to the *same* Commons recording (e.g. دِين/دَيْن ← `Ar-دين.ogg`; بِرَّ/بَرَّ/بُرَّ ← `بر.wav`; حَمَام/حَمَّام; دَرَسَ/دَرَّسَ; عَلِمَ/عَلَّمَ; فَهِمَ/فَهَّمَ; كَسَرَ/كَسَّرَ; سَلِمَ/سَلَّمَ; قَدِمَ/قَدَّمَ; خَرَجَ/خَرَّجَ; جَمَل/جَمَّلَ; فَرَح/فَرَّحَ; وَسِخ/وَسَّخَ) — identical audio for both answer options makes discrimination untestable. Fix applied 2026-09-20: the first member kept its human recording, the 15 colliding counterparts were regenerated with the single neural voice (`EDGE_FORCE_IDS=… EDGE_ONLY_FORCE=1 python scripts/generate_all_audio_edge.py`, 15/15 ok). Reproduce the audit any time with the md5 snippet documented in §11.
- **Known confounds, not hidden:** (a) minimal-pair items mix human and neural voices across pairs (e.g. human سَيْف vs neural-regenerated counterpart side), so voice timbre can cue the answer — for strict phoneme-discrimination studies, regenerate the full word set with the single neural voice (delete `public/audio/ar-mp-*.mp3` and rerun the Edge script) or restrict to human-only pairs; (b) human hits span **MSA (`ara`) and dialects (`ary` Moroccan, `arz` Egyptian, `apc`/`ajp` Levantine)** — e.g. the سَارَ/صَارَ pair mixes `ary` + `ajp` voices — so a minority of "MSA" items carry dialectal realizations (ث→ت/س, ذ→د mergers audible); (c) several human recordings are **phrase-embedded** (word inside a phrase: `سيف غزال`, `شرف القضاة`, `حسن زاهر`, `فرح يوسف`, `ثورة 25 يناير`, `الأ…بن سريع التميمي`) rather than isolated words; (d) shadda scoring is strict (no shadda-insensitive fallback) so genuinely homophonous human recordings of distinct vocalizations (e.g. جَدّ/جَدَّ) each score only their own item.
- The `AudioEngine.generateSyntheticSpeechBuffer()` sine-stack now never fires; it is retained only as crash protection. The UI does not badge human vs neural playback.
- Preloading (`audioEngine.preload([current, next])`) warms the current and next item to mask fetch latency.
- Regeneration: `EDGE_MAX` env var chunks the run (e.g. `$env:EDGE_MAX="120"; python scripts/generate_all_audio_edge.py`); completed chunks are skipped on resume. `EDGE_VOICE` overrides the voice (e.g. `ar-SA-HamedNeural` male MSA, `ar-EG-SalmaNeural` Egyptian female); `EDGE_CONCURRENCY` overrides parallelism.

---

## 7. Acoustic Degradation Engine — Full DSP Disclosure

> **Conversion guarantee:** this entire section is identical to the English build because the engine is untouched — `src/audio/AudioEngine.ts` and `src/audio/presets.ts` are byte-for-byte the same files. Arabic speech takes the same degraded path; only the linguistic content passing through it changed.

File: `src/audio/AudioEngine.ts`. No hidden processing: every node, coefficient, and formula is listed here.

### 7.1 Graph topology

**Degraded path:** `BufferSource → ChopperGain (packet loss) → HighPass biquad → LowPass biquad → WaveShaper → [DryGain → Master | Convolver → WetGain → Master] + (Looping NoiseSource → BandPass → NoiseGain → Master) → MasterGain → AnalyserNode → destination.`

**Clean bypass (`clean: true`):** `BufferSource → MasterGain → AnalyserNode → destination.` No filtering, no noise, no reverb, no distortion. Playback-rate is still honoured.

`AnalyserNode`: `fftSize = 512`, `smoothingTimeConstant = 0.8`, `frequencyBinCount = 256`. Visualiser reads time-domain bytes each animation frame; when idle it draws a flat baseline.

### 7.2 Preset parameter matrix (exact author-tuned values from `src/audio/presets.ts` — tuned by ear, not lab-calibrated)

> Only the `landline` 300–3,400 Hz band edges reuse a real standard (ITU-T narrowband telephony). Every other number below — drive, SNR, loss %, reverb wet — is an author-chosen heuristic that "sounded right" (e.g. drive 45, 28% loss for intercom). Do not cite these as measured channel specifications.

| Preset (`presetId`) | Display name | HP (Hz) | LP (Hz) | Drive 0–100 | SNR (dB) | Noise | Loss % | Reverb wet |
|---|---|---|---|---|---|---|---|---|
| `cellphone` | Weak Cell Signal | 200 | 7,000 | 8 | 18 | pink | 4 | 0.02 |
| `landline` (default) | Phone Call | 300 | 3,400 | 22 | 12 | radio_hum | 0 | 0.05 |
| `train_pa` | Train Station | 350 | 4,200 | 35 | 5 | subway_rumble | 0 | 0.38 |
| `intercom_staccato` | Office Intercom | 450 | 3,000 | 45 | 2 | white | 28 | 0.08 |
| `walkie_talkie` | Walkie-Talkie | 500 | 2,500 | 60 | 0 | radio_hum | 12 | 0.04 |
| `custom` | Custom Settings | 300 | 3,400 | 20 | 10 | pink | 10 | 0.10 |

Pedagogical reading (author intent, not measurement): `landline` = standard 300–3,400 Hz telephone band + faint hum; `walkie_talkie` = narrowest band + hardest clipping + 0 dB SNR; `train_pa` = widest reverb (0.38) + low rumble; `intercom_staccato` = heaviest packet loss (28%); `cellphone` = gentlest (18 dB SNR, 4% loss). Custom sliders expose HP 50–800 Hz, LP 1,500–8,000 Hz, SNR 0–30 dB (UI displays `Level {30 − snrDb}`), drive 0–100, and five noise-type buttons (None/Cafe Chatter/Soft Hiss/Quiet Hum/Low Rumble). Any slider edit retags the config to `presetId: 'custom'`, `name: 'Custom'`.

### 7.3 Node-by-node mathematics

1. **Packet-loss chopper (author heuristic, not a telecom model).** Interprets `packetLossRate` clamped to 0–80%. Skips the first 80 ms (attack preservation), then walks a cursor: at each step draws `rand×100 < rate×1.5`; on a hit schedules a 30–90 ms dropout (`0.03 + rand×0.06`) with **2 ms linear micro-fades** (`1.0 → 0.001 → hold → 1.0`) to avoid clicks, then advances `drop + 0.08 + rand×0.12`; otherwise advances `0.06 + rand×0.08`. Uses plain `Math.random()` with no seed — **not** Gilbert-Elliott burst loss or any calibrated loss model. Deterministic seed is **not** used — each playback differs, disclosed as a repeatability limit.
2. **Biquad band-limiting.** `highpass.frequency = highPassHz, Q = 1.0`; `lowpass.frequency = lowPassHz, Q = 1.0`. This is what removes `/s/` sibilance energy (4–8 kHz) under `landline`/`walkie_talkie` settings.
3. **WaveShaper saturation.** 44,100-sample sigmoid curve; `k = max(0, drive)`; identity pass-through when `k ≤ 0`; otherwise `curve[i] = ((3+k)·x·20·(π/180)) / (π + k·|x|)`, `oversample = '4x'`. Higher drive = harder mic-diaphragm clipping.
4. **Reverberation.** Synthetic stereo impulse `generateImpulseResponse(ctx, 1.6 s, decay 2.0)`: `length = rate×1.6`, each channel `noise×(1−t)^2`. Applied only when `reverbWet > 0.02`: `dry = max(0.2, 1−wet×0.6)`, `wet = min(1.2, wet×1.5)` through a `ConvolverNode`.
5. **SNR noise mixer (standard formula, assumed reference, SPL-uncalibrated).** Skipped when `noiseType === 'off'` or `snrDb ≥ 30`. Noise loop (5 s seamless buffer) → `bandpass.frequency = (HP+LP)/2, Q = 0.5` → gain `g = max(0.005, 0.35 × 10^(−snr/20))` where **0.35 is the assumed speech reference RMS (−12 dBFS class, not a measured SPL)**. Worked example: at 0 dB SNR, `g = 0.35`; at 12 dB, `g ≈ 0.088`; at 18 dB, `g ≈ 0.044`. Reported SNRs are digital-domain calculations, not sound-pressure-level measurements.
6. **Noise synthesis algorithms.** White: uniform `±0.5`. Pink: Paul Kellett 6-pole filter bank (`b0…b6` coefficients as coded, `×0.06` scale). Radio hum: 60 Hz×0.4 + 120 Hz×0.2 + hiss×0.3, all `×0.35`. Subway rumble: leaky integrator `y += 0.04·(white−y)`-style accumulator (`lastVal×0.96 + white×0.04`, `×2.5`). Buffers cached in `noiseBuffers`.
7. **Playback rate.** `source.playbackRate.value = 1.0 | 0.8` (Normal/Slow toggle). Note: rate change without pitch correction lowers formants — disclosed as a scaffold, not a time-stretch algorithm.
8. **Lifecycle.** `play()` calls `stop()` first (kills prior source + noise), lazily creates/resumes `AudioContext` (autoplay-policy compliant), `fetch → decodeAudioData` with cache in `bufferCache`, `source.onended` stops noise and fires the UI callback. `stop()` is exception-safe against double-stop.

### 7.4 Clean A/B bypass — why it matters

After an error the learner can replay the identical stimulus **without degradation** (`Clear Audio [C]`). Theoretically this provides the auditory-system “template” for top-down repair; practically every feedback panel exposes both `Listen Again [Space]` (degraded) and `Clear Audio [C]` (clean) so the contrast is one keypress apart.

### 7.5 Waveform visualiser (`WaveformVisualizer.tsx`)

Canvas 2-D oscilloscope: blue `#007aff` stroke for degraded, green `#34c759` for clean, `#e5e5ea` flat baseline when idle; `h×0.42` vertical scale; DPR-aware sizing; `requestAnimationFrame` loop cancelled on unmount. Hidden entirely in Calm Mode to reduce visual load.

---

## 8. Training Modes and Pedagogy

All three modes share the item pipeline in `src/App.tsx`: **filter by `selectedLevel` → `activeItem = list[currentIndex % len]` → preload current+next → `playDegraded`/`playClean` → `handleSubmitAnswer` → stats update → feedback panel → Next/Shuffle.**

| Mode (UI label) | Key | Prompt | Response | Scoring |
|---|---|---|---|---|
| Similar Words | `minimal_pair` | “Which Arabic word did you hear? · أيّ كلمة سمعت؟” + 2 large RTL buttons; order alternates by `currentIndex % 2` | Click / `1`–`2` | Exact match, then `normalizeArabic()` fallback (alef/hamza, ة/ه, ى/ي, tashkeel). |
| Type Words | `dictation` | “Type what you heard in Arabic · اكتب ما سمعت” + autofocused RTL input + IPA + transliteration hint | Type + `Enter`/Submit | Exact match, **or** orthography-normalized match, **or** Arabic number-synonym pass via `NUMBER_SYNONYMS` both directions (`"4"↔"أربعة"↔"٤"` … full 0–20/tens/100/1000 table in `App.tsx`, incl. unvocalized variants). Shadda is strict (no shadda-insensitive fallback — gemination is the C1 training target). |
| Situations | `comprehension_stress` | Bilingual scenario title + English question + Arabic `questionAr` + 4 RTL options | Click / `1`–`4` | Exact match to `scenario.correctOption`. |

Feedback panel states the correct answer verbatim, echoes the learner’s wrong choice parenthetically (“you chose: …”), and offers degraded + clean replay before `Next Question [Enter]`. Tone is deliberately non-punitive (“Great job!” / “Good try!”).

**Stats recorded per attempt** (`handleSubmitAnswer` — structure identical to the English build): `totalAttempted/Correct`, `streak/bestStreak`, per-mode `attempted/correct`, `phonemeAccuracy[phoneme]`, `levelAccuracy[level]`, and a `recentHistory` entry `{word, userAnswer, correctAnswer, correct, mode, preset name, timestamp, phoneme?, level?}` capped at 50 (drawer renders the latest 15). Overall/mode/level accuracy are all `round(100×correct/attempted)`. Storage keys are version-bumped (`acoustic_ear_user_stats_v6_ar`, `acoustic_ear_oxford_level_v2_ar`) so legacy English history never mixes with Arabic history.

**Navigation:** `Next` = `index+1`; `Shuffle` = `index + 1…7` random jump; mode or level switch resets `index` to 0 and stops audio. Question counter shows `(index % total)+1 of total` plus a Level chip when filtered.

---

## 9. Application Architecture and Code Map

### 9.1 Stack (exact `package.json`)

Runtime: `react 19`, `react-dom 19`, `@vitejs/plugin-react 6`, `vite 8`, `@tailwindcss/vite 4` + `tailwindcss 4`, `lucide-react 0.546` (icons), `motion 12` + `canvas-confetti 1.9` (installed; confetti/atom not wired into the current practice loop — disclosed), `express 4` + `@types/express` (installed; no server file ships — scaffold residue), `@google/genai 2.4` (installed; uncalled — see §5), `dotenv 17`, `clsx 2`. Dev: `typescript 7`, `tsx 4`, `esbuild 0.25`, `@types/*`, `autoprefixer 10`. Scripts: `dev` (Vite on `0.0.0.0:3000`), `build` (`vite build`), `preview`, `clean` (`rm -rf dist server.js`), `lint` (`tsc --noEmit`), `ingest` (`node scripts/ingest_audio.js`). Package manager artefacts: `bun.lock` ships, so Bun is supported.

### 9.2 File map

```
index.html                  title/meta/OG tags (Polluted Arabic, ar+en), Plus Jakarta Sans + Noto Naskh Arabic, #root, /src/main.tsx
vite.config.ts              react()+tailwindcss(), @→repo-root alias, HMR/watch DISABLE_HMR guard
src/main.tsx                StrictMode createRoot render
src/App.tsx                 all state, filtering, playback callbacks, Arabic scoring (normalizeArabic + NUMBER_SYNONYMS), stats, layout (item pipeline & stats logic identical to English build)
src/types/index.ts          AcousticPresetId/NoiseType/AcousticConfig/TrainingMode/OxfordLevel/*Entry/Scenario/Dataset/Stats (+ additive Arabic fields: transliteration/diacritized/questionAr; general_vocab in category union)
src/audio/presets.ts        6 configs with exact DSP numbers (§7.2) — BYTE-IDENTICAL to English build
src/audio/AudioEngine.ts    DSP graph, noise synthesis, IR, distortion curve, cache, analyser — BYTE-IDENTICAL to English build
src/data/oxfordLevels.ts    All/A1–C1 MSA metadata (code/name/CEFR/description)
src/components/Header.tsx         mode segmented control, streak/accuracy chips, Calm toggle, Score button
src/components/LevelSelector.tsx  6-button grid with per-level live counts
src/components/PresetSelector.tsx 6 preset cards + custom sliders + noise-type buttons
src/components/WaveformVisualizer.tsx canvas oscilloscope
src/components/TrainingCard.tsx   play/clean/read-aloud(ar-SA)/speed/prompt/RTL inputs/feedback/keyboard (playback & keyboard logic identical; strings bilingual, options RTL)
src/components/StatsDrawer.tsx    accuracy/streak/completed, per-mode + per-level bars, 15-item history, reset
src/index.css               Tailwind import, Apple HIG palette, Noto Naskh Arabic in font stack, focus rings, .apple-pressable
public/data/vocabulary.json shipped MSA corpus v3.0.0 (1.76 MB, 3,600 words + 1,020 scenarios)
public/data/vocabulary.v2.1.0-english.backup.json English-build corpus backup (pre-conversion)
public/data/vocabulary.v2.0.0.backup.json older English pre-purge backup
public/audio/ar-*.mp3       4,620 Arabic speech files (words + full-transcript scenarios, 44.1 kHz/128k/mono; ~267 MB — use Git LFS). Legacy English MP3s deleted 2026-09-20.
scripts/generate_arabic_corpus.js  SHIPPED Arabic 3,600+1,020 generator (AR_MINIMAL_PAIR_SPECS + MSA core + ar_50k fill + MSA templates; v3.0.0)
scripts/ingest_arabic_audio.js     Arabic human-audio pipeline (Wiktionary {{ar-pr}} + Commons/Lingua Libre ara search + ffmpeg mono)
scripts/generate_all_audio_edge.py Edge Neural TTS bulk fill — defaults ar-SA-ZariyahNeural; ASCII-id targets; EDGE_MAX/EDGE_VOICE/EDGE_FORCE_IDS/EDGE_ONLY_FORCE (4,447 files, 0 failures)
scripts/ingest_audio.js     English-build human-audio pipeline (reference, unchanged)
scripts/build_educational_corpus.js English curated corpus writer (reference, unchanged)
scripts/generate_massive_corpus.js  English 3,593+1,020 generator (reference, unchanged)
scripts/download_missing_audio.js 43-word English Commons top-up downloader (reference, unchanged)
scripts/sync_vocab.cjs      audio-gated vocab.json rewriter (reference; do not run casually — it will shrink the corpus)
```

### 9.3 Data flow

```
vocabulary.json --fetch--> App.dataset --filter(level,mode)--> activeItem
activeItem.audioUrl --preload/loadAudio--> AudioBuffer --play(config)--> speakers + analyser--> canvas
learner answer --handleSubmitAnswer--> UserStats --localStorage--> StatsDrawer
```

Storage keys (all `localStorage`, no cookies, no server): `acoustic_ear_user_stats_v6_ar`, `acoustic_ear_oxford_level_v2_ar`, `acoustic_ear_calm_mode` (`"true"` string check), `acoustic_ear_turbo_mode`. The `_ar`-suffixed keys separate Arabic history from legacy English-build history (`…_v5` / `…_v1`); calm/turbo prefs are shared.

---

## 10. Installation, Configuration, and Running

### 10.1 Prerequisites

- Node 20+ (or Bun 1+; `bun.lock` present) and `ffmpeg` on `PATH` **only if** running audio-ingestion scripts (`ffmpeg -version` must succeed for MP3 normalisation).
- Modern Chromium/Chrome recommended (Web Audio `ConvolverNode`, `WaveShaper oversample '4x'`, `decodeAudioData` behaviour verified there; Safari/Firefox largely work but IR/convolver gain staging was tuned in Chrome).

### 10.2 Install and run (Windows PowerShell shown; macOS/Linux equivalent)

```powershell
# 1. Enter the project
Set-Location -LiteralPath "C:\Users\SCSM11\Downloads\0pollutedenglish - Copy"

# 2. Install (npm or bun)
npm install
# or: bun install

# 3. Develop (HMR at http://localhost:3000)
npm run dev

# 4. Typecheck (this repo's "lint")
npm run lint

# 5. Build + preview production bundle
npm run build
npm run preview

# 6. Regenerate the Arabic corpus (writes public/data/vocabulary.json — back it up first)
npm run corpus:ar

# 7. Fetch human Arabic audio first (Wiktionary + Commons/Lingua Libre), then
#    neural-fill the rest with Edge MSA voice (resumable chunks):
npm run ingest:ar
$env:EDGE_VOICE="ar-SA-ZariyahNeural"; python scripts/generate_all_audio_edge.py
```

No build-time secrets are required. Copy `.env.example` to `.env` only if you intend to wire Gemini/APP_URL features in future work; **the current app runs without any env vars**.

### 10.3 NPM script reference

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite --port=3000 --host=0.0.0.0` | Local dev server, HMR unless `DISABLE_HMR=true`. |
| `build` | `vite build` | Production bundle to `dist/`. |
| `preview` | `vite preview` | Serve `dist/` locally. |
| `lint` | `tsc --noEmit` | Typecheck only (no ESLint config ships). |
| `clean` | `rm -rf dist server.js` | Remove build artefacts (POSIX syntax; on stock Windows PowerShell use `Remove-Item -Recurse -Force dist, server.js`). |
| `ingest` | `node scripts/ingest_audio.js` | English-build human-audio pipeline (reference; network + ffmpeg). |
| `ingest:ar` | `node scripts/ingest_arabic_audio.js [--max=N] [--level=A1]` | Arabic human-audio pipeline: Wiktionary `{{ar-pr}}` + Commons/Lingua Libre search → `public/audio/ar-*.mp3` (network + ffmpeg). |
| `corpus:ar` | `node scripts/generate_arabic_corpus.js` | Regenerate the shipped MSA `vocabulary.json` v3.0.0 (needs network for ar_50k fill; falls back to offline core + pairs). |

Edge TTS bulk fill is invoked directly: `$env:EDGE_VOICE="ar-SA-ZariyahNeural"; python scripts/generate_all_audio_edge.py` with optional `$env:EDGE_MAX="700"` chunking, `$env:EDGE_CONCURRENCY="10"`, and the collision-repair flags `$env:EDGE_FORCE_IDS="ar-mp-0052.mp3,…"; $env:EDGE_ONLY_FORCE="1"`. **Warning:** the corpus writer overwrites `public/data/vocabulary.json`. Back it up first (English v2.1.0 backup is kept at `public/data/vocabulary.v2.1.0-english.backup.json`).

---

## 11. Corpus Build Pipelines — Reproducibility

English-build pipelines (reference, unchanged — they produced the backed-up `vocabulary.v2.1.0-english.backup.json`):

1. **`scripts/ingest_audio.js` (v1, human-audio grounded).** `WORD_DEFINITIONS` (~250 entries: teen/ty + consonant/vowel pairs + numbers/dates/transit/emergency/daily verbs) × `scrapeWiktionary → resolveCommonsUrl → downloadAndConvert(ffmpeg)` under a `pMap(concurrency=2)` pool with `fetchWithRetry(retries=4, backoff 1s, 10 s timeout, 429 exponential backoff)` and `sleep(250 ms)` between successes. Emits `vocabulary.json v1.0.0` + 8 hand-written `STRESS_SCENARIOS`. Skip-download logic reuses MP3s >1,000 bytes and existing IPA.
2. **`scripts/build_educational_corpus.js` (v2 curated).** `COMPREHENSIVE_WORDS` (A1 numbers/pairs/classroom, A2 transit/safety, B1 academic/travel, B2 research, C1 formal discourse) + `EDUCATIONAL_SCENARIOS` (30 hand-written A1–C1 situations with full transcripts/questions/distractors). Writes `vocabulary.json v2.0.0` (pretty-printed), prints per-level distributions, then attempts `ensureAllAudio()` top-up downloads.
3. **`scripts/generate_massive_corpus.js` (English shipped JSON, v2.0.0 → v2.1.0 after purge).** `MINIMAL_PAIR_SPECS` (~200 contrast specs → 331 deduplicated pair entries) + live Google-10K fetch stratified to quotas (A1 700 / A2 750 / B1 800 / B2 700 / C1 remainder, total cap 3,600; general items get placeholder `ipa: "/{word}/"`, `partOfSpeech: "noun"`, `category: "general_vocab"`) + deterministic 1,020-scenario template expansion. Writes **minified** `vocabulary.json` with `totalWords` + `totalScenarios`.
4. **`scripts/download_missing_audio.js`.** 43-word Commons top-up (`book`, `exam`, … `valid`) trying `en-us-`, `En-us-`, `en-uk-`, `En-uk-`, and four Lingua Libre uploader patterns before falling back to Wiktionary-parse. 200 ms pacing, ffmpeg normalisation, per-word success logging.
5. **`scripts/sync_vocab.cjs`.** Safety rewriter: parses `ingest_audio.js` source for `WORD_DEFINITIONS`/`STRESS_SCENARIOS` via regex+`eval`, keeps only entries whose MP3 exists, reuses prior IPA, writes `v1.0.0`. Useful before offline demos; **do not run casually** — it will shrink the corpus to audio-gated size.
6. **English Edge fill (2026-09-20).** `scripts/generate_all_audio_edge.py` with `EDGE_VOICE=en-US-AriaNeural`: 4,189 files, 0 failures, concurrency 10, 3-attempt retry, `EDGE_MAX` chunking.

Arabic (MSA) pipelines (shipped, v3.0.0):

7. **`scripts/generate_arabic_corpus.js` — `npm run corpus:ar` (shipped JSON output, v3.0.0).** `AR_MINIMAL_PAIR_SPECS` (127 contrast specs → 242 deduplicated pair entries with real IPA + transliteration) + 607-word hand-curated MSA core (`CORE_A1…C1` with POS tags) + live ar_50k fetch (48,509 candidates after Arabic-block/≥3-letter/profanity filters) stratified to the **same quotas** (A1 700 / A2 750 / B1 800 / B2 700 / C1 remainder, total cap 3,600; general items get placeholder `ipa: "/{word}/"`, `partOfSpeech: "noun"`, `category: "general_vocab"`) + deterministic 1,020-scenario MSA template expansion (gender/case-checked ordinals, number-words in transcripts, Arabic-Indic digits in options, bilingual questions). Writes **minified** `vocabulary.json` with `version`, `language: "ar"`, `totalWords` + `totalScenarios`. During development it also caught and fixed live bugs (double `الساعة`, missing ١٢/٢٧ digit maps, masculine/feminine ordinal agreement) — all verified to 0 scenario defects before shipping.
8. **`scripts/ingest_arabic_audio.js` — `npm run ingest:ar [--max=N] [--level=A1]` (shipped human-audio fill).** `scrapeArabicWiktionary()` (`{{audio|ar}}` + `{{ar-pr}}` inline audio + `{{IPA|ar}}`, vocalized-then-plain retry) → `searchCommonsArabic()` (Commons file search catching Lingua Libre `ara/ary/arz/ajp/apc` + `Ar-*.ogg` legacy) → `resolveCommonsUrl()` → `downloadAndConvert()` (same ffmpeg spec + explicit mono) under the same `pMap(concurrency=2)` + 250 ms pacing. Minimal pairs first, then general vocab. Measured 2026-09-20: **188 pair words resolved, 173 kept** (15 same-source collisions regenerated per §6.7). Writes only `public/audio/ar-*.mp3`; never rewrites `vocabulary.json`.
9. **`scripts/generate_all_audio_edge.py` with `EDGE_VOICE=ar-SA-ZariyahNeural` (shipped audio fill, 2026-09-20).** Reads `vocabulary.json`, derives ASCII-id targets from `audioUrl` (never from Arabic script), synthesises words from `diacritized || word` and scenarios from the full MSA transcript, then `ffmpeg`-normalises to 44.1 kHz / 128 kbps / mono. Concurrency 10, 3-attempt retry, `EDGE_MAX` chunking, `EDGE_VOICE`/`EDGE_CONCURRENCY` overrides, plus `EDGE_FORCE_IDS` + `EDGE_ONLY_FORCE=1` for the 15-file collision repair. Result: **4,447 files, 0 failures** (15 force + 4,432 fill across 40/300/700×4/592 chunks). Rerun is idempotent (existing files skipped).
10. **Same-source audit (reproduce any time).** md5-compare present `ar-mp-*.mp3` files and join against `pairWord` counterparts (Node one-liner in the build notes): groups sharing bytes *and* paired by `pairWord` are untestable contrasts — keep one human member, regenerate the rest via step 9's force flags. Non-counterpart collisions (e.g. حَلَّ/حَلّ sharing a file across different specs) are harmless for training since those words never meet as options.

---

## 12. User Manual

1. **Pick a skill** in the header segmented control: Similar Words / Type Words / Situations.
2. **Pick a difficulty** (All/A1–C1). Counts on each button are live for the active mode.
3. **Press Play Sound [Space].** Arabic audio plays degraded through the active Background Sound. Press **Clear Audio [C]** any time for the pristine version. Toggle **Normal/Slow** (1.0×/0.8×). **Read Aloud** speaks the on-screen Arabic prompt (not the hidden answer) via the OS `ar-SA` voice for dyslexia/screen-reader support.
4. **Answer:** click an option (or `1`–`4`), or type in Arabic (RTL input) and `Enter`. Alef/hamza, ة/ه and diacritic variants are accepted, as are digit/word equivalences (`"٤" = "أربعة" = "4"`); shadda (gemination) is scored strictly.
5. **Study the feedback:** correct answer quoted in Arabic script, your error echoed, both replays available, then `Next [Enter]` or `Shuffle` (random +1…+7 jump). The pronunciation hint shows IPA plus a Latin transliteration gloss for pairs.
6. **Change the channel** under Background Sounds: Phone Call (default), Train Station, Walkie-Talkie, Intercom, Weak Cell Signal, or Custom Sound sliders (bass/clarity/noise/crackle + noise-type buttons). In Situations mode the app auto-selects the channel matching the Arabic scene (مطار/محطة → Train Station, هاتف → Phone Call, لاسلكي/أمن → Walkie-Talkie) unless you override it.
7. **Track progress** via Score: overall accuracy, streak/best, completed count, per-mode and per-level bars, and the last 15 attempts with preset attribution. Reset Data asks for `window.confirm` first.
8. **Reduce load** with Calm View (hides waveform, persists across reloads).

Keyboard map: `Space` play degraded · `C` clean · `1`–`4` choose · `Enter` submit/next · `R` replay-after-answer · `Esc` release dictation focus. All interactive elements meet ≥44 px targets with visible `:focus-visible` rings.

---

## 13. Ethics, Privacy, Accessibility, Licensing, and Attribution

- **Human subjects & privacy.** No login, no telemetry, no cookies, no analytics endpoint. All stats remain in the user’s own `localStorage` and can be wiped in one tap. Classroom deployments should still obtain institutional consent for any screen-recorded or exported history used in research.
- **Accessibility (WCAG 2.2 AA intent, not certified).** Calm Mode, Read Aloud (`rate 0.88`, `ar-SA`), RTL/`lang="ar"` Arabic controls, keyboard-complete operation, ARIA `tablist`/`radiogroup`, labelled canvases/sections, 44–50 px targets, Apple-HIG focus rings, non-colour-only feedback (icons + words + percentages). No independent accessibility audit has been performed; do not cite as WCAG-certified. No vestibular-risk animation beyond the waveform, which Calm Mode removes.
- **Licensing — read before submitting to a university or corpus registry.** (a) This repository declares **no code licence file**; obtain author permission or add one (MIT/Apache-2.0 recommended) before redistribution. (b) Wiktionary IPA/audio metadata: **CC BY-SA 4.0 — credit “Wiktionary contributors” with hyperlink and licence notice, ShareAlike on adaptation.** (c) Commons/Lingua Libre audio (173 kept files): **per-file licences vary (CC BY-SA / CC0); bulk MP3 redistribution without per-file credit violates the licences** — generate an attribution appendix from the Commons `imageinfo` `extmetadata` before publishing the `public/audio/` bundle. (d) ar_50k frequency list: research-use; CAMeL/CEFR lists are cited references, not redistributed — confirm policy for commercial use. (e) Fonts/deps: OFL (Plus Jakarta Sans, Noto Naskh Arabic)/MIT/Apache as installed. (f) Edge neural audio is a Microsoft synthetic voice — no speaker rights attach, but do not imply Microsoft endorsement. (g) This project is **not endorsed by, affiliated with, or certified by Oxford University Press, the CEFR Council of Europe, Wiktionary, Wikimedia, or Microsoft.**
- **Corpus-review suitability.** Suitable as a *study corpus + trainer* with disclosed template wording and mixed human/neural voices (§6.6, §6.7, §14). Not suitable as a *reference phonetic corpus* until per-file speaker/dialect/licence metadata and human validation of scenario transcripts are added (§15).

---

## 14. Limitations, Threats to Validity, and Known Defects — Nothing Hidden

1. **Audio coverage gap — CLOSED 2026-09-20 (Arabic).** 4,620 Arabic MP3s on disk, 0 missing of 3,600 word URLs and 0 missing of 1,020 scenario URLs (173 human + 4,447 neural, 0 generation failures). The sine fallback is dormant last-resort code. What reviewers must weigh instead is **voice/dialect heterogeneity** (mixed Commons speakers/dialects + single Edge MSA voice — see §6.7) and **repo weight** (~267 MB of Arabic MP3s plus legacy English files; do not commit to git without LFS).
2. **Scenario audio = full-transcript ar-SA neural speech (generated scenarios).** The 1,020 template scenarios play their complete MSA announcement (~10–14 s) in the single `ar-SA-ZariyahNeural` voice. Template wording itself remains unvetted Mad Libs — see item 3.
3. **Template artefacts.** Generated MSA scenarios reuse phrasing; some option sets required padding (`لا شيء مما ذُكر`) and distractor plausibility was not human-rated. Scenarios are unvetted Mad Libs from `{CITY}`, `{GATE}`, `{TIME}` token substitution, not examiner-written items — though all 1,020 now carry matching full-transcript audio, and number/gender/case agreement was mechanically verified (0 defects at ship).
4. **Placeholder phonetics for general vocab.** All 3,358 `general_vocab` items carry `ipa: "/{word}/"` and many carry placeholder `partOfSpeech: "noun"` regardless of truth. Only minimal-pair subsets (242) have trustworthy IPA/POS/transliteration. (The English-build `category`-union schema drift is fixed: `general_vocab` is now in the type.) Per-file human/neural audio provenance is also not yet in `vocabulary.json`.
5. **Non-deterministic degradation.** Packet-loss dropouts use plain `Math.random()` per playback with no seed — not Gilbert-Elliott or any standard burst-loss model; identical “trials” are not acoustically identical. IR noise is likewise generated once per context from `Math.random()`. (Engine unchanged from English build — same limitation, same disclosure.)
6. **Unvalidated difficulty strata.** A1–C1 labels are author-assigned by ar_50k frequency rank + curated MSA core cross-checked against the Arabic CEFR list and CAMeL frequencies, not Rasch-calibrated or examiner-moderated. C2 absent by design because there was no objective basis to classify it.
7. **No adaptive sequencing, no efficacy trial, no reliability stats.** Shuffling is uniform-random; no SRS, no IRT, no Cronbach’s α / test–retest has been computed. The stats drawer is descriptive, not psychometrically validated.
8. **Residual scaffold.** `express`, `@google/genai`, `motion`, `canvas-confetti` are installed but unwired; `metadata.json`’s Gemini capability and `.env.example`’s keys are inert. `clean` script uses POSIX `rm` (breaks on stock Windows PowerShell). `generate_arabic_corpus.js` requires network for the ar_50k fetch and falls back to the offline core + pairs if it fails (849 words standalone).
9. **Browser variance.** Convolver/WaveShaper/decoder behaviour differs across browsers; reported SNRs are digital-domain calculations relative to an assumed 0.35 speech RMS, not sound-pressure-level measurements. No hearing-safety limiter beyond `masterGain = 1.0` is implemented — keep device volume moderate with headphones.
10. **Human-audio dialect admixture.** The 173 kept human recordings mix MSA (`ara`) with Moroccan (`ary`), Egyptian (`arz`) and Levantine (`apc`/`ajp`) realizations — e.g. one emphatic pair spans `ary`+`ajp` voices. Learners WILL hear non-MSA variants (interdental→stop fricative mergers, different /q/–/g/ and vowel qualities). This is disclosed, not filtered: it aids dialect awareness but confounds strict MSA phoneme-discrimination measurement. Mitigation: regenerate any subset with the single neural voice (step 9) or restrict to `ara`-only pairs after a per-file audit (§15).
11. **Phrase-embedded human recordings.** A minority of human hits record the target word inside a longer phrase (proper names, verse fragments) rather than in isolation. Both members of such pairs were repaired to single-voice neural audio where they collided (§6.7); remaining phrase-embedded singletons are disclosed in the ingest log pattern, not individually tagged.
12. **MSA-only scope.** Dialect pronunciations (Egyptian ت/د for ث/ذ, Gulf/Levantine variants) are accepted nowhere in scoring; the corpus teaches MSA. Travellers to dialect regions should treat this as a formal-register foundation, not street coverage.

---

## 15. Evaluation Plan and Future Work

Proposed within-subjects study: learners grouped by author-assigned A1–C1 practice levels × 5 author-tuned presets × 3 modes, counterbalanced, with pre/post clean-vs-degraded minimal-pair probes at fixed digital-domain SNRs (18/12/5/2/0 dB) on emphatic/pharyngeal/uvular contrasts, retention at 1 week, and transfer to held-out MSA scenarios; primary endpoints per-phoneme Δaccuracy and SNR-slope flattening; analysis by mixed-effects logistic regression with random intercepts for learner and item. Power from pilot drawer data (export `localStorage` JSON). This study has not been run; no efficacy claim is made.

Roadmap, in priority order: (a) per-file speaker/dialect/licence attribution roll (human-vs-neural + `ara` vs dialect tag per entry) + human IPA/POS audit of the 3,358 general items; (b) single-voice minimal-pair set option for strict discrimination studies (mechanism exists: `EDGE_FORCE_IDS`/`EDGE_ONLY_FORCE`, or full `ar-mp-*` regeneration); (c) seeded-PRNG “frozen trial” mode for replicability; (d) adaptive scheduler (IRT/SRS) + reliability reporting; (e) C2 stratum only after external moderation (candidate source: Arabic CEFR C2 lemmas); (f) server-optional sync with E2E encryption; (g) ESLint + unit/integration tests for Arabic scoring (`normalizeArabic`, digit synonyms), shuffling, and DSP math; (h) SPL-calibrated headphone profiles and safe-listening limiter; (i) Git LFS for `public/audio/` (~267 MB Arabic + legacy English); (j) dialect-expansion packs (Egyptian/Levantine/Gulf scenario overlays) clearly separated from the MSA core.

---

## 16. References

- Council of Europe. (2020). *Common European Framework of Reference for Languages: Learning, Teaching, Assessment — Companion Volume.* Council of Europe Publishing. (Used for familiar A1–C1 bin names only; no certification claimed.)
- Oxford University Press / Oxford Online Placement Test (OOPT) — CEFR banding guidance (levels A1–C1 referenced for strata naming only; no certification, affiliation, or endorsement claimed).
- ITU-T narrowband telephony (PSTN, nominal 300–3,400 Hz, cf. G.711) — band edges reused for `landline` preset only; other preset values are author-tuned.
- W3C. *Web Audio API Specification* (`BiquadFilterNode`, `WaveShaperNode`, `ConvolverNode`, `AnalyserNode`).
- Paul Kellett pink-noise filter coefficients (6-pole IIR 1/f approximation, as implemented).
- Flege, J. E. Speech Learning Model (SLM); Best, C. T. Perceptual Assimilation Model for L2 (PAM-L2) — design motivation only, not validation of this app.
- Aldamen, H., & Al-Deaibes, M. (2023). Arabic emphatic consonants as produced by English speakers: an acoustic study. *Heliyon.* (VOT as reliable stop cue; F1↑/F2↓/F3↑ vowel effects; proficiency effects.)
- Hayes-Harb, R., & Durham, K. (2016). Native English speakers' perception of Arabic emphatics; vowel-context effects ([a] easiest). *Plus* Reading LSWP-9 (Binasfour & Setter): 36–63% L2 emphatic perception/production error; pharyngealization-spread account.
- Al Mahmoud, M. S. (2013). Discrimination of Arabic contrasts by American learners. *SSLLT 3*(2). (PAM assimilation-type predictions: CG emphatic/plain, UC pharyngeal–glottal/velar–uvular, UU uvular sets.)
- Lowe, C. (2025). Perceptual acquisition of Arabic emphatic consonants in the L2: is pharyngealisation enough? (Vowel cues dominate for English L1; /t/–/tˤ/ most accurate; /a/ most accurate.)
- Khallaf, N. et al. Arabic CEFR Classified List (8,834 MSA lemmas; Buckwalter + KELLY + Al-Kitaab via MADAMIRA) — reference for level bins.
- CAMeL-Lab. Camel Arabic Frequency Lists (16.1M types / 17.3B tokens; MSA split) — reference for frequency ordering.
- Mozilla Common Voice Arabic v26 (136,185 clips, 157.46 h, CC0); MBZUAI ArVoice (Interspeech 2025, 83.52 h multi-speaker MSA); Arabic Speech Corpus (4.1 h, CC-BY-4.0); ClArTTS (12 h Classical Arabic) — reference corpora, not bundled.
- Ladefoged, P., & Johnson, K. *A Course in Phonetics* (IPA conventions, functional load).
- Bjork, R. A., & Bjork, E. L. Desirable difficulties; Sweller, J. Cognitive Load Theory.
- CAST. *Universal Design for Learning Guidelines*; W3C. *Web Content Accessibility Guidelines (WCAG) 2.2* (intent only, no certification).
- Data sources: English Wiktionary Arabic entries (CC BY-SA 4.0); Wikimedia Commons + Lingua Libre `ara/ary/arz/ajp/apc` (per-file licences); hermitdave ar_50k (GitHub); Edge Neural TTS `ar-SA-ZariyahNeural` (Microsoft synthetic voice); Plus Jakarta Sans + Noto Naskh Arabic (OFL 1.1).

Suggested citation for this system: *Listening Practice · Arabic (MSA) — Acoustic Ear Degraded-Speech Practice Prototype, MSA corpus v3.0.0 (3,600 educational-safe words incl. 242 IPA-annotated minimal pairs; 1,020 MSA scenarios with full-transcript audio; 4,620 Arabic MP3s — 173 Commons/Lingua Libre human + 4,447 Edge `ar-SA-ZariyahNeural`, 15 collision repairs, 0 missing, verified 2026-09-20), React/Web-Audio implementation, 2026. DSP/App logic identical to the English build. Independent prototype, not OUP/CEFR-certified. Commons human audio © their contributors under CC BY-SA/CC0 as applicable.*

---

## 17. Appendices

### Appendix A — Minimal-pair contrast inventory (shipped, v3.0.0 MSA)

| Contrast | Example pairs (levels) |
|---|---|
| `/s/–/sˤ/` | سَيْف/صَيْف، سَارَ/صَارَ، سُور/صُور، سَبَّ/صَبَّ، سَلَّى/صَلَّى، سَاحَ/صَاحَ، سَرَّ/صَرَّ، صَبْر/سَبْر، صَدَى/سَدَى (A1–B2) |
| `/t/–/tˤ/` | تِين/طِين، تَابَ/طَابَ، تَرَب/طَرَب، طَبَعَ/تَبِعَ، تَلَّ/طَلَّ، تَمَّ/طَمَّ (A1–B2) |
| `/d/–/dˤ/` | دَرْب/ضَرْب، دَلَّ/ضَلَّ، دَاء/ضَاءَ، دَلِيل/ضَلِيل، ضَلَال/دَلَال (A1–B2) |
| `/ð/–/ðˤ/` | ذَلَّ/ظَلَّ، ذُلّ/ظِلّ، ذَرْف/ظَرْف (A2–B1) |
| `/θ/–/sˤ/` | ثَوَاب/صَوَاب (B1) |
| Vowel quantity | دِين/دَيْن، عُد/عُود، قُل/قُول، بَرَّ/بِرَّ/بُرَّ، جَدّ/جَادّ، كَاتِب/كَتَبَ، عَامِل/عَمِلَ، طَالَ/طَلَّ، حَمَام/حَمَّام (A1–B2) |
| `/ħ/–/h/` | حَلَّ/هَلَّ، حَبَّ/هَبَّ، حَال/هَالَ، حَدَّ/هَدَّ، حَوْل/هَوْل، حَمَّ/هَمَّ (A2–B2) |
| `/ʕ/–/ʔ/` | عَلَم/أَلَم، عَيْن/أَيْن، عَمَل/أَمَل، عَرْض/أَرْض، عَمّ/أَمَّ، عَرَب/أَرَب (A1–B2) |
| `/q/–/k/` | قَلْب/كَلْب، قَرَّ/كَرَّ، قَدَّ/كَدَّ، قَشَّرَ/كَشَّرَ، قَمَر/كَمَر (A1–B2) |
| `/x/–/ħ/`, `/x/–/ɣ/` | خَال/حَال، خَلّ/حَلّ، خَدّ/حَدّ، خَطَبَ/حَطَبَ، خَتَمَ/حَتَمَ؛ خَرَّ/غَرَّ، خَطَّ/غَطَّ، غَائِب/خَائِب (A1–B2) |
| `/θ/–/s/`, `/θ/–/t/` | ثَارَ/سَارَ، ثَمَن/سَمَن، ثَمَر/سَمَر، ثَوْرَة/سُورَة (near); ثَمَّ/تَمَّ، ثَابَ/تَابَ (A2–B2) |
| `/ð/–/z/`, `/ð/–/d/` | ذَرَّ/زَرَّ؛ نَذَرَ/نَدَرَ، بَذَرَ/بَدَرَ (B2) |
| `/ʃ/–/s/`, `/ʃ/–/dʒ/`, `/dʒ/–/z/`, `/ðˤ/–/z/` | شَكَّ/سَكَّ، شَهْر/سَهَر، شَالَ/سَالَ، شَبَّ/سَبَّ، شَرَف/سَرَف؛ شَاعَ/جَاعَ، شَدَّ/جَدَّ، شَمْل/جَمَل؛ جَرَّ/زَرَّ؛ ظَاهِر/زَاهِر (A2–B2) |
| `/z/–/s/` | زَارَ/سَارَ، زَادَ/سَادَ، زَمَن/سَمَن، عَسَلَ/عَزَلَ (A2–B2) |
| `/l/–/r/`, `/b/–/m/`, `/f/–/b/`, `/n/–/m/` | لَاحَ/رَاحَ، لَفَّ/رَفَّ؛ بَيْت/مَيْت، بَرَّ/مَرَّ، بَاعَ/مَاعَ؛ فَاتَ/بَاتَ، فَرَّ/بَرَّ؛ نَالَ/مَالَ (A1–B1) |
| Gemination `/C/–/CC/` | دَرَسَ/دَرَّسَ، عَلِمَ/عَلَّمَ، فَهِمَ/فَهَّمَ، كَسَرَ/كَسَّرَ، سَلِمَ/سَلَّمَ (C1)؛ قَدِمَ/قَدَّمَ، خَرَجَ/خَرَّجَ، جَمَل/جَمَّلَ (B1–B2)؛ فَرَح/فَرَّحَ، كَبِير/كَبَّرَ، صَغِير/صَغَّرَ، طَوِيل/طَوَّلَ، قَصِير/قَصَّرَ، جَدِيد/جَدَّدَ، قَرِيب/قَرَّبَ، نَظِيف/نَظَّفَ (A1)؛ بَارِد/بَرَّدَ، سَرِيع/سَرَّعَ، وَسِخ/وَسَّخَ (A2)؛ مَرِيض/مَرَّضَ، جَائِع/جَوَّعَ، رَخِيص/رَخَّصَ، غَالِي/غَلَّى (B1)؛ عَطْشَان/عَطَّشَ، حَارّ/حَرَّرَ (B2) |
| Numbers (unit–ten) | ثَلاثَة/ثَلاثُون، أَرْبَعَة/أَرْبَعُون، خَمْسَة/خَمْسُون، سِتَّة/سِتُّون، سَبْعَة/سَبْعُون، ثَمَانِيَة/ثَمَانُون، تِسْعَة/تِسْعُون، عَشَرَة/عِشْرُون (A1)؛ أَحَدَ عَشَرَ/اثْنَا عَشَرَ، وَاحِد/اثْنَان، صِفْر/عَشَرَة (A1)؛ مِئَة/أَلْف (B1) |

### Appendix B — Preset matrix

See §7.2 (exact HP/LP/drive/SNR/noise/loss/reverb per preset plus custom slider ranges).

### Appendix C — JSON schemas

See §6.3 for `VocabEntry`, `StressScenario`, `VocabDataset`, `AcousticConfig`, `UserStats` with verbatim examples. Validate with `tsc --noEmit` (types) plus a JSON-schema check on `public/data/vocabulary.json` before submission.

### Appendix D — Keyboard shortcuts

`Space` degraded replay · `C` clean bypass · `1`–`4` answer · `Enter` submit/next · `R` replay in feedback state · `Esc` blur dictation input.

### Appendix E — Glossary

SNR (signal-to-noise ratio, dB); HP/LP (high-/low-pass cutoff); WaveShaper drive (saturation index); packet loss (stochastic 30–90 ms muting); convolver IR (synthetic room impulse); minimal pair (two words differing by one phoneme); emphatic (pharyngealized coronal: ص ض ط ظ vs س د ت ذ); MSA (Modern Standard Arabic, formal pan-Arab standard); tashkeel (vowel diacritics); shadda (gemination mark ّ); transliteration (Latin gloss, e.g. ṣayf); CEFR/OOPT (proficiency framework/placement test); A/B bypass (instant clean reference).

### Appendix F — Version and reproduction record

- Corpus snapshot: `version 3.0.0` (`language: "ar"`), 3,600 educational-safe MSA words (242 pairs + 607 curated core + 2,751 ar_50k fill), 1,020 MSA scenarios, `audioCoverage` block (0 missing), 4,620 Arabic MP3s (~267 MB, 44.1 kHz/128k/mono: 173 Commons/Lingua Libre human + 4,447 Edge `ar-SA-ZariyahNeural` incl. 15 collision repairs, 0 failures), verified 2026-09-20 via `node -e` JSON audit + `Get-ChildItem public/audio/ar-*.mp3` + ffprobe spot-checks (`ar-mp-0001.mp3` human سَيْف 1.39 s, `ar-mp-0052.mp3` neural دَيْن 1.87 s, `ar-scenario_1.mp3` 13.44 s). English backups kept at `public/data/vocabulary.v2.1.0-english.backup.json` (+ v2.0.0).
- Generators: `node scripts/generate_arabic_corpus.js` (word/scenario JSON) → `node scripts/ingest_arabic_audio.js --max=242` (human fill: 188 resolved, 173 kept) → force-repair (`EDGE_FORCE_IDS` + `EDGE_ONLY_FORCE=1`: 15/15) → `python scripts/generate_all_audio_edge.py` in `EDGE_MAX` chunks (40/300/700/700/700/700/592; 4,432 fills, 0 failures). English predecessors retained in `scripts/` for reference.
- Reproduce counts any time with the one-liner in §6.1. Back up `vocabulary.json` before re-running any writer script.
- `public/audio/` is currently unignored (4,620 Arabic MP3s, ~267 MB; legacy English MP3s deleted 2026-09-20) — confirm Git LFS coverage before archiving for review.

*End of README — no aspect of the corpus size, audio coverage, DSP mathematics, scoring rules, data provenance, licensing obligations, or known defects has been knowingly withheld. Where the implementation is provisional (dormant sine fallback, template scenarios, placeholder IPA, author-assigned levels, ear-tuned presets inherited unchanged from the English build, mixed human/neural/dialect voices, inert Gemini flag), it is labelled as such above so reviewers can judge accordingly. This is an independent MSA practice prototype, not an accredited test suite. Audio: 4,620 real-speech Arabic MP3s, 0 missing, verified 2026-09-20.*

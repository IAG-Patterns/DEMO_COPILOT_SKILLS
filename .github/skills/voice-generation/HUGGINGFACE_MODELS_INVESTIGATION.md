# Hugging Face TTS/Audio Models Investigation

**Investigation Date:** January 8, 2026
**Purpose:** Identify better models than Bark for voice generation/singing

---

## Executive Summary

Based on deep investigation, here are the **top recommended models** ranked by use case:

### 🏆 For Singing/Music Generation (Best Options):

| Rank | Model | Why Better Than Bark | Difficulty | GPU Req |
|------|-------|---------------------|------------|---------|
| 1 | **ACE-Step** | Full song generation (vocals + accompaniment), 15x faster than LLM-based, lyric editing | Medium | 8GB+ |
| 2 | **Tencent SongGeneration** | Professional quality songs, 4m30s length, dual-track output | Medium | 10GB+ |
| 3 | **Bark** (current) | Simple, proven, good for short singing clips | Easy | 4GB+ |

### 🏆 For Text-to-Speech (Best Options):

| Rank | Model | Why Better Than Bark | Speed | Size |
|------|-------|---------------------|-------|------|
| 1 | **Kokoro-82M** | 167x faster, only 82M params, Apache license, high quality | ⭐⭐⭐⭐⭐ | 82M |
| 2 | **Microsoft VibeVoice** | Multi-speaker (4), 90min audio, podcast-quality | ⭐⭐⭐ | 1.5B |
| 3 | **Supertonic 2** | Fastest (12164 chars/sec on RTX4090), 66M params, multilingual | ⭐⭐⭐⭐⭐ | 66M |
| 4 | **Fish-Speech 1.5** | 1M+ hours training, 13 languages, excellent quality | ⭐⭐⭐⭐ | ~1B |

---

## Detailed Model Analysis

### 1. 🎵 Kokoro-82M - Best Lightweight TTS

**Repository:** https://huggingface.co/hexgrad/Kokoro-82M
**GitHub:** https://github.com/hexgrad/kokoro
**Downloads:** 1.78M/month (extremely popular)
**License:** Apache 2.0 ✅

**Key Strengths:**
- Only 82M parameters - runs on CPU!
- Comparable quality to much larger models
- 167x faster than real-time on RTX4090
- Multiple languages (English, Spanish, French, Hindi, Italian, Japanese, Portuguese, Chinese)
- Multiple voice presets
- Active development, very popular

**Installation:**
```bash
pip install kokoro>=0.9.4 soundfile
# On Windows, also install espeak-ng from https://github.com/espeak-ng/espeak-ng/releases
```

**Usage:**
```python
from kokoro import KPipeline
import soundfile as sf

pipeline = KPipeline(lang_code='a')  # 'a' = American English

text = "Hello, this is a test of the Kokoro text to speech model."
generator = pipeline(text, voice='af_heart')

for i, (gs, ps, audio) in enumerate(generator):
    sf.write(f'output_{i}.wav', audio, 24000)
```

**Singing Capability:** ❌ No native singing support (speech only)

---

### 2. 🎶 ACE-Step - Best for Full Song Generation

**Repository:** https://huggingface.co/ACE-Step/ACE-Step-v1-3.5B
**GitHub:** https://github.com/ace-step/ACE-Step
**License:** Apache 2.0 ✅

**Key Strengths:**
- Generates complete songs with vocals AND accompaniment
- 15x faster than LLM-based models
- 4 minutes of music in 20 seconds on A100
- Full-song generation, duration control
- Lyric editing capability
- Voice cloning, remixing
- 19 languages supported

**Hardware Performance:**
| GPU | RTF (27 steps) | Time for 1 min |
|-----|----------------|----------------|
| RTX 4090 | 34.48x | 1.74s |
| A100 | 27.27x | 2.20s |
| RTX 3090 | 12.76x | 4.70s |
| M2 Max | 2.27x | 26.43s |

**Installation:**
```bash
git clone https://github.com/ace-step/ACE-Step.git
cd ACE-Step
pip install -e .

# Run the Gradio UI
acestep --port 7865
```

**API Usage:**
```bash
pip install git+https://github.com/ace-step/ACE-Step.git
```

```python
# ACE-Step generates via a Gradio interface or command line
# Full API usage requires running the inference script
```

**Why Better Than Bark for Singing:**
- ✅ Generates professional-quality full songs
- ✅ Separate vocal and accompaniment tracks
- ✅ Lyric-aligned generation
- ✅ Much faster inference
- ✅ Voice cloning support
- ❌ More complex setup
- ❌ Higher GPU requirements

---

### 3. 🎤 Tencent SongGeneration (LeVo) - Best Production Quality

**Repository:** https://huggingface.co/tencent/SongGeneration
**GitHub:** https://github.com/tencent-ailab/songgeneration
**License:** Custom (see LICENSE file)

**Key Strengths:**
- Professional production quality
- Up to 4m30s song generation
- Dual-track output (vocals + accompaniment separate)
- Prompt audio for style transfer
- Outperforms Suno and other commercial models on benchmarks

**Model Versions:**
| Version | Duration | Languages | GPU Memory |
|---------|----------|-----------|------------|
| base | 2m30s | Chinese | 10G/16G |
| base-new | 2m30s | Chinese, English | 10G/16G |
| base-full | 4m30s | Chinese, English | 12G/18G |
| large | 4m30s | Chinese, English | 22G/28G |

**Installation:**
```bash
git clone https://github.com/tencent-ailab/SongGeneration.git
cd SongGeneration
pip install -r requirements.txt
pip install -r requirements_nodeps.txt --no-deps

# Download model
huggingface-cli download lglg666/SongGeneration-base-new --local-dir ./songgeneration_base_new
```

**Usage:**
```bash
sh generate.sh songgeneration_base_new sample/lyrics.jsonl sample/output
```

**Lyrics Format:**
```
[intro-short] ; [verse] These faded memories of us. I can't erase the tears you cried before. ; [chorus] Like a fool begs for supper. I find myself waiting for her. ; [outro-short]
```

---

### 4. 🎙️ Microsoft VibeVoice - Best for Long-form/Podcasts

**Repository:** https://huggingface.co/microsoft/VibeVoice-1.5B
**GitHub:** https://github.com/microsoft/VibeVoice
**Downloads:** 419K/month
**License:** MIT ✅

**Key Strengths:**
- Up to 90 minutes of audio
- Up to 4 distinct speakers
- Podcast/conversational audio
- 7.5 Hz ultra-low frame rate (efficient)
- Based on Qwen2.5-1.5B LLM

**Limitations:**
- ❌ Speech-only, no music/singing
- ❌ English and Chinese only
- ❌ Adds AI disclaimer watermark to audio

---

### 5. ⚡ Supertonic 2 - Fastest TTS

**Repository:** https://huggingface.co/Supertone/supertonic-2
**GitHub:** https://github.com/supertone-inc/supertonic
**License:** OpenRAIL-M

**Key Strengths:**
- 167x faster than real-time
- Only 66M parameters
- On-device, no cloud needed
- ONNX optimized
- 5 languages (English, Korean, Spanish, Portuguese, French)

**Performance:**
| Platform | Characters/Second |
|----------|------------------|
| RTX 4090 | 12,164 |
| M4 Pro WebGPU | 2,509 |
| M4 Pro CPU | 1,263 |
| Kokoro | 117 |

**Singing Capability:** ❌ No singing support

---

### 6. 🐟 Fish-Speech 1.5 - Best Multilingual TTS

**Repository:** https://huggingface.co/fishaudio/fish-speech-1.5
**GitHub:** https://github.com/fishaudio/fish-speech
**License:** CC-BY-NC-SA-4.0 (Non-commercial)

**Key Strengths:**
- Trained on 1M+ hours of audio
- 13 languages with excellent quality
- Voice cloning capability
- Active development (OpenAudio S1)

**Languages:**
English (300k+ hrs), Chinese (300k+ hrs), Japanese (100k+ hrs), German, French, Spanish, Korean, Arabic, Russian, Dutch, Italian, Polish, Portuguese

---

## Comparison Matrix

| Model | Singing | TTS | Speed | Size | GPU Req | License | Ease |
|-------|---------|-----|-------|------|---------|---------|------|
| **Kokoro-82M** | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 82M | CPU OK | Apache | ⭐⭐⭐⭐⭐ |
| **ACE-Step** | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ | 3.5B | 8GB+ | Apache | ⭐⭐⭐ |
| **SongGeneration** | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ | Large | 10GB+ | Custom | ⭐⭐ |
| **VibeVoice** | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 1.5B | 8GB+ | MIT | ⭐⭐⭐ |
| **Supertonic** | ❌ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 66M | CPU OK | OpenRAIL | ⭐⭐⭐⭐ |
| **Fish-Speech** | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ~1B | 4GB+ | NC | ⭐⭐⭐ |
| **Bark** (current) | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ~1B | 4GB+ | MIT | ⭐⭐⭐⭐ |

---

## Recommendations for SKILL.md Update

### For Singing Tasks:
1. **Primary:** Keep Bark for simple singing (proven, easy)
2. **Advanced:** Add ACE-Step for professional full-song generation
3. **Enterprise:** Add SongGeneration for production quality

### For TTS Tasks:
1. **Primary:** Add Kokoro-82M (fastest, lightest, Apache license)
2. **Alternative:** Keep Coqui TTS for voice cloning
3. **Long-form:** Add VibeVoice for podcasts/conversations

### Benchmark Updates:
1. Add Kokoro task (much faster than current tests)
2. Add ACE-Step task for full song generation
3. Keep Bark task for backward compatibility

---

## Quick Installation Commands

```bash
# Kokoro (recommended for TTS)
pip install kokoro>=0.9.4 soundfile

# ACE-Step (recommended for singing/music)
pip install git+https://github.com/ace-step/ACE-Step.git

# Bark (current, simple singing)
pip install git+https://github.com/suno-ai/bark.git scipy
```

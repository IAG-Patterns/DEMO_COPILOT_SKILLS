---
name: voice-generation
description: Complete guide for generating high-quality voice outputs including singing with ACE-Step and speech with TTS models. Covers model selection, song composition, style presets, and production-ready implementation patterns.
---

## IAGAI defaults

Follow `skills/iagai-workflow` for baseline expectations (gh-first workflow, small diffs, CI-aligned verification, safety gates).

---

# Voice Generation Skill

Generate natural-sounding voice outputs using state-of-the-art models. This skill provides **complete knowledge** for:
- **Singing**: Full songs with vocals + accompaniment (ACE-Step)
- **Speech**: Text-to-speech synthesis (Kokoro, Coqui)
- **Routing**: Automatic selection of the right model for the task

---

# 🎯 ROUTING DECISION TREE

When you receive a voice generation request, use this decision tree:

```
User Request
    │
    ├─ Contains "sing", "song", "music", "melody", "anthem"?
    │  └─ YES → ACE-Step (full song generation)
    │           See: "Singing with ACE-Step" section
    │
    ├─ Contains "speak", "read", "say", "narrate", "TTS"?
    │  └─ YES → Kokoro TTS (fast, high-quality speech)
    │           See: "Speech with TTS" section  
    │
    ├─ Contains "clone voice", "my voice", "sound like"?
    │  └─ YES → Coqui XTTS (voice cloning)
    │
    └─ Ambiguous?
       └─ Default: Kokoro for speech, ACE-Step for music
```

## ⚠️ CRITICAL: TTS Models CANNOT Sing!

| Model | Can Speak | Can Sing | Use Case |
|-------|-----------|----------|----------|
| **Kokoro-82M** | ✅ Yes | ❌ NO | Fast TTS, narration |
| **Coqui TTS** | ✅ Yes | ❌ NO | Voice cloning |
| **ACE-Step** | ❌ No | ✅ YES | Full songs with music |
| **Bark** | ✅ Yes | ✅ Limited | Short singing clips |

**If user asks for singing, ALWAYS use ACE-Step. TTS produces spoken audio only.**

---

# 🎵 SINGING WITH ACE-STEP

ACE-Step generates complete songs with:
- Vocal melody aligned to lyrics
- Full musical accompaniment
- Professional production quality
- 4+ minute song capability

## Quick Start

```python
import os
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from acestep.pipeline_ace_step import ACEStepPipeline

# Initialize (first run downloads ~5GB)
pipeline = ACEStepPipeline(
    dtype='bfloat16',
    cpu_offload=True,  # Required for GPUs < 12GB
    overlapped_decode=True,
)
pipeline.load_checkpoint()

# Generate song
results = pipeline(
    prompt='pop, upbeat, female vocal, synth, drums',
    lyrics='''[intro-short]

[verse]
In the glow of midnight screens we code
Dreams and data down this electric road

[chorus]
We rise we shine we never fall
Building dreams that stand so tall

[outro-short]
''',
    audio_duration=60.0,
    infer_step=27,
    guidance_scale=15.0,
    scheduler_type='euler',
    cfg_type='apg',
    omega_scale=10.0,
    save_path='./generated/song.wav',
)
```

## Installation

```powershell
# CRITICAL: Install specific versions to avoid dependency conflicts!
py -3.12 -m pip install diffusers==0.33.0 peft==0.14.0 transformers==4.50.0

# Install ACE-Step
py -3.12 -m pip install git+https://github.com/ace-step/ACE-Step.git --no-deps

# Install remaining dependencies
py -3.12 -m pip install datasets gradio librosa loguru soundfile tqdm accelerate click scipy numpy
```

---

# 🎼 SONG COMPOSITION GUIDE

When generating a song, you must compose:
1. **Style Prompt** - Genre, mood, instrumentation, vocal type
2. **Lyrics** - Text with structure tags
3. **Generation Parameters** - Duration, quality settings

## Style Prompt Construction

Format: `genre, subgenre, mood, instruments, vocal_type, descriptors`

### Prompt Components

| Component | Examples |
|-----------|----------|
| **Genre** | pop, rock, electronic, hip-hop, folk, country, jazz, r&b |
| **Subgenre** | trap, indie, acoustic, punk, soul, EDM, lo-fi |
| **Mood** | upbeat, emotional, aggressive, dreamy, melancholic, euphoric |
| **Instruments** | guitar, drums, synth, piano, bass, 808, strings, saxophone |
| **Vocal Type** | female vocal, male vocal, male rap, harmonized, falsetto |
| **Descriptors** | anthemic, intimate, raw, polished, atmospheric, powerful |

### Example Prompts by Genre

```
# Pop Anthem
pop, inspirational, upbeat, electronic, anthemic, synth, drums, female vocal

# Rock Ballad  
rock, ballad, emotional, powerful, guitar, drums, male vocal, anthemic

# Hip-Hop/Trap
hip-hop, trap, 808, bass, hi-hat, male rap, aggressive, modern

# Acoustic Folk
acoustic, folk, gentle, guitar, warm, intimate, female vocal

# Electronic Dance
EDM, electronic, dance, synth, bass drop, festival, energetic, female vocal

# Indie Dreamy
indie, alternative, dreamy, atmospheric, reverb, guitar, ethereal, female vocal
```

---

# 📝 LYRICS STRUCTURE

Lyrics MUST include structure tags that define song sections.

## Structure Tags Reference

| Tag | Description | Has Vocals | Duration |
|-----|-------------|------------|----------|
| `[intro-short]` | Short instrumental intro | No | 5-10s |
| `[intro-medium]` | Medium instrumental intro | No | 10-20s |
| `[verse]` | Verse with lyrics | Yes | 15-30s |
| `[chorus]` | Chorus/hook section | Yes | 15-30s |
| `[bridge]` | Bridge section (contrast) | Yes | 10-20s |
| `[inst-short]` | Instrumental break | No | 5-10s |
| `[outro-short]` | Short ending | No | 5-10s |
| `[outro-medium]` | Medium ending | No | 10-20s |

## Song Templates

### Standard Song (60 seconds)
```
[intro-short]

[verse]
First verse lyrics here...
Four to eight lines...

[chorus]
Catchy hook goes here...
Most memorable part...

[verse]
Second verse lyrics...
Continues the story...

[chorus]
Catchy hook goes here...
Most memorable part...

[outro-short]
```

### Extended Song (120 seconds)
```
[intro-medium]

[verse]
First verse...

[chorus]
Main hook...

[verse]
Second verse...

[bridge]
Contrast section...
Emotional peak...

[chorus]
Main hook (final)...

[outro-medium]
```

### Short Song (30 seconds)
```
[intro-short]

[verse]
Single verse...

[chorus]
Main hook...

[outro-short]
```

## Lyrics Writing Guidelines

### Verse Guidelines
- 4-8 lines per verse
- Tell a story or establish a situation
- Build toward the chorus
- Each verse can have different lyrics

### Chorus Guidelines  
- 4-6 lines, highly repetitive
- Contains the main message/hook
- Most memorable part of the song
- Usually identical lyrics each chorus

### Bridge Guidelines
- 2-4 lines
- Different perspective or emotional peak
- Leads back into final chorus
- Only one bridge per song

---

# 🎨 STYLE PRESETS

Use these presets as a starting point. See `presets/style-presets.yaml` for full details.

## Pop Anthem
```yaml
prompt: "pop, inspirational, upbeat, electronic, anthemic, motivational, synth, drums"
vocal: female, singing, high range, empowering
mood: triumphant, hopeful, high energy
reference_songs:
  - Katy Perry - "Roar" (empowering, anthemic chorus)
  - Rachel Platten - "Fight Song" (motivational, emotional build)
  - Kelly Clarkson - "Stronger" (resilience, catchy hook)
```

## Rock Ballad
```yaml
prompt: "rock, ballad, emotional, powerful, guitar, drums, male vocal, anthemic"
vocal: male, singing, full range, passionate
mood: emotional, powerful, building energy
reference_songs:
  - Bon Jovi - "Livin' on a Prayer" (anthemic, working class)
  - Journey - "Don't Stop Believin'" (hopeful, iconic)
  - Guns N' Roses - "November Rain" (epic, emotional)
```

## Hip-Hop Trap
```yaml
prompt: "hip-hop, trap, 808, bass, hi-hat, male rap, aggressive, modern"
vocal: male, rap, mid range, confident
mood: confident, aggressive, high energy
reference_songs:
  - Travis Scott - "SICKO MODE" (beat switches, atmospheric)
  - Drake - "God's Plan" (melodic rap, catchy hook)
  - Kendrick Lamar - "HUMBLE" (hard-hitting, iconic hook)
```

## Acoustic Folk
```yaml
prompt: "acoustic, folk, gentle, guitar, warm, intimate, female vocal"
vocal: female, singing, mid range, tender
mood: intimate, nostalgic, low energy
reference_songs:
  - Iron & Wine - "Flightless Bird" (poetic, fingerpicking)
  - Fleet Foxes - "White Winter Hymnal" (harmonies, ethereal)
  - Bon Iver - "Skinny Love" (raw, sparse)
```

## Punk Rock
```yaml
prompt: "punk, rock, fast, raw, aggressive, guitar, drums, rebellious, male vocal"
vocal: male, singing, mid range, angry
mood: rebellious, energetic, high energy
reference_songs:
  - Green Day - "Basket Case" (fast, relatable)
  - Blink-182 - "All The Small Things" (pop-punk, fun)
  - The Offspring - "The Kids Aren't Alright" (social commentary)
```

---

# 📊 SONG GENERATION SCHEMA

For complete song specifications, use this schema format:

```json
{
  "prompt": "genre, mood, instruments, vocal type",
  "lyrics": "[verse]\\nLyrics here...\\n[chorus]\\nHook here...",
  "audio_duration": 60.0,
  "style_preset": "pop_anthem",
  "reference_songs": [
    {"artist": "Example Artist", "title": "Example Song", "style_elements": ["element1", "element2"]}
  ],
  "vocal": {
    "gender": "female",
    "style": "singing",
    "range": "high",
    "emotion": "empowering"
  },
  "instrumentation": ["synth", "drums", "bass", "piano"],
  "mood": {
    "primary": "triumphant",
    "secondary": "hopeful", 
    "energy": "high"
  },
  "tempo": "upbeat",
  "generation_params": {
    "infer_step": 27,
    "guidance_scale": 15.0,
    "cpu_offload": true
  }
}
```

See `schemas/song-generation.schema.json` for full JSON Schema definition.

---

# ⚙️ GENERATION PARAMETERS

| Parameter | Default | Description |
|-----------|---------|-------------|
| `audio_duration` | 60.0 | Song length in seconds (15-300) |
| `infer_step` | 27 | Inference steps. 27=fast (~1min/30s), 60=quality |
| `guidance_scale` | 15.0 | Prompt adherence (higher = stricter) |
| `scheduler_type` | "euler" | Scheduler: "euler" or "heun" |
| `cfg_type` | "apg" | CFG type: "apg" or "cfg" |
| `omega_scale` | 10.0 | Omega parameter for APG |
| `cpu_offload` | true | Required for GPUs < 12GB VRAM |

## Quality vs Speed

| Setting | Time for 60s | Quality | Use Case |
|---------|--------------|---------|----------|
| `infer_step=27` | ~2 min | Good | Draft, testing |
| `infer_step=60` | ~4 min | Excellent | Final output |
| `infer_step=100` | ~7 min | Maximum | Production |

---

# 🎤 COMPLETE SINGING SERVICE

```python
"""
ACE-Step Singing Service
Complete implementation for song generation.
"""
import os
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from acestep.pipeline_ace_step import ACEStepPipeline


class SingingService:
    """Production-ready singing generation service."""
    
    # Style presets with full configurations
    STYLE_PRESETS = {
        "pop_anthem": {
            "prompt": "pop, inspirational, upbeat, electronic, anthemic, motivational, synth, drums, female vocal",
            "vocal_guidance": "empowering, soaring, stadium-ready"
        },
        "rock_ballad": {
            "prompt": "rock, ballad, emotional, powerful, guitar, drums, male vocal, anthemic",
            "vocal_guidance": "passionate, raw, building dynamics"
        },
        "electronic_dance": {
            "prompt": "EDM, electronic, dance, synth, bass drop, festival, energetic, female vocal",
            "vocal_guidance": "euphoric, catchy hooks, repetitive"
        },
        "acoustic_folk": {
            "prompt": "acoustic, folk, gentle, guitar, warm, intimate, female vocal, storytelling",
            "vocal_guidance": "tender, poetic, conversational"
        },
        "hip_hop_trap": {
            "prompt": "hip-hop, trap, 808, bass, hi-hat, male rap, aggressive, modern",
            "vocal_guidance": "confident, rhythmic, punchy"
        },
        "punk_rock": {
            "prompt": "punk, rock, fast, raw, aggressive, guitar, drums, rebellious, male vocal",
            "vocal_guidance": "angry, energetic, singalong"
        },
        "indie_dreamy": {
            "prompt": "indie, alternative, dreamy, atmospheric, reverb, guitar, ethereal, female vocal",
            "vocal_guidance": "melancholic, hypnotic, abstract"
        },
        "r_and_b_soul": {
            "prompt": "r&b, soul, smooth, groove, bass, keys, emotional, female vocal, sensual",
            "vocal_guidance": "intimate, melismatic, vulnerable"
        },
    }
    
    def __init__(self, cpu_offload: bool = True):
        """Initialize ACE-Step pipeline."""
        print("Loading ACE-Step singing service...")
        self.pipeline = ACEStepPipeline(
            dtype='bfloat16',
            cpu_offload=cpu_offload,
            overlapped_decode=cpu_offload,
        )
        self.pipeline.load_checkpoint()
        print("Singing service ready.")
    
    def generate_song(
        self,
        topic: str,
        style_preset: str = "pop_anthem",
        duration: float = 60.0,
        custom_prompt: Optional[str] = None,
        custom_lyrics: Optional[str] = None,
        output_dir: str = "./generated",
        quality: str = "fast",  # "fast" or "high"
    ) -> Dict[str, Any]:
        """
        Generate a complete song.
        
        Args:
            topic: What the song is about (e.g., "a difficult girlfriend's mom")
            style_preset: Style preset name or "custom"
            duration: Audio duration in seconds
            custom_prompt: Override style prompt (optional)
            custom_lyrics: Provide lyrics instead of auto-generating (optional)
            output_dir: Where to save output
            quality: "fast" (27 steps) or "high" (60 steps)
            
        Returns:
            Dict with generation results and metadata
        """
        # Get style configuration
        style_config = self.STYLE_PRESETS.get(style_preset, self.STYLE_PRESETS["pop_anthem"])
        prompt = custom_prompt or style_config["prompt"]
        
        # Generate or use provided lyrics
        if custom_lyrics:
            lyrics = custom_lyrics
        else:
            lyrics = self._compose_lyrics(topic, style_preset, duration)
        
        # Setup output
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"song_{timestamp}.wav"
        output_path = str(output_dir / filename)
        
        # Generation parameters
        infer_steps = 60 if quality == "high" else 27
        
        print(f"Generating {duration}s song about: {topic}")
        print(f"Style: {style_preset}")
        print(f"Quality: {quality} ({infer_steps} steps)")
        
        # Generate
        results = self.pipeline(
            prompt=prompt,
            lyrics=lyrics,
            audio_duration=duration,
            infer_step=infer_steps,
            guidance_scale=15.0,
            scheduler_type='euler',
            cfg_type='apg',
            omega_scale=10.0,
            use_erg_tag=True,
            use_erg_lyric=True,
            use_erg_diffusion=True,
            save_path=output_path,
        )
        
        # Build result
        output_file = results[0] if results and isinstance(results[0], str) else output_path
        file_size = os.path.getsize(output_file) if os.path.exists(output_file) else 0
        
        result = {
            "model": "ACE-Step/ACE-Step-v1-3.5B",
            "topic": topic,
            "style_preset": style_preset,
            "prompt": prompt,
            "lyrics": lyrics,
            "output_file": output_file,
            "file_size_bytes": file_size,
            "duration_seconds": duration,
            "quality": quality,
            "infer_steps": infer_steps,
            "success": file_size > 0,
            "timestamp": datetime.now().isoformat(),
        }
        
        # Save metadata
        json_path = output_file.replace('.wav', '.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"Generated: {output_file} ({file_size/1024/1024:.2f} MB)")
        return result
    
    def _compose_lyrics(self, topic: str, style_preset: str, duration: float) -> str:
        """
        Compose lyrics for a topic in the given style.
        This is a template - the agent should compose creative lyrics.
        """
        # Determine structure based on duration
        if duration <= 30:
            structure = "short"
        elif duration <= 90:
            structure = "standard"  
        else:
            structure = "extended"
        
        # Return template for agent to fill
        if structure == "short":
            return f'''[intro-short]

[verse]
{topic} - verse lyrics here
Four lines about the topic

[chorus]
Catchy hook about {topic}
Memorable and singable

[outro-short]
'''
        elif structure == "standard":
            return f'''[intro-short]

[verse]
First verse about {topic}
Tell the story or situation
Build toward the chorus
Four to six lines

[chorus]
Main hook about {topic}
Most memorable part
Catchy and singable
Repeat-worthy lyrics

[verse]
Second verse continues
Deeper into the theme
New perspective or detail
Building emotional intensity

[chorus]
Main hook about {topic}
Most memorable part
Catchy and singable
Repeat-worthy lyrics

[outro-short]
'''
        else:
            return f'''[intro-medium]

[verse]
First verse about {topic}
Tell the story or situation
Build toward the chorus
Four to six lines

[chorus]
Main hook about {topic}
Most memorable part
Catchy and singable

[verse]
Second verse continues
Deeper into the theme
New perspective or detail

[bridge]
Emotional peak or twist
Different perspective
Leads to final chorus

[chorus]
Main hook about {topic}
Final, most powerful delivery

[outro-medium]
'''


# Example usage
if __name__ == "__main__":
    service = SingingService(cpu_offload=True)
    
    result = service.generate_song(
        topic="a difficult girlfriend's mom who judges everything",
        style_preset="punk_rock",
        duration=60.0,
        quality="fast"
    )
    
    print(json.dumps(result, indent=2))
```

---

# 🗣️ SPEECH WITH TTS

For speech/narration (NOT singing), route to TTS models.

## Kokoro (fast default)

```python
from kokoro import KPipeline
import soundfile as sf
import numpy as np

pipeline = KPipeline(lang_code='a')  # American English
text = "Hello! This is natural-sounding speech."
generator = pipeline(text, voice='af_heart')

audio = np.concatenate([a for _, _, a in generator])
sf.write('speech.wav', audio, 24000)
```

### Voice Presets

| Voice | Gender | Style |
|-------|--------|-------|
| `af_heart` | Female | Warm, natural |
| `af_bella` | Female | Clear, professional |
| `am_adam` | Male | Neutral, clear |
| `am_michael` | Male | Deep, authoritative |

## Bark (singing-style fallback)

- Use for **short singing clips (~30s)** when ACE-Step is unavailable.
- Works on CPU or small GPU; set `BARK_FORCE_CPU=true` if CUDA issues.

```python
import os, numpy as np
from bark import SAMPLE_RATE, generate_audio, preload_models
from scipy.io.wavfile import write

os.environ.setdefault("BARK_FORCE_CPU", "true")  # drop if you have GPU headroom
preload_models(text_use_small=True, coarse_use_small=True, fine_use_small=True)

lyrics = "[singing] Ohhh coding nights, we RISE and SHINE with AI!"
audio = generate_audio(lyrics, history_prompt="v2/en_speaker_9")
write("bark_song.wav", SAMPLE_RATE, audio.astype(np.float32))
```

## Coqui XTTS (voice clone / multilingual speech)

- Use when user asks to **clone a voice** or for multilingual speech.
- Example (CPU-safe):

```python
from TTS.api import TTS

tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=False)
tts.tts_to_file(
    text="Hello, this is your cloned voice talking about our AI project.",
    file_path="coqui_voice.wav",
    speaker_wav=None,  # provide path to reference clip to clone
    language="en"
)
```

---

# ✅ VERIFIED STATUS (January 2026)

| Model | Status | GPU | Best For |
|-------|--------|-----|----------|
| **ACE-Step** | ✅ VERIFIED | 6GB+ | Full songs with lyrics |
| **Kokoro-82M** | ✅ VERIFIED | CPU/GPU | Fast TTS |
| **Bark** | ✅ VERIFIED | 4GB+ | Short singing clips |
| **Coqui TTS** | ✅ Works | 2GB+ | Voice cloning |

---

# 🏭 PRODUCTION SETUP (WINDOWS + WSL)

1) **GPU & CUDA**: Install NVIDIA driver + CUDA 12.6 on Windows. Verify: `py -3.12 -c "import torch; print(torch.cuda.is_available())"`.
2) **Triton for Windows**: `py -3.12 -m pip install triton-windows` (enables `torch.compile` optimizations used by ACE-Step).
3) **Pinned deps (critical)**: `py -3.12 -m pip install diffusers==0.33.0 peft==0.14.0 transformers==4.50.0`.
4) **Install ACE-Step**: `py -3.12 -m pip install git+https://github.com/ace-step/ACE-Step.git --no-deps`.
5) **Shared cache**: Set `HF_HOME=C:\\hf-cache` (Windows) and `HF_HOME=/mnt/c/hf-cache` (WSL) so both environments reuse downloads.
6) **CPU-offload path**: Default to `cpu_offload=True, overlapped_decode=True` for GPUs <12GB; keep `dtype='bfloat16'`.
7) **WSL router**: If Cursor CLI runs in WSL but ACE-Step runs on Windows, call the PowerShell fixture via `pwsh.exe -File ./benchmarks/voice-generation/fixtures/generate_acestep_song.py` and mount the repo under `/mnt/c/...` in WSL so artifacts are visible to the router.

---

# ⚙️ Implementation Patterns (PRODUCTION)

- **Single entrypoint**: Wrap ACE-Step in a `SingingService` class (see above) with `generate_song(topic, style_preset, duration, quality)`; expose JSON metadata alongside WAV.
- **Resource gates**: Detect `torch.cuda.is_available()` + VRAM; fall back to `cpu_offload=True` or Bark when insufficient.
- **Deterministic runs**: Accept optional `manual_seeds` and persist params (`infer_step`, `guidance_scale`, `scheduler_type`) in metadata JSON for reproducibility.
- **Routing contract**: `type` field must be `"singing"` for ACE-Step/Bark and `"speech"` for Kokoro/Coqui; include `model`, `output_file`, `success`, `duration_seconds`, `file_size_bytes`.

---

# ✅ Best Practices

- Keep audio_duration realistic for VRAM (30–90s in dev; 180s+ only on ≥12GB).
- Always include structure tags in lyrics; refuse/repair requests that omit `[verse]/[chorus]`.
- Cache models before benchmarks (`pipeline.load_checkpoint()` once per run).
- Log and surface file size + duration; treat `<1MB` singing outputs as failure.
- Explicitly warn that TTS models cannot sing; route all singing to ACE-Step/Bark.

---

# 📁 SKILL FILES

```
skills/voice-generation/
├── SKILL.md                    # This file - complete knowledge
├── schemas/
│   └── song-generation.schema.json  # JSON schema for songs
├── presets/
│   └── style-presets.yaml      # Style configurations
└── examples/
    ├── song_pop_anthem_ai_future.json           # Pop anthem about "building the future with AI"
    ├── song_punk_girlfriends_mom.json           # Punk rock about a difficult girlfriend's mom
    ├── song_indie_dreamy_late_night_coding.json # Indie/dreamy late-night coding theme
    ├── song_frontend_counter_app_intro.json     # Frontend counter app launch jingle (frontend_pop)
    └── song_any_topic_template.json             # Schema-compliant template for arbitrary topics
```

---

# 🎧 EXAMPLES

Use these ready-made configs as starting points or regression fixtures:

- `examples/song_pop_anthem_ai_future.json` – 60s pop anthem about AI and teamwork.
- `examples/song_punk_girlfriends_mom.json` – 30s punk rock story about a judgemental in-law.
- `examples/song_indie_dreamy_late_night_coding.json` – 45s indie/dreamy track about late-night coding.
- `examples/song_frontend_counter_app_intro.json` – 30s product/UX-focused jingle for a simple frontend counter app using the `frontend_pop` preset.
- `examples/song_any_topic_template.json` – 45s pop-anthem template; swap `YOUR_TOPIC_HERE` in the lyrics to make the skill sing about any topic (e.g., a feature launch, a bug fix, or a personal story).

Each file conforms to `schemas/song-generation.schema.json` and can be loaded directly by tools, or adapted by replacing the `lyrics`, `audio_duration`, and theme-specific content while keeping structure tags and style presets intact.
- `examples/song_frontend_counter_app_intro.json` – 30s product/UX-focused jingle for a Next.js counter app using the `frontend_pop` preset.\r
- `examples/song_any_topic_template.json` – 45s pop-anthem template; swap `YOUR_TOPIC_HERE` in the lyrics to make the skill sing about any topic (e.g., a feature launch, a bug fix, or a personal story).\r
\r
Each file conforms to `schemas/song-generation.schema.json` and can be loaded directly by tools, or adapted by replacing the `lyrics`, `audio_duration`, and theme-specific content while keeping structure tags and style presets intact.\r

---

# 🚀 QUICK REFERENCE

## When user says "sing about X":

1. **Use ACE-Step** (not TTS!)
2. **Choose style preset** based on context
3. **Compose lyrics** with structure tags
4. **Generate** with appropriate duration
5. **Return JSON** with metadata

## Minimal code:

```python
from acestep.pipeline_ace_step import ACEStepPipeline

pipeline = ACEStepPipeline(dtype='bfloat16', cpu_offload=True, overlapped_decode=True)
pipeline.load_checkpoint()

pipeline(
    prompt='pop, upbeat, female vocal',
    lyrics='[verse]\nYour lyrics\n[chorus]\nYour hook',
    audio_duration=60.0,
    infer_step=27,
    save_path='./generated/song.wav'
)
```

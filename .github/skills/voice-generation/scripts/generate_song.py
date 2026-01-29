#!/usr/bin/env python3
"""
ACE-Step Song Generation Script

Generate complete songs with vocals and accompaniment using ACE-Step.
Part of the voice-generation skill.

Usage:
    python generate_song.py --help
    python generate_song.py --topic "coding at midnight" --style pop_anthem --duration 60
    python generate_song.py --lyrics-file my_lyrics.txt --style rock_ballad

Requirements:
    pip install diffusers==0.33.0 peft==0.14.0 transformers==4.50.0
    pip install git+https://github.com/ace-step/ACE-Step.git --no-deps
    pip install datasets librosa loguru soundfile tqdm accelerate click scipy numpy
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Fix Windows encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.environ['PYTHONIOENCODING'] = 'utf-8'


STYLE_PRESETS = {
    "pop_anthem": "pop, inspirational, upbeat, electronic, anthemic, female vocal, synth, drums",
    "rock_ballad": "rock, ballad, emotional, powerful, guitar, drums, male vocal, anthemic",
    "electronic_dance": "EDM, electronic, dance, synth, bass drop, festival, energetic, female vocal",
    "acoustic_folk": "acoustic, folk, gentle, guitar, warm, intimate, female vocal, storytelling",
    "hip_hop_trap": "hip-hop, trap, 808, bass, hi-hat, male rap, aggressive, modern",
    "punk_rock": "punk, rock, fast, raw, aggressive, guitar, drums, rebellious, male vocal",
    "indie_dreamy": "indie, alternative, dreamy, atmospheric, reverb, guitar, ethereal, female vocal",
    "r_and_b_soul": "r&b, soul, smooth, groove, bass, keys, emotional, female vocal, sensual",
    "frontend_pop": "pop, electronic, upbeat, synth, drums, catchy, female vocal, product launch, tech",
}


def compose_lyrics(topic: str, style: str, duration: float) -> str:
    """Compose lyrics template based on topic and duration."""
    if duration <= 30:
        return f"""[intro-short]

[verse]
{topic} - the story begins
Every moment a chance to win

[chorus]
Rise and shine, reach for the sky
Together we soar, together we fly

[outro-short]
"""
    else:
        return f"""[intro-short]

[verse]
{topic} - in the light of day
We find our path, we find our way
With every step we grow so strong
This is where we all belong

[chorus]
Rise and shine, reach for the sky
Together we soar, together we fly
In the rhythm of our hearts we find
A future bright for all mankind

[verse]
{topic} - through the darkest night
We carry on, we hold on tight
The dreams we chase become so real
This power inside is what we feel

[chorus]
Rise and shine, reach for the sky
Together we soar, together we fly
In the rhythm of our hearts we find
A future bright for all mankind

[outro-short]
"""


def generate_song(
    topic: str = None,
    style: str = "pop_anthem",
    custom_prompt: str = None,
    lyrics: str = None,
    lyrics_file: str = None,
    duration: float = 60.0,
    output: str = None,
    quality: str = "fast",
    cpu_offload: bool = True,
) -> dict:
    """Generate a song using ACE-Step."""
    
    print("=" * 60)
    print("ACE-STEP SONG GENERATION")
    print("=" * 60)
    
    # Determine output path
    if output is None:
        output_dir = Path(__file__).parent.parent / "generated"
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output = str(output_dir / f"song_{timestamp}.wav")
    else:
        Path(output).parent.mkdir(parents=True, exist_ok=True)
    
    # Get style prompt
    prompt = custom_prompt or STYLE_PRESETS.get(style, STYLE_PRESETS["pop_anthem"])
    
    # Get lyrics
    if lyrics_file and os.path.exists(lyrics_file):
        with open(lyrics_file, 'r', encoding='utf-8') as f:
            lyrics = f.read()
    elif lyrics is None:
        if topic:
            lyrics = compose_lyrics(topic, style, duration)
        else:
            lyrics = compose_lyrics("building the future with AI", style, duration)
    
    print(f"Style: {style}")
    print(f"Prompt: {prompt}")
    print(f"Duration: {duration}s")
    print(f"Quality: {quality}")
    print(f"Output: {output}")
    print("-" * 60)
    print(f"Lyrics preview:\n{lyrics[:300]}...")
    print("-" * 60)
    
    # Import and initialize ACE-Step
    print("Loading ACE-Step pipeline...")
    from acestep.pipeline_ace_step import ACEStepPipeline
    
    pipeline = ACEStepPipeline(
        dtype="bfloat16",
        cpu_offload=cpu_offload,
        overlapped_decode=cpu_offload,
    )
    
    print("Loading model checkpoint...")
    pipeline.load_checkpoint()
    
    # Configure inference
    infer_steps = 27 if quality == "fast" else 60
    
    print(f"Generating {duration}s song with {infer_steps} inference steps...")
    
    results = pipeline(
        prompt=prompt,
        lyrics=lyrics,
        audio_duration=duration,
        infer_step=infer_steps,
        guidance_scale=15.0,
        scheduler_type="euler",
        cfg_type="apg",
        omega_scale=10.0,
        guidance_interval=0.5,
        guidance_interval_decay=0.0,
        min_guidance_scale=3.0,
        use_erg_tag=True,
        use_erg_lyric=True,
        use_erg_diffusion=True,
        save_path=output,
    )
    
    # Process results
    print("=" * 60)
    
    output_file = results[0] if results and isinstance(results[0], str) else output
    file_size = os.path.getsize(output_file) if os.path.exists(output_file) else 0
    
    result = {
        "model": "ACE-Step/ACE-Step-v1-3.5B",
        "type": "singing",
        "style_preset": style,
        "prompt": prompt,
        "lyrics": lyrics,
        "topic": topic,
        "output_file": output_file,
        "file_size_bytes": file_size,
        "duration_seconds": duration,
        "infer_steps": infer_steps,
        "quality": quality,
        "cpu_offload": cpu_offload,
        # Optional schema-aligned fields for downstream tools
        "audio_duration": duration,
        "generation_params": {
            "infer_step": infer_steps,
            "guidance_scale": 15.0,
            "scheduler_type": "euler",
            "cfg_type": "apg",
            "omega_scale": 10.0,
            "cpu_offload": cpu_offload,
        },
        "success": file_size > 500000,  # >500KB for reasonable audio
        "error": None,
        "timestamp": datetime.now().isoformat(),
    }
    
    # Save metadata
    json_path = output_file.replace('.wav', '.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    if result["success"]:
        print(f"SUCCESS! Generated: {output_file}")
        print(f"Size: {file_size/1024/1024:.2f} MB")
    else:
        print(f"WARNING: Output may be incomplete ({file_size} bytes)")
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Generate songs with ACE-Step (any topic, style, and duration)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples (arbitrary topics):
  python generate_song.py --topic "coding at midnight" --style pop_anthem
  python generate_song.py --topic "heartbreak" --style rock_ballad --duration 90
  python generate_song.py --topic "a difficult girlfriend's mom who judges everything" --style punk_rock --duration 30
  python generate_song.py --lyrics-file my_lyrics.txt --style punk_rock

Available Styles:
  pop_anthem       - Upbeat, inspirational, female vocal
  rock_ballad      - Emotional, powerful, male vocal  
  electronic_dance - EDM, energetic, female vocal
  acoustic_folk    - Gentle, intimate, female vocal
  hip_hop_trap     - 808, aggressive, male rap
  punk_rock        - Fast, raw, rebellious, male vocal
  indie_dreamy     - Atmospheric, ethereal, female vocal
  r_and_b_soul     - Smooth, emotional, female vocal
  frontend_pop     - Product/UX themed pop for apps and interfaces
"""
    )
    
    parser.add_argument("--topic", "-t", type=str, help="What the song is about")
    parser.add_argument("--style", "-s", type=str, default="pop_anthem",
                        choices=list(STYLE_PRESETS.keys()),
                        help="Style preset (default: pop_anthem)")
    parser.add_argument("--prompt", "-p", type=str, help="Custom style prompt (overrides --style)")
    parser.add_argument("--lyrics", type=str, help="Custom lyrics (inline)")
    parser.add_argument("--lyrics-file", type=str, help="Path to lyrics file")
    parser.add_argument("--duration", "-d", type=float, default=60.0,
                        help="Duration in seconds (default: 60)")
    parser.add_argument("--output", "-o", type=str, help="Output WAV path")
    parser.add_argument("--quality", "-q", type=str, default="fast",
                        choices=["fast", "high"],
                        help="Quality: fast (27 steps) or high (60 steps)")
    parser.add_argument("--no-cpu-offload", action="store_true",
                        help="Disable CPU offloading (requires >12GB VRAM)")
    
    args = parser.parse_args()
    
    result = generate_song(
        topic=args.topic,
        style=args.style,
        custom_prompt=args.prompt,
        lyrics=args.lyrics,
        lyrics_file=args.lyrics_file,
        duration=args.duration,
        output=args.output,
        quality=args.quality,
        cpu_offload=not args.no_cpu_offload,
    )
    
    print("\nJSON RESULT:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    sys.exit(main())

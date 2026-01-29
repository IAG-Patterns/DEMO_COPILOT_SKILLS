#!/usr/bin/env python3
"""
Kokoro TTS Speech Generation Script

Generate natural-sounding speech using Kokoro-82M TTS model.
Part of the voice-generation skill.

Usage:
    python generate_speech.py --help
    python generate_speech.py --text "Hello, this is a test"
    python generate_speech.py --text-file input.txt --voice af_bella

Requirements:
    pip install kokoro>=0.9.4 soundfile numpy
    # Also requires espeak-ng installed: winget install eSpeak-NG.eSpeak-NG
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Fix Windows encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')


VOICE_PRESETS = {
    "af_heart": "Female, warm, natural",
    "af_bella": "Female, clear, professional",
    "af_sarah": "Female, friendly, conversational",
    "am_adam": "Male, neutral, clear",
    "am_michael": "Male, deep, authoritative",
}


def generate_speech(
    text: str = None,
    text_file: str = None,
    voice: str = "af_heart",
    language: str = "a",  # 'a' = American English
    output: str = None,
) -> dict:
    """Generate speech using Kokoro TTS."""
    
    print("=" * 60)
    print("KOKORO TTS SPEECH GENERATION")
    print("=" * 60)
    
    # Get text
    if text_file and os.path.exists(text_file):
        with open(text_file, 'r', encoding='utf-8') as f:
            text = f.read().strip()
    elif text is None:
        text = "Hello! This is Kokoro, an ultra-fast text to speech model. I can generate natural sounding speech for any text you provide."
    
    # Determine output path
    if output is None:
        output_dir = Path(__file__).parent.parent / "generated"
        output_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output = str(output_dir / f"speech_{timestamp}.wav")
    else:
        Path(output).parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Voice: {voice} ({VOICE_PRESETS.get(voice, 'custom')})")
    print(f"Language: American English")
    print(f"Text: {text[:100]}...")
    print(f"Output: {output}")
    print("-" * 60)
    
    # Import and generate
    print("Loading Kokoro pipeline...")
    from kokoro import KPipeline
    import soundfile as sf
    import numpy as np
    
    pipeline = KPipeline(lang_code=language)
    
    print("Generating speech...")
    generator = pipeline(text, voice=voice)
    
    # Collect all audio segments
    all_audio = []
    for i, (gs, ps, audio) in enumerate(generator):
        all_audio.append(audio)
        print(f"  Generated segment {i+1}")
    
    # Concatenate and save
    full_audio = np.concatenate(all_audio)
    sf.write(output, full_audio, 24000)
    
    # Results
    print("=" * 60)
    
    duration = len(full_audio) / 24000
    file_size = os.path.getsize(output)
    
    result = {
        "model": "hexgrad/Kokoro-82M",
        "type": "speech",
        "voice": voice,
        "voice_description": VOICE_PRESETS.get(voice, "custom"),
        "language": "American English",
        "text": text,
        "output_file": output,
        "file_size_bytes": file_size,
        "duration_seconds": round(duration, 2),
        "sample_rate": 24000,
        "success": file_size > 10000,  # >10KB
        "error": None,
        "timestamp": datetime.now().isoformat(),
    }
    
    # Save metadata
    json_path = output.replace('.wav', '.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    if result["success"]:
        print(f"SUCCESS! Generated: {output}")
        print(f"Duration: {duration:.2f} seconds")
        print(f"Size: {file_size:,} bytes")
    else:
        print(f"WARNING: Output may be incomplete")
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Generate speech with Kokoro TTS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_speech.py --text "Hello, world!"
  python generate_speech.py --text-file script.txt --voice af_bella
  python generate_speech.py --text "Welcome to the demo" --output demo.wav

Available Voices:
  af_heart   - Female, warm, natural (default)
  af_bella   - Female, clear, professional
  af_sarah   - Female, friendly, conversational
  am_adam    - Male, neutral, clear
  am_michael - Male, deep, authoritative

Note: Requires espeak-ng installed for phoneme processing.
      Windows: winget install eSpeak-NG.eSpeak-NG
"""
    )
    
    parser.add_argument("--text", "-t", type=str, help="Text to speak")
    parser.add_argument("--text-file", type=str, help="Path to text file")
    parser.add_argument("--voice", "-v", type=str, default="af_heart",
                        choices=list(VOICE_PRESETS.keys()),
                        help="Voice preset (default: af_heart)")
    parser.add_argument("--output", "-o", type=str, help="Output WAV path")
    
    args = parser.parse_args()
    
    result = generate_speech(
        text=args.text,
        text_file=args.text_file,
        voice=args.voice,
        output=args.output,
    )
    
    print("\nJSON RESULT:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    sys.exit(main())

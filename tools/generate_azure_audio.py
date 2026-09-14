#!/usr/bin/env python3
"""Generate Arabic lesson audio with Microsoft Azure Speech.

Environment variables required:
  AZURE_SPEECH_KEY
  AZURE_SPEECH_REGION

Install:
  pip install azure-cognitiveservices-speech

Run from repository root:
  python3 tools/generate_azure_audio.py

The script writes MP3 files into assets/audio/ and never stores the Azure key.
"""

from pathlib import Path
import os
import sys
import azure.cognitiveservices.speech as speechsdk

VOICE = os.getenv("AZURE_SPEECH_VOICE", "ar-SA-ZariyahNeural")
KEY = os.getenv("AZURE_SPEECH_KEY")
REGION = os.getenv("AZURE_SPEECH_REGION")

ITEMS = {
    "assets/audio/ba/name.mp3": "بَاء",
    "assets/audio/ba/fatha.mp3": "بَ",
    "assets/audio/ba/damma.mp3": "بُ",
    "assets/audio/ba/kasra.mp3": "بِ",
    "assets/audio/ba/long-a.mp3": "بَا",
    "assets/audio/ba/long-u.mp3": "بُو",
    "assets/audio/ba/long-i.mp3": "بِي",
    "assets/audio/blend/ka.mp3": "كَ",
    "assets/audio/blend/ta.mp3": "تَ",
    "assets/audio/words/kataba.mp3": "كَتَبَ",
    "assets/audio/words/babun.mp3": "بَابٌ",
    "assets/audio/words/baytun.mp3": "بَيْتٌ",
    "assets/audio/words/hablun.mp3": "حَبْلٌ",
    "assets/audio/words/kitabun.mp3": "كِتَابٌ",
}


def require_env():
    missing = [name for name, value in {
        "AZURE_SPEECH_KEY": KEY,
        "AZURE_SPEECH_REGION": REGION,
    }.items() if not value]
    if missing:
        print("Missing environment variables: " + ", ".join(missing), file=sys.stderr)
        sys.exit(2)


def make_ssml(text: str) -> str:
    return f'''<speak version="1.0" xml:lang="ar-SA">
  <voice name="{VOICE}">
    <prosody rate="-8%" pitch="0%">{text}</prosody>
  </voice>
</speak>'''


def synthesize(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    speech_config = speechsdk.SpeechConfig(subscription=KEY, region=REGION)
    speech_config.speech_synthesis_voice_name = VOICE
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
    )
    audio_config = speechsdk.audio.AudioOutputConfig(filename=str(path))
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=audio_config,
    )
    result = synthesizer.speak_ssml_async(make_ssml(text)).get()
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print(f"OK   {path}  <-  {text}")
        return

    details = result.cancellation_details
    raise RuntimeError(
        f"Azure synthesis failed for {text}: {details.reason}; {details.error_details}"
    )


def main():
    require_env()
    root = Path(__file__).resolve().parents[1]
    for rel_path, text in ITEMS.items():
        synthesize(root / rel_path, text)
    print(f"\nGenerated {len(ITEMS)} files using voice {VOICE}.")


if __name__ == "__main__":
    main()

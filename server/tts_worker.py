import asyncio
import sys
import os

try:
    import edge_tts
except ImportError:
    sys.exit(1)

async def main():
    voice = sys.argv[1] if len(sys.argv) > 1 else "ar-SA-HamedNeural"
    rate = sys.argv[2] if len(sys.argv) > 2 else "-2%"
    pitch = sys.argv[3] if len(sys.argv) > 3 else "-1Hz"
    
    text = sys.stdin.read().strip()
    if not text:
        sys.exit(0)

    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            sys.stdout.buffer.write(chunk["data"])
            sys.stdout.buffer.flush()

if __name__ == "__main__":
    asyncio.run(main())

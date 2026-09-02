import asyncio
import sys
import re

try:
    import edge_tts
except ImportError:
    sys.exit(1)

def enrich_arabic_for_voice(text: str) -> str:
    """
    Applies phonetic corrections, diacritization, and natural breathing pauses
    for professional studio-grade Arabic narration.
    """
    t = text

    # Remove markdown formatting & links
    t = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t)
    t = re.sub(r'https?://\S+', '', t)
    t = re.sub(r'#{1,6}\s*', '', t)
    t = re.sub(r'\*{1,3}', '', t)
    t = re.sub(r'^[•\-\*]\s+', '', t, flags=re.MULTILINE)
    t = re.sub(r'[✦💎🤖🎙️📸📖✍️⚡📋🎁🎉✅⚠️📌•]', ' ', t)

    # Phonetic translation of English terms & acronyms
    t = re.sub(r'\b(SAT|sat)\b', 'السَّات', t)
    t = re.sub(r'\b(IELTS|ielts)\b', 'الآيِلْتس', t)
    t = re.sub(r'\b(Cognia|cognia)\b', 'كُوجْنِيَا العالمية', t)
    t = re.sub(r'\b(STEAM|steam|STEM|stem)\b', 'سْتِيمْ', t)
    t = re.sub(r'\b(AP|ap)\b', 'إي بي', t)
    t = re.sub(r'\b(3D|3d)\b', 'ثُلَاثِيَّة الأَبْعَاد', t)
    t = re.sub(r'\b(PDF|pdf)\b', 'بِي دِي إِف', t)

    # Convert percentages to words
    t = re.sub(r'(\d+)\s*%', r'\1 بالمِئَة', t)

    # Format long phone numbers digit by digit for clear audible reading
    t = re.sub(r'\b(0[1-5]\d{7,8})\b', lambda m: ' '.join(m.group(1)), t)

    # Intelligent diacritics for prestige and clarity
    t = t.replace('مدارس العقيق', 'مَدَارِسُ العَقِيق')
    t = t.replace('العقيق الأهلية', 'العَقِيقِ الأَهْلِيَّة')
    t = t.replace('المدينة المنورة', 'المَدِينَةِ المُنَوَّرَة')
    t = t.replace('السلام عليكم ورحمة الله وبركاته', 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُه')
    t = t.replace('السلام عليكم', 'السَّلَامُ عَلَيْكُمْ')
    t = t.replace('أهلاً وسهلاً', 'أَهْلًا وَسَهْلًا بِك')
    t = t.replace('يا هلا', 'يَا هَلَا وَمَرْحَبًا')
    t = t.replace('المسار الوطني', 'المَسَارُ الوَطَنِيُّ')
    t = t.replace('الدبلومة الأمريكية', 'الدِّبْلُومَةُ الأَمْرِيكِيَّة')
    t = t.replace('رياض الأطفال', 'رِيَاضُ الأَطْفَال')

    # Natural breathing pauses: gentle pause after sentence stops
    t = re.sub(r'([.؟!])\s+', r'\1 ... ', t)
    t = re.sub(r'(:)\s+', r'، ', t)

    # Clean excessive spaces
    t = re.sub(r'\s+', ' ', t).strip()
    return t

async def main():
    voice = sys.argv[1] if len(sys.argv) > 1 else "ar-SA-HamedNeural"
    # Snappy and natural +5% rate for brisk responsiveness (no dragging)
    rate = sys.argv[2] if len(sys.argv) > 2 else "+5%"
    pitch = sys.argv[3] if len(sys.argv) > 3 else "-1Hz"

    raw_text = sys.stdin.read().strip()
    if not raw_text:
        sys.exit(0)

    # Apply studio enrichment
    enriched_text = enrich_arabic_for_voice(raw_text)

    communicate = edge_tts.Communicate(enriched_text, voice, rate=rate, pitch=pitch, volume="+15%")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            sys.stdout.buffer.write(chunk["data"])
            sys.stdout.buffer.flush()

if __name__ == "__main__":
    asyncio.run(main())

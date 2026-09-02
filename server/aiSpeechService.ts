import crypto from "node:crypto";

// Memory cache for instant 0ms audio retrieval
const audioCache = new Map<string, { buffer: Buffer; createdAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Preprocess and clean Arabic text for natural voice pronunciation
 */
export function cleanArabicTextForSpeech(text: string): string {
  return text
    // Remove markdown links but keep the anchor text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove raw URLs
    .replace(/https?:\/\/\S+/g, "")
    // Remove headers, bold, italics, bullets
    .replace(/###/g, "")
    .replace(/##/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^[•\-\*]\s+/gm, "")
    // Remove visual symbols and emojis that confuse TTS
    .replace(/[✦💎🤖🎙️📸📖✍️⚡📋🎁🎉✅⚠️📌]/g, " ")
    .replace(/[_\-–—]/g, " ")
    // Clean excessive spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split text into natural spoken phrases (max ~150 chars per chunk)
 */
function splitIntoNaturalPhrases(text: string, maxChunkLen: number = 150): string[] {
  const sentences = text.split(/(?<=[.،؟!:\n])/).map((s) => s.trim()).filter(Boolean);
  const phrases: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length <= maxChunkLen) {
      phrases.push(sentence);
    } else {
      // Split by words if sentence is long
      const words = sentence.split(" ");
      let current = "";
      for (const w of words) {
        if ((current + " " + w).length <= maxChunkLen) {
          current = current ? current + " " + w : w;
        } else {
          if (current) phrases.push(current);
          current = w;
        }
      }
      if (current) phrases.push(current);
    }
  }

  return phrases.filter((p) => p.trim().length > 0);
}

/**
 * Synthesizes high quality Arabic voice audio and returns base64 MP3 data
 */
export async function synthesizeArabicVoice(rawText: string): Promise<{
  audioBase64: string;
  durationEstimateSeconds: number;
}> {
  const cleaned = cleanArabicTextForSpeech(rawText);
  if (!cleaned) {
    throw new Error("لا يوجد نص قابل للنطق");
  }

  // Check in-memory cache
  const cacheKey = crypto.createHash("md5").update(cleaned).digest("hex");
  const cached = audioCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return {
      audioBase64: cached.buffer.toString("base64"),
      durationEstimateSeconds: Math.ceil(cleaned.length / 15),
    };
  }

  // Natural phrase chunking
  // Cap at ~600 chars for optimal performance and rapid audio response
  const phrases = splitIntoNaturalPhrases(cleaned.slice(0, 700));
  const audioChunks: Buffer[] = [];

  for (const phrase of phrases) {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        phrase
      )}&tl=ar&client=tw-ob`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          Accept: "*/*",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const ab = await res.arrayBuffer();
        if (ab.byteLength > 200) {
          audioChunks.push(Buffer.from(ab));
        }
      }
    } catch (e) {
      console.warn("TTS chunk fetch error:", e);
    }
  }

  if (audioChunks.length === 0) {
    throw new Error("تعذر توليد الصوت");
  }

  const mergedBuffer = Buffer.concat(audioChunks);

  // Save in cache
  audioCache.set(cacheKey, {
    buffer: mergedBuffer,
    createdAt: Date.now(),
  });

  return {
    audioBase64: mergedBuffer.toString("base64"),
    durationEstimateSeconds: Math.ceil(cleaned.length / 15),
  };
}

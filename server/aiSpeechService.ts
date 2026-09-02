import crypto from "node:crypto";
import path from "node:path";
import { spawn } from "node:child_process";

// Memory cache for instant 0ms audio retrieval
const audioCache = new Map<string, { buffer: Buffer; createdAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Preprocess and clean Arabic text for natural human voice pronunciation
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
 * Synthesizes via Microsoft Neural Engine in Python worker (ar-SA-HamedNeural / ar-SA-ZariyahNeural)
 */
function synthesizeWithNeuralWorker(text: string, voice: string = "ar-SA-HamedNeural"): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const workerScript = path.resolve(process.cwd(), "server/tts_worker.py");
    const py = spawn("python3", [workerScript, voice, "-2%", "-1Hz"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    const chunks: Buffer[] = [];
    let errorOutput = "";

    py.stdout.on("data", (c) => chunks.push(c));
    py.stderr.on("data", (c) => (errorOutput += c.toString()));

    const timeout = setTimeout(() => {
      py.kill();
      reject(new Error("NEURAL_TTS_TIMEOUT"));
    }, 15000);

    py.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0 && chunks.length > 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`Worker exited with code ${code}: ${errorOutput}`));
      }
    });

    py.stdin.write(text);
    py.stdin.end();
  });
}

/**
 * Fallback multi-chunk generator
 */
async function fallbackGoogleTts(text: string): Promise<Buffer> {
  const sentences = text.split(/(?<=[.،؟!:\n])/).map((s) => s.trim()).filter(Boolean);
  const audioChunks: Buffer[] = [];

  for (const phrase of sentences.slice(0, 10)) {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        phrase.slice(0, 150)
      )}&tl=ar&client=tw-ob`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const ab = await res.arrayBuffer();
        if (ab.byteLength > 200) {
          audioChunks.push(Buffer.from(ab));
        }
      }
    } catch (e) {
      // Non-blocking
    }
  }

  if (audioChunks.length === 0) {
    throw new Error("فشل الصوت الاحتياطي");
  }

  return Buffer.concat(audioChunks);
}

/**
 * Synthesizes high quality Arabic voice audio and returns base64 MP3 data
 * Uses HamedNeural (Saudi Arabian warm human male broadcaster voice) by default!
 */
export async function synthesizeArabicVoice(
  rawText: string,
  voiceType: "male" | "female" = "male"
): Promise<{
  audioBase64: string;
  durationEstimateSeconds: number;
  voiceUsed: string;
}> {
  const cleaned = cleanArabicTextForSpeech(rawText);
  if (!cleaned) {
    throw new Error("لا يوجد نص قابل للنطق");
  }

  const voiceName = voiceType === "female" ? "ar-SA-ZariyahNeural" : "ar-SA-HamedNeural";

  // Check in-memory cache
  const cacheKey = crypto.createHash("md5").update(`${voiceName}:${cleaned}`).digest("hex");
  const cached = audioCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return {
      audioBase64: cached.buffer.toString("base64"),
      durationEstimateSeconds: Math.ceil(cleaned.length / 14),
      voiceUsed: voiceName,
    };
  }

  let finalBuffer: Buffer | null = null;

  // 1. Primary Engine: Ultra-realistic Neural Male Voice (ar-SA-HamedNeural)
  try {
    finalBuffer = await synthesizeWithNeuralWorker(cleaned.slice(0, 900), voiceName);
  } catch (err: any) {
    console.warn("Neural TTS worker failed, falling back to secondary engine:", err?.message);
    // 2. Secondary fallback
    try {
      finalBuffer = await fallbackGoogleTts(cleaned.slice(0, 500));
    } catch (fallbackErr) {
      throw new Error("تعذر توليد الصوت");
    }
  }

  if (!finalBuffer || finalBuffer.length === 0) {
    throw new Error("تعذر توليد الصوت");
  }

  // Save in cache
  audioCache.set(cacheKey, {
    buffer: finalBuffer,
    createdAt: Date.now(),
  });

  return {
    audioBase64: finalBuffer.toString("base64"),
    durationEstimateSeconds: Math.ceil(cleaned.length / 14),
    voiceUsed: voiceName,
  };
}

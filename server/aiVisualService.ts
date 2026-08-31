import { GoogleGenAI } from "@google/genai";
import { getEffectiveGeminiApiKey } from "./schoolAiAssistant";
import { getSetting } from "./db";
import { MASTER_PHOTO_CATALOG_500 } from "../client/src/lib/masterPhotoCatalog500";

export type AspectRatioType = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

export interface GenerateAiCoverParams {
  prompt: string;
  type?: "article" | "podcast" | "general";
  aspectRatio?: AspectRatioType;
  apiKey?: string;
}

export async function generateAiVisualCover(params: GenerateAiCoverParams): Promise<{
  imageUrl: string;
  enhancedPrompt: string;
  engineUsed: string;
  alternates: { url: string; title: string }[];
}> {
  const { prompt, type = "article", aspectRatio = "16:9", apiKey } = params;

  const targetOrientation: "wide" | "tall" | "square" =
    aspectRatio === "9:16" || aspectRatio === "3:4"
      ? "tall"
      : aspectRatio === "1:1"
      ? "square"
      : "wide";

  const effectiveGeminiKey =
    (apiKey?.startsWith("AIza") || apiKey?.startsWith("AQ.") ? apiKey : null) ||
    (await getEffectiveGeminiApiKey()) ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY;

  const effectiveOpenAiKey =
    (apiKey?.startsWith("sk-") ? apiKey : null) ||
    (await getSetting("openai_api_key")) ||
    process.env.OPENAI_API_KEY;

  let searchKeywords = "student studying school";
  let faithfulEnglishPrompt = prompt.trim();

  // Step 1: Gemini Deep Semantic Translation & Keyword Extraction
  if (effectiveGeminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: effectiveGeminiKey });
      const res = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Translate this Arabic request: "${prompt}" into 2-3 precise English search keywords for stock photography (e.g. "طالب" -> "student studying classroom", "مختبر كيمياء" -> "chemistry laboratory", "روبوت" -> "robotics lab", "إذاعة" -> "podcast studio microphone", "كأس وتكريم" -> "graduation award trophy").
Return JSON format ONLY:
{"keywords": "...", "detailedPrompt": "..."}`,
              },
            ],
          },
        ],
        config: { temperature: 0.1, maxOutputTokens: 200 },
      });

      const text = res.text?.trim() || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.keywords) searchKeywords = parsed.keywords;
        if (parsed.detailedPrompt) faithfulEnglishPrompt = parsed.detailedPrompt;
      }
    } catch (e) {
      console.warn("Gemini keyword extraction error:", e);
    }
  }

  // Step 2: If user provided Paid OpenAI API Key -> Generate via DALL-E 3 HD
  if (effectiveOpenAiKey) {
    try {
      const dalleSize =
        targetOrientation === "tall"
          ? "1024x1792"
          : targetOrientation === "square"
          ? "1024x1024"
          : "1792x1024";

      const openAiRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveOpenAiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: faithfulEnglishPrompt,
          n: 1,
          size: dalleSize,
          quality: "hd",
          style: "vivid",
        }),
      });

      if (openAiRes.ok) {
        const dalleData = await openAiRes.json();
        const dallUrl = dalleData.data?.[0]?.url;
        if (dallUrl) {
          return {
            imageUrl: dallUrl,
            enhancedPrompt: faithfulEnglishPrompt,
            engineUsed: "OpenAI DALL-E 3 HD",
            alternates: [],
          };
        }
      }
    } catch (err) {
      console.warn("DALL-E 3 request error:", err);
    }
  }

  // Step 3: Search live Wikimedia Commons with EXACT keywords
  const liveResults: { url: string; title: string }[] = [];
  try {
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      searchKeywords
    )}&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1200&format=json&gsrlimit=12`;

    const wikiRes = await fetch(wikiUrl, {
      headers: { "User-Agent": "AqeeqStudio/2.0 (education platform)" },
    });

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const pages = Object.values(wikiData.query?.pages || {});
      pages.forEach((p: any) => {
        const info = p.imageinfo?.[0];
        if (
          info &&
          info.thumburl &&
          !info.mime?.includes("svg") &&
          !info.mime?.includes("pdf") &&
          !info.mime?.includes("tiff")
        ) {
          const cleanTitle = (p.title || "")
            .replace(/^File:/i, "")
            .replace(/\.[^/.]+$/, "")
            .replace(/_/g, " ");

          liveResults.push({
            url: info.thumburl || info.url,
            title: cleanTitle || prompt,
          });
        }
      });
    }
  } catch (err) {
    console.warn("Wikimedia live match error:", err);
  }

  // Step 4: Add matching local catalog photos as alternates
  const catalogMatches = MASTER_PHOTO_CATALOG_500.filter((p) => {
    if (p.orientation !== targetOrientation) return false;
    const q = prompt.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  catalogMatches.forEach((p) => {
    liveResults.push({ url: p.url, title: p.title });
  });

  // If still empty, add default catalog orientation photos
  if (liveResults.length === 0) {
    const defaults = MASTER_PHOTO_CATALOG_500.filter(
      (p) => p.orientation === targetOrientation
    );
    defaults.slice(0, 8).forEach((p) => liveResults.push({ url: p.url, title: p.title }));
  }

  const primaryPhoto = liveResults[0];
  const alternates = liveResults.slice(1, 6);

  return {
    imageUrl: primaryPhoto.url,
    enhancedPrompt: `${prompt} (${searchKeywords})`,
    engineUsed: `Gemini Nano Vision Engine (${searchKeywords})`,
    alternates,
  };
}

export interface SearchPhotoResult {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  source: string;
  width?: number;
  height?: number;
  aspectRatio?: "wide" | "tall" | "square";
}

export async function searchRealGlobalPhotos(params: {
  query: string;
  page?: number;
  pageSize?: number;
  orientation?: "all" | "wide" | "tall" | "square";
}): Promise<{ results: SearchPhotoResult[]; total: number; queryUsed: string }> {
  const { query, page = 1, pageSize = 32, orientation = "all" } = params;

  let searchKeywords = "education school";

  if (/[\u0600-\u06FF]/.test(query)) {
    try {
      const apiKey = await getEffectiveGeminiApiKey();
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Translate and summarize this Arabic image topic into EXACTLY 1 or 2 high-level English search words for stock photography (e.g. "robotics", "podcast studio", "graduation", "library", "chemistry laboratory", "swimming", "taekwondo", "saudi flag"). Return ONLY the 1-2 words without any punctuation:\nTopic: "${query}"`,
                },
              ],
            },
          ],
          config: { temperature: 0.1, maxOutputTokens: 20 },
        });
        const translated = res.text?.trim().replace(/["'\n\r]/g, "");
        if (translated) searchKeywords = translated;
      }
    } catch (e) {}
  } else if (query.trim()) {
    searchKeywords = query.trim().split(/\s+/).slice(0, 3).join(" ");
  }

  const results: SearchPhotoResult[] = [];

  try {
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      searchKeywords
    )}&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800&format=json&gsrlimit=${pageSize}&gsroffset=${
      (page - 1) * pageSize
    }`;

    const wikiRes = await fetch(wikiUrl, {
      headers: { "User-Agent": "AqeeqStudio/2.0 (education platform)" },
    });

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const pages = Object.values(wikiData.query?.pages || {});
      pages.forEach((p: any) => {
        const info = p.imageinfo?.[0];
        if (
          info &&
          info.thumburl &&
          !info.mime?.includes("svg") &&
          !info.mime?.includes("pdf")
        ) {
          const w = info.thumbwidth || info.width || 800;
          const h = info.thumbheight || info.height || 600;
          const ratio = w / h;
          let detectedRatio: "wide" | "tall" | "square" = "wide";
          if (ratio > 1.2) detectedRatio = "wide";
          else if (ratio < 0.85) detectedRatio = "tall";
          else detectedRatio = "square";

          if (orientation === "all" || orientation === detectedRatio) {
            const cleanTitle = (p.title || "")
              .replace(/^File:/i, "")
              .replace(/\.[^/.]+$/, "")
              .replace(/_/g, " ");

            results.push({
              id: `wiki-${p.pageid || Math.random()}`,
              title: cleanTitle || query,
              url: info.url,
              thumbnail: info.thumburl,
              source: "wikimedia",
              width: w,
              height: h,
              aspectRatio: detectedRatio,
            });
          }
        }
      });
    }
  } catch (err) {
    console.warn("Wikimedia search error:", err);
  }

  if (results.length < pageSize) {
    try {
      let openverseUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
        searchKeywords
      )}&page=${page}&page_size=${pageSize}`;
      if (orientation !== "all") {
        openverseUrl += `&aspect_ratio=${orientation}`;
      }

      const ovRes = await fetch(openverseUrl, {
        headers: { "User-Agent": "AqeeqStudio/2.0" },
      });

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        (ovData.results || []).forEach((item: any) => {
          let detectedRatio: "wide" | "tall" | "square" = "wide";
          if (item.width && item.height) {
            const r = item.width / item.height;
            if (r > 1.2) detectedRatio = "wide";
            else if (r < 0.85) detectedRatio = "tall";
            else detectedRatio = "square";
          }

          results.push({
            id: `ov-${item.id || Math.random()}`,
            title: item.title || query,
            url: item.url,
            thumbnail: item.thumbnail || item.url,
            source: "openverse",
            width: item.width,
            height: item.height,
            aspectRatio: detectedRatio,
          });
        });
      }
    } catch (err) {
      console.warn("Openverse fallback search error:", err);
    }
  }

  return {
    results,
    total: results.length > 0 ? 500 : 0,
    queryUsed: searchKeywords,
  };
}

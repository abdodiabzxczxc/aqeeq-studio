import { GoogleGenAI } from "@google/genai";
import { getEffectiveGeminiApiKey } from "./schoolAiAssistant";
import { getSetting } from "./db";

export type AspectRatioType = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

export interface GenerateAiCoverParams {
  prompt: string;
  type?: "article" | "podcast" | "general";
  aspectRatio?: AspectRatioType;
  model?: "nano-banana-pro" | "dalle3" | "flux-pro" | "flux-realism" | "flux" | "turbo";
  stylePreset?:
    | "3d-luxury-gold"
    | "cinematic-stage"
    | "cyber-quantum"
    | "editorial-prestige"
    | "photorealistic"
    | "cinematic"
    | "editorial"
    | "studio-pro";
  apiKey?: string; // Optional user-provided Gemini, OpenAI, or Replicate key
}

export async function generateAiVisualCover(params: GenerateAiCoverParams): Promise<{
  imageUrl: string;
  enhancedPrompt: string;
  engineUsed: string;
}> {
  const {
    prompt,
    type = "article",
    aspectRatio = "16:9",
    model = "nano-banana-pro",
    stylePreset = "3d-luxury-gold",
    apiKey,
  } = params;

  let width = 1280;
  let height = 720;

  if (aspectRatio === "1:1") {
    width = 1024;
    height = 1024;
  } else if (aspectRatio === "9:16") {
    width = 720;
    height = 1280;
  } else if (aspectRatio === "3:4") {
    width = 768;
    height = 1024;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else {
    width = 1280;
    height = 720;
  }

  const effectiveGeminiKey =
    (apiKey?.startsWith("AIza") || apiKey?.startsWith("AQ.") ? apiKey : null) ||
    (await getEffectiveGeminiApiKey()) ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY;

  const effectiveOpenAiKey =
    (apiKey?.startsWith("sk-") ? apiKey : null) ||
    (await getSetting("openai_api_key")) ||
    process.env.OPENAI_API_KEY;

  let enhancedPrompt = "";

  // Step 1: Prompt Enhancement using Gemini
  try {
    if (effectiveGeminiKey) {
      const ai = new GoogleGenAI({ apiKey: effectiveGeminiKey });
      const systemPrompt = `You are a world-class 3D Art Director creating prestigious covers for «Al-Aqeeq Schools & Studio» in Medina, Saudi Arabia.
Topic: "${prompt}"
Medium: "${type === "podcast" ? "Audio Podcast Visual Cover" : "Educational & Scientific Magazine Cover"}"
Orientation: "${aspectRatio === "9:16" || aspectRatio === "3:4" ? "Vertical 9:16 Layout" : aspectRatio === "1:1" ? "Square 1:1 Framing" : "Cinematic 16:9 Wide Landscape"}"
Style: "${stylePreset}"

ART DIRECTION RULES:
1. PURE LUXURY & CONCEPTUAL PRESTIGE: Never generate distorted faces or creepy avatars. Focus on breathtaking 3D conceptual installations, obsidian marble podiums, floating 24k gold geometric emblems, frosted crystal refractions, laser circuitry, holographic data rings, volumetric lighting, 8k resolution, photorealistic raytracing.
2. Output format: Return ONLY the final detailed English prompt in one paragraph, no quotes, no markdown.`;

      const res = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        config: { temperature: 0.3, maxOutputTokens: 250 },
      });

      enhancedPrompt = res.text?.trim() || "";
    }
  } catch (err) {
    console.warn("Gemini visual prompt enhancement error:", err);
  }

  if (!enhancedPrompt) {
    enhancedPrompt = `A breathtaking 3D conceptual masterpiece for ${prompt}, majestic 24k gold and obsidian marble sculpture, floating crystal rings, volumetric warm golden lighting, Cinema4D Octane render 8K, ultra-detailed raytracing, cinematic magazine cover, no humans, no text`;
  }

  // ================= 1. Nano Banana Pro (Google Gemini Image Generation) =================
  if (model === "nano-banana-pro" && effectiveGeminiKey) {
    const nanoModels = [
      "gemini-3-pro-image",
      "nano-banana-pro-preview",
      "gemini-3.1-flash-image",
      "gemini-2.5-flash-image",
    ];

    const ai = new GoogleGenAI({ apiKey: effectiveGeminiKey });
    for (const nanoModel of nanoModels) {
      try {
        const response = await ai.models.generateContent({
          model: nanoModel,
          contents: [
            {
              role: "user",
              parts: [{ text: `${enhancedPrompt}, 8k photorealistic masterpiece, ultra-detailed, volumetric lighting, luxury quality` }],
            },
          ],
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if ((p as any).inlineData?.data) {
            const mime = (p as any).inlineData.mimeType || "image/jpeg";
            const base64Url = `data:${mime};base64,${(p as any).inlineData.data}`;
            return {
              imageUrl: base64Url,
              enhancedPrompt,
              engineUsed: `Google Gemini (${nanoModel} / Nano Banana Pro)`,
            };
          }
        }
      } catch (err: any) {
        console.warn(`Nano Banana (${nanoModel}) attempt note:`, err?.message || err);
      }
    }
  }

  // ================= 2. OpenAI DALL-E 3 HD =================
  if (effectiveOpenAiKey && (model === "dalle3" || effectiveOpenAiKey.startsWith("sk-"))) {
    try {
      const dalleSize =
        aspectRatio === "9:16" || aspectRatio === "3:4"
          ? "1024x1792"
          : aspectRatio === "1:1"
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
          prompt: enhancedPrompt,
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
            enhancedPrompt,
            engineUsed: "OpenAI DALL-E 3 HD (Ultra Pro)",
          };
        }
      }
    } catch (err) {
      console.warn("DALL-E 3 request error:", err);
    }
  }

  // ================= 3. Flux 3D Octane Render 8K Engine =================
  const finalPromptWithDirectives = `${enhancedPrompt}, 8k resolution, octane render, masterpiece, dramatic volumetric lighting, luxury aesthetic, cinema4d, unreal engine 5, photorealistic`;
  const seed = Math.floor(Math.random() * 9000000) + 1000000;
  const targetModel = model === "turbo" ? "turbo" : "flux";
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    finalPromptWithDirectives
  )}?width=${width}&height=${height}&model=${targetModel}&nologo=true&enhance=true&seed=${seed}`;

  return {
    imageUrl,
    enhancedPrompt: finalPromptWithDirectives,
    engineUsed: "Flux 3D Octane 8K (Nano Enhanced)",
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
        if (info && info.thumburl && !info.mime?.includes("svg")) {
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

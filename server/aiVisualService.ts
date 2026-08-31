import { GoogleGenAI } from "@google/genai";
import { getEffectiveGeminiApiKey } from "./schoolAiAssistant";

export type AspectRatioType = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

export interface GenerateAiCoverParams {
  prompt: string;
  type?: "article" | "podcast" | "general";
  aspectRatio?: AspectRatioType;
  model?: "flux-realism" | "flux-pro" | "flux" | "turbo";
  stylePreset?: "photorealistic" | "cinematic" | "editorial" | "studio-pro";
}

export async function generateAiVisualCover(params: GenerateAiCoverParams): Promise<{
  imageUrl: string;
  enhancedPrompt: string;
}> {
  const {
    prompt,
    type = "article",
    aspectRatio = "16:9",
    model = "flux-realism",
    stylePreset = "photorealistic",
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
    // 16:9 default
    width = 1280;
    height = 720;
  }

  let enhancedPrompt = "";

  try {
    const apiKey = await getEffectiveGeminiApiKey();
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const systemPrompt = `You are an award-winning executive art director and master prompt engineer for «Al-Aqeeq Schools & Studio» in Medina, Saudi Arabia.
Transform the following Arabic topic into an ultra-high-end, photorealistic English photography prompt:
Topic: "${prompt}"
Context: "${type === "podcast" ? "Official high-end Podcast / Broadcasting Studio visual cover" : "Prestigious Saudi educational article editorial cover"}"
Orientation: "${aspectRatio === "9:16" || aspectRatio === "3:4" ? "Vertical Portrait / Poster" : aspectRatio === "1:1" ? "Square Composition" : "Cinematic Wide Landscape"}"
Style Request: "${stylePreset}"

Strict Quality & Art Direction Rules:
1. PHOTO-REALISM FIRST: Must look like an authentic, high-budget commercial photograph shot by a world-class photographer with a Hasselblad H6D-100c or Sony A1 camera.
2. OPTICAL DETAILS: 85mm f/1.4 lens, natural bokeh, razor-sharp focus on subject, authentic skin textures, natural subsurface scattering, zero cartoonish or plastic look.
3. COMPOSITION: Formatted perfectly for ${aspectRatio === "9:16" ? "vertical 9:16 portrait mobile/poster layout" : aspectRatio === "1:1" ? "balanced 1:1 square framing" : "cinematic 16:9 wide landscape framing"}.
4. CONTEXT & ARCHITECTURE: Authentic Saudi high-end educational environment in Medina, elegant Saudi attire (thobe, shemagh, abaya with dignity and class), modern architectural aesthetics, warm golden-hour lighting and subtle amber glow.
5. NEGATIVE INSTRUCTIONS: NO cartoon, NO anime, NO surreal distortion, NO disfigured limbs, NO blurry faces, NO CGI plastic shine, NO text or watermarks.
6. Return ONLY the finalized English prompt string, without any commentary or quotes.`;

      const res = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        config: { temperature: 0.3 },
      });

      enhancedPrompt = res.text?.trim() || "";
    }
  } catch (err) {
    console.warn("Gemini visual prompt enhancement error:", err);
  }

  if (!enhancedPrompt) {
    enhancedPrompt = `Ultra-photorealistic 8k commercial photography, prestigious Saudi modern school campus in Medina, high-end authentic scene, warm golden lighting, ${prompt}`;
  }

  const seed = Math.floor(Math.random() * 9000000) + 1000000;
  const targetModel = model || "flux-realism";
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&model=${targetModel}&nologo=true&enhance=true&seed=${seed}`;

  return {
    imageUrl,
    enhancedPrompt,
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
  const { query, page = 1, pageSize = 30, orientation = "all" } = params;

  let englishKeywords = query.trim();

  // If query contains Arabic characters, translate to precise photography keywords using Gemini
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
                  text: `Translate and optimize this Arabic image search query into 2-3 precise English keywords for a high-quality global photo library. Return ONLY the English keywords separated by single spaces, no punctuation:\nSearch: "${query}"`,
                },
              ],
            },
          ],
          config: { temperature: 0.2, maxOutputTokens: 30 },
        });
        const translated = res.text?.trim().replace(/["'\n\r]/g, "");
        if (translated) englishKeywords = translated;
      }
    } catch (e) {}
  }

  try {
    let url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
      englishKeywords
    )}&page=${page}&page_size=${pageSize}`;

    if (orientation && orientation !== "all") {
      url += `&aspect_ratio=${orientation}`;
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "AqeeqStudio/1.0" },
    });

    if (response.ok) {
      const data = await response.json();
      const results: SearchPhotoResult[] = (data.results || []).map((item: any) => {
        let detectedRatio: "wide" | "tall" | "square" = "wide";
        if (item.width && item.height) {
          const r = item.width / item.height;
          if (r > 1.2) detectedRatio = "wide";
          else if (r < 0.85) detectedRatio = "tall";
          else detectedRatio = "square";
        }

        return {
          id: String(item.id || Math.random()),
          title: item.title || query,
          url: item.url,
          thumbnail: item.thumbnail || item.url,
          source: item.source || "openverse",
          width: item.width,
          height: item.height,
          aspectRatio: detectedRatio,
        };
      });

      return {
        results,
        total: data.result_count || results.length,
        queryUsed: englishKeywords,
      };
    }
  } catch (err) {
    console.warn("Global photo search error:", err);
  }

  return {
    results: [],
    total: 0,
    queryUsed: englishKeywords,
  };
}

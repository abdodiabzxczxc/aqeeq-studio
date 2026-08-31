import { GoogleGenAI } from "@google/genai";
import { getEffectiveGeminiApiKey } from "./schoolAiAssistant";

export type AspectRatioType = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

export interface GenerateAiCoverParams {
  prompt: string;
  type?: "article" | "podcast" | "general";
  aspectRatio?: AspectRatioType;
  model?: "flux-realism" | "flux-pro" | "flux" | "turbo";
  stylePreset?:
    | "3d-luxury-gold"
    | "cinematic-stage"
    | "cyber-quantum"
    | "editorial-prestige"
    | "photorealistic"
    | "cinematic"
    | "editorial"
    | "studio-pro";
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
    stylePreset = "3d-luxury-gold",
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

  let enhancedPrompt = "";

  try {
    const apiKey = await getEffectiveGeminiApiKey();
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const systemPrompt = `You are a world-class 3D Art Director and Master Visual Concept Designer creating high-end, award-winning magazine & podcast covers for «Al-Aqeeq Schools & Studio» in Medina, Saudi Arabia.

Goal: Turn the Arabic topic into a breathtaking, prestigious 3D conceptual cover scene (Cinema4D, Octane Render 8K, Unreal Engine 5.4 raytracing).

Topic: "${prompt}"
Medium: "${type === "podcast" ? "Official Audio Podcast & Radio Visual Cover" : "Prestigious Educational & Scientific Magazine Cover"}"
Orientation: "${aspectRatio === "9:16" || aspectRatio === "3:4" ? "Vertical 9:16 Poster Layout" : aspectRatio === "1:1" ? "Square 1:1 Album Framing" : "Cinematic 16:9 Wide Landscape Framing"}"
Chosen Style: "${stylePreset}"

CRITICAL ART DIRECTION INSTRUCTIONS (ZERO DISTORTED FACES):
1. PURE CONCEPTUAL LUXURY: NEVER generate human faces, cartoon characters, or creepy avatars. Instead, create majestic 3D conceptual installations, obsidian marble podiums, floating golden geometric emblems, crystal refractions, laser circuitry, holographic data rings, glowing architectural lines, or warm volumetric god-rays.
2. MATERIALITY: Polished 24k gold leaf, dark obsidian marble with subtle gold veins, frosted crystal glass with chromatic aberration, brushed titanium, warm amber ambient glow (#f8ca14).
3. LIGHTING: Cinematic studio lighting, deep dramatic shadows, subsurface scattering on crystals, rim lighting, atmospheric dust motes, 8k resolution, photorealistic raytracing, Octane Render benchmark quality.
4. IDENTITY: Subtle Islamic/Arabian geometric motifs infused with futuristic minimalism (representing Medina's intellectual excellence).
5. Output format: Return ONLY the final detailed English prompt in one paragraph, no quotes, no markdown.`;

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

  // Append strict negative enhancements
  const finalPromptWithDirectives = `${enhancedPrompt}, 8k resolution, octane render, masterpiece, dramatic lighting, luxury aesthetic`;
  const seed = Math.floor(Math.random() * 9000000) + 1000000;
  const targetModel = model === "turbo" ? "turbo" : "flux";
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPromptWithDirectives)}?width=${width}&height=${height}&model=${targetModel}&nologo=true&enhance=true&seed=${seed}`;

  return {
    imageUrl,
    enhancedPrompt: finalPromptWithDirectives,
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

  // If query contains Arabic characters, translate to 1-2 clean English keywords using Gemini
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

  // Source 1: Wikimedia Commons Live High-Res API
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

  // Source 2: Openverse Live Search API
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

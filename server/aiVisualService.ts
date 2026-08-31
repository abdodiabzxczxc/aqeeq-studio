import { GoogleGenAI } from "@google/genai";
import { getEffectiveGeminiApiKey } from "./schoolAiAssistant";

export interface GenerateAiCoverParams {
  prompt: string;
  type?: "article" | "podcast" | "general";
  aspectRatio?: "16:9" | "1:1" | "4:3";
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
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
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
Style Request: "${stylePreset}"

Strict Quality & Art Direction Rules:
1. PHOTO-REALISM FIRST: Must look like an authentic, high-budget commercial photograph shot by a world-class photographer with a Hasselblad H6D-100c or Sony A1 camera.
2. OPTICAL DETAILS: 85mm f/1.4 lens, natural bokeh, razor-sharp focus on subject, authentic skin textures, natural subsurface scattering, zero cartoonish or plastic look.
3. CONTEXT & ARCHITECTURE: Authentic Saudi high-end educational environment in Medina, elegant Saudi attire (thobe, shemagh, abaya with dignity and class), modern architectural aesthetics, warm golden-hour lighting and subtle amber glow.
4. SPECIFICITY: If the topic is Robotics/AI, feature real high-tech robotics equipment, LEGO League discovery boards, microcontrollers. If about swimming/taekwondo, feature real Olympic lanes, dojos. If about awards, feature real polished brass trophies. If about podcast, feature real Shure SM7B studio microphone with warm LED studio panels.
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
    enhancedPrompt = `Ultra-photorealistic 8k commercial photography, prestigious Saudi modern school campus in Medina, high-end authentic scene, warm golden lighting, 85mm portrait lens, ${prompt}`;
  }

  const seed = Math.floor(Math.random() * 9000000) + 1000000;
  const targetModel = model || "flux-realism";
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&model=${targetModel}&nologo=true&enhance=true&seed=${seed}`;

  return {
    imageUrl,
    enhancedPrompt,
  };
}

import { GoogleGenAI } from "@google/genai";
import { getEffectiveGeminiApiKey } from "./schoolAiAssistant";

export interface GenerateAiCoverParams {
  prompt: string;
  type?: "article" | "podcast" | "general";
  aspectRatio?: "16:9" | "1:1" | "4:3";
}

export async function generateAiVisualCover(params: GenerateAiCoverParams): Promise<{
  imageUrl: string;
  enhancedPrompt: string;
}> {
  const { prompt, type = "article", aspectRatio = "16:9" } = params;

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
      const systemPrompt = `You are a world-class art director and visual concept artist for «Al-Aqeeq Educational Group» in Medina, Saudi Arabia.
Transform the following Arabic topic or description into an ultra-detailed, photorealistic English visual prompt for Flux / Midjourney:
User Description: "${prompt}"
Context Type: "${type === "podcast" ? "Podcast cover art / modern broadcasting studio" : "School article cover / prestigious educational photography"}"

Key Artistic Guidelines:
- Style: Highly cinematic, photorealistic 8k, modern Saudi cultural elegance, luxurious golden lighting, shallow depth of field.
- Setting: Contemporary high-end Saudi school, smart AI labs, podcast studios, Medina architectural subtle aesthetics, or inspiring educational scenes.
- Negative Elements: NO distorted faces, NO ugly artifacts, NO text or watermark overlays.
- Return ONLY the final English prompt string, without any introductory or concluding comments.`;

      const res = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        config: { temperature: 0.4 },
      });

      enhancedPrompt = res.text?.trim() || "";
    }
  } catch (err) {
    console.warn("Gemini visual prompt enhancement error:", err);
  }

  if (!enhancedPrompt) {
    enhancedPrompt = `Cinematic photorealistic 8k modern Saudi educational scene in Madinah, high-end school campus, inspiring students, warm golden hour volumetric lighting, ultra-detailed textures, ${prompt}`;
  }

  const seed = Math.floor(Math.random() * 9000000) + 1000000;
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&model=flux&nologo=true&enhance=true&seed=${seed}`;

  return {
    imageUrl,
    enhancedPrompt,
  };
}

import { getDb } from "./db";
import { localSettings } from "./localStore";
import { GoogleGenAI } from "@google/genai";
import seedArticlesData from "./seedArticles.json";

export type AqeeqArticleCategory =
  | "مقالات علمية"
  | "اللغة العربية"
  | "الجودة والاعتماد"
  | "اللغة الإنجليزية"
  | "الذكاء الاصطناعي في التعليم"
  | "تربوي"
  | "إبداعات الطلاب"
  | "إرشاد أسري"
  | "أنشطة وفعاليات"
  | "تجارب ملهمة";

export type AqeeqArticle = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string | null;
  category: AqeeqArticleCategory | string;
  coverUrl?: string | null;
  status: "published" | "pending" | "rejected";
  likesCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_ARTICLES: AqeeqArticle[] = seedArticlesData as AqeeqArticle[];

export async function listAllArticles(): Promise<AqeeqArticle[]> {
  const raw = localSettings.get("aqeeq_articles_list");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // Upgrade from old dummy mock data to real official school articles
      if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some((a: any) => a.slug === "academic-excellence-journey")) {
        return parsed;
      }
    } catch {}
  }
  localSettings.set("aqeeq_articles_list", JSON.stringify(DEFAULT_ARTICLES));
  return DEFAULT_ARTICLES;
}


export async function getPublishedArticles(category?: string, search?: string): Promise<AqeeqArticle[]> {
  const all = await listAllArticles();
  return all
    .filter((a) => a.status === "published")
    .filter((a) => (!category || category === "all" ? true : a.category === category))
    .filter((a) => {
      if (!search || !search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
}

export async function getArticleBySlug(slug: string): Promise<AqeeqArticle | undefined> {
  const all = await listAllArticles();
  const article = all.find((a) => a.slug === slug || String(a.id) === slug);
  if (article) {
    article.viewCount = (article.viewCount || 0) + 1;
    localSettings.set("aqeeq_articles_list", JSON.stringify(all));
  }
  return article;
}

export async function submitGuestArticle(data: {
  title: string;
  content: string;
  excerpt?: string;
  authorName: string;
  authorRole?: string;
  category: AqeeqArticleCategory | string;
  coverUrl?: string;
}): Promise<AqeeqArticle> {
  const all = await listAllArticles();
  const now = new Date().toISOString();
  const id = all.length > 0 ? Math.max(...all.map((a) => a.id)) + 1 : 1;
  const slug = `article-${id}-${Date.now().toString(36)}`;
  
  const excerpt = data.excerpt || data.content.slice(0, 160).replace(/[\r\n]+/g, " ") + "...";

  const newArticle: AqeeqArticle = {
    id,
    title: data.title.trim(),
    slug,
    content: data.content.trim(),
    excerpt,
    authorName: data.authorName.trim(),
    authorRole: data.authorRole?.trim() || "مشارك",
    authorAvatar: null,
    category: data.category,
    coverUrl: data.coverUrl || null,
    status: "pending",
    likesCount: 0,
    viewCount: 0,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newArticle);
  localSettings.set("aqeeq_articles_list", JSON.stringify(all));
  return newArticle;
}

export async function createAdminArticle(data: {
  title: string;
  content: string;
  excerpt?: string;
  authorName: string;
  authorRole?: string;
  category: AqeeqArticleCategory | string;
  coverUrl?: string;
  isPublished?: boolean;
}): Promise<AqeeqArticle> {

  const all = await listAllArticles();
  const now = new Date().toISOString();
  const id = all.length > 0 ? Math.max(...all.map((a) => a.id)) + 1 : 1;
  const slug = `article-${id}-${Date.now().toString(36)}`;
  const excerpt = data.excerpt || data.content.slice(0, 160).replace(/[\r\n]+/g, " ") + "...";

  const newArticle: AqeeqArticle = {
    id,
    title: data.title.trim(),
    slug,
    content: data.content.trim(),
    excerpt,
    authorName: data.authorName.trim(),
    authorRole: data.authorRole?.trim() || "إدارة المدرسة",
    authorAvatar: "/favicon.png",
    category: data.category,
    coverUrl: data.coverUrl || null,
    status: data.isPublished ? "published" : "pending",
    likesCount: 0,
    viewCount: 0,
    publishedAt: data.isPublished ? now : null,
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newArticle);
  localSettings.set("aqeeq_articles_list", JSON.stringify(all));
  return newArticle;
}

export async function moderateArticle(
  id: number,
  status: "published" | "pending" | "rejected",
  updates?: {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: AqeeqArticleCategory | string;
    coverUrl?: string | null;
  }
): Promise<AqeeqArticle | undefined> {
  const all = await listAllArticles();
  const article = all.find((a) => a.id === id);
  if (!article) return undefined;

  article.status = status;
  article.updatedAt = new Date().toISOString();
  if (status === "published" && !article.publishedAt) {
    article.publishedAt = new Date().toISOString();
  }
  if (updates?.title) article.title = updates.title.trim();
  if (updates?.content) article.content = updates.content.trim();
  if (updates?.excerpt) article.excerpt = updates.excerpt.trim();
  if (updates?.category) article.category = updates.category;
  if (updates?.coverUrl !== undefined) article.coverUrl = updates.coverUrl;

  localSettings.set("aqeeq_articles_list", JSON.stringify(all));
  return article;
}

export async function deleteArticle(id: number): Promise<boolean> {
  let all = await listAllArticles();
  all = all.filter((a) => a.id !== id);
  localSettings.set("aqeeq_articles_list", JSON.stringify(all));
  return true;
}

export async function likeArticle(id: number): Promise<number> {
  const all = await listAllArticles();
  const article = all.find((a) => a.id === id);
  if (article) {
    article.likesCount = (article.likesCount || 0) + 1;
    localSettings.set("aqeeq_articles_list", JSON.stringify(all));
    return article.likesCount;
  }
  return 0;
}

export async function aiPolishArticle(title: string, content: string): Promise<{ polishedTitle: string; polishedContent: string; polishedExcerpt: string }> {
  try {
    const { getEffectiveGeminiApiKey } = await import("./schoolAiAssistant");
    const apiKey = await getEffectiveGeminiApiKey();
    if (!apiKey) {
      return {
        polishedTitle: title,
        polishedContent: content,
        polishedExcerpt: content.slice(0, 160).replace(/[\r\n]+/g, " ") + "...",
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `أنت رئيس التحرير والخبير اللغوي والصحفي الرسمي لـ «مدارس العقيق الأهلية والدولية بالمدينة المنورة».
قم بالتدقيق اللغوي والإملائي وإعادة الصياغة الصحفية الراقية للمقال المدرسي التالي مع الحفاظ على روح الفكرة ومصداقيتها وهويتها العقيقية:

العنوان الأصلي: "${title}"
نص المقال:
"${content}"

أعد النتيجة بصيغة JSON فقط بهذا الشكل الدقيق:
{
  "polishedTitle": "العنوان الصحفي المحسّن والمصقول",
  "polishedContent": "نص المقال المصحح لغوياً والمنسق بفقرات احترافية",
  "polishedExcerpt": "موجز صحفي جذاب للمقال في سطرين (حد أقصى 150 حرف)"
}`;

    const models = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash"];
    for (const model of models) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json", temperature: 0.25 },
        });

        const text = res.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return {
            polishedTitle: parsed.polishedTitle || title,
            polishedContent: parsed.polishedContent || content,
            polishedExcerpt: parsed.polishedExcerpt || content.slice(0, 160) + "...",
          };
        }
      } catch (err) {}
    }
  } catch (err) {
    console.warn("AI article polish error:", err);
  }

  return {
    polishedTitle: title,
    polishedContent: content,
    polishedExcerpt: content.slice(0, 160).replace(/[\r\n]+/g, " ") + "...",
  };
}

export async function aiDraftArticle(params: {
  topic: string;
  category?: AqeeqArticleCategory | string;
  authorRole?: string;
}): Promise<{ title: string; excerpt: string; content: string; category: string }> {

  try {
    const { getEffectiveGeminiApiKey } = await import("./schoolAiAssistant");
    const apiKey = await getEffectiveGeminiApiKey();
    if (!apiKey) {
      return {
        title: `مقال صحفي: ${params.topic}`,
        excerpt: `مقال تربوي يسلّط الضوء على ${params.topic} في مدارس العقيق الأهلية والدولية بالمدينة المنورة.`,
        content: `في إطار رسالة مدارس العقيق الأهلية والدولية نحو إلهام الأجيال وتنمية القدرات، يسرنا استعراض موضوع ${params.topic} وتأثيره الإيجابي على رحلة الطلاب التعليمية.`,
        category: params.category || "تربوي",
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `أنت رئيس التحرير والكاتب الصحفي الرسمي لـ «مدارس العقيق الأهلية والدولية بالمدينة المنورة» و«استوديو العقيق».
المطلوب منك كتابة مقال صحفي وتربوي متكامل، مشوق، ورصين حول الفكرة أو الحدث التالي:
الموضوع: "${params.topic}"
التصنيف المطلوب: "${params.category || 'تربوي'}"

إرشادات الصياغة الصحفية الذكية:
1. الارتكاز على هوية مدارس العقيق وقيمها وأركانها الأربعة (نُلهم الأجيال، نُنمّي القدرات، نحتفي بالتميّز، نصنع الأثر).
2. الالتزام بالدقة والمصداقية واللغة العربية الفصحى الرصينة.
3. التنسيق بفقرات متماسكة مع مقدمة جذابة، محاور واضحة، وخاتمة ملهمة.
4. إبراز البيئة التعليمية المتطورة، التميز الأكاديمي، والمراكز المعتمدة بمدارس العقيق.

أعد النتيجة بصيغة JSON فقط بهذا الشكل الدقيق:
{
  "title": "عنوان صحفي جذاب ومبتكر",
  "excerpt": "موجز صحفي في حدود 150 حرف يلخص جوهر المقال",
  "content": "نص المقال الكامل منسقاً بفقرات ومقدمة وخاتمة ملهمة",
  "category": "${params.category || 'تربوي'}"
}`;

    const models = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash"];
    for (const model of models) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { 
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const text = res.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return {
            title: parsed.title || `مقال صحفي: ${params.topic}`,
            excerpt: parsed.excerpt || `مقال عن ${params.topic}`,
            content: parsed.content || "",
            category: parsed.category || params.category || "تربوي",
          };
        }
      } catch (err) {}
    }
  } catch (err) {
    console.warn("AI article draft error:", err);
  }

  return {
    title: `مقال صحفي: ${params.topic}`,
    excerpt: `مقال صحفي يتناول ${params.topic} في مدارس العقيق.`,
    content: `مقال صحفي حول ${params.topic}`,
    category: params.category || "تربوي",
  };
}

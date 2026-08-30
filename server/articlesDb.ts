import { getDb } from "./db";
import { localSettings } from "./localStore";
import { GoogleGenAI } from "@google/genai";

export type AqeeqArticle = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string | null;
  category: "تربوي" | "إبداعات الطلاب" | "إرشاد أسري" | "أنشطة وفعاليات" | "تجارب ملهمة";
  coverUrl?: string | null;
  status: "published" | "pending" | "rejected";
  likesCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_ARTICLES: AqeeqArticle[] = [
  {
    id: 1,
    title: "رحلة التميز الأكاديمي: كيف تبني مدارس العقيق قادة المستقبل؟",
    slug: "academic-excellence-journey",
    excerpt: "نظرة متعمقة في المناهج العالمية والبيئة التعليمية المحفزة التي تقدمها مدارس العقيق لطلابها في كافة المراحل.",
    content: `في عالم سريع التغير، لم يعد التعليم مجرد تلقين للمعلومات، بل أصبح صناعة للشخصية وصقلاً للمواهب وبناءً لمهارات التفكير النقدي وحل المشكلات.

تسعى مدارس العقيق الأهلية والدولية بالمدينة المنورة إلى تقديم نموذج رائد يجمع بين الأصالة المعرفية والتقنيات التربوية العالمية، حيث تقدم المدارس:
1. **برامج الدبلومة الأمريكية والبريطانية** المعتمدة دولياً.
2. **معامل ذكية متطورة** للروبوت والذكاء الاصطناعي والتفكير الإبداعي.
3. **رعاية فائقة للموهوبين** عبر مشاركات سنوية في الأولمبيادات العلمية ومسابقات موهبة.
4. **بيئة محفزة للأنشطة اللاصفية** تصقل المهارات القيادية وتغرس روح التعاون.

إن مسيرة التميز مستمرة بفضل تكامل جهود المعلمين المخلصين وشراكة أولياء الأمور الواعين، لنرى أبناءنا وبناتنا دوماً في منصات التكريم الأولى.`,
    authorName: "أ. عبد الرحمن خليل",
    authorRole: "إدارة التطوير التربوي",
    authorAvatar: "/favicon.png",
    category: "تربوي",
    coverUrl: "/og-preview.png",
    status: "published",
    likesCount: 38,
    viewCount: 245,
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    title: "أثر المشاركة في الأنشطة الطلابية على التحصيل الدراسي والشخصية",
    slug: "student-activities-impact",
    excerpt: "دراسة تجريبية وتوصيات تربوية لأولياء الأمور لتعزيز مشاركة أبنائهم في الفعاليات والنوادي الطلابية.",
    content: `تُظهر الدراسات التربوية الحديثة أن الطلاب المشاركين في الأنشطة الطلابية المدرسية (الإذاعة المدرسية، النوادي العلمية، الفنون، الفرق الكشفية والرياضية) يحققون معدلات تحصيل أكاديمي أعلى بنسبة تتجاوز 25% مقارنة بأقرانهم.

يعود ذلك إلى:
- تعزيز الثقة بالنفس والقدرة على مواجهة الجمهور.
- تنظيم وإدارة الوقت بكفاءة بين المذاكرة والنشاط.
- تنمية روح المبادرة والعمل الجماعي.

نحث جميع أولياء الأمور الكرام على تشجيع أبنائهم وبناتهم للانضمام إلى النوادي الطلابية المتاحة بمدارس العقيق منذ بداية العام الدراسي.`,
    authorName: "د. خالد السبيعي",
    authorRole: "مستشار التوجيه الطلابي",
    authorAvatar: null,
    category: "إرشاد أسري",
    coverUrl: null,
    status: "published",
    likesCount: 29,
    viewCount: 180,
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export async function listAllArticles(): Promise<AqeeqArticle[]> {
  const raw = localSettings.get("aqeeq_articles_list");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
  category: "تربوي" | "إبداعات الطلاب" | "إرشاد أسري" | "أنشطة وفعاليات" | "تجارب ملهمة";
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
  category: "تربوي" | "إبداعات الطلاب" | "إرشاد أسري" | "أنشطة وفعاليات" | "تجارب ملهمة";
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
    category?: "تربوي" | "إبداعات الطلاب" | "إرشاد أسري" | "أنشطة وفعاليات" | "تجارب ملهمة";
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
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return {
        polishedTitle: title,
        polishedContent: content,
        polishedExcerpt: content.slice(0, 160).replace(/[\r\n]+/g, " ") + "...",
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `أنت خبير لغوي وتربوي متميز في مدارس العقيق.
قم بالتدقيق اللغوي والإملائي وتحسين الصياغة للمقال المدرسي التالي ليصبح أسلوبه راقياً ومشوقاً وصحيحاً لغوياً:

العنوان الأصلي: "${title}"
نص المقال:
"${content}"

أعد النتيجة بصيغة JSON فقط بهذا الشكل الدقيق:
{
  "polishedTitle": "العنوان المحسّن والمصقول",
  "polishedContent": "نص المقال المصحح لغوياً والمنسق بالفقرات",
  "polishedExcerpt": "موجز جذاب للمقال في سطرين (حد أقصى 150 حرف)"
}`;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
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
  } catch (err) {
    console.warn("AI article polish error:", err);
  }

  return {
    polishedTitle: title,
    polishedContent: content,
    polishedExcerpt: content.slice(0, 160).replace(/[\r\n]+/g, " ") + "...",
  };
}

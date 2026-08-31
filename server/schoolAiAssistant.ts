import { GoogleGenAI } from "@google/genai";
import { getPublishedArticles } from "./articlesDb";
import { getPodcasts } from "./podcastDb";
import { listSchoolNewsIssues, listAqeeqAlbums, getSiteBroadcast, getDb } from "./db";
import { settings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ActionShortcut = {
  label: string;
  url: string;
  icon: string;
};

// Singleton Client Cache
let cachedAiClient: { key: string; client: GoogleGenAI } | null = null;
function getAiClient(apiKey: string): GoogleGenAI {
  if (!cachedAiClient || cachedAiClient.key !== apiKey) {
    cachedAiClient = { key: apiKey, client: new GoogleGenAI({ apiKey }) };
  }
  return cachedAiClient.client;
}

// In-Memory Live Platform Data Cache (2-minute TTL for zero database latency)
let cachedLivePlatformData = "";
let lastLivePlatformFetchTime = 0;
const LIVE_CACHE_TTL_MS = 120_000;

async function getCachedLivePlatformData(): Promise<string> {
  const now = Date.now();
  if (cachedLivePlatformData && now - lastLivePlatformFetchTime < LIVE_CACHE_TTL_MS) {
    return cachedLivePlatformData;
  }
  try {
    const [recentArticles, recentPodcasts, recentIssues, recentAlbums, broadcast] = await Promise.all([
      getPublishedArticles().catch(() => []),
      getPodcasts().catch(() => []),
      listSchoolNewsIssues("published").catch(() => []),
      listAqeeqAlbums("published").catch(() => []),
      getSiteBroadcast().catch(() => null),
    ]);

    const articlesSummary = (recentArticles as any[])
      .slice(0, 3)
      .map((a: any) => `• مقال: «${a.title}» للكاتب ${a.authorName} (${a.category})`)
      .join("\n");

    const podcastsSummary = (recentPodcasts as any[])
      .slice(0, 3)
      .map((p: any) => `• حلقة: «${p.title}» - ${p.category} (${p.mediaType === "video" ? "فيديو" : "صوت"})`)
      .join("\n");

    const issuesSummary = (recentIssues as any[])
      .slice(0, 2)
      .map((i: any) => `• عدد المجلة: «${i.title}»`)
      .join("\n");

    const albumsSummary = (recentAlbums as any[])
      .slice(0, 2)
      .map((alb: any) => `• ألبوم: «${alb.title}»`)
      .join("\n");

    cachedLivePlatformData = `
--- بيانات حية من منصة استوديو العقيق حالياً ---
${broadcast?.enabled && broadcast.message ? `📢 تنبيه معلن في المنصة: "${broadcast.message}"` : ""}
${issuesSummary ? `أحدث أعداد المجلة:\n${issuesSummary}` : ""}
${albumsSummary ? `أحدث ألبومات الصور:\n${albumsSummary}` : ""}
${articlesSummary ? `أحدث المقالات:\n${articlesSummary}` : ""}
${podcastsSummary ? `أحدث حلقات البودكاست:\n${podcastsSummary}` : ""}
-----------------------------------------
`;
    lastLivePlatformFetchTime = now;
  } catch (e) {
    // Non-blocking
  }
  return cachedLivePlatformData;
}

export async function getEffectiveGeminiApiKey(): Promise<string | null> {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_API_KEY) return process.env.GOOGLE_API_KEY;
  if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;

  try {
    const db = await getDb();
    if (db) {
      const row = await db.select().from(settings).where(eq(settings.key, "gemini_api_key")).limit(1);
      if (row.length > 0 && row[0].value?.trim()) {
        return row[0].value.trim();
      }
    }
  } catch (e) {
    // Ignore DB fetch errors
  }

  return null;
}

const SYSTEM_INSTRUCTION_CORPUS = `
أنت ذكاء اصطناعي فائق التطور والذكاء واللباقة (Powered by Google Gemini 3.6 Flash ⚡💎). 
تعمل كمستشار شخصي وصديق ذكي وممثل تربوي رسمي لـ «مدارس العقيق الأهلية والدولية بالمدينة المنورة».

==================================================
🌟 شخصيتك وأسلوبك في الحوار (ذكاء حقيقي مفتوح وطبيعي 100%):
==================================================
1. **حرية الحديث والإجابة عن أي موضوع**:
   - أنت لست مقيداً بمواضيع المدرسة فقط؛ يمكنك الحديث والإجابة عن **أي سؤال وموضوع يطرحه المستخدم في كل مجالات المعرفة والحياة** (العلوم، التكنولوجيا، البرمجة، الرياضيات، التاريخ، الأدب، الدردشة العامة، النصائح الحياتية، النكت والممازحة الخفيفة، أو أي استفسار عام).
   - تجيب بذكاء بشري عالي، فهم عميق، وأسلوب ممتع ولبق بدون أي قيود مصطنعة.

2. **التفاعل الإنساني والترحيب الطبيعي**:
   - إذا سلم عليك المستخدم ("السلام عليكم"، "ازيك"، "مساء الخير"، "صباح الخير"، "عامل ايه"، "هلا"، "كيف حالك")، رد عليه بتحية عفوية ودافئة وودودة مثل أي إنسان وخدمة عملاء حقيقية راقية (مثلاً: "وعليكم السلام ورحمة الله وبركاته! يا هلا والله، نورتنا يا غالي.. أنا بخير الحمد لله، وتسلم لذوقك وسؤالك. طمني عنك؟ وكيف أقدر أساعدك اليوم؟ 😊").
   - لا تسرد مقالات طويلة أو قوالب معلبة عند التحية؛ خلك عفوي ومتفاعل مع طبيعة الرسالة.

3. **استيعاب كل اللهجات العربية**:
   - تفهم العامية المصرية، السعودية، الحجازية، الخليجية، والشامية واللغة الفصحى بطلاقة وتتجاوب بسلاسة.

4. **خبير وموسوعة كاملة لمدارس العقيق الأهلية والدولية (عند السؤال عنها)**:
   - **الاعتمادات**: معتمدة من وزارة التعليم، حاصلة على الاعتماد الأكاديمي الدولي الكامل من منظمة Cognia للمسار الدولي، وشريك رسمي لمؤسسة (موهبة).
   - **المسار الوطني (الأهلي)**: مناهج الوزارة + تدعيم إثرائي مكثف للغة الإنجليزية والعلوم + برنامج تدريب مكثف ومستمر لاختبارات القدرات العامة والتحصيلي (قياس).
   - **المسار الدولي (الدبلومة الأمريكية - Cognia)**: معايير Common Core و NGSS الأمريكية، تدريس المواد باللغة الإنجليزية، مقررات AP الجامعية المتقدمة، وتدريب SAT / ACT / IELTS.
   - **مرحلة الطفولة المبكرة ورياض الأطفال (KG1, KG2, KG3)**: منهج مونتيسوري التفاعلي، التعلم باللعب والاستكشاف، برنامج Phonics، القرآن الكريم، وبيئة آمنة جداً (سن القبول 3، 4، 5 سنوات).
   - **الموهبة والروبوتيكس (STEM)**: معامل الروبوت والذكاء الاصطناعي، مسابقات VEX و FLL، والأولمبيادات العلمية.
   - **المرافق الرياضية**: مسبح نصف أولمبي مغطى ومدفأ مع مدربين معتمدين، صالات رياضية مكيفة، وملاعب عشبية بمواصفات الفيفا ومسرح مدرسي ضخم.
   - **القبول والتسجيل والرسوم**: التقديم متاح عبر البوابة الرسمية https://aqeeq.edu.sa، ويتضمن المقابلة التربوية واختبار تحديد المستوى.
   - **الخصومات والمنح**: خصم الإخوة (10% للثاني، 15% للثالث، 20% للرابع فما فوق)، خصم السداد المبكر، ومنح التفوق والموهبة وحفظة القرآن الكريم.
   - **المنصة الرقمية الفاخرة (استوديو العقيق)**:
     • مجلة العقيق 3D التفاعلية وPDF: (/journal)
     • ألبومات الفعاليات وتقنية البحث بالوجه (AI Face Search): (/albums)
     • منصة مقالات وأقلام العقيق: (/articles)
     • أثير إذاعة وبودكاست العقيق: (/podcast)
   - **المقر والمواعيد**: المدينة المنورة، الاصطفاف 6:45 ص، وقسم خدمة المستفيدين والتسجيل يستقبلكم حتى 3:30 عصراً.
`;

export async function askSchoolAiAssistant(
  messages: ChatMessage[],
  userPrompt: string
): Promise<{ reply: string; suggestedQuestions: string[]; actionShortcuts?: ActionShortcut[] }> {
  // 1. Fetch live platform context (cached with 0ms overhead)
  const livePlatformData = await getCachedLivePlatformData();

  // 2. Discover Gemini API Key
  const apiKey = await getEffectiveGeminiApiKey();

  if (apiKey) {
    try {
      const ai = getAiClient(apiKey);

      // Format clean multi-turn conversation history (last 10 turns for optimal speed)
      const formattedContents: any[] = [];
      const recentHistory = (messages || []).slice(-10);

      for (const msg of recentHistory) {
        if (!msg.content || typeof msg.content !== "string") continue;
        const role = msg.role === "user" ? "user" : "model";

        if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
          formattedContents[formattedContents.length - 1].parts[0].text += `\n${msg.content}`;
        } else {
          formattedContents.push({
            role,
            parts: [{ text: msg.content }],
          });
        }
      }

      if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === "user") {
        formattedContents[formattedContents.length - 1].parts[0].text += `\n${userPrompt}`;
      } else {
        formattedContents.push({
          role: "user",
          parts: [{ text: userPrompt }],
        });
      }

      const fullSystemContext = `${SYSTEM_INSTRUCTION_CORPUS}\n\n${livePlatformData}`;

      let rawReply = "";
      for (let attempt = 0; attempt <= 2; attempt++) {
        try {
          const res = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: formattedContents,
            config: {
              systemInstruction: fullSystemContext,
              temperature: 0.72,
              maxOutputTokens: 1200,
            },
          });
          rawReply = res.text?.trim() || "";
          if (rawReply) break;
        } catch (mErr) {
          if (attempt === 2) {
            console.warn("Gemini call failed after retries:", mErr);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
          }
        }
      }
      if (rawReply) {
        const suggestedQuestions = generateSmartFollowUpQuestions(userPrompt, rawReply);
        const actionShortcuts = generateActionShortcuts(userPrompt, rawReply);
        return {
          reply: rawReply,
          suggestedQuestions,
          actionShortcuts,
        };
      }
    } catch (err) {
      console.warn("Gemini Live AI generation error:", err);
    }
  }

  // 3. Fallback
  return getDeepConversationalReasoningReply(userPrompt, messages);
}

// ------------------------------------------------------------------------------------------------
// Conversational Fallback Reasoning Engine
// ------------------------------------------------------------------------------------------------

function getDeepConversationalReasoningReply(
  prompt: string,
  history: ChatMessage[]
): { reply: string; suggestedQuestions: string[]; actionShortcuts?: ActionShortcut[] } {
  const norm = normalizeArabicText(prompt);

  // Greeting / Chit-chat
  if (isGreeting(norm)) {
    return {
      reply: `وعليكم السلام ورحمة الله وبركاته! يا هلا والله، نورتنا يا غالي 🌿😊

أنا بخير والحمد لله، وتسلم لذوقك وسؤالك. طمني عنك؟

أنا في خدمتك لمساعدتك في أي موضوع عام أو استفسار بخصوص مدارس العقيق والتسجيل والمناهج. تفضل كيف أقدر أساعدك؟`,
      suggestedQuestions: [
        "ما هي شروط ورسوم القبول والتسجيل للعام الجديد؟",
        "قارن لي بين المسار الوطني والدبلومة الأمريكية",
        "كيف أبحث عن صوري في ألبومات التخرج بالذكاء الاصطناعي؟",
      ],
      actionShortcuts: [
        { label: "📖 تصفح مجلة العقيق", url: "/journal", icon: "journal" },
        { label: "📸 ألبومات الفعاليات", url: "/albums", icon: "albums" },
        { label: "🎙️ إذاعة وبودكاست العقيق", url: "/podcast", icon: "podcast" },
      ],
    };
  }

  // Comparison between American Diploma and National Track
  if (norm.includes("مقارن") || (norm.includes("الفرق") && (norm.includes("امريك") || norm.includes("دولي") || norm.includes("وطن") || norm.includes("اهل")))) {
    return {
      reply: `أهلاً بك يا غالي! من دواعي سروري أن أوضح لك الفرق بكل بساطة لتختار الأنسب لابنك 🎓💎:

### 🇸🇦 1. المسار الوطني (الأهلي):
• **المنهج**: يتبع مناهج وزارة التعليم مع تدعيم إثرائي مكثف للغة الإنجليزية والعلوم.
• **التركيز الأساسي**: تدريب مستمر ومعسكرات مكثفة لاختبارات **القدرات العامة والتحصيلي (قياس)**.
• **الأنسب لـ**: الطلاب الراغبين في القبول بالجامعات السعودية وكليات الطب والهندسة الوطنية.

---

### 🇺🇸 2. المسار الدولي (الدبلومة الأمريكية - American Diploma):
• **الاعتماد**: معتمد دولياً بالكامل من منظمة **Cognia** العالمية ومعترف به محلياً ودولياً.
• **المنهج**: معايير Common Core و NGSS الأمريكية وتدريس المواد العلمية بالإنجليزية.
• **المقررات المتقدمة (AP Courses)**: تمنح الطالب ساعات جامعية معتمدة تؤهله لأرقى الجامعات.
• **الاختبارات**: تدريب متخصص لاختبارات **SAT / ACT / IELTS**.
• **الأنسب لـ**: الطلاب الذين يخططون للابتعاث الخارجي أو الجامعات الدولية المرموقة.

لو تحب أساعدك في اختيار المسار الأنسب حسب اهتمامات ابنك أو مرحلته أنا معاك! 😊`,
      suggestedQuestions: [
        "ما هي شروط الالتحاق بالدبلومة الأمريكية؟",
        "ما هي الرسوم الدراسية وخيارات السداد والخصومات؟",
        "كيف أسجل ابني في المدارس للعام الجديد؟",
      ],
      actionShortcuts: [
        { label: "📖 تصفح مجلة العقيق", url: "/journal", icon: "journal" },
        { label: "🎙️ استمع لبودكاست القيادات التعليمية", url: "/podcast", icon: "podcast" },
      ],
    };
  }

  // Admissions & Tuition
  if (norm.includes("تسجيل") || norm.includes("قبول") || norm.includes("رسوم") || norm.includes("تقديم") || norm.includes("خصم") || norm.includes("مصاريف") || norm.includes("اقساط")) {
    return {
      reply: `يا هلا بك! بالنسبة للقبول والتسجيل والرسوم في مدارس العقيق، الموضوع سهل جداً وميسر 📝🌿:

### 📋 خطوات التسجيل:
1. التقديم إلكترونياً عبر البوابة الرسمية: [aqeeq.edu.sa](https://aqeeq.edu.sa).
2. حجز موعد المقابلة التربوية واختبار تحديد المستوى المناسب لسن الطالب.
3. تسليم الوثائق المطلوبة (الهوية / الإقامة، شهادات السنوات السابقة، كرت التطعيمات).
4. استلام إشعار القبول واعتماد المقعد.

### 🎁 الخصومات والمنح المتوفرة:
• **خصم الإخوة**: 10% للابن الثاني، 15% للثالث، و20% للرابع فما فوق.
• **خصم السداد المبكر**: عند سداد الرسوم كاملة قبل بداية العام.
• **منح التفوق والموهبة**: رعاية خاصة لحفظة كتاب الله وأبطال موهبة.
• خطط سداد فصلية وأقساط ميسرة.

إدارة القبول والتسجيل تسعد باستقبالكم يومياً في مقر المدارس بالمدينة المنورة حتى الساعة 3:30 عصراً. تحب أساعدك في تسجيل مرحلة معينة؟ 😊`,
      suggestedQuestions: [
        "ما هو سن القبول لرياض الأطفال والصف الأول؟",
        "هل تتوفر خدمة حافلات ونقل مدرسي مكيّفة؟",
        "ما هي الأوراق المطلوبة للتسجيل؟",
      ],
      actionShortcuts: [
        { label: "🌐 رابط بوابة القبول والتسجيل", url: "https://aqeeq.edu.sa", icon: "external" },
        { label: "📸 استكشف ألبومات الفعاليات", url: "/albums", icon: "albums" },
      ],
    };
  }

  // General natural reply
  return {
    reply: `أهلاً وسهلاً بك يا غالي! أنا في خدمتك دائماً لمساعدتك في أي استفسار عام أو أي سؤال يخص:
• 📝 **التسجيل، القبول، الرسوم، وخصومات الإخوة**
• 🎓 **المسار الوطني والدبلومة الأمريكية (Cognia)**
• 📸 **ألبومات الفعاليات وتقنية البحث بالوجه (AI Face Search)**
• 📖 **مجلة العقيق 3D ومقالات الطلاب والبودكاست الإذاعي**
• 🤖 **برامج الموهبة ومعامل الروبوتيكس والمسبح الأولمبي**

تفضل اسألني عن أي موضوع في بالك وسأجيبك فوراً بكل وضوح وسرور! 😊`,
    suggestedQuestions: [
      "قارن بين المسار الوطني والدبلومة الأمريكية",
      "ما هي شروط ورسوم القبول والتسجيل؟",
      "كيف أبحث عن صوري في ألبومات التخرج بالوجه؟",
    ],
    actionShortcuts: [
      { label: "📖 مجلة العقيق", url: "/journal", icon: "journal" },
      { label: "📸 ألبومات الحفلات", url: "/albums", icon: "albums" },
      { label: "🎙️ البودكاست", url: "/podcast", icon: "podcast" },
    ],
  };
}

// ------------------------------------------------------------------------------------------------
// Helper Utilities
// ------------------------------------------------------------------------------------------------

function normalizeArabicText(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .trim();
}

function isGreeting(text: string): boolean {
  const greetings = [
    "مرحبا",
    "اهلين",
    "السلام عليكم",
    "صباح الخير",
    "مساء الخير",
    "هلا",
    "هاي",
    "hello",
    "hi",
    "ازيك",
    "شخبارك",
    "كيف حالك",
    "عامل ايه",
    "اخبارك",
    "يا هلا",
    "حياك",
  ];
  return greetings.some((g) => text.includes(g)) && text.length < 50;
}

function generateSmartFollowUpQuestions(prompt: string, reply: string): string[] {
  const p = normalizeArabicText(prompt + " " + reply);

  if (p.includes("دبلوم") || p.includes("امريك") || p.includes("sat") || p.includes("cognia")) {
    return [
      "ما هي متطلبات وشروط الالتحاق بالدبلومة الأمريكية؟",
      "ما هي مقررات AP المتقدمة المعتمدة في المدارس؟",
      "كيف يتم تدريب الطلاب لاختبارات SAT و IELTS؟",
    ];
  }
  if (p.includes("تسجيل") || p.includes("قبول") || p.includes("رسوم") || p.includes("خصم")) {
    return [
      "ما هي نسبة خصم الإخوة والسداد المبكر؟",
      "ما هي المستندات المطلوبة لتسجيل طالب مستجد؟",
      "ما هي مواعيد الدوام الرسمي ومكتب التسجيل؟",
    ];
  }
  if (p.includes("البوم") || p.includes("صور") || p.includes("وجه") || p.includes("تخرج") || p.includes("سيلفي")) {
    return [
      "كيف استخدم الكاميرا للبحث عن صوري في حفل التخرج؟",
      "أين أجد ألبوم حفل التخرج الأخير؟",
      "كيف أقوم بتنزيل الصور بجودة عالية؟",
    ];
  }

  return [
    "ما هي مميزات الدبلومة الأمريكية بمدارس العقيق؟",
    "ما هي شروط ورسوم القبول والتسجيل؟",
    "كيف أبحث عن صوري في ألبومات التخرج بالذكاء الاصطناعي؟",
  ];
}

function generateActionShortcuts(prompt: string, reply: string): ActionShortcut[] {
  const p = normalizeArabicText(prompt + " " + reply);
  const shortcuts: ActionShortcut[] = [];

  if (p.includes("مجل") || p.includes("قراء") || p.includes("عدد")) {
    shortcuts.push({ label: "📖 تصفح مجلة العقيق", url: "/journal", icon: "journal" });
  }
  if (p.includes("البوم") || p.includes("صور") || p.includes("وجه") || p.includes("تخرج") || p.includes("سيلفي")) {
    shortcuts.push({ label: "📸 ألبومات الفعاليات والبحث بالوجه", url: "/albums", icon: "albums" });
  }
  if (p.includes("بودكاست") || p.includes("اذاع") || p.includes("صوت") || p.includes("حلق")) {
    shortcuts.push({ label: "🎙️ استمع لبودكاست العقيق", url: "/podcast", icon: "podcast" });
  }
  if (p.includes("مقال") || p.includes("اقلام") || p.includes("كاتب")) {
    shortcuts.push({ label: "✍️ قراءة مقالات العقيق", url: "/articles", icon: "articles" });
  }
  if (p.includes("تسجيل") || p.includes("قبول") || p.includes("تواصل") || p.includes("رسوم")) {
    shortcuts.push({ label: "🌐 بوابة القبول والتسجيل", url: "https://aqeeq.edu.sa", icon: "external" });
  }

  if (shortcuts.length === 0) {
    shortcuts.push(
      { label: "📖 مجلة العقيق", url: "/journal", icon: "journal" },
      { label: "📸 الألبومات والبحث بالوجه", url: "/albums", icon: "albums" },
      { label: "🎙️ البودكاست", url: "/podcast", icon: "podcast" }
    );
  }

  return shortcuts.slice(0, 3);
}

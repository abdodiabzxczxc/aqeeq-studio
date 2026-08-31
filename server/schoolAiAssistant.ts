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
أنت شخص حقيقي ومستشار خدمة عملاء وتربوي ودود ولطيف ومحترف جداً في «مدارس العقيق الأهلية والدولية بالمدينة المنورة».

==================================================
🎯 أهم قواعد أسلوبك وشخصيتك (تحدث كإنسان حقيقي تماماً):
==================================================
1. **الرد الطبيعي الإنساني والترحيب**:
   - إذا سلم عليك العميل أو ولي الأمر ("السلام عليكم"، "ازيك"، "مساء الخير"، "صباح الخير"، "كيف حالك"، "يا هلا")، رد عليه بتحية دافئة ولطيفة مثل أي إنسان وخدمة عملاء حقيقية راقية (مثال: "وعليكم السلام ورحمة الله وبركاته! يا هلا والله، نورتنا يا غالي.. أنا بخير الحمد لله، وتحت أمرك في أي وقت 😊🌿").
   - لا تسرد مقالات طويلة عند التحية فقط، بل رحب به واسأله بلطف كيف تساعده.

2. **التحدث بمرونة وفهم كافة اللهجات**:
   - تفهم اللهجات السعودية، الحجازية، المصرية، الخليجية، والشامية والعامية وتتجاوب معها بذكاء وتلقائية وبساطة.
   - تحدث بلغة عربية فصيحة سلسة ودافئة جداً وقريبة من القلب، خالية من التعقيد والجفاف الروبوتي.

3. **الإجابة على قدر السؤال بذكاء وذوق**:
   - أجب عن صلب السؤال بوضوح وصدق.
   - إذا سأل عن مقارنة (مثل الدبلومة الأمريكية والمسار الوطني)، اشرح له بنقاط مبسطة وجميلة تبرز المزايا والفرق.
   - إذا سأل عن الرسوم والتسجيل، اشرح له خطوات التقديم وخصومات الإخوة ووجهه لبوابة التسجيل.
   - اختم كلامك بعبارة ودية لطيفة مثل: "تحب أوضحلك أي نقطة ثانية يا غالي؟" أو "قولي في أي مرحلة ابنك علشان أساعدك أكتر 😊".

4. **الروابط المباشرة داخل المنصة**:
   - اذكر الروابط عند الحاجة:
     • (/journal) لمجلة العقيق ثلاثية الأبعاد
     • (/albums) لألبومات الفعاليات والبحث بالوجه (AI Face Search)
     • (/articles) لمنصة مقالات وأقلام العقيق
     • (/podcast) لإذاعة وبودكاست العقيق
     • (https://aqeeq.edu.sa) لبوابة القبول والتسجيل الرسمية

==================================================
📚 المعرفة الشاملة بمدارس العقيق الأهلية والدولية:
==================================================
- **الهوية والاعتمادات**: صرح تعليمي رائد بالمدينة المنورة يجمع القيم الإسلامية والوطنية بالمعايير العالمية. معتمدة من وزارة التعليم، وحاصلة على الاعتماد الأكاديمي الدولي (Cognia) للمسار الدولي، وشريك رسمي لمؤسسة (موهبة).
- **المسار الوطني (الأهلي)**: مناهج الوزارة + تدعيم إثرائي مكثف للغة الإنجليزية والعلوم + برنامج تدريب مكثف لاختبارات القدرات والتحصيلي (قياس).
- **المسار الدولي (الدبلومة الأمريكية - American Diploma)**: اعتماد Cognia الدولي، مناهج Common Core و NGSS الأمريكية، مقررات AP المتقدمة المحسوبة بساعات جامعية، وتدريب متخصص لاختبارات SAT / ACT / IELTS.
- **مرحلة الطفولة المبكرة ورياض الأطفال (KG1, KG2, KG3)**: منهج مونتيسوري التفاعلي، التعلم باللعب والاستكشاف، برنامج Phonics، القرآن الكريم، وبيئة آمنة جداً. سن القبول 3، 4، 5 سنوات.
- **رعاية الموهوبين والابتكار**: فصول موهبة، أولمبيادات العلوم، ومعامل الروبوتيكس والذكاء الاصطناعي (STEM Labs) ومسابقات VEX و FLL.
- **المرافق الرياضية والبيئة المدرسية**: مسبح نصف أولمبي مغطى ومدفأ، صالات رياضية مكيفة، ملاعب عشبية بمواصفات الفيفا، ومسرح مدرسي ضخم وعيادة طبية مجهزة.
- **القبول والتسجيل والرسوم**: التقديم عبر [https://aqeeq.edu.sa](https://aqeeq.edu.sa)، المقابلة التربوية واختبار تحديد المستوى.
- **الخصومات والمنح**: خصم الإخوة (10% للثاني، 15% للثالث، 20% للرابع فما فوق)، خصم السداد المبكر، ومنح حفظة القرآن والموهوبين، وخطط سداد ميسرة.
- **النقل المدرسي**: أسطول حافلات مكيفة ومجهزة بكاميرات وGPS ومشرفات نقل.
- **المقر والمواعيد**: المدينة المنورة، الاصطفاف 6:45 صباحاً، وقسم التسجيل وخدمة المستفيدين يستقبل أولياء الأمور حتى 3:30 عصراً.
`;

export async function askSchoolAiAssistant(
  messages: ChatMessage[],
  userPrompt: string
): Promise<{ reply: string; suggestedQuestions: string[]; actionShortcuts?: ActionShortcut[] }> {
  // 1. Fetch live platform context
  let livePlatformData = "";
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

    livePlatformData = `
--- بيانات حية وفورية من المنصة حالياً ---
${broadcast?.enabled && broadcast.message ? `📢 تنبيه معلن: "${broadcast.message}"` : ""}
${issuesSummary ? `أحدث أعداد المجلة المتاحة:\n${issuesSummary}` : ""}
${albumsSummary ? `أحدث ألبومات الصور:\n${albumsSummary}` : ""}
${articlesSummary ? `أحدث المقالات:\n${articlesSummary}` : ""}
${podcastsSummary ? `أحدث حلقات البودكاست:\n${podcastsSummary}` : ""}
-----------------------------------------
`;
  } catch (e) {
    console.warn("Could not fetch live platform context for AI Assistant:", e);
  }

  // 2. Discover Gemini API Key
  const apiKey = await getEffectiveGeminiApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Format multi-turn conversation history for Gemini
      const formattedContents: any[] = [];

      const recentHistory = (messages || []).slice(-14);
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
      try {
        const res = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: formattedContents,
          config: {
            systemInstruction: fullSystemContext,
            temperature: 0.75,
            maxOutputTokens: 1600,
          },
        });
        rawReply = res.text?.trim() || "";
      } catch (mErr) {
        const res = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: formattedContents,
          config: {
            systemInstruction: fullSystemContext,
            temperature: 0.75,
            maxOutputTokens: 1600,
          },
        });
        rawReply = res.text?.trim() || "";
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
      console.warn("Gemini Live AI Assistant generation error:", err);
    }
  }

  // 3. Fallback: Friendly Natural Conversational Reply
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

أنا في خدمتك دائماً كمستشارك التربوي وخدمة عملاء مدارس العقيق بالمدينة المنورة. أنا بخير والحمد لله، وأتمنى لك يوماً جميلاً وسعيداً!

تفضل، كيف أقدر أساعدك اليوم بخصوص المدارس أو التسجيل أو المناهج؟`,
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
    reply: `أهلاً وسهلاً بك يا غالي في مدارس العقيق الأهلية والدولية بالمدينة المنورة 💎🌿

أنا في خدمتك دائماً لمساعدتك والإجابة على أي استفسار يخص:
• 📝 **التسجيل، القبول، الرسوم، وخصومات الإخوة**
• 🎓 **المسار الوطني والدبلومة الأمريكية (Cognia)**
• 📸 **ألبومات الفعاليات وتقنية البحث بالوجه (AI Face Search)**
• 📖 **مجلة العقيق 3D ومقالات الطلاب والبودكاست الإذاعي**
• 🤖 **برامج الموهبة ومعامل الروبوتيكس والمسبح الأولمبي**

تفضل اسألني عن أي نقطة وحابب أساعدك فيها فوراً! 😊`,
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

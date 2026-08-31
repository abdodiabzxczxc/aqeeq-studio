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
      .slice(0, 10)
      .map((a: any) => `• [${a.category}] مقال: «${a.title}» — بقلم: ${a.authorName} (${a.authorRole || "كاتب"})\n  نبذة: ${a.excerpt || ""}`)
      .join("\n");

    const podcastsSummary = (recentPodcasts as any[])
      .slice(0, 10)
      .map((p: any) => `• [${p.category}] «${p.title}» — تقديم / إشراف: ${p.hostName || "إعلام مدارس العقيق"} (${p.mediaType === "video" ? "فيديو" : "تسجيل صوتي"})\n  الوصف: ${p.description || ""}`)
      .join("\n");

    const issuesSummary = (recentIssues as any[])
      .slice(0, 5)
      .map((i: any) => `• عدد المجلة: «${i.title}» (العدد ${i.issueNumber || "1"} - ${i.pageCount || 1} صفحة)`)
      .join("\n");

    const albumsSummary = (recentAlbums as any[])
      .slice(0, 8)
      .map((alb: any) => `• ألبوم مصور: «${alb.title}» (${alb.albumDate || "موسم 2026"}) - عدد الصور: ${alb.photos?.length || 0}`)
      .join("\n");

    cachedLivePlatformData = `
=============================================
📚 أرشيف وبيانات حية فورية من منصة استوديو العقيق:
=============================================
${broadcast?.enabled && broadcast.message ? `📢 إعلان عاجل في المنصة: "${broadcast.message}"\n` : ""}
📰 أعداد مجلة العقيق المنشورة:
${issuesSummary || "لا توجد أعداد حالياً"}

📸 ألبومات الصور والفعاليات الرسمية:
${albumsSummary || "لا توجد ألبومات حالياً"}

✍️ أحدث مقالات الطلاب والمعلمين:
${articlesSummary || "لا توجد مقالات حالياً"}

🎙️ أحدث حلقات الإذاعة والبودكاست:
${podcastsSummary || "لا توجد حلقات حالياً"}
=============================================
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

4. **خبير وموسوعة كاملة لمدارس العقيق الأهلية والدولية (السجل التوثيقي الشامل لكافة منشورات وإنجازات وأنشطة المدارس على X وإنستغرام)**:
   - **الرؤية والرسالة والشعار**:
     • **الرؤية (Vision)**: أن نكون صرحاً تعليمياً ريادياً بمعايير عالمية وقيم إسلامية راسخة (To be a leading world-class educational corporation employing Islamic values).
     • **الرسالة (Mission)**: تقديم تعليم متميز لطلابنا وطالباتنا من خلال تطبيق أعلى المعايير الدولية التربوية والأكاديمية.
     • **أركان العقيق الأربعة**:
       1. **«نُلهم الأجيال»**: تعليم نوعي يرسخ المعرفة، وينمي التفكير، ويحفز التعلم المستمر لبناء أساس علمي متين.
       2. **«نُنمّي القدرات»**: تمكين الطلاب من اكتشاف مواهبهم وتنمية الابتكار والتفكير النقدي ومهارات المستقبل.
       3. **«نحتفي بالتميّز»**: بيئة تعليمية محفزة تفتح أبواب المنافسة في المحافل والأولمبيادات المحلية والدولية.
       4. **«نصنع الأثر»**: غرس القيم وبناء الشخصية القيادية المؤثرة لصناعة مستقبل واعد.
   - **الموقع والتواصل المباشر**:
     • **المقر**: المملكة العربية السعودية - المدينة المنورة - ممشى الهجرة - حي الرانوناء (مجمع تعليمي فخم تم تدشينه برعاية وتشريف صاحب السمو الملكي الأمير فيصل بن سلمان بن عبدالعزيز).
     • **الهاتف الموحد**: +966148131652 (0148131652)
     • **البوابة الرسمية**: https://aqeeq.edu.sa
     • **حساب منصة X (تويتر)**: [@alaqeeq_school](https://x.com/alaqeeq_school)
     • **حساب إنستغرام**: [@alaqeeq_schools](https://www.instagram.com/alaqeeq_schools/)
     • **أرقام الواتساب للتسجيل والأنشطة**: 0558559707 / 0568742104

   - **القيادة العليا ومجلس الإدارة (Leadership & Executive Management)**:
     • **أ. محمد شربيني**: رئيس مجلس الإدارة (Chairman of the Board of Directors).
     • **أ. مؤيد شربيني**: نائب رئيس مجلس الإدارة (Vice Chairman of the Board of Directors).
     • **أ. أحمد شربيني**: المدير التنفيذي لشركة العقيق القابضة (Chief Executive Officer - CEO).
     • **أ. عبدالله ناصر الحربي**: نائب الرئيس التنفيذي لقطاع التعليم والتدريب (Vice CEO for Education & Training Sector).
     • **أ. محمد زايد**: رئيس قطاع المتابعة والتطوير في شركة العقيق القابضة.

   - **سجل الشرف والبطولات وإنجازات الطلاب (موثقة بالأسماء والمراكز)**:
     • **اختبار القدرات والتحصيلي والاعتماد الأكاديمي**:
       - **مدارس العقيق الدولية بنات**: حققت **المركز الرابع على مستوى إدارة تعليم المدينة المنورة من أصل 170 مدرسة** في اختبار القدرات العامة.
       - **ثانوية العقيق الأهلية بنات**: تصنيفها ضمن **أفضل 100 مدرسة على مستوى المملكة العربية السعودية**، وتحقيق **المركز الرابع على مستوى المدارس الأهلية في المدينة المنورة** في التحصيل العلمي.
       - **ابتدائية العقيق الدولية بنات**: فوز الصف السادس (مادة الرياضيات) بـ **المركز الأول على مستوى المدينة المنورة** في اختبارات «نافس».
       - **ابتدائية العقيق الأهلية بنات**: نيل شهادة **التميز المدرسي لعام 2025م** واستثناؤها من الاختبارات المركزية.
       - **اختبار ACT الدولي**: تحقيق **المركز الأول على مستوى المنطقة الغربية والمركز السابع على مستوى الشرق الأوسط** في النصف الثاني لعام 2025.
       - **المسار المصري**: تصدر نتائج الشهادة الإعدادية على مستوى المملكة وتكريم من المكتب الثقافي المصري بجدة.
     • **الروبوت والذكاء الاصطناعي والأولمبيادات العلمية**:
       - **بطولة دوري فيرست للروبوت 2026 (FIRST LEGO League - فئة الاستكشاف)**: فريق **Aqeeq Robotics** بطل **المملكة العربية السعودية بالمركز الأول**، وممثل المملكة في النهائيات العالمية.
       - **أولمبياد اللغة الإنجليزية الوطني لفئة الصغار (ELO)**: فريق **Aqeeq Heroes** حقق **المركز الأول على مستوى المدينة المنورة والمركز الثامن على مستوى المملكة**.
       - **مسابقة كانجارو للغة الإنجليزية 2025 & 2026**: الطالب **ياسين محمد راتب** حقق **المركز الأول على مستوى المملكة العربية السعودية**.
       - **مسابقة بيبراس موهبة للمعلوماتية**: المركز الأول على مستوى المدينة المنورة، وتتويج الطالبات:
         * الطالبة **إيلين عبدالمنعم العوفي** (الميدالية الفضية 🥈).
         * الطالبة **سِدرة مازن كابلي** (الميدالية البرونزية 🥉).
         * الطالبة **كادي محمد الحربي** (الميدالية البرونزية 🥉).
       - **ملتقى الأمن السيبراني بجامعة جدة**: الطالب **سعد بن مازن القرني** (ثانوية العقيق بنين) حقق **المركز الأول في مسابقة "التقط العلم" (CTF)**.
       - **مسابقة صقر للروبوتات 2026**: مشاركة وتميز الطالبة **نور الجهني**.
       - **أولمبياد الروبوت العالمية WRO ومسابقات VEX و FLL**: فرق مجهزة بمركز STEAM.
       - **أولمبياد العلوم والرياضيات الوطني «نسمو 2026»**: خوض المرحلتين الأولى والثانية على مستوى تعليم المدينة.
       - **الأولمبياد الوطني للإبداع العلمي (إبداع 2025 / 2026)**: ترشح طالبات العقيق للمعارض المركزية.
     • **مسابقات القراءة والإلقاء والخطابة والقرآن الكريم**:
       - **تحدي القراءة العربي (الموسم العاشر - فئة أبطال التحدي بالمدينة المنورة)**:
         * الطالب **أحمد عبدالرحمن العمري** (متوسطة العقيق الأهلية): **المركز الثاني على مستوى منطقة المدينة المنورة** وخاض المرحلة الثانية بالمملكة.
         * الطالبة **جوري نبيل عبيد** (متوسطة العقيق الأهلية): **المركز الثالث على مستوى منطقة المدينة المنورة**.
         * الطالب **عبدالعزيز ريان الحصين** (متوسطة العقيق الأهلية): **المركز الرابع على مستوى منطقة المدينة المنورة**.
       - **مسابقة أقرأ**: تأهل القارئة **فريدة الطنبولي** (ابتدائية العقيق الدولية) للتصفيات النهائية.
       - **تحدي الإلقاء للأطفال 5 (مجمع الملك سلمان العالمي للغة العربية)**: مشاركة فرسان العقيق: **يزيد النجم**، **عدنان الناظر**، **عبدالإله بن عبدالله**، **خالد كاتب**، و**حكيم حسام**.
       - **مسابقات حفظ القرآن الكريم والسنة النبوية (مبادرة الوحيين)**:
         * الطالب **عبدالوهاب الشنقيطي** (حفظ القرآن الكريم كاملاً).
         * الطالب **حمزة محمد فهمي** (حفظ 10 أجزاء).
         * الطالب **محمد ذياب الأحمدي** (حفظ 5 أجزاء).
         * الطلاب: **صهيب رحيم**، **أحمد الزهراني**، **محمد إبراهيم** (حفظ جزء عم 30)، و**عمر عادل شربجي** (متوسطة).
         * تكريم برعاية فضيلة الشيخ د. **عثمان طه** (خطاط المصحف الشريف) والشيخ د. **أسامة الأخضر** (مؤذن المسجد النبوي).
     • **البطولات الرياضية وألعاب القوى**:
       - **بطولة المملكة العربية السعودية للملاكمة (وزن الريشة)**: الطالب **نواف الجهني** حقق **المركز الأول وتوج بطلاً للمملكة**.
       - **ملتقى ألعاب القوى السعودية بالباحة**: الطالبة **هبة محمد السيد** حققت **المركز الأول في سباق 100م والمركز الثاني في سباق 200م ناشئات**.
       - **دوري المدارس لألعاب القوى**: تأهل الطالبين **عبد الرحمن حمزة عمر** و **ليث رامي الزهراني** لتمثيل المدينة المنورة على مستوى المملكة وحصد ميداليات متنوعة.
       - **بطولة الهواة للهوكي (Saudi Hockey)**: الطالبة **عبير أبو الفرج** (الميدالية الذهبية 🥇)، والطالبان **عبدالله خياط** و **منصور أبو الفرج** (الميدالية الفضية 🥈).
       - **دوري كرة القدم بمدارس العقيق الدولية**: فوز فصل 4A باللقب بعد فوزه على 5B بنتيجة (2-1).

   - **الرحلات الميدانية والأنشطة والفعاليات المنفذة**:
     • **رحلة محافظة العُلا**: برنامج ثقافي وتاريخي واستكشافي في معالم العُلا التراثية.
     • **رحلة منتجع شاطئ الدولفين بينبع**: أنشطة بحرية وشاطئية لطلاب المتوسطة والدولية.
     • **رحلة مركز الأمير عبدالمجيد بن عبدالعزيز**: مسبح، صالات ألعاب، ملاعب كرة، بلياردو، وفرفيرة وبادل.
     • **رحلات بنز بولينج (Pinz Bowling)**، **ملاهي طفل المستقبل بالعالية مول**، **سباركيز بالراشد مول**، و**تشكي تشيز**.
     • **زيارة مركز الأمير محمد بن سلمان للخط العربي** لطلاب مجموعة الفن.
     • **زيارة أطفال الروضة إلى بُستان المُستظلّ** (أول بقعة وصل إليها النبي ﷺ في المدينة المنورة بعد الهجرة النبوية).
     • **زيارة طالبات الدولية إلى مسجد القبلتين**، وزيارة ميدانية لطلاب الدولية إلى **كلية الطب بجامعة طيبة**.
     • **خدمة ضيوف الرحمن**: استقبال المعتمرين والحجاج بمطار الأمير محمد بن عبدالعزيز الدولي.
     • **معرض عقيق المدينة للفنون بالعالية مول (بوابة 1)**: رسم حر، تلوين، ورسم على الوجه.
     • **معرض عقيق المدينة للعلوم (Science Fair)** وأسبوع الكيمياء العربي وتجارب العلوم الحية.
     • **مهرجان الشعوب بروضة العقيق**، بازار العقيق الطلابي، برنامج "القائد الصغير"، وبرنامج "المربي الصديق".

   - **العروض والخصومات والأنظمة الأكاديمية**:
     • **خصم الأصدقاء**: خصم 15% إلى 25% لرسوم الطالب عند تسجيل صديق + خصم 10% للصديق المسجل.
     • **خصم الجيران (يا حلو جيرتنا)**: خصم 5% لسكان الأحياء المجاورة لمجمع الرانوناء.
     • **خصم الروضة والصف الأول الابتدائي**: خصومات 20% و 15% مع خيارات سداد وتقسيط مرنة.
     • **أكاديمية العقيق الرياضية**:
       - اشتراك مجاني لمدة فصل دراسي كامل عند التسجيل في المدارس.
       - دورة التايكوندو مع المدرب الدولي محمد عياد (أحد، ثلاثاء، خميس 9:00 - 10:30 م - واتساب: 0558559707).
       - دورة السباحة (8 حصص تدريبية بـ 350 ريالاً - واتساب: 0558559707).
     • **دورات الروبوت والبرمجة بمركز STEAM**:
       - فئة الصغار (7-10 سنوات): 350 ريالاً - أحد وثلاثاء 3:30 - 5:00 م.
       - فئة الكبار (11-14 سنة): 400 ريالاً - اثنين وأربعاء 3:30 - 5:00 م (واتساب: 0568742104).
     • **التأهيل للاختبارات**: حصص مدمجة ضمن اليوم الدراسي لاختبارات: **القدرات، التحصيلي، STEP، و IELTS**.
     • **الشراكات الاستراتيجية**: شراكة مع **شركة كلاسيرا للتعليم الذكي** (استقبال الرئيس التنفيذي لكلاسيرا م. محمد المدني من قِبل الرئيس التنفيذي لشركة العقيق القابضة أ. أحمد الشربيني)، وهيئة تطوير المدينة المنورة.

   - **أقسام المنصة الرقمية (استوديو العقيق)**:
     • **مجلة العقيق 3D التفاعلية ونسخ PDF**: (/journal)
     • **ألبومات الحفلات والفعاليات مع ميزة البحث بالوجه بالذكاء الاصطناعي (AI Face Search)**: (/albums)
     • **مقالات وأقلام العقيق ومحرر الصياغة الذكي**: (/articles)
     • **أثير إذاعة وبودكاست العقيق (صوت وفيديو)**: (/podcast)
     • **الأخبار والعروض وتغطيات التواصل الاجتماعي**: (/offers)
     • **جهاز اللاسلكي المدرسي (Walkie-Talkie)**: للنداء والتواصل الفوري بين الكادر المدرسي.
   - **أوقات الدوام الرسمي**: الاصطفاف الصباحي يبدأ 6:45 ص، واستقبال أولياء الأمور وخدمة المستفيدين متاح حتى 3:30 عصراً.
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

      const modelsToTry = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash"];
      let rawReply = "";

      for (const model of modelsToTry) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("AI_TIMEOUT")), 15000)
          );

          const apiPromise = ai.models.generateContent({
            model,
            contents: formattedContents,
            config: {
              systemInstruction: fullSystemContext,
              temperature: 0.72,
              maxOutputTokens: 900,
            },
          });

          const res = await Promise.race([apiPromise, timeoutPromise]);
          rawReply = res.text?.trim() || "";
          if (rawReply) break;
        } catch (err: any) {
          console.warn(`Model ${model} attempt failed:`, err?.message?.slice(0, 80));
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
      console.warn("Gemini initialization error:", err);
    }
  }

  // 3. Fallback: Instant Conversational Reply (0ms)
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
• 🤖 **برامج الموهبة ومعامل الروبوتيكس والأنشطة الرياضية**

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

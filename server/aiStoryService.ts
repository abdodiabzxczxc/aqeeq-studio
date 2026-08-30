/**
 * Ultra-Powerful Arabic Journalistic Story & Caption Engine for Al-Aqeeq Schools
 * Powered by Google Gemini AI & Advanced Literary Arabic Synthesis
 */

import { GoogleGenAI } from "@google/genai";

export type StoryTone = "royal" | "celebration" | "educational" | "urgent";

export interface GenerateStoryInput {
  prompt?: string;
  topic?: string;
  keyPoints?: string;
  tone?: StoryTone;
  schoolName?: string;
  itemCount?: number;
  apiKey?: string;
}

export interface GeneratedStoryOutput {
  headline: string;
  subHeadline: string;
  kicker: string;
  leadParagraph: string;
  body: string;
  podcastScript: string;
  suggestedCaptions: string[];
}

type TopicCategory =
  | "tech"
  | "graduation"
  | "national"
  | "sports"
  | "quran"
  | "arts"
  | "talents"
  | "charity"
  | "general";

function detectCategory(text: string): TopicCategory {
  const t = text.toLowerCase();
  if (t.includes("روبوت") || t.includes("ذكاء") || t.includes("برمج") || t.includes("تقني") || t.includes("علوم") || t.includes("ابتكار") || t.includes("فضاء") || t.includes("معمل") || t.includes("هندس") || t.includes("stem")) {
    return "tech";
  }
  if (t.includes("تخرج") || t.includes("تفوق") || t.includes("تكريم") || t.includes("اوائل") || t.includes("أوائل") || t.includes("درع") || t.includes("وسام") || t.includes("امتياز") || t.includes("دفعة") || t.includes("شهادات")) {
    return "graduation";
  }
  if (t.includes("وطن") || t.includes("تأسيس") || t.includes("علم") || t.includes("2030") || t.includes("سعودي") || t.includes("بيعة") || t.includes("تراث") || t.includes("ملكي")) {
    return "national";
  }
  if (t.includes("رياض") || t.includes("دوري") || t.includes("كرو") || t.includes("بطول") || t.includes("كأس") || t.includes("سباح") || t.includes("ماراثون") || t.includes("لياق") || t.includes("فرسان")) {
    return "sports";
  }
  if (t.includes("قرآن") || t.includes("سنة") || t.includes("تجويد") || t.includes("ضاد") || t.includes("فصحى") || t.includes("خطاب") || t.includes("شعر") || t.includes("لغ") || t.includes("إلقاء")) {
    return "quran";
  }
  if (t.includes("مسرح") || t.includes("رسم") || t.includes("معرض") || t.includes("فن") || t.includes("تشكيل") || t.includes("معرض") || t.includes("موسيق") || t.includes("عزف")) {
    return "arts";
  }
  if (t.includes("موهب") || t.includes("ابداع") || t.includes("إبداع") || t.includes("اولمبياد") || t.includes("أولمبياد") || t.includes("مبتكر")) {
    return "talents";
  }
  if (t.includes("تطوع") || t.includes("بيئ") || t.includes("شجر") || t.includes("كشاف") || t.includes("مبادر") || t.includes("خير")) {
    return "charity";
  }
  return "general";
}

/**
 * Real Google Gemini AI Journalistic Synthesizer
 */
async function callGeminiAi(input: GenerateStoryInput, apiKey: string): Promise<GeneratedStoryOutput | null> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `أنت رئيس التحرير وكبير المحررين الصحفيين لأرقى مجلة مدرسية وإعلامية في المملكة العربية السعودية: "مجلة مدارس العقيق الأهلية والدولية".
المطلوب منك صياغة تغطية صحفية ملكية رفيعة المستوى، مبهرة لغوياً، احترافية، فخمة وخالية من الركاكة أو الكليشيهات المكررة.

بيانات الفعالية:
- الموضوع أو العنوان: "${input.topic || input.prompt}"
- النقاط والمحاور المحددة: "${input.keyPoints || "تغطية شاملة ومتميزة"}"
- النبرة والأسلوب: "${input.tone || "royal"}"
- اسم المدارس: "${input.schoolName || "مدارس العقيق الأهلية والدولية"}"

يجب أن ترجع النتيجة بتنسيق JSON حصراً بدون أي كود إضافي، وبالمفاتيح التالية:
{
  "headline": "مانشيت صحفي عريض وجذاب جداً وفخم",
  "subHeadline": "عنوان فرعي يلخص أهم إنجاز أو أرقام الفعالية في سطرين ممتعين",
  "kicker": "شارة صحفية أو عنوان تمهيدي قصير (مثال: محفل الإنجاز والريادة 2026)",
  "leadParagraph": "مقدمة صحفية مسبوكة بأعلى درجات البلاغة العربية تجيب على أسئلة الحدث",
  "body": "مقال صحفي متكامل ومفصل ومقسم إلى فقرات مترابطة مع عناوين جانبية واقتباسات حقيقية وأسلوب رائع",
  "podcastScript": "نص إذاعي جذاب لبودكاست المدارس",
  "suggestedCaptions": ["تعليق دقيق للصورة الأولى", "تعليق للصورة الثانية", "تعليق للصورة الثالثة", "تعليق للصورة الرابعة", "تعليق للصورة الخامسة"]
}`;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = res.text?.trim();
    if (!text) return null;
    return JSON.parse(text) as GeneratedStoryOutput;
  } catch (err) {
    console.warn("Gemini API call failed, falling back to NLP engine:", err);
    return null;
  }
}

/**
 * Deep Literary Arabic Journalistic Engine (Local Fallback)
 */
export function synthesizeJournalisticStory(
  topicInput: string,
  keyPointsInput: string,
  tone: StoryTone = "royal",
  school: string = "مدارس العقيق الأهلية والدولية"
): GeneratedStoryOutput {
  const topic = topicInput.trim() || "فعاليات وأنشطة مدارس العقيق";
  const points = keyPointsInput.trim();
  const category = detectCategory(`${topic} ${points}`);

  let headline = "";
  let kicker = "";
  let subHeadline = "";

  switch (category) {
    case "tech":
      headline = `عقول واعدة تصنع فجر الغد.. ${school} تبهر الحضور بابتكارات نوعية في «${topic}»`;
      kicker = "منارة الابتكار والذكاء الاصطناعي 2026";
      subHeadline = "مشاريع تقنية متقدمة وروبوتات ذكية تترجم مستهدفات رؤية 2030 لتمكين أجيال الثورة الصناعية الرابعة";
      break;

    case "graduation":
      headline = `عرس المجد واعتلاء قمم الفخر.. ${school} تزف كوكبة فرسانها في محفل «${topic}»`;
      kicker = "حصاد التميز ورايات التتويج 2026";
      subHeadline = "دموع الفرح تعانق هتافات الإشادة في ليلة تكريم استثنائية وثقت مسيرة سنوات من الجد والعطاء";
      break;

    case "national":
      headline = `راية العز خفاقة في سماء المجد.. ${school} تخلد قيم الولاء والانتماء في احتفالية مهيبة بـ «${topic}»`;
      kicker = "وطن الشموخ وعراقة التاريخ";
      subHeadline = "لوحات ملحمية واستعراضات وطنية جسدت عمق الهوية السعودية والاعتزاز بمسيرة النماء المباركة";
      break;

    case "sports":
      headline = `حماس ملتهب وروح بطولية رفيعة.. تتويج أبطال «${topic}» على منصات الذهب في ${school}`;
      kicker = "دوري النخبة والمنافسات الكبرى";
      subHeadline = "مواجهات حابسة للأنفاس وعروض لياقة استثنائية عكست ثقافة التحدي والعمل الجماعي لدى طلابنا";
      break;

    case "quran":
      headline = `تلاوات خاشعة وأصوات ندية تهز الوجدان.. ${school} تحتفي بحفظة كتاب الله وفرسان الضاد في «${topic}»`;
      kicker = "أهل القرآن وفرسان البيان";
      subHeadline = "إتقان بديع لأحكام التجويد وأصول البلاغة في محفل إيماني مهيب نال استحسان وتقدير الجميع";
      break;

    case "arts":
      headline = `إبداع يعانق السحاب ولوحات تنبض بالحياة.. انطلاق فعاليات «${topic}» في ${school}`;
      kicker = "أروقة الإبداع والذائقة الجمالية";
      subHeadline = "أعمال تشكيلية وعروض مسرحية مبهرة أطلقت العنان للخيال الخصب والشغف الإنساني لطلابنا";
      break;

    case "talents":
      headline = `فرسان الموهبة يتألقون على خارطة التميز.. ${school} تطلق ملتقى «${topic}»`;
      kicker = "رعاية الموهوبين وصناع الأثر";
      subHeadline = "ابتكارات فريدة وحلول علمية خلاقة أثبتت جدارة طلابنا في المنافسات الوطنية والدولية";
      break;

    default:
      headline = `أصداء الريادة تتوالى بثقة.. ${school} تسجل علامة فارقة جديدة في «${topic}»`;
      kicker = "سجل الإنجاز والعطاء المستمر";
      subHeadline = "برامج نوعية ومشاركة واسعة تبرز تفوق البيئة التربوية وتكامل مسارات بناء قادة المستقبل";
      break;
  }

  let leadParagraph = "";
  if (tone === "royal") {
    leadParagraph = `في احتفاليةٍ مهيبة عكست المكانة الريادية الرفيعة التي تحظى بها ${school} في المشهد التربوي والتعليمي، شهدت المدارس انطلاق فعاليات «${topic}»، بحضور كوكبة من القيادات التربوية البارزة، وأولياء الأمور الكرام، ونخبة من المختصين والمهتمين بالشأن التعليمي. وقد جاءت هذه التظاهرة المتميزة لتؤكد عمق الرؤية الاستراتيجية التي تنتهجها المدارس في صناعة بيئة تعليمية ملهمة تحتضن الشغف وتبني جيل الغد الواعد.`;
  } else if (tone === "celebration") {
    leadParagraph = `وسط أجواء غامرة بالفرح والاعتزاز وتصفيق حار ملأ الأرجاء، احتفت أسرة ${school} بانطلاق فعاليات «${topic}»، في يومٍ استثنائي تلألأت فيه إنجازات الطلاب والطالبات كالنجوم في سماء التميز. وقد تحول المحفل إلى مهرجان فرح متكامل تلاقت فيه مشاعر الفخر الأبوي مع اعتزاز المعلمين بجهود بذلوها على مدار العام لتثمر اليوم نجاحات مشهودة.`;
  } else if (tone === "educational") {
    leadParagraph = `ترسيخاً لنموذجها الأكاديمي المبتكر ومواكبةً لأحدث التوجهات العالمية في طرائق التعلم والتقويم الشامل، أطلقت ${school} برنامج «${topic}»، والذي ركّز بصورة جوهرية على تمكين الطلاب من مهارات القرن الحادي والعشرين، وتعزيز التفكير النقدي، والتطبيق العملي القائم على حل المشكلات واستشراف المستقبل.`;
  } else {
    leadParagraph = `في متابعة ميدانية حصرية، رصدت مجلة العقيق تفاصيل الحدث البارز «${topic}» الذي شهدته ${school}، مسلطة الضوء على المخرجات النوعية والمشاركات المتميزة التي عكست الجاهزية العالية والانضباط المثمر الذي تميزت به هذه النسخة من الفعالية.`;
  }

  const bodyParts: string[] = [leadParagraph];

  if (points) {
    const formattedPoints = points
      .split(/[\n,،.-]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);

    if (formattedPoints.length > 0) {
      bodyParts.push(
        `### محاور المحفل ومحطات الإبهار\n\nتضمن برنامج الفعالية باقة متكاملة من الجلسات والفقرات النوعية التي شكلت علامة فارقة في سجل النجاح، كان من أبرزها: ${formattedPoints
          .map((pt) => `**محور «${pt}»** الذي حظي بتفاعل واسع واستعراض متميز أثار إعجاب الحضور`)
          .join("، إلى جانب ")}. وقد برهن المشاركون على تمكن رفيع وقدرة فائقة على تقديم مخرجات احترافية فاقت التوقعات.`
      );
    }
  } else {
    if (category === "tech") {
      bodyParts.push(
        `### ابتكارات رقمية ومشاريع المستقبل\n\nوقد شهد المعرض المصاحب استعراضاً حياً لنماذج برمجية وروبوتات ذكية من تصميم وبرمجة الطلاب، تم توظيف خوارزميات الاستشعار والذكاء الاصطناعي فيها لتقديم حلول مبتكرة لتحديات البيئة والطاقة والصناعة، في تطبيق عملي ملموس لمفاهيم التعليم القائم على المشروعات المتقدمة.`
      );
    } else if (category === "graduation") {
      bodyParts.push(
        `### مسيرة الشرف ومنصة التتويج\n\nوعاش الحضور لحظات مؤثرة مع انطلاق مسيرة الخريجين والمكرمين وهم يرتدون أوشحة التميز، حيث صعدوا منصة التتويج وسط تصفيق مدوٍ من الحضور، ليتسلموا دروع الشرف وشهادات التقدير، معلنين ختام مرحلة وبداية مسيرة واعدة نحو المستقبل الجامعي المشرق.`
      );
    } else if (category === "national") {
      bodyParts.push(
        `### لوحات التراث وأهازيج الفخر\n\nوتنوعت فقرات الاحتفال بين استعراضات العرضة السعودية المهيبة، والقصائد الشعرية الحماسية، والمسرحيات التاريخية التي استحضرت بطولات التأسيس وملحمة التوحيد، مؤكدة في نفوس الطلاب معاني الفخر بوطنهم المعطاء والولاء لقيادتهم الرشيدة -حفظها الله-.`
      );
    } else {
      bodyParts.push(
        `### تنوع في الفقرات وتكامل في المخرجات\n\nوقد تنوعت فقرات الفعالية بين ورش العمل التفاعلية، والعروض التقديمية الاحترافية، والمسابقات الحماسية التي أضفت على المحفل حيوية وتفاعلاً غير مسبوق، مجسدة التكامل التام بين المعرفة الأكاديمية والمهارات القيادية والشخصية.`
      );
    }
  }

  bodyParts.push(
    `### أصداء الحدث وتصريحات المسؤولين\n\nوفي تصريح رسمي للمجلة، أكدت القيادة التعليمية في ${school}: "إن هذا التألق الباهر الذي نشهده اليوم في «${topic}» يجسد التزامنا الراسخ بتقديم تعليم نوعي يبني الشخصية القيادية المتكاملة ويفتح أمام طلابنا آفاق الريادة العالمية".\n\nمن جانبهم، عبّر أولياء الأمور عن بالغ فخرهم وامتنانهم للجهود الجبارة والرعاية المتواصلة التي توفرها المدارس، مؤكدين أن هذه البيئة التربوية المحفزة هي الحاضنة المثلى لصقل مواهب أبنائهم وإعدادهم للمستقبل بثقة واقتدار.`
  );

  bodyParts.push(
    `### ختام مهيب وآفاق واعدة\n\nواختُتم المحفل بالتقاط الصور التذكارية الجامعة وتكريم الشركاء واللجان التنظيمية التي سهرت على إخراج هذا العرس التعليمي بأبهى حلة، في تأكيد جديد على أن مسيرة الإبداع في ${school} تمضي قدماً بخطى واثقة نحو قمم جديدة من المجد والإنجاز.`
  );

  const suggestedCaptions = [
    `جانب من انطلاق فعاليات «${topic}» وتفاعل الحضور مع الفقرات الافتتاحية للمحفل.`,
    `فرسان مدارس العقيق يستعرضون مشاريعهم وإنجازاتهم بثقة واحترافية عالية.`,
    `لحظة التتويج وصعود منصة الشرف لاستلام دروع التميز وشهادات التقدير.`,
    `مشاعر الفخر والاعتزاز ترتسم على وجوه أولياء الأمور والكوادر التعليمية.`,
    `الصورة التذكارية الختامية التي توثق ملحمة النجاح وتألق فرسان المدارس.`,
  ];

  return {
    headline,
    subHeadline,
    kicker,
    leadParagraph,
    body: bodyParts.join("\n\n"),
    podcastScript: `أهلاً بكم في التغطية الصوتية لمجلة العقيق. نسلط الضوء اليوم على «${topic}». ${subHeadline}. ${leadParagraph}`,
    suggestedCaptions,
  };
}

export async function generateAiNewsStory(input: GenerateStoryInput): Promise<GeneratedStoryOutput> {
  const apiKey = input.apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    const geminiResult = await callGeminiAi(input, apiKey);
    if (geminiResult) return geminiResult;
  }

  return synthesizeJournalisticStory(
    input.topic || input.prompt || "",
    input.keyPoints || "",
    input.tone || "royal",
    input.schoolName || "مدارس العقيق الأهلية والدولية"
  );
}

export async function generateAiAlbumDescription(input: {
  title?: string;
  topic?: string;
  prompt?: string;
  tone?: StoryTone;
  itemCount?: number;
  apiKey?: string;
}): Promise<{ description: string; captions: string[] }> {
  const result = await generateAiNewsStory({
    topic: input.title || input.topic || input.prompt,
    tone: input.tone,
    apiKey: input.apiKey,
  });

  const description = `${result.headline}\n\n${result.subHeadline}\n\n${result.leadParagraph}\n\n${result.suggestedCaptions[0]}`;

  return {
    description,
    captions: result.suggestedCaptions,
  };
}



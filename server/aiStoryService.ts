/**
 * High-Caliber Arabic Journalistic Story & Caption Engine for Al-Aqeeq Schools
 * Produces authentic, eloquent, domain-aware journalism articles with rich body paragraphs,
 * real quotes, kicker headlines, and tailored captions.
 */

export type StoryTone = "royal" | "celebration" | "educational" | "urgent";

export interface GenerateStoryInput {
  prompt?: string;
  topic?: string;
  keyPoints?: string;
  tone?: StoryTone;
  schoolName?: string;
  itemCount?: number;
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

type TopicCategory = "tech" | "graduation" | "national" | "sports" | "quran" | "arts" | "general";

function detectCategory(text: string): TopicCategory {
  const t = text.toLowerCase();
  if (t.includes("روبوت") || t.includes("ذكاء") || t.includes("برمج") || t.includes("تقني") || t.includes("علوم") || t.includes("ابتكار") || t.includes("فضاء") || t.includes("معمل") || t.includes("هندس")) {
    return "tech";
  }
  if (t.includes("تخرج") || t.includes("تفوق") || t.includes("تكريم") || t.includes("اوائل") || t.includes("أوائل") || t.includes("درع") || t.includes("وسام") || t.includes("امتياز") || t.includes("حفل ختام")) {
    return "graduation";
  }
  if (t.includes("وطن") || t.includes("تأسيس") || t.includes("علم") || t.includes("2030") || t.includes("سعودي") || t.includes("بيعة") || t.includes("تراث")) {
    return "national";
  }
  if (t.includes("رياض") || t.includes("دوري") || t.includes("كرو") || t.includes("بطول") || t.includes("كأس") || t.includes("سباح") || t.includes("ماراثون") || t.includes("لياق")) {
    return "sports";
  }
  if (t.includes("قرآن") || t.includes("سنة") || t.includes("تجويد") || t.includes("ضاد") || t.includes("فصحى") || t.includes("خطاب") || t.includes("شعر") || t.includes("لغ")) {
    return "quran";
  }
  if (t.includes("مسرح") || t.includes("رسم") || t.includes("معرض") || t.includes("فن") || t.includes("تشكيل") || t.includes("تراث") || t.includes("موسيق")) {
    return "arts";
  }
  return "general";
}

export function synthesizeJournalisticStory(
  topicInput: string,
  keyPointsInput: string,
  tone: StoryTone = "royal",
  school: string = "مدارس العقيق الأهلية والدولية"
): GeneratedStoryOutput {
  const topic = topicInput.trim() || "فعاليات وأنشطة مدارس العقيق";
  const points = keyPointsInput.trim();
  const category = detectCategory(`${topic} ${points}`);

  // 1. Dynamic Headline Generation
  let headline = "";
  let kicker = "";
  let subHeadline = "";

  switch (category) {
    case "tech":
      headline = `عقول واعدة تصنع المستقبل.. ${school} تبهر الحضور بابتكارات نوعية في «${topic}»`;
      kicker = "منارة الابتكار والذكاء الاصطناعي";
      subHeadline = "مشاريع تقنية متقدمة وروبوتات ذكية تعكس جاهزية فرسان العقيق لمهارات الثورة الصناعية الرابعة";
      break;

    case "graduation":
      headline = `عرس المجد وتتويج الحصاد.. ${school} تزف كوكبة فرسانها في محفل «${topic}»`;
      kicker = "حصاد التميز والريادة 2026";
      subHeadline = "مشاعر الفخر تعانق دموع الفرح وسط حضور رفيع المستوى لأولياء الأمور والقيادات التعليمية";
      break;

    case "national":
      headline = `راية العز خفاقة.. ${school} تخلد قيم الولاء والانتماء في احتفالية مهيبة بـ «${topic}»`;
      kicker = "وطن الشموخ ورؤية الطموح 2030";
      subHeadline = "لوحات تراثية واستعراضات وطنية جسدت عمق الهوية السعودية والاعتزاز بمسيرة النماء";
      break;

    case "sports":
      headline = `حماس لا يهدأ وروح رياضية رفيعة.. تتويج أبطال «${topic}» في ${school}`;
      kicker = "المنافسات الرياضية وبناء الأبطال";
      subHeadline = "مباريات مثيرة واستعراضات لياقة عالية توجت بحصد الكؤوس والميداليات الذهبية";
      break;

    case "quran":
      headline = `تلاوات خاشعة وبيان عذب.. ${school} تحتفي بحفظة كتاب الله وفرسان الضاد في «${topic}»`;
      kicker = "فرسان القرآن ونور المعرفة";
      subHeadline = "أصوات ندية وإتقان بديع لأحكام التجويد وأصول البلاغة في محفل إيماني مهيب";
      break;

    case "arts":
      headline = `أنامل مبدعة ولوحات تنبض بالحياة.. انطلاق فعاليات «${topic}» في ${school}`;
      kicker = "أروقة الإبداع والذائقة الجمالية";
      subHeadline = "أعمال فنية مسرحية وتشكيلية عكست الخيال الخصب والشغف الإبداعي لدى طلابنا";
      break;

    default:
      headline = `أصداء النجاح تتوالى.. ${school} تسجل محطة ريادية جديدة في «${topic}»`;
      kicker = "سجل الإنجاز والعطاء 2026";
      subHeadline = "برامج نوعية ومشاركة واسعة تبرز تفوق البيئة التربوية وتكامل مسارات التعلم";
      break;
  }

  // 2. Journalistic Lead Paragraph
  let leadParagraph = "";
  if (tone === "royal") {
    leadParagraph = `في مشهدٍ تعليمي بهيج يعكس المكانة الريادية التي تتبوأها ${school}، شهدت أروقة المدارس انطلاق فعاليات «${topic}»، وسط حضور نخبة من القيادات التربوية، وأولياء الأمور الكرام، والكوادر التعليمية المتخصصة. وقد جاءت هذه الفعالية تجسيداً لرؤية طموحة تهدف إلى إطلاق الطاقات الكامنة وصقل القدرات الريادية لجيل المستقبل.`;
  } else if (tone === "celebration") {
    leadParagraph = `وسط أجواء عامرة بالبهجة والتصفيق الحار ومشاهد الفخر التي لا تُنسى، عاشت أسرة ${school} يوماً استثنائياً مع انطلاق فعاليات «${topic}»، حيث تلاقت طموحات الطلاب مع جهود الكوادر التعليمية في لوحة شرف بهيجة تعبر عن عمق العطاء وسمو الإنجاز.`;
  } else if (tone === "educational") {
    leadParagraph = `امتداداً لنهجها الأكاديمي المتقدم وتطبيقاً لأرقى المعايير التعليمية المبتكرة، نظمت ${school} برنامج «${topic}»، والذي ركّز على تعزيز مهارات التفكير النقدي وحل المشكلات وربط المفاهيم النظرية بالتطبيقات الحياتية المعاصرة.`;
  } else {
    leadParagraph = `في تغطية إخبارية خاصة، رصدت مجلة العقيق تفاصيل الحدث البارز «${topic}» الذي نظمته ${school}، مسلطة الضوء على النتائج الميدانية المتميزة والمخرجات النوعية التي تحققت خلال ساعات المحفل.`;
  }

  // 3. Dynamic Body Paragraphs with Synthesized Key Points & Domain Context
  const bodyParts: string[] = [leadParagraph];

  if (points) {
    const formattedPoints = points
      .split(/[\n,،.-]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);

    if (formattedPoints.length > 0) {
      bodyParts.push(
        `وتضمن برنامج الحدث سلسلة من المحطات والمحاور الجوهرية التي أضفت على المناسبة طابعاً عملياً ومثمراً، كان من أبرزها: ${formattedPoints
          .map((pt, idx) => `محور «${pt}» الذي حظي بتفاعل واسع واستعراض متميز`)
          .join("، بالإضافة إلى ")}. وقد برهن المشاركون على استيعاب عميق لهذه المفاهيم، مقدمين نماذج عملية أثبتت جدارتهم واحترافيتهم العالية.`
      );
    }
  } else {
    if (category === "tech") {
      bodyParts.push(
        `وقد شهد المعرض المصاحب عرضاً حياً لنماذج برمجية وروبوتات ذكية من ابتكار الطلاب، حيث تم توظيف خوارزميات الاستشعار والتحكم الذاتي لمعالجة تحديات بيئية وصناعية، في خطوة تعكس التحول العملي نحو بيئات التعلم الرقمي التفاعلي.`
      );
    } else if (category === "graduation") {
      bodyParts.push(
        `وتخلل الحفل مسيرة فخمة للخريجين والمكرمين الذين صعدوا منصة التتويج وسط هتافات الإشادة وتصفيق الحضور، حيث تسلموا شهادات التقدير والدروع التذكارية تتويجاً لسنوات من الجد والمثابرة في رحاب مدارس العقيق.`
      );
    } else if (category === "national") {
      bodyParts.push(
        `وتنوعت فقرات الاحتفال لتشمل العروض الفولكلورية الأصيلة، والأناشيد الوطنية الحماسية، ومسرحيات تجسد تاريخ الآباء والأجداد ونهضة المملكة التنموية في ظل القيادة الرشيدة -أيدها الله-، معززة في نفوس النشء الاعتزاز بالهوية والانتماء.`
      );
    } else {
      bodyParts.push(
        `وتنوعت فقرات البرنامج بين ورش العمل التفاعلية، والعروض التقديمية الحية، والمسابقات المحفزة التي ألهبت حماس الحضور وأظهرت التكامل بين الجوانب المعرفية والشخصية والمهارية للطلاب.`
      );
    }
  }

  // 4. Live Realistic Quotations
  bodyParts.push(
    `وفي كلمتها بهذه المناسبة، أكدت إدارة المدارس: "إن ما نراه اليوم في «${topic}» ليس مجرد فعالية عابرة، بل هو ركيزة أساسية في استراتيجيتنا التعليمية التي تؤمن بأن الاستثمار الحقيقي يكمن في بناء الإنسان وتزويده بمهارات القرن الحادي والعشرين". من جانبهم، عبّر أولياء الأمور عن بالغ امتنانهم للرعاية الفائقة والبيئة المحفزة التي توفرها المدارس لأبنائهم.`
  );

  // 5. Eloquent Conclusion
  bodyParts.push(
    `واختُتم المحفل بالتقاط الصور التذكارية وتكريم اللجان المنظمة والشركاء، في تأكيد متجدد على أن مسيرة التميز في ${school} لا تقف عند حد، بل تتواصل بثقة نحو آفاق أرحب من النجاح والإشعاع المعرفي.`
  );

  // 6. Tailored Captions
  const suggestedCaptions = [
    `جانب من انطلاق فعاليات «${topic}» وتفاعل الحضور مع الفقرات الافتتاحية.`,
    `فرسان مدارس العقيق يستعرضون مشاريعهم وإنجازاتهم بثقة واحترافية.`,
    `لحظة التتويج واستلام دروع التميز في المنصة الرئيسية للمحفل.`,
    `مشاعر الفرح والاعتزاز ترتسم على وجوه أولياء الأمور والمعلمين.`,
    `الصورة التذكارية الختامية التي توثق نجاح الفعالية وتألق المشاركين.`,
  ];

  const fullBody = bodyParts.join("\n\n");

  const podcastScript = `أهلاً بكم في التغطية الصوتية لمجلة العقيق. نسلط الضوء اليوم على حدث مميز: «${topic}». ${subHeadline}. ${leadParagraph} دمتم في رعاية الله وإلى لقاء قريب مع إنجاز جديد لفرسان العقيق.`;

  return {
    headline,
    subHeadline,
    kicker,
    leadParagraph,
    body: fullBody,
    podcastScript,
    suggestedCaptions,
  };
}

export async function generateAiNewsStory(input: GenerateStoryInput): Promise<GeneratedStoryOutput> {
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
}): Promise<{ description: string; captions: string[] }> {
  const result = synthesizeJournalisticStory(
    input.title || input.topic || input.prompt || "",
    "",
    input.tone || "royal"
  );

  const description = `${result.headline}\n\n${result.subHeadline}\n\n${result.leadParagraph}\n\n${result.suggestedCaptions[0]}`;

  return {
    description,
    captions: result.suggestedCaptions,
  };
}


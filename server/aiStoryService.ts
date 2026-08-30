/**
 * AI Story & Caption Generator Service for Al-Aqeeq Schools
 * Generates royal-standard Arabic journalistic articles, headlines, captions, and podcast scripts.
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

const TONE_STYLES: Record<StoryTone, { prefix: string; adjectives: string[]; closing: string }> = {
  royal: {
    prefix: "في محفلٍ بهيج يعكس مسيرة التميز والريادة",
    adjectives: ["الملهمة", "الاستثنائية", "المباركة", "الرائدة", "السامية"],
    closing: "وتستمر مدارس العقيق الأهلية والدولية في تسطير صفحات المجد وصناعة جيل الغد الواعد.",
  },
  celebration: {
    prefix: "وسط أجواء غامرة بالفرح والاعتزاز والفخر",
    adjectives: ["المتألقة", "المبهجة", "المتميزة", "الرائعة", "المبهرة"],
    closing: "مهنئين فرساننا وذويهم على هذا الإنجاز المستحق، وإلى مزيد من التألق والنجاحات.",
  },
  educational: {
    prefix: "تجسيداً لقيم التميز الأكاديمي وبناء القدرات الوطنية",
    adjectives: ["الإبداعية", "المعرفية", "المثمرة", "المنهجية", "الشاملة"],
    closing: "مؤكدين التزامنا بتقديم تجربة تعليمية رائدة تلهم شغف التعلم والابتكار.",
  },
  urgent: {
    prefix: "في تغطية حصرية ومباشرة لأبرز محطات الإنجاز",
    adjectives: ["المتسارعة", "البارزة", "النوعية", "المكثفة", "الفورية"],
    closing: "كونوا بالقرب لمتابعة المزيد من المستجدات والتغطيات الحصرية لفعاليات مدارس العقيق.",
  },
};

export async function generateAiNewsStory(input: GenerateStoryInput): Promise<GeneratedStoryOutput> {
  const tone = input.tone || "royal";
  const style = TONE_STYLES[tone];
  const topic = input.topic?.trim() || input.prompt?.trim() || "فعاليات وأنشطة مدارس العقيق";
  const keyPoints = input.keyPoints?.trim() || "";
  const school = input.schoolName || "مدارس العقيق الأهلية والدولية";

  // Synthesize rich Arabic journalistic story
  const headline = topic.includes("تكريم") || topic.includes("تخرج")
    ? `في عرسٍ بهيج وتتويجٍ للإبداع.. ${school} تحتفي بفرسان التميز والريادة`
    : topic.includes("معرض") || topic.includes("علوم") || topic.includes("ابتكار")
    ? `منارة الابتكار ومحفل الإبداع.. انطلاق فعاليات ${topic} في ${school}`
    : topic.includes("وطني") || topic.includes("يوم")
    ? `فخرٌ واعتزاز بالوطن الغالي.. ${school} تحتفل بـ ${topic} في مشهد يعزز الانتماء`
    : `أصداء الإنجاز تتوالى.. ${school} تطلق فعاليات «${topic}»`;

  const subHeadline = `شهد المحفل حضوراً متميزاً وسط تفاعل واسع من الطلاب والكوادر التعليمية وأولياء الأمور الكرام`;

  const leadParagraph = `${style.prefix}، نظمت ${school} فعاليات «${topic}»، والتي تضمنت باقة من البرامج والأنشطة النوعية الهادفة إلى إبراز مواهب الطلاب وصقل قدراتهم المعرفية والشخصية في بيئة تربوية محفزة.`;

  const bodyParagraphs = [
    leadParagraph,
    keyPoints
      ? `وقد تمحورت الفعالية حول عدة ركائز أساسية شملت: ${keyPoints}، حيث عكست هذه المحطات عمق الرؤية التعليمية والتكامل بين المنهاج النظري والتطبيق العملي الخلاق.`
      : `وقد شهدت الفعالية إقبالاً كبيراً ومشاركة فاعلة من مختلف المراحل الدراسية، حيث تنوعت العروض والمشاركات بين الابتكارات العلمية، والمبادرات المجتمعية، والفقرات الثقافية التي لاقت إشادة واستحساناً واسعاً.`,
    `من جهتهم، عبّر الحضور وأولياء الأمور عن بالغ فخرهم واعتزازهم بالمستوى المتقدم الذي أظهره الطلاب والطالبات، مؤكدين أن هذه البرامج تسهم بصورة جوهرية في تعزيز الثقة بالنفس واكتساب مهارات المستقبل.`,
    style.closing,
  ];

  const podcastScript = `أهلاً بكم في بودكاست مجلة العقيق. ${style.prefix}، نسلط الضوء اليوم على «${topic}». ${subHeadline}. ${keyPoints ? `ومن أبرز محطات هذه الفعالية: ${keyPoints}.` : ""} ${style.closing} دمتم في رعاية الله وإلى لقاء قريب.`;

  const suggestedCaptions = [
    `جانب من الحضور والتفاعل المميز خلال انطلاق فعاليات ${topic}.`,
    `فرسان مدارس العقيق يسطرون الإنجاز بثقة وتألق.`,
    `لقطة تذكارية توثق فرحة الإنجاز والتتويج المستحق.`,
    `إشادة واسعة بالجهود المبذولة وتكامل بيئة التعلم.`,
    `صورة ختامية تجمع المشاركين في لوحة فخر واعتزاز.`,
  ];

  return {
    headline,
    subHeadline,
    kicker: "موسم العقيق 2026",
    leadParagraph,
    body: bodyParagraphs.join("\n\n"),
    podcastScript,
    suggestedCaptions,
  };
}

export async function generateAiAlbumDescription(input: {
  title?: string;
  topic?: string;
  prompt?: string;
  tone?: StoryTone;
  itemCount?: number;
}): Promise<{ description: string; captions: string[] }> {
  const tone = input.tone || "royal";
  const style = TONE_STYLES[tone];
  const title = input.title?.trim() || input.topic?.trim() || input.prompt?.trim() || "ألبوم فعاليات العقيق";

  const description = `${style.prefix}، يوثق هذا الألبوم المصور أروع اللحظات والذكريات الخالدة في «${title}». جولة بصرية ممتعة تنقلكم إلى قلب الحدث لتعيشوا تفاصيل الإنجاز وفرحة المشاركين في مدارس العقيق الأهلية والدولية.`;

  const captions = [
    `لحظات الانطلاق والافتتاح الرسمي للحدث.`,
    `تألق فرسان المدارس وسط تفاعل بهيج.`,
    `تكريم وتقدير للمتميزين في المنصة الرئيسية.`,
    `فرحة أولياء الأمور بمشاركات أبنائهم وبناتهم.`,
    `لقطات عفوية تعكس روح الفريق والشغف.`,
    `ختام الحدث بصورة تذكارية خالدة في الذاكرة.`,
  ];

  return { description, captions };
}

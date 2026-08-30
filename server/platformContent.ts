export type ContentField = {
  key: string;
  section: string;
  label: string;
  value: string;
  type: "text" | "textarea";
  isPublic: boolean;
};

export const PLATFORM_CONTENT_DEFAULTS: ContentField[] = [
  { key: "home_badge", section: "الصفحة الرئيسية", label: "الشعار القصير أعلى العنوان", value: "منصة واحدة لكل مناسباتك", type: "text", isPublic: true },
  { key: "home_primary_cta", section: "الصفحة الرئيسية", label: "زر البدء الرئيسي", value: "ابدأ إدارة فعاليتك", type: "text", isPublic: true },
  { key: "home_how_link", section: "التنقل العام", label: "رابط كيف تعمل المنصة", value: "كيف تعمل؟", type: "text", isPublic: true },
  { key: "home_features_link", section: "التنقل العام", label: "رابط مزايا المنصة", value: "المزايا", type: "text", isPublic: true },
  { key: "lobby_greeting", section: "بوابة المدير", label: "تحية بوابة فعالياتي", value: "صباح التنظيم الجميل", type: "text", isPublic: false },
  { key: "lobby_empty_title", section: "بوابة المدير", label: "عنوان حالة عدم وجود فعاليات", value: "ابدأ أول فعالية لك", type: "text", isPublic: false },
  { key: "guest_arrival_note", section: "رحلة الضيف", label: "تعليمات الوصول للضيف", value: "يرجى الحضور قبل الموعد بربع ساعة وإبراز رمز الدعوة عند البوابة.", type: "textarea", isPublic: true },
  { key: "ai_welcome", section: "مساعد المدير", label: "رسالة ترحيب مساعد المدير", value: "أنا مديرك الذكي. أخبرني بما تريد تعديله أو تنظيمه وسأجهز لك التغيير قبل تنفيذه.", type: "textarea", isPublic: false },
];

export const contentDefaultByKey = (key: string) => PLATFORM_CONTENT_DEFAULTS.find((item) => item.key === key);

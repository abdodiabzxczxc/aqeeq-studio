export type EditorPageGroup = "الموقع العام" | "إدارة المنصة" | "الفعاليات ومساحاتها" | "صفحات مخصصة";
export type EditorPageKind = "home" | "lobby" | "dashboard" | "control" | "scan" | "event" | "workspace" | "guests" | "invitation" | "operations" | "reports" | "settings" | "activity" | "users" | "platform" | "identity" | "team" | "journal" | "news" | "live" | "stage" | "memory" | "maison" | "custom";

export type EditorPageEntry = {
  id: string;
  title: string;
  path: string;
  group: EditorPageGroup;
  hint: string;
  kind: EditorPageKind;
  level?: 0 | 1 | 2;
  status?: "منشورة" | "مسودة";
};

export type EditorMapEvent = { id: number; title: string; isActive: boolean };
export type EditorMapCustomPage = { id: number; title: string; slug: string; status: "draft" | "published"; isVisible: boolean };
export type EditorMapNewsIssue = { id: number; title: string; slug: string; issueDate: string; status: "draft" | "published" };

export const editorPageGroups: EditorPageGroup[] = ["الموقع العام", "إدارة المنصة", "الفعاليات ومساحاتها", "صفحات مخصصة"];

const dashboardChildren: Array<{ id: string; title: string; hint: string; kind: EditorPageKind }> = [
  { id: "events", title: "إدارة الفعاليات", hint: "إنشاء الفعاليات وهويتها", kind: "workspace" },
  { id: "activity", title: "سجل النشاط", hint: "تاريخ تغييرات المنصة", kind: "activity" },
  { id: "users", title: "الفريق والصلاحيات", hint: "المستخدمون والأدوار", kind: "users" },
  { id: "operations", title: "الإشعارات والنسخ", hint: "التشغيل والنسخ الاحتياطي", kind: "operations" },
  { id: "platform", title: "إعدادات المنصة", hint: "شعارات وإعدادات عامة", kind: "platform" },
];

const controlChildren: Array<{ id: string; title: string; hint: string; kind: EditorPageKind }> = [
  { id: "command", title: "مركز القيادة", hint: "ملخص الإدارة الموحد", kind: "control" },
  { id: "events", title: "فعاليات مركز الإدارة", hint: "إعداد الفعاليات", kind: "workspace" },
  { id: "guests", title: "الضيوف والدعوات", hint: "إدارة الحضور والدعوات", kind: "guests" },
  { id: "operations", title: "التشغيل والإشعارات", hint: "البوابات والتشغيل الحي", kind: "operations" },
  { id: "reports", title: "التقارير", hint: "تقارير الفعاليات", kind: "reports" },
  { id: "identity", title: "الموقع والهوية", hint: "الشعارات ومحتوى الموقع", kind: "identity" },
  { id: "team", title: "الفريق والسجل", hint: "الأدوار وسجل العمليات", kind: "team" },
];

const workspaceChildren: Array<{ id: string; title: string; hint: string; kind: EditorPageKind }> = [
  { id: "overview", title: "نظرة عامة", hint: "ملخص واستعداد الفعالية", kind: "workspace" },
  { id: "guests", title: "الضيوف والدعوات", hint: "قائمة الضيوف والدعوات", kind: "guests" },
  { id: "operations", title: "التشغيل والحضور", hint: "البوابات وسجل المسح", kind: "operations" },
  { id: "reports", title: "التقارير", hint: "التقرير التنفيذي للفعالية", kind: "reports" },
  { id: "invitation", title: "مصمم الدعوة الرقمية", hint: "قوالب وتحرير التصميم الذي يُنزّل للضيوف", kind: "invitation" },
  { id: "maison", title: "دار العقيق", hint: "إطلاق الفعالية والبطاقة السوداء والمسرح والأرشيف", kind: "maison" },
  { id: "settings", title: "إعدادات الفعالية", hint: "هوية وتفاصيل الفعالية", kind: "settings" },
];

export function buildEditorPageEntries(events: EditorMapEvent[], customPages: EditorMapCustomPage[], issues: EditorMapNewsIssue[] = []): EditorPageEntry[] {
  const entries: EditorPageEntry[] = [
    { id: "home-public", title: "الصفحة الرئيسية العامة", path: "/?visual=1", group: "الموقع العام", hint: "الواجهة التي يراها الزوار قبل الدخول", kind: "home", level: 0 },
    { id: "school-about", title: "عن مدارس العقيق", path: "/about?visual=1", group: "الموقع العام", hint: "الفصل التحريري عن رسالة وهوية المدرسة", kind: "home", level: 0 },
    { id: "school-life", title: "الحياة المدرسية", path: "/life?visual=1", group: "الموقع العام", hint: "الفصل التحريري عن تجربة الطالب والأنشطة", kind: "home", level: 0 },
    { id: "lobby", title: "فعالياتي", path: "/?editor=1", group: "الموقع العام", hint: "ردهة الفعاليات بعد الدخول", kind: "lobby", level: 0 },
    { id: "dashboard", title: "لوحة التحكم", path: "/dashboard?editor=1", group: "إدارة المنصة", hint: "الملخص التشغيلي للمنصة", kind: "dashboard", level: 0 },
    ...dashboardChildren.map((page) => ({ id: `dashboard-${page.id}`, title: page.title, path: `/dashboard?tab=${page.id}&editor=1`, group: "إدارة المنصة" as const, hint: page.hint, kind: page.kind, level: 1 as const })),
    { id: "control", title: "مركز الإدارة", path: "/control?editor=1", group: "إدارة المنصة", hint: "المركز الموحد لإدارة المنصة", kind: "control", level: 0 },
    ...controlChildren.map((page) => ({ id: `control-${page.id}`, title: page.title, path: `/control?tab=${page.id}&editor=1`, group: "إدارة المنصة" as const, hint: page.hint, kind: page.kind, level: 1 as const })),
    { id: "scan", title: "بوابة المسح", path: "/scan?editor=1", group: "إدارة المنصة", hint: "التحقق من رموز QR وتسجيل الحضور", kind: "scan", level: 0 },
    { id: "live", title: "Alaqeeq Live", path: "/live?visual=1", group: "الموقع العام", hint: "استوديو موسم الفعاليات والأنشطة", kind: "live", level: 0 },
    { id: "live-ideas", title: "خزانة التجارب", path: "/live/ideas?visual=1", group: "الموقع العام", hint: "قوالب العوالم والتجارب للأنشطة", kind: "live", level: 1 },
    { id: "news-manager", title: "استوديو نشرة العقيق", path: "/news?visual=1", group: "إدارة المنصة", hint: "رفع الأعداد وإدارة غلاف المجلة", kind: "news", level: 0 },
    { id: "journal-archive", title: "مكتبة مجلة العقيق", path: "/journal?visual=1", group: "الموقع العام", hint: "واجهة المجلة العامة والأرشيف المستقل", kind: "journal", level: 0 },
    { id: "maison-vault", title: "خزنة مواسم العقيق", path: "/maison?visual=1", group: "الموقع العام", hint: "أرشيف الإصدارات والفعاليات الفاخرة", kind: "maison", level: 0 },
  ];
  for (const event of events) {
    entries.push({ id: `event-${event.id}`, title: event.title, path: `/workspace/${event.id}?tab=overview&editor=1`, group: "الفعاليات ومساحاتها", hint: "مساحة تشغيل الفعالية", kind: "workspace", level: 0, status: event.isActive ? "منشورة" : "مسودة" });
    entries.push({ id: `event-public-${event.id}`, title: "الصفحة العامة للفعالية", path: `/event/${event.id}?visual=1`, group: "الفعاليات ومساحاتها", hint: "صفحة الضيوف والدعوة الرقمية", kind: "event", level: 1, status: event.isActive ? "منشورة" : "مسودة" });
    entries.push({ id: `event-stage-${event.id}`, title: "شاشة المسرح", path: `/event/${event.id}/stage?visual=1`, group: "الفعاليات ومساحاتها", hint: "عرض القاعة والمشاهد الحية", kind: "stage", level: 1, status: event.isActive ? "منشورة" : "مسودة" });
    entries.push({ id: `event-memory-${event.id}`, title: "بوابة ذكريات الفعالية", path: `/event/${event.id}/memories?visual=1`, group: "الفعاليات ومساحاتها", hint: "صفحة الذكريات العامة بعد النشاط", kind: "memory", level: 1, status: event.isActive ? "منشورة" : "مسودة" });
    entries.push({ id: `event-premiere-${event.id}`, title: "بوابة العرض الأول", path: `/event/${event.id}/premiere?visual=1`, group: "الفعاليات ومساحاتها", hint: "البطاقة السوداء وإطلاق إصدار الفعالية", kind: "maison", level: 1, status: event.isActive ? "منشورة" : "مسودة" });
    entries.push({ id: `event-honor-${event.id}`, title: "صالة الشرف", path: `/event/${event.id}/honor?visual=1`, group: "الفعاليات ومساحاتها", hint: "برنامج الضيوف وتجربة الاستقبال الفاخرة", kind: "maison", level: 1, status: event.isActive ? "منشورة" : "مسودة" });
    entries.push({ id: `event-portrait-${event.id}`, title: "بورتريه المناسبة", path: `/event/${event.id}/portrait?visual=1`, group: "الفعاليات ومساحاتها", hint: "قصة الختام واللحظات المختارة", kind: "maison", level: 1, status: event.isActive ? "منشورة" : "مسودة" });
    entries.push(...workspaceChildren.map((page) => ({ id: `workspace-${event.id}-${page.id}`, title: page.title, path: `/workspace/${event.id}?tab=${page.id}&editor=1`, group: "الفعاليات ومساحاتها" as const, hint: page.hint, kind: page.kind, level: 1 as const, status: event.isActive ? "منشورة" as const : "مسودة" as const })));
    entries.push(
      { id: `workspace-${event.id}-invitation-preview`, title: "معاينة دعوة رقمية", path: `/workspace/${event.id}?tab=guests&tool=invitation&editor=1`, group: "الفعاليات ومساحاتها", hint: "اختر ضيفاً ثم عاين دعوته قبل تنزيلها", kind: "invitation", level: 2, status: event.isActive ? "منشورة" : "مسودة" },
      { id: `workspace-${event.id}-invitation-png`, title: "تنزيل دعوة PNG", path: `/workspace/${event.id}?tab=guests&tool=png&editor=1`, group: "الفعاليات ومساحاتها", hint: "تنزيل بطاقة الضيف بصيغة PNG", kind: "invitation", level: 2, status: event.isActive ? "منشورة" : "مسودة" },
      { id: `workspace-${event.id}-invitations-bulk`, title: "الدعوات الجماعية ZIP", path: `/workspace/${event.id}?tab=guests&tool=bulk&editor=1`, group: "الفعاليات ومساحاتها", hint: "تجهيز دعوات عدة ضيوف في ملف واحد", kind: "invitation", level: 2, status: event.isActive ? "منشورة" : "مسودة" },
      { id: `workspace-${event.id}-qr-cards`, title: "طباعة بطاقات QR", path: `/workspace/${event.id}?tab=guests&tool=qr&editor=1`, group: "الفعاليات ومساحاتها", hint: "فتح أدوات طباعة بطاقات الدخول", kind: "invitation", level: 2, status: event.isActive ? "منشورة" : "مسودة" },
    );
  }
  const months = Array.from(new Set(issues.map((issue) => issue.issueDate.slice(0, 7)))).sort((a, b) => b.localeCompare(a));
  entries.push(...issues.map((issue) => ({ id: `journal-issue-${issue.id}`, title: issue.title, path: `/journal/issue/${issue.slug}?visual=1`, group: "الموقع العام" as const, hint: `عدد المجلة بتاريخ ${issue.issueDate}`, kind: "journal" as const, level: 1 as const, status: issue.status === "published" ? "منشورة" as const : "مسودة" as const })));
  entries.push(...months.map((monthKey) => ({ id: `journal-month-${monthKey}`, title: `كتيب ${monthKey}`, path: `/journal/month/${monthKey}?visual=1`, group: "الموقع العام" as const, hint: "كتيب شهري يجمع الأعداد المنشورة", kind: "journal" as const, level: 1 as const })));
  entries.push(...customPages.map((page) => ({ id: `page-${page.id}`, title: page.title, path: `/page/${page.slug}?visual=1`, group: "صفحات مخصصة" as const, hint: page.isVisible ? "تظهر في تنقل الموقع" : "مخفية من تنقل الموقع", kind: "custom" as const, level: 0 as const, status: page.status === "published" ? "منشورة" as const : "مسودة" as const })));
  return entries;
}

export function filterEditorPageEntries<T extends EditorPageEntry>(entries: T[], query: string): T[] {
  const needle = query.trim().toLocaleLowerCase("ar");
  if (!needle) return entries;
  return entries.filter((page) => `${page.title} ${page.path} ${page.group} ${page.hint}`.toLocaleLowerCase("ar").includes(needle));
}

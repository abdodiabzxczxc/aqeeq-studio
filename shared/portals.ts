export type SystemPortalCategory = "parents_students" | "staff_admin" | "public";

export interface SystemPortalItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: SystemPortalCategory;
  iconName: string;
  badge?: string;
  visible: boolean;
  order: number;
  openInNewTab?: boolean;
}

export const PORTAL_CATEGORY_LABELS: Record<SystemPortalCategory, string> = {
  parents_students: "خدمات أولياء الأمور والطلاب",
  staff_admin: "الأنظمة الإدارية والموظفين",
  public: "خدمات ومنصات عامة",
};

export const AVAILABLE_PORTAL_ICONS = [
  { id: "file-text", label: "مستند / خطط", icon: "FileText" },
  { id: "smartphone", label: "هاتف / تطبيق", icon: "Smartphone" },
  { id: "briefcase", label: "حقيبة عمل / ERP", icon: "Briefcase" },
  { id: "mail", label: "بريد إلكتروني", icon: "Mail" },
  { id: "cloud", label: "سحابة رقمية", icon: "Cloud" },
  { id: "ticket", label: "تذاكر وصيانة", icon: "Ticket" },
  { id: "video", label: "اجتماعات مرئية", icon: "Video" },
  { id: "shield", label: "إدارة وأمان", icon: "Shield" },
  { id: "link", label: "رابط خارجي", icon: "ExternalLink" },
] as const;

export const DEFAULT_SYSTEM_PORTALS: SystemPortalItem[] = [
  {
    id: "portal-daily-plans",
    title: "الخطط الدراسية الأسبوعية",
    description: "متابعة الواجبات اليومية وجدول الحصص الأسبوعي للطلاب",
    url: "https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php",
    category: "parents_students",
    iconName: "file-text",
    badge: "أولياء الأمور",
    visible: true,
    order: 1,
    openInNewTab: true,
  },
  {
    id: "portal-parent-app",
    title: "تحميل تطبيق أولياء الأمور",
    description: "تطبيق العقيق الذكي لمتابعة الدرجات والغياب والتواصل المباشر",
    url: "https://qr-codes.io/LQMip0",
    category: "parents_students",
    iconName: "smartphone",
    badge: "iOS & Android",
    visible: true,
    order: 2,
    openInNewTab: true,
  },
  {
    id: "portal-odoo-erp",
    title: "نظام Odoo الإداري",
    description: "المنظومة الإدارية والمالية وشؤون الموظفين والعمليات المدرسية",
    url: "https://live.aqeeq.edu.sa",
    category: "staff_admin",
    iconName: "briefcase",
    badge: "ERP",
    visible: true,
    order: 3,
    openInNewTab: true,
  },
  {
    id: "portal-official-email",
    title: "البريد الإلكتروني الرسمي",
    description: "منصة المراسلات والبريد الرسمي لمنسوبي مدارس العقيق",
    url: "https://email.aqeeqholding.com",
    category: "staff_admin",
    iconName: "mail",
    badge: "Webmail",
    visible: true,
    order: 4,
    openInNewTab: true,
  },
  {
    id: "portal-cloud-storage",
    title: "سحابة العقيق الرقمية",
    description: "التخزين السحابي الآمن ومشاركة المجلدات والملفات التعليمية",
    url: "https://next.aqeeq.app",
    category: "staff_admin",
    iconName: "cloud",
    badge: "NextCloud",
    visible: true,
    order: 5,
    openInNewTab: true,
  },
  {
    id: "portal-tickets-maintenance",
    title: "بوابة التذاكر والصيانة",
    description: "الدعم التقني والفني وطلبات الصيانة والمتابعة الفورية",
    url: "https://portal.aqeeq.app",
    category: "staff_admin",
    iconName: "ticket",
    badge: "IT Support",
    visible: true,
    order: 6,
    openInNewTab: true,
  },
  {
    id: "portal-live-meetings",
    title: "اجتماعات العقيق المرئية",
    description: "قاعات البث المرئي المباشر واللقاءات التفاعلية عن بعد",
    url: "https://aqeeq.live",
    category: "staff_admin",
    iconName: "video",
    badge: "Live Meet",
    visible: true,
    order: 7,
    openInNewTab: true,
  },
  {
    id: "portal-admin-dashboard",
    title: "لوحة الإدارة والتحكم",
    description: "بوابة دخول المشرفين لإدارة محتوى منصة استوديو العقيق",
    url: "/login",
    category: "staff_admin",
    iconName: "shield",
    badge: "Admin",
    visible: true,
    order: 8,
    openInNewTab: false,
  },
];

export type TicketType = "student" | "guardian" | "guest" | "vip";
export type PaymentStatus = "paid" | "unpaid" | "exempt";
export type ScanResult = "success" | "duplicate" | "not_found" | "invalid";
export type UserRole = "admin" | "user" | "receptionist";

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  student: "تذكرة عادية",
  guardian: "مرافق",
  guest: "مدعو",
  vip: "VIP",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "مدفوع",
  unpaid: "غير مدفوع",
  exempt: "معفى",
};

export const SCAN_RESULT_LABELS: Record<ScanResult, string> = {
  success: "دخول ناجح",
  duplicate: "دخول مكرر",
  not_found: "غير موجود",
  invalid: "رمز غير صالح",
};

export const EVENT_TYPE_LABELS = {
  graduation: "حفل تخرج",
  wedding: "حفل زفاف",
  conference: "مؤتمر",
  exhibition: "معرض",
  honoring: "حفل تكريم",
  meeting: "اجتماع",
  workshop: "ورشة عمل",
  custom: "فعالية مخصصة",
} as const;

export type EventType = keyof typeof EVENT_TYPE_LABELS;

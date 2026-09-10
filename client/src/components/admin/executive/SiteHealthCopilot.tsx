import React, { useMemo } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Wand2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DiagnosticIssue {
  id: string;
  severity: "error" | "warning" | "info";
  title: string;
  description: string;
  autoFixLabel?: string;
  onAutoFix?: () => void;
}

interface SiteHealthCopilotProps {
  orchestration: any;
  onUpdateOrchestration: (updated: any) => Promise<void> | void;
  dark?: boolean;
}

export function SiteHealthCopilot({
  orchestration,
  onUpdateOrchestration,
  dark = true,
}: SiteHealthCopilotProps) {
  const issues = useMemo<DiagnosticIssue[]>(() => {
    const list: DiagnosticIssue[] = [];

    // 1. WhatsApp Number Check
    const rawWa = orchestration?.nav?.whatsapp || "";
    const cleanWa = rawWa.replace(/[^0-9]/g, "");
    if (!cleanWa) {
      list.push({
        id: "wa-missing",
        severity: "error",
        title: "رقم الواتساب الرسمي غير معين",
        description: "لا يوجد رقم واتساب مسجل في الترويسة للتواصل مع أولياء الأمور.",
      });
    } else if (!cleanWa.startsWith("966")) {
      list.push({
        id: "wa-prefix",
        severity: "warning",
        title: "رقم الواتساب ينقصه كود الدولة الدولي (966)",
        description: `الرقم الحالي (${rawWa}) قد لا يفتح المحادثة على أجهزة أولياء الأمور بشكل سليم بدون كود المملكة.`,
        autoFixLabel: "إضافة كود 966 تلقائياً ⚡",
        onAutoFix: async () => {
          let fixed = cleanWa;
          if (fixed.startsWith("05")) fixed = "966" + fixed.substring(1);
          else if (fixed.startsWith("5")) fixed = "966" + fixed;
          await onUpdateOrchestration({
            nav: { ...orchestration.nav, whatsapp: fixed },
          });
          toast.success("تم ضبط رقم الواتساب بالصيغة الدولية بنجاح");
        },
      });
    }

    // 2. Admissions vs Header CTA Consistency
    const isAdmissionsOpen = orchestration?.admissionsSettings?.isOpen !== false;
    const ctaText = orchestration?.nav?.ctaButtonText || "";
    if (!isAdmissionsOpen && (ctaText.includes("سجل") || ctaText.includes("القبول"))) {
      list.push({
        id: "admissions-cta-mismatch",
        severity: "warning",
        title: "تناقض بين حالة القبول وزر الهيدر",
        description: "استقبال طلبات التسجيل مغلق حالياً، بينما زر الهيدر ما زال يعرض (القبول والتسجيل).",
        autoFixLabel: "تغيير زر الهيدر لـ (قائمة الانتظار) ⚡",
        onAutoFix: async () => {
          await onUpdateOrchestration({
            nav: { ...orchestration.nav, ctaButtonText: "قائمة الانتظار 📋" },
          });
          toast.success("تم تحديث نص زر الهيدر ليطابق حالة التسجيل");
        },
      });
    }

    // 3. Emergency Banner Check
    if (orchestration?.emergencyBanner?.enabled && !orchestration?.emergencyBanner?.text?.trim()) {
      list.push({
        id: "emergency-empty",
        severity: "error",
        title: "شريط الطوارئ مفعل بدون نص",
        description: "الشريط العاجل مفعل في أعلى الموقع ولكنه لا يحتوي على أي نص تحذيري أو إعلان.",
      });
    }

    // 4. Social Links Check
    const social = orchestration?.social || {};
    if (social.xEnabled && social.xUrl && !social.xUrl.startsWith("http")) {
      list.push({
        id: "social-x-protocol",
        severity: "info",
        title: "رابط منصة إكس ينقصه بروتوكول https://",
        description: "الرابط قد يفشل في فتح المتصفح على بعض الأجهزة.",
      });
    }

    return list;
  }, [orchestration, onUpdateOrchestration]);

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const healthScore = Math.max(70, 100 - errorCount * 15 - warningCount * 5);

  return (
    <div
      className={`p-5 rounded-3xl border space-y-4 ${
        dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-current/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black">رادار سلامة الموقع وفاحص الجودة الاستباقي</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                درجة الصحة: {healthScore}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">
              فحص تلقائي مستمر لصحة الروابط، أرقام الواتساب، وتناسق رسائل الموقع
            </p>
          </div>
        </div>

        {issues.length === 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400">
            <CheckCircle2 size={13} />
            <span>كافة مفاصل الموقع سليمة 100%</span>
          </span>
        ) : (
          <span className="text-[11px] font-black text-amber-400">
            {issues.length} تنبيهات تحتاج انتباهك
          </span>
        )}
      </div>

      {issues.length === 0 ? (
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-300 font-bold leading-relaxed">
            رائع! لم يتم رصد أي روابط معطوبة، أرقام تواصل غير منسقة، أو تناقضات في رسائل الموقع. منظومة مدارس العقيق تعمل بأعلى كفاءة.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                issue.severity === "error"
                  ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
                  : issue.severity === "warning"
                  ? "border-amber-500/30 bg-amber-500/5 text-amber-300"
                  : "border-blue-500/30 bg-blue-500/5 text-blue-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <h5 className="text-xs font-black">{issue.title}</h5>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              </div>

              {issue.autoFixLabel && issue.onAutoFix && (
                <Button
                  type="button"
                  onClick={issue.onAutoFix}
                  className="rounded-xl font-black text-xs px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black shrink-0 gap-1.5 shadow-xs"
                >
                  <Wand2 size={12} />
                  <span>{issue.autoFixLabel}</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

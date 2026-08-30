export type EventReadinessSource = {
  isActive: boolean;
  ceremonyDate?: string | null;
  venue?: string | null;
  logoUrl?: string | null;
  invitationTitle?: string | null;
  invitationSubtitle?: string | null;
  sections?: string | null;
  gates?: string | null;
};

export type EventStatsSource = {
  total?: number | string | null;
  attended?: number | string | null;
  paid?: number | string | null;
};

export type EventPhase = "preparing" | "ready" | "live" | "archived";
export type WorkspaceAction = "overview" | "guests" | "operations" | "reports" | "settings";

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0);

export function getEventExperience(event: EventReadinessSource, stats?: EventStatsSource) {
  const total = toNumber(stats?.total);
  const attended = toNumber(stats?.attended);
  const paid = toNumber(stats?.paid);
  const checks = [
    { id: "details", label: "بيانات الموعد والمكان", hint: "أضف الموعد والمكان قبل مشاركة الفعالية.", complete: Boolean(event.ceremonyDate && event.venue), action: "settings" as WorkspaceAction },
    { id: "guests", label: "قائمة الضيوف", hint: "أضف الضيوف أو استورد قائمتك.", complete: total > 0, action: "guests" as WorkspaceAction },
    { id: "identity", label: "هوية الدعوة", hint: "أضف شعاراً أو عنواناً خاصاً للدعوة.", complete: Boolean(event.logoUrl || event.invitationTitle || event.invitationSubtitle), action: "settings" as WorkspaceAction },
    { id: "gates", label: "القطاعات والبوابات", hint: "جهّز بوابات وقطاعات الاستقبال.", complete: Boolean(event.sections || event.gates), action: "settings" as WorkspaceAction },
  ];
  const completeCount = checks.filter((check) => check.complete).length;
  const readiness = Math.round((completeCount / checks.length) * 100);
  const attendanceRate = total ? Math.round((attended / total) * 100) : 0;
  const phase: EventPhase = !event.isActive ? "archived" : attended > 0 ? "live" : readiness === 100 ? "ready" : "preparing";
  const phaseMeta: Record<EventPhase, { label: string; description: string; tone: "amber" | "emerald" | "sky" | "slate" }> = {
    preparing: { label: "قيد التحضير", description: "أكمل العناصر الناقصة قبل بدء الفعالية.", tone: "amber" },
    ready: { label: "جاهزة للتشغيل", description: "كل أساسيات الفعالية مكتملة ويمكن بدء الاستقبال.", tone: "emerald" },
    live: { label: "جارية الآن", description: "تابع الحضور والبوابات والتنبيهات لحظة بلحظة.", tone: "sky" },
    archived: { label: "مؤرشفة", description: "راجع التقرير النهائي واحتفظ بها كقالب لفعالية قادمة.", tone: "slate" },
  };
  const nextIncomplete = checks.find((check) => !check.complete);
  const nextAction = phase === "live"
    ? { label: "فتح التشغيل الحي", description: "تابع الدخول وسجل الحضور من مكان واحد.", action: "operations" as WorkspaceAction }
    : phase === "archived"
      ? { label: "عرض التقرير النهائي", description: "راجع ملخص الحضور ونتائج الفعالية.", action: "reports" as WorkspaceAction }
      : nextIncomplete
        ? { label: nextIncomplete.label, description: nextIncomplete.hint, action: nextIncomplete.action }
        : { label: "مراجعة الفعالية", description: "كل العناصر الأساسية مكتملة وجاهزة للمراجعة.", action: "overview" as WorkspaceAction };
  const attention = [
    ...checks.filter((check) => !check.complete).map((check) => ({ id: check.id, label: check.hint, action: check.action })),
    ...(phase === "live" && total > attended ? [{ id: "absent", label: `لم يصل ${Math.max(0, total - attended)} ضيف بعد.`, action: "operations" as WorkspaceAction }] : []),
  ];
  return { checks, readiness, completeCount, totalChecks: checks.length, total, attended, paid, attendanceRate, phase, phaseMeta: phaseMeta[phase], nextAction, attention };
}

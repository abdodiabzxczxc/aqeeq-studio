import SchoolNewsPager from "@/components/SchoolNewsPager";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { trpc } from "@/lib/trpc";
import { VisualEditable } from "@/components/VisualEditor";
import { FolderArchive } from "lucide-react";
import { useLocation } from "wouter";

const monthName = (key: string) => {
  try {
    return new Date(`${key}-01T12:00:00`).toLocaleDateString("ar-SA", { year: "numeric", month: "long" });
  } catch {
    return key;
  }
};

export default function SchoolNewsMonthlyPage({ monthKey }: { monthKey: string; standalone?: boolean }) {
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.schoolNews.monthlyBook.useQuery({ monthKey });
  const title = `كتيب نشرة العقيق — ${monthName(monthKey)}`;

  if (isLoading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#090b11] text-slate-100">
        <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" />
        <div className="mx-auto max-w-[1500px] px-4 py-8 animate-pulse">
          <div className="h-5 w-48 rounded-lg bg-white/10 mb-6" />
          <div className="h-[550px] rounded-3xl bg-white/5 border border-white/10" />
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#090b11] text-slate-100">
      <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" logoUrl={data?.issues[0]?.headerLogoUrl} />
      <div className="mx-auto max-w-[1500px] px-3 py-3 md:px-6 md:py-6">
        {/* Unconditional Breadcrumb Navigation */}
        <nav className="mb-4 flex items-center justify-between gap-2 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="hover:text-current transition">الرئيسية</button>
            <span className="opacity-40">›</span>
            <button onClick={() => navigate("/journal")} className="hover:text-current transition">مجلة العقيق</button>
            <span className="opacity-40">›</span>
            <span className="text-white truncate max-w-xs">{title}</span>
          </div>
          <button
            onClick={() => navigate("/journal")}
            className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300 hover:text-amber-200 transition"
          >
            <span>← عودة للأعداد</span>
          </button>
        </nav>

        {data?.pages.length ? (
          <VisualEditable id="news-monthly-shell" tag="section" label="إطار الكتيب الشهري" as="section" className="rounded-[2rem]">
            <VisualEditable id="news-monthly-title" tag="text" label="عنوان الكتيب الشهري" as="h1" defaultText={title} className="sr-only" />
            <SchoolNewsPager
              title={title}
              kicker={`تجميع تلقائي · ${data.issues.length} عدد أسبوعي`}
              pages={data.pages}
              coverImageUrl={data.issues[0]?.coverUrl || data.pages[0]?.imageUrl}
              shareUrl={typeof window === "undefined" ? undefined : window.location.href}
              onArchive={() => navigate("/journal")}
            />
          </VisualEditable>
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <FolderArchive size={36} className="text-amber-300" />
            <h1 className="mt-4 text-2xl font-black text-amber-50">لا يوجد كتيب منشور لهذا الشهر</h1>
            <p className="mt-2 text-sm text-slate-500">سيظهر الكتيب تلقائياً بمجرد نشر أول عدد أسبوعي يحتوي على صفحات.</p>
          </div>
        )}
      </div>

      {/* Unified Luxury Site Footer */}
      <AlaqeeqStudioSiteFooter />
    </main>
  );
}

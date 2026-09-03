import SchoolNewsPager from "@/components/SchoolNewsPager";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { trpc } from "@/lib/trpc";
import { VisualEditable } from "@/components/VisualEditor";
import { FolderArchive } from "lucide-react";
import { useLocation } from "wouter";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

const monthName = (key: string) => {
  try {
    return new Date(`${key}-01T12:00:00`).toLocaleDateString("ar-SA", { year: "numeric", month: "long" });
  } catch {
    return key;
  }
};

export default function SchoolNewsMonthlyPage({ monthKey }: { monthKey: string; standalone?: boolean }) {
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { data, isLoading } = trpc.schoolNews.monthlyBook.useQuery({ monthKey });
  const title = `كتيب نشرة العقيق — ${monthName(monthKey)}`;

  if (isLoading) {
    return (
      <main dir="rtl" className={`min-h-screen transition-colors ${dark ? "bg-[#090b11] text-slate-100" : "bg-[#f5f1e7] text-slate-800"}`}>
        <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" />
        <div className="mx-auto max-w-[1500px] px-4 py-8 animate-pulse">
          <div className="h-5 w-48 rounded-lg bg-current/10 mb-6" />
          <div className="h-[550px] rounded-3xl bg-current/5 border border-current/10" />
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className={`min-h-screen transition-colors ${dark ? "bg-[#090b11] text-slate-100" : "bg-[#f5f1e7] text-slate-800"}`}>
      <AlaqeeqStudioSiteHeader title="مجلة العقيق" active="journal" logoUrl={data?.issues[0]?.headerLogoUrl} />
      <div className="mx-auto max-w-[1500px] px-3 py-3 md:px-6 md:py-6">
        {/* Unconditional Breadcrumb Navigation */}
        <nav className="mb-4 flex items-center justify-between gap-2 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="hover:text-current transition">الرئيسية</button>
            <span className="opacity-40">›</span>
            <button onClick={() => navigate("/journal")} className="hover:text-current transition">مجلة العقيق</button>
            <span className="opacity-40">›</span>
            <span className={dark ? "text-white truncate max-w-xs" : "text-slate-900 truncate max-w-xs"}>{title}</span>
          </div>
          <button
            onClick={() => navigate("/journal")}
            className={`inline-flex items-center gap-1.5 text-xs font-black transition ${
              dark ? "text-amber-300 hover:text-amber-200" : "text-[#08467d] hover:text-[#06335c]"
            }`}
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
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
            <FolderArchive size={44} className={dark ? "text-amber-300" : "text-[#08467d]"} />
            <h1 className={`mt-4 text-2xl font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>لا يوجد كتيب منشور لهذا الشهر</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">سيظهر الكتيب تلقائياً بمجرد نشر أول عدد أسبوعي يحتوي على صفحات.</p>
            <button
              onClick={() => navigate("/journal")}
              className={`mt-6 px-5 py-3 rounded-xl text-xs font-black transition shadow-md ${
                dark ? "bg-amber-300 text-black hover:bg-amber-400" : "bg-[#08467d] text-white hover:bg-[#06335c]"
              }`}
            >
              استعراض جميع أعداد المجلة ✦
            </button>
          </div>
        )}
      </div>

      {/* Unified Luxury Site Footer */}
      <AlaqeeqStudioSiteFooter />
    </main>
  );
}

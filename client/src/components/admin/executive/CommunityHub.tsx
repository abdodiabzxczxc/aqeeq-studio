import React, { useState } from "react";
import { HelpCircle, Handshake } from "lucide-react";
import { FaqContentManager } from "@/components/admin/content/FaqContentManager";
import { PartnersContentManager } from "@/components/admin/content/PartnersContentManager";

interface CommunityHubProps {
  dark: boolean;
  orchestration: any;
  onSaveOrchestration: (updated: any) => Promise<void>;
  isSaving: boolean;
}

export function CommunityHub({
  dark,
  orchestration,
  onSaveOrchestration,
  isSaving,
}: CommunityHubProps) {
  const [subTab, setSubTab] = useState<"faqs" | "partners">("faqs");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Deck */}
      <div
        className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          dark ? "border-white/10 bg-[#070c14]/90" : "border-black/10 bg-white shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <HelpCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">الأسئلة الشائعة وشركاء النجاح ❓🤝</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              إدارة بنك الأسئلة المتداولة وإجاباتها الرسمية، وقائمة شركاء ومدارس العقيق المعتمدة
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
          <button
            type="button"
            onClick={() => setSubTab("faqs")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              subTab === "faqs"
                ? dark
                  ? "bg-[#f8ca14] text-black shadow"
                  : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <HelpCircle size={14} />
            <span>بنك الأسئلة الشائعة ({orchestration?.faqs?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("partners")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              subTab === "partners"
                ? dark
                  ? "bg-[#f8ca14] text-black shadow"
                  : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Handshake size={14} />
            <span>شركاء النجاح ({orchestration?.partners?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Content Panels */}
      {subTab === "faqs" && (
        <FaqContentManager
          dark={dark}
          orchestration={orchestration}
          onSave={onSaveOrchestration}
          isSaving={isSaving}
        />
      )}

      {subTab === "partners" && (
        <PartnersContentManager
          dark={dark}
          orchestration={orchestration}
          onSave={onSaveOrchestration}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

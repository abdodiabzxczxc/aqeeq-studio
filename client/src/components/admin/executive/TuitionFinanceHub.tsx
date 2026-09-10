import React from "react";
import { Calculator } from "lucide-react";
import { TuitionFeesContentManager } from "@/components/admin/content/TuitionFeesContentManager";

interface TuitionFinanceHubProps {
  dark: boolean;
  orchestration: any;
  onSaveOrchestration: (updated: any) => Promise<void>;
  isSaving: boolean;
}

export function TuitionFinanceHub({
  dark,
  orchestration,
  onSaveOrchestration,
  isSaving,
}: TuitionFinanceHubProps) {
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
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">مصفوفة الرسوم الدراسية والمالية 💰</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              تحديد رسوم المراحل الدراسية للبنين والبنات، حاسبة الأقساط، وضوابط خصومات السداد المبكر والإخوة
            </p>
          </div>
        </div>
      </div>

      {/* Tuition Fees Matrix Content */}
      <TuitionFeesContentManager
        dark={dark}
        orchestration={orchestration}
        onSave={onSaveOrchestration}
        isSaving={isSaving}
      />
    </div>
  );
}

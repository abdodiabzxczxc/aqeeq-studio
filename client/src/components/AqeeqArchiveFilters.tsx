import { Search, X } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  months: string[];
  month: string;
  onMonthChange: (value: string) => void;
  resultCount: number;
  noun: string;
};

export function AqeeqArchiveFilters({ query, onQueryChange, months, month, onMonthChange, resultCount, noun }: Props) {
  return <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-black/15 p-3 sm:flex-row sm:items-center">
    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#0a0d14] px-3 py-2 text-slate-300 focus-within:border-amber-300/45"><Search size={15} className="text-amber-300" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={`ابحث في ${noun}…`} className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none placeholder:text-slate-600" />{query ? <button type="button" onClick={() => onQueryChange("")} className="text-slate-400 hover:text-amber-200" aria-label="مسح البحث"><X size={14} /></button> : null}</label>
    <select value={month} onChange={(event) => onMonthChange(event.target.value)} className="rounded-xl border border-white/10 bg-[#0a0d14] px-3 py-2 text-xs font-black text-slate-200 outline-none focus:border-amber-300/45"><option value="all">كل التواريخ</option>{months.map((key) => <option key={key} value={key}>{new Date(`${key}-01T12:00:00`).toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}</option>)}</select>
    <span className="shrink-0 text-center text-[10px] font-black text-amber-200">{resultCount} {noun}</span>
  </div>;
}

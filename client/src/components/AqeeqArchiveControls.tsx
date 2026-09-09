import { VisualEditable, VisualIcon } from "@/components/VisualEditor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AQEEQ_SORT_OPTIONS, type AqeeqSortOption } from "@/lib/aqeeqArchiveControls";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { ArrowDown, ArrowUp, ArrowUpDown, X } from "lucide-react";

type ContentTypeOption = { id: string; label: string; count?: number };
type AqeeqArchiveControlsProps = {
  id: string;
  label: string;
  query: string;
  onQueryChange: (value: string) => void;
  sort: AqeeqSortOption;
  onSortChange: (value: AqeeqSortOption) => void;
  typeOptions?: ContentTypeOption[];
  activeType?: string;
  onTypeChange?: (value: string) => void;
};

const FILTER_CHOICES: Array<{ id: "date" | "name" | "views"; label: string; ascending: AqeeqSortOption; descending: AqeeqSortOption }> = [
  { id: "date", label: "الأحدث", ascending: "newest", descending: "oldest" },
  { id: "name", label: "الاسم", ascending: "nameAsc", descending: "nameDesc" },
  { id: "views", label: "الأكثر مشاهدة", ascending: "mostViewed", descending: "leastViewed" },
];

export function AqeeqArchiveControls({
  id,
  label,
  query,
  onQueryChange,
  sort,
  onSortChange,
  typeOptions,
  activeType,
  onTypeChange,
}: AqeeqArchiveControlsProps) {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const sortLabel = AQEEQ_SORT_OPTIONS.find((option) => option.id === sort)?.label || "الترتيب";
  const hasTypeOptions = Boolean(typeOptions?.length && onTypeChange);
  const toggleSort = (choice: (typeof FILTER_CHOICES)[number]) =>
    onSortChange(sort === choice.ascending ? choice.descending : choice.ascending);

  return (
    <VisualEditable
      id={`${id}-shell`}
      tag="section"
      label={label}
      as="section"
      className={`aqeeq-archive-controls mb-8 rounded-[2rem] border transition-all duration-300 p-4 sm:p-6 backdrop-blur-xl ${
        dark
          ? "border-[#f8ca14]/30 bg-black/70 shadow-[0_16px_40px_rgba(0,0,0,0.5)] shadow-[#f8ca14]/5"
          : "border-[#08467d]/15 bg-white/95 shadow-[0_16px_40px_rgba(8,70,125,0.06)] shadow-slate-200/50"
      }`}
    >
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-2.5 w-2.5 rounded-full animate-pulse ${
              dark ? "bg-[#f8ca14] shadow-[0_0_10px_#f8ca14]" : "bg-[#08467d] shadow-[0_0_8px_#08467d]"
            }`}
          />
          <VisualEditable
            id={`${id}-title`}
            tag="text"
            label={`عنوان ${label}`}
            defaultText={label}
            as="h3"
            className={`text-sm sm:text-base font-black ${dark ? "text-amber-100" : "text-[#08467d]"}`}
          />
        </div>
        <span
          className={`text-[10px] font-black tracking-[.2em] uppercase rounded-full px-3 py-1 border ${
            dark ? "border-white/10 text-slate-400 bg-white/[0.03]" : "border-slate-200 text-slate-500 bg-slate-50"
          }`}
        >
          FIND &amp; SORT
        </span>
      </div>

      {/* Dedicated Categories Row */}
      {hasTypeOptions && (
        <div className="mb-4 pt-1">
          <div
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 flex-nowrap sm:flex-wrap"
            role="group"
            aria-label="تصنيفات المحتوى"
          >
            <VisualEditable
              id={`${id}-content-type-label`}
              tag="text"
              label={`عنوان تصنيفات ${label}`}
              defaultText="التصنيف:"
              as="span"
              className={`text-xs font-black shrink-0 ml-1 ${dark ? "text-amber-300/90" : "text-[#08467d]"}`}
            />
            {typeOptions?.map((option) => {
              const isActive = activeType === option.id;
              return (
                <VisualEditable
                  key={option.id}
                  id={`${id}-content-type-${option.id}`}
                  tag="button"
                  label={`تصنيف ${option.label}`}
                  defaultText={option.label}
                  as="button"
                  onAction={() => onTypeChange?.(option.id)}
                  aria-pressed={isActive}
                  className={`aqeeq-content-type-button shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all duration-200 ${
                    isActive
                      ? dark
                        ? "bg-[#f8ca14] text-black shadow-[0_0_20px_rgba(248,202,20,0.35)] scale-[1.02]"
                        : "bg-[#08467d] text-white shadow-[0_4px_16px_rgba(8,70,125,0.25)] scale-[1.02]"
                      : dark
                      ? "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? dark
                            ? "bg-black/20 text-black"
                            : "bg-white/20 text-white"
                          : dark
                          ? "bg-white/10 text-slate-400"
                          : "bg-black/5 text-slate-500"
                      }`}
                    >
                      {option.count}
                    </span>
                  )}
                </VisualEditable>
              );
            })}
          </div>
        </div>
      )}

      {/* Dedicated Search & Sort Row with Full Width and Breathing Room */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Field */}
        <div
          className={`relative flex-1 flex items-center min-h-[48px] rounded-2xl border px-4 transition-all duration-200 ${
            dark
              ? "border-white/10 bg-black/60 text-white focus-within:border-[#f8ca14]/80 focus-within:shadow-[0_0_20px_rgba(248,202,20,0.15)]"
              : "border-slate-200 bg-slate-50/80 text-slate-900 focus-within:border-[#08467d]/70 focus-within:bg-white focus-within:shadow-[0_0_20px_rgba(8,70,125,0.1)]"
          }`}
        >
          <div className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}>
            <VisualIcon id={`${id}-search-icon`} label={`أيقونة بحث ${label}`} icon="search" size={18} />
          </div>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="ابحث بالاسم أو العنوان أو التفاصيل..."
            className={`min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm font-bold outline-none ${
              dark ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"
            }`}
            aria-label={`بحث ${label}`}
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                dark
                  ? "text-slate-400 hover:text-white hover:bg-white/10"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
              aria-label="مسح نص البحث"
            >
              <X size={15} />
            </button>
          ) : null}
          <VisualEditable
            id={`${id}-search-placeholder`}
            tag="text"
            label={`نص توضيحي لبحث ${label}`}
            defaultText="ابحث بالاسم"
            as="span"
            className="sr-only"
          />
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`aqeeq-archive-filter-trigger inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2.5 rounded-2xl border px-5 text-xs font-black transition-all duration-200 ${
                dark
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20 hover:border-[#f8ca14]/60 active:scale-98"
                  : "border-[#08467d]/25 bg-[#08467d]/5 text-[#08467d] hover:bg-[#08467d]/10 hover:border-[#08467d]/50 active:scale-98"
              }`}
              aria-label="فتح خيارات ترتيب النتائج"
            >
              <VisualIcon id={`${id}-filter-icon`} label={`أيقونة فلترة ${label}`} icon="filter" size={16} />
              <VisualEditable
                id={`${id}-filter-button`}
                tag="text"
                label={`نص زر فلترة ${label}`}
                defaultText={`ترتيب: ${sortLabel}`}
                as="span"
              />
              <ArrowUpDown size={14} className="opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={`aqeeq-archive-filter-menu w-64 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl ${
              dark ? "border-[#f8ca14]/30 bg-[#0a0d14]/98 text-white" : "border-slate-200 bg-white/98 text-slate-900"
            }`}
          >
            <div dir="rtl">
              <DropdownMenuLabel
                className={`px-3 py-2 text-[11px] font-black tracking-wider ${
                  dark ? "text-[#f8ca14]" : "text-[#08467d]"
                }`}
              >
                اضغط للتبديل بين الاتجاهين ⇅
              </DropdownMenuLabel>
              <div className="space-y-1">
                {FILTER_CHOICES.map((choice) => {
                  const selected = sort === choice.ascending || sort === choice.descending;
                  const descending = sort === choice.descending;
                  return (
                    <DropdownMenuItem
                      key={choice.id}
                      onSelect={() => toggleSort(choice)}
                      className={`cursor-pointer justify-between rounded-xl px-3 py-2.5 text-xs font-black transition ${
                        selected
                          ? dark
                            ? "bg-[#f8ca14] text-black focus:bg-[#f8ca14] focus:text-black font-extrabold"
                            : "bg-[#08467d] text-white focus:bg-[#08467d] focus:text-white font-extrabold"
                          : dark
                          ? "text-slate-200 hover:bg-white/10 focus:bg-white/10 focus:text-white"
                          : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900"
                      }`}
                    >
                      <span>{choice.label}</span>
                      <span className="inline-flex items-center gap-1">
                        <ArrowUp size={13} className={selected && !descending ? "opacity-100 font-bold" : "opacity-30"} />
                        <ArrowDown size={13} className={selected && descending ? "opacity-100 font-bold" : "opacity-30"} />
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </VisualEditable>
  );
}

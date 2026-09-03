import { VisualEditable, VisualIcon } from "@/components/VisualEditor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AQEEQ_SORT_OPTIONS, type AqeeqSortOption } from "@/lib/aqeeqArchiveControls";
import { ArrowDown, ArrowUp } from "lucide-react";

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

export function AqeeqArchiveControls({ id, label, query, onQueryChange, sort, onSortChange, typeOptions, activeType, onTypeChange }: AqeeqArchiveControlsProps) {
  const sortLabel = AQEEQ_SORT_OPTIONS.find((option) => option.id === sort)?.label || "الترتيب";
  const hasTypeOptions = Boolean(typeOptions?.length && onTypeChange);
  const toggleSort = (choice: (typeof FILTER_CHOICES)[number]) => onSortChange(sort === choice.ascending ? choice.descending : choice.ascending);

  const searchField = <div className={`aqeeq-archive-search ${hasTypeOptions ? "aqeeq-archive-search--news" : "aqeeq-archive-search--archive"} flex min-h-10 items-center gap-2 rounded-xl border border-[#d9bd26]/35 px-3 text-[#d9bd26]`}>
    <VisualIcon id={`${id}-search-icon`} label={`أيقونة بحث ${label}`} icon="search" size={16} />
    <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="ابحث بالاسم..." className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-100 outline-none placeholder:text-slate-500" aria-label={`بحث ${label}`} />
    <VisualEditable id={`${id}-search-placeholder`} tag="text" label={`نص توضيحي لبحث ${label}`} defaultText="ابحث بالاسم" as="span" className="sr-only" />
  </div>;

  const sortMenu = <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button type="button" className="aqeeq-archive-filter-trigger inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-[#d9bd26]/55 px-3 text-xs font-black text-[#d9bd26]" aria-label="فتح خيارات ترتيب النتائج">
        <VisualIcon id={`${id}-filter-icon`} label={`أيقونة فلترة ${label}`} icon="filter" size={16} />
        <VisualEditable id={`${id}-filter-button`} tag="text" label={`نص زر فلترة ${label}`} defaultText={`ترتيب: ${sortLabel}`} as="span" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="aqeeq-archive-filter-menu w-64 border-[#d9bd26]/35 bg-black p-2 text-white">
      <div dir="rtl">
        <DropdownMenuLabel className="text-xs font-black text-[#d9bd26]">اضغط للتبديل بين الاتجاهين</DropdownMenuLabel>
        {FILTER_CHOICES.map((choice) => {
          const selected = sort === choice.ascending || sort === choice.descending;
          const descending = sort === choice.descending;
          return <DropdownMenuItem key={choice.id} onSelect={() => toggleSort(choice)} className={`cursor-pointer justify-between rounded-xl px-3 py-3 text-xs font-black ${selected ? "bg-[#d9bd26] text-black focus:bg-[#d9bd26] focus:text-black" : "text-slate-100 focus:bg-[#085187] focus:text-white"}`}>
            <span>{choice.label}</span>
            <span className="inline-flex items-center gap-0.5"><ArrowUp size={14} className={selected && descending ? "opacity-100" : "opacity-35"} /><ArrowDown size={14} className={selected && !descending ? "opacity-100" : "opacity-35"} /></span>
          </DropdownMenuItem>;
        })}
      </div>
    </DropdownMenuContent>
  </DropdownMenu>;

  const typeButtons = hasTypeOptions ? <div className="aqeeq-content-type-group flex shrink-0 flex-wrap items-center gap-2" role="group" aria-label="تصنيفات الأخبار">
    <VisualEditable id={`${id}-content-type-label`} tag="text" label={`عنوان تصنيفات ${label}`} defaultText="اعرض:" as="span" className="text-[11px] font-black text-[#d9bd26]" />
    {typeOptions?.map((option) => (
      <VisualEditable key={option.id} id={`${id}-content-type-${option.id}`} tag="button" label={`تصنيف ${option.label}`} defaultText={option.label} as="button" onAction={() => onTypeChange?.(option.id)} aria-pressed={activeType === option.id} className={`aqeeq-content-type-button rounded-xl border px-3 py-2 text-xs font-black flex items-center gap-1 ${activeType === option.id ? "is-active" : ""}`}>
        <span>{option.label}</span>
        {option.count !== undefined && <span className="opacity-50 font-normal">({option.count})</span>}
      </VisualEditable>
    ))}
  </div> : null;

  return <VisualEditable id={`${id}-shell`} tag="section" label={label} as="section" className="aqeeq-archive-controls mb-7 rounded-[1.5rem] border border-[#d9bd26]/25 bg-black/20 p-3 sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><VisualEditable id={`${id}-title`} tag="text" label={`عنوان ${label}`} defaultText={label} as="h3" className="text-sm font-black text-amber-100" /><span className="text-[10px] font-black tracking-[.16em] text-slate-500">FIND & SORT</span></div>
    {hasTypeOptions ? <div className="aqeeq-archive-news-row mt-3 flex items-center gap-2">{typeButtons}{searchField}{sortMenu}</div> : <div className="mt-3 flex flex-wrap items-center gap-2">{searchField}{sortMenu}</div>}
  </VisualEditable>;
}

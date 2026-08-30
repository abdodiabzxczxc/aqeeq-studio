import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { VisualEditable } from "./VisualEditor";

export function AlaqeeqPublicHeader({ eyebrow, title, children, returnHome = true, showNav = true }: { eyebrow: string; title: string; children?: ReactNode; returnHome?: boolean; showNav?: boolean }) {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: "/about", label: "عن العقيق" },
    { href: "/life", label: "الحياة المدرسية" },
    { href: "/maison", label: "مواسم العقيق" },
    { href: "/journal", label: "سجل الحكايات" },
  ];
  const go = (href: string) => { navigate(href); setMenuOpen(false); };
  return <header className="aq-public-header relative" dir="rtl"><VisualEditable id="public-header-shell" tag="section" label="الرأس العام للصفحة" as="div">
    <div className="mx-auto grid h-[76px] max-w-[1440px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-5 md:px-10">
      {returnHome ? <VisualEditable id="public-header-home" tag="button" label="رابط مدارس العقيق" as="button" onAction={() => navigate("/")} className="aq-header-link"><ArrowRight size={17} /><span className="hidden sm:inline">مدارس العقيق</span></VisualEditable> : <VisualEditable id="public-header-context" tag="text" label="سياق الرأس العام" as="span" defaultText={eyebrow} className="aq-header-link pointer-events-none"><Sparkles size={16} /><span className="hidden sm:inline">{eyebrow}</span></VisualEditable>}
      <VisualEditable id="public-header-title-block" tag="section" label="عناوين الرأس العام" as="div" className="min-w-0 text-center"><VisualEditable id="public-header-eyebrow" tag="text" label="شارة الرأس العام" as="div" defaultText={eyebrow} className="aq-kicker" /><VisualEditable id="public-header-title" tag="text" label="عنوان الرأس العام" as="div" defaultText={title} className="truncate text-xs font-black text-white sm:text-sm" /></VisualEditable>
      <div className="flex min-w-0 items-center justify-end gap-3">{showNav ? <VisualEditable id="public-header-navigation" tag="section" label="تنقل الرأس العام" as="div" className="hidden items-center gap-4 xl:flex">{links.map((link) => <VisualEditable key={link.href} id={`public-header-nav-${link.href.slice(1)}`} tag="button" label={`رابط: ${link.label}`} as="button" onAction={() => go(link.href)} className={`whitespace-nowrap text-xs font-bold transition ${location === link.href ? "text-amber-200" : "text-slate-400 hover:text-white"}`}>{link.label}</VisualEditable>)}</VisualEditable> : null}<div className="flex min-w-[42px] items-center justify-end gap-2">{children}{showNav ? <VisualEditable id="public-header-menu-toggle" tag="button" label="زر قائمة الموقع" as="button" onAction={() => setMenuOpen((value) => !value)} className="aq-header-link !h-10 !w-10 !justify-center !px-0 xl:hidden">{menuOpen ? <X size={17} /> : <Menu size={18} />}</VisualEditable> : null}</div></div>
    </div>
    {showNav && menuOpen ? <VisualEditable id="public-header-menu" tag="section" label="القائمة المنبثقة للموقع" as="div" className="absolute inset-x-0 top-full z-50 border-b border-amber-300/15 bg-[#0b0e15]/[.98] px-5 py-5 shadow-2xl backdrop-blur-xl lg:hidden"><div className="mx-auto grid max-w-[1440px] gap-2">{links.map((link, index) => <VisualEditable key={link.href} id={`public-header-menu-${link.href.slice(1)}`} tag="button" label={`قائمة: ${link.label}`} as="button" onAction={() => go(link.href)} className={`flex items-center justify-between rounded-2xl px-4 py-4 text-right transition ${location === link.href ? "bg-amber-300 text-[#18130a]" : "bg-white/[.035] text-white hover:bg-white/[.08]"}`}><span className="font-black">{link.label}</span><span className="text-xs opacity-60">فصل ٠{index + 1}</span></VisualEditable>)}</div></VisualEditable> : null}
  </VisualEditable></header>;
}

import { createInvitationPngBlob, type InvitationPngInput } from "@/lib/invitationPng";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type Props = { input: InvitationPngInput; alt?: string; className?: string; children?: ReactNode };

/** يعرض نفس وحدات البكسل التي يستخدمها زر تنزيل PNG، لذلك لا توجد معاينة ثانية مختلفة. */
export default function InvitationPngPreview({ input, alt = "معاينة الدعوة النهائية", className = "", children }: Props) {
  const signature = useMemo(() => JSON.stringify(input), [input]);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setFailed(false);
    void createInvitationPngBlob(JSON.parse(signature) as InvitationPngInput).then((blob) => {
      objectUrl = URL.createObjectURL(blob);
      if (cancelled) URL.revokeObjectURL(objectUrl);
      else setUrl(objectUrl);
    }).catch((error) => { console.error("Invitation preview generation failed", error); if (!cancelled) setFailed(true); });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [signature]);

  return <div className={`relative overflow-hidden bg-[#0b1018] ${className}`}>{url ? <img src={url} alt={alt} className="block h-full w-full object-contain" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs font-bold text-slate-400"><Loader2 size={22} className="animate-spin text-amber-300" />جارٍ بناء المعاينة النهائية…</div>}{failed ? <div className="absolute inset-0 flex items-center justify-center bg-[#0b1018]/90 px-6 text-center text-xs text-[#de191e]">تعذر إعداد المعاينة، لكن يمكنك إعادة المحاولة بعد لحظة.</div> : null}{children}</div>;
}

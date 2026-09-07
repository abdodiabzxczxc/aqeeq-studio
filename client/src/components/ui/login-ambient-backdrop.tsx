import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Camera, Newspaper, BookOpen } from "lucide-react";

export interface BackdropMediaCard {
  id: string | number;
  title: string;
  image: string;
  badge: string;
  type: "album" | "showcase" | "issue";
}

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

const FALLBACK_ITEMS: BackdropMediaCard[] = [
  { id: "fb-1", title: "معامل الذكاء الاصطناعي وSTEM", image: "/covers/student-lab-admissions.jpg", badge: "أكاديميات المستقبل", type: "album" },
  { id: "fb-2", title: "المسار الأمريكي المعتمد Cognia", image: "/covers/cover-about.jpg", badge: "المسار الدولي", type: "showcase" },
  { id: "fb-3", title: "أبطال الروبوت فيرست ليجو WRO", image: "/covers/first-lego-champions.png", badge: "بطولات عالمية", type: "album" },
  { id: "fb-4", title: "الصرح الرياضي والمسبح الأولمبي", image: "/covers/cover-admissions.jpg", badge: "مرافق عالمية", type: "showcase" },
  { id: "fb-5", title: "مجلة صوت العقيق الدورية", image: "/covers/student-excellence-about.jpg", badge: "إصدارات رسمية", type: "issue" },
  { id: "fb-6", title: "أكاديمية قياس والقدرات والتحصيلي", image: "/covers/student-robotics-accreditations.jpg", badge: "تفوق أكاديمي", type: "album" },
  { id: "fb-7", title: "الاعتمادات المدرسية ومراكز SAT & IELTS", image: "/covers/cover-accreditations.jpg", badge: "اعتمادات دولية", type: "showcase" },
  { id: "fb-8", title: "أنشطة وفعاليات مدارس العقيق", image: "/covers/aqeeq-anthems-royal-cover.jpg", badge: "فعاليات كبرى", type: "album" },
];

export function LoginAmbientBackdrop({ dark = true }: { dark?: boolean }) {
  // Fetch live items from albums, showcases, and journal issues
  const { data: albums = [] } = trpc.aqeeqAlbums.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: showcases = [] } = trpc.aqeeqShowcases.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: issues = [] } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });

  const dynamicItems = useMemo(() => {
    const list: BackdropMediaCard[] = [];

    // 1. Albums
    if (Array.isArray(albums)) {
      albums
        .filter((a) => Boolean(a.coverUrl))
        .slice(0, 10)
        .forEach((a) => {
          const resolved = directDriveImage(a.coverUrl) || a.coverUrl;
          if (resolved) {
            list.push({
              id: `alb-${a.id}`,
              title: a.title,
              image: resolved,
              badge: "ألبوم العقيق",
              type: "album",
            });
          }
        });
    }

    // 2. Showcases / News
    if (Array.isArray(showcases)) {
      showcases
        .filter((s) => Boolean(s.coverUrl))
        .slice(0, 10)
        .forEach((s) => {
          const resolved = directDriveImage(s.coverUrl) || s.coverUrl;
          if (resolved) {
            list.push({
              id: `show-${s.id}`,
              title: s.title,
              image: resolved,
              badge: "معرض الأخبار",
              type: "showcase",
            });
          }
        });
    }

    // 3. Magazine / Journal Issues
    if (Array.isArray(issues)) {
      issues
        .filter((i) => Boolean(i.coverUrl))
        .slice(0, 8)
        .forEach((i) => {
          const resolved = directDriveImage(i.coverUrl) || i.coverUrl;
          if (resolved) {
            list.push({
              id: `iss-${i.id}`,
              title: i.title,
              image: resolved,
              badge: i.seasonLabel || "مجلة العقيق",
              type: "issue",
            });
          }
        });
    }

    if (list.length === 0) return FALLBACK_ITEMS;

    return list;
  }, [albums, showcases, issues]);

  // Split into Row 1 and Row 2 for opposite slow gliding
  const half = Math.ceil(dynamicItems.length / 2);
  const row1Base = dynamicItems.slice(0, Math.max(half, 4));
  const row2Base = dynamicItems.slice(Math.max(half, 4));
  const row2Final = row2Base.length >= 3 ? row2Base : FALLBACK_ITEMS;

  // Duplicate items for seamless continuous looping
  const row1 = [...row1Base, ...row1Base, ...row1Base];
  const row2 = [...row2Final, ...row2Final, ...row2Final];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Low-opacity moving photo cards layer */}
      <div
        className={`absolute inset-0 flex flex-col justify-center gap-6 sm:gap-10 transition-opacity duration-1000 ${
          dark ? "opacity-[0.14]" : "opacity-[0.18]"
        }`}
      >
        {/* Row 1: Right to Left (Continuous ultra-slow gliding) */}
        <div className="flex w-max animate-marquee-rtl gap-5 sm:gap-7 will-change-transform [animation-duration:95s]">
          {row1.map((item, idx) => (
            <BackdropCard key={`r1-${item.id}-${idx}`} item={item} dark={dark} />
          ))}
        </div>

        {/* Row 2: Left to Right (Continuous ultra-slow reverse gliding) */}
        <div
          className="flex w-max gap-5 sm:gap-7 will-change-transform [animation:marquee-rtl_110s_linear_infinite_reverse]"
        >
          {row2.map((item, idx) => (
            <BackdropCard key={`r2-${item.id}-${idx}`} item={item} dark={dark} />
          ))}
        </div>
      </div>

      {/* 2. Soft Ambient Radial Vignette & Depth Mask */}
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(4,7,12,0.88) 0%, rgba(4,7,12,0.65) 50%, rgba(4,7,12,0.95) 100%)"
            : "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(248,250,252,0.88) 0%, rgba(248,250,252,0.65) 50%, rgba(248,250,252,0.95) 100%)",
        }}
      />

      {/* 3. Luxury Ambient Color Glow Orbs */}
      <div
        className={`absolute top-1/4 -right-20 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
          dark ? "bg-amber-500/10" : "bg-blue-600/10"
        }`}
      />
      <div
        className={`absolute bottom-1/4 -left-20 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
          dark ? "bg-emerald-600/10" : "bg-emerald-500/10"
        }`}
      />
    </div>
  );
}

function BackdropCard({ item, dark }: { item: BackdropMediaCard; dark: boolean }) {
  return (
    <div
      className={`relative w-[220px] h-[220px] sm:w-[270px] sm:h-[270px] rounded-[2rem] overflow-hidden border flex-shrink-0 transition-all ${
        dark
          ? "border-white/10 bg-[#090d14] shadow-2xl shadow-black/80"
          : "border-slate-200 bg-white shadow-xl shadow-slate-300/60"
      }`}
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover select-none filter contrast-[1.05]"
      />

      {/* Gradient shade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Badge */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <span className="rounded-xl bg-black/60 border border-white/20 px-2.5 py-1 text-[10px] font-black text-amber-300 backdrop-blur-md flex items-center gap-1.5">
          {item.type === "album" && <Camera size={10} />}
          {item.type === "showcase" && <Newspaper size={10} />}
          {item.type === "issue" && <BookOpen size={10} />}
          <span>{item.badge}</span>
        </span>
      </div>

      {/* Bottom title */}
      <div className="absolute inset-x-0 bottom-0 p-3.5 text-right z-10">
        <p className="text-xs font-black text-white line-clamp-1 drop-shadow-md">
          {item.title}
        </p>
      </div>
    </div>
  );
}

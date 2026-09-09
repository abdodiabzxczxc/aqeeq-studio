import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

interface AqeeqScrollRevealSectionProps {
  children: React.ReactNode;
  /** Extra tailwind classes for the container */
  className?: string;
  /** Kept for backwards compatibility */
  scrollVh?: number;
  /** Kept for backwards compatibility */
  neonLine?: boolean;
}

/**
 * AqeeqScrollRevealSection
 * انسياب طبيعي وسلس 100% بدون أي قص أو ستائر أو خطوط أو ظلال
 */
export function AqeeqScrollRevealSection({
  children,
  className = "",
}: AqeeqScrollRevealSectionProps) {
  return (
    <div className={`relative z-10 w-full bg-transparent border-0 shadow-none ${className}`}>
      {children}
    </div>
  );
}


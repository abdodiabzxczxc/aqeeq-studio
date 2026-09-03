import { cn } from "@/lib/utils";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Aqeeq Studio Caught Error:", error, errorInfo);
    // Auto-heal when dynamic imports fail after deployment
    const isChunkError =
      error?.message?.includes("dynamically imported module") ||
      error?.message?.includes("Loading chunk") ||
      error?.name === "ChunkLoadError";

    const hasAttemptedAutoReload = typeof window !== "undefined" && sessionStorage.getItem("aqeeq_auto_chunk_reload") === "true";

    if (isChunkError && !hasAttemptedAutoReload) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("aqeeq_auto_chunk_reload", "true");
      }
      void this.handleReload();
    }
  }

  handleReload = async () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch (e) {
        console.error("Purge cache failed", e);
      }
      window.location.href = window.location.origin + window.location.pathname + "?_t=" + Date.now();
    }
  };

  handleGoHome = async () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch (e) {
        console.error("Purge cache failed", e);
      }
      window.location.href = "/?_t=" + Date.now();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div dir="rtl" className="flex items-center justify-center min-h-[70vh] p-6 bg-[#06080d] text-white font-[Tajawal,sans-serif]">
          <div className="flex flex-col items-center text-center w-full max-w-lg p-8 rounded-3xl border border-emerald-500/20 bg-[#0a0f16]/90 shadow-2xl backdrop-blur-xl">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#f8ca14] mb-5">
              <AlertCircle size={32} />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              لحظة واحدة من فضلك
            </h2>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-sm">
              حدث تحديث في محتوى الصفحة تطلب إعادة تهيئة سريعة. اضغط على الزر أدناه للمتابعة بسلاسة.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#005A36] hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition active:scale-95 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>إعادة تحميل الصفحة (تنظيف الكاش)</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition active:scale-95 cursor-pointer"
              >
                <Home size={16} />
                <span>الصفحة الرئيسية</span>
              </button>
            </div>

            {this.state.error && (
              <details className="mt-6 w-full text-right">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 select-none">
                  تفاصيل الخطأ (Error Debug Info)
                </summary>
                <div className="mt-2 p-3 w-full rounded-xl bg-black/60 border border-white/10 overflow-auto max-h-48 text-left" dir="ltr">
                  <pre className="text-[11px] text-red-400 font-mono whitespace-break-spaces">
                    {this.state.error.message}
                    {"\n\n"}
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


/**
 * useAutoSave — FEAT-1: Auto-save any form state to localStorage.
 *
 * Usage:
 *   const { autoSaveStatus, clearDraft, hasDraft, loadDraft } = useAutoSave("journal-draft-slug", formData);
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T>(
  key: string,
  data: T,
  debounceMs = 2000,
): {
  autoSaveStatus: AutoSaveStatus;
  hasDraft: boolean;
  clearDraft: () => void;
  loadDraft: () => T | null;
} {
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    try { return Boolean(localStorage.getItem(key)); } catch { return false; }
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<T>(data);
  useEffect(() => { latestDataRef.current = data; }, [data]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        setAutoSaveStatus("saving");
        localStorage.setItem(key, JSON.stringify(latestDataRef.current));
        setHasDraft(true);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } catch {
        setAutoSaveStatus("error");
      }
    }, debounceMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, key, debounceMs]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(key); setHasDraft(false); setAutoSaveStatus("idle"); } catch { /* */ }
  }, [key]);

  const loadDraft = useCallback((): T | null => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
  }, [key]);

  return { autoSaveStatus, hasDraft, clearDraft, loadDraft };
}

export function autoSaveLabel(status: AutoSaveStatus, hasDraft: boolean): string {
  if (status === "saving") return "⏳ جارٍ الحفظ التلقائي...";
  if (status === "saved") return "✅ محفوظ تلقائياً";
  if (status === "error") return "⚠️ فشل الحفظ التلقائي";
  if (hasDraft) return "💾 مسودة محفوظة";
  return "";
}

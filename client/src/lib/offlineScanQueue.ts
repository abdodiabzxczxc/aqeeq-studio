export type OfflineScan = {
  id: string;
  qrCode: string;
  deviceInfo?: string;
  ceremonyId?: number;
  gate?: string;
  createdAt: number;
};

const DB_NAME = "alaqeeq-graduation-offline";
const STORE_NAME = "scan-queue";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB غير متاح"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("تعذر فتح التخزين المحلي"));
  });
}

export async function enqueueOfflineScan(scan: Omit<OfflineScan, "id" | "createdAt">) {
  const db = await openDb();
  const record: OfflineScan = { ...scan, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now() };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("تعذر حفظ عملية المسح"));
  });
  db.close();
  return record;
}

export async function listOfflineScans(): Promise<OfflineScan[]> {
  const db = await openDb();
  const rows = await new Promise<OfflineScan[]>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result ?? []).sort((a, b) => a.createdAt - b.createdAt));
    request.onerror = () => reject(request.error ?? new Error("تعذر قراءة عمليات المسح"));
  });
  db.close();
  return rows;
}

export async function removeOfflineScan(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("تعذر حذف العملية المتزامنة"));
  });
  db.close();
}

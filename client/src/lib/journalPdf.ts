export type JournalPdfPage = { imageUrl: string };

export function getJournalPdfFilename(title: string) {
  const name = title.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ") || "مجلة-العقيق";
  return `${name}.pdf`;
}

async function imageDataFromUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("تعذر تحميل إحدى صفحات العدد");
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذر تجهيز صورة الصفحة"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
  return { dataUrl, format: blob.type.includes("png") ? "PNG" : "JPEG" } as const;
}

export async function buildJournalPdf(title: string, pages: JournalPdfPage[]) {
  if (!pages.length) throw new Error("لا توجد صفحات في هذا العدد");
  const { jsPDF } = await import("jspdf");
  let pdf: InstanceType<typeof jsPDF> | null = null;

  for (const page of pages) {
    const image = await imageDataFromUrl(page.imageUrl);
    const probe = new jsPDF({ unit: "pt" });
    const dimensions = probe.getImageProperties(image.dataUrl);
    const width = dimensions.width;
    const height = dimensions.height;
    const orientation = width >= height ? "landscape" : "portrait";
    if (!pdf) pdf = new jsPDF({ orientation, unit: "pt", format: [width, height] });
    else pdf.addPage([width, height], orientation);
    const activePdf = pdf as InstanceType<typeof jsPDF>;
    activePdf.addImage(image.dataUrl, image.format, 0, 0, width, height, undefined, "FAST");
  }

  return pdf as InstanceType<typeof jsPDF>;
}

export async function downloadJournalPdf(title: string, pages: JournalPdfPage[]) {
  const pdf = await buildJournalPdf(title, pages);
  pdf.save(getJournalPdfFilename(title));
}

export async function openJournalPdfForPrint(title: string, pages: JournalPdfPage[]) {
  const pdf = await buildJournalPdf(title, pages);
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error("تعذر فتح ملف PDF للطباعة");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

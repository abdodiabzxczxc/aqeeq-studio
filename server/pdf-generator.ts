import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export async function generateInvitationPDF(attendee: {
  id: number;
  fullName: string;
  idNumber: string;
  ticketType: string;
  qrCode: string;
  seatNumber?: string;
  logoUrl?: string;
  eventTitle?: string;
  eventSubtitle?: string;
}): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const qrDataUrl = (await QRCode.toDataURL(attendee.qrCode, {
        errorCorrectionLevel: "H",
        type: "image/png",
        margin: 1,
        width: 240,
      })) as string;

      let logoBuffer: Buffer | undefined;
      if (attendee.logoUrl) {
        try {
          const logoResponse = await fetch(attendee.logoUrl);
          if (logoResponse.ok) {
            logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
          }
        } catch (error) {
          console.warn("[PDF] Could not load ceremony logo", error);
        }
      }

      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Luxurious dark background matching website theme (#0f0f17)
      doc.rect(0, 0, 595, 842).fill("#0f0f17");

      const goldColor = "#c9a84c";
      const darkBorder = "#1e1e2f";
      const eventTitle = attendee.eventTitle || "منصة إدارة الفعاليات";
      const eventSubtitle = attendee.eventSubtitle || "بطاقة دعوة رسمية";

      doc.rect(30, 30, 535, 782).lineWidth(2).stroke(goldColor);
      doc.rect(36, 36, 523, 770).lineWidth(1).stroke(darkBorder);

      // Header Area
      doc.fillColor(goldColor).font("Helvetica-Bold", 18);
      doc.text(eventTitle, 0, 60, { width: 595, align: "center" });

      doc.fillColor("#e2e8f0").font("Helvetica", 12);
      doc.text(eventSubtitle, 0, 85, { width: 595, align: "center" });

      if (logoBuffer) {
        try {
          doc.image(logoBuffer, 247, 115, { fit: [100, 50], align: "center", valign: "center" });
        } catch (e) {
          // fallback
        }
      }

      // Title Card Box
      doc.roundedRect(80, 185, 435, 60, 8).fill("#171725");
      doc.fillColor(goldColor).font("Helvetica-Bold", 18);
      doc.text("بطاقة دخول الحفل", 0, 203, { width: 595, align: "center" });

      // Attendee Details Box
      const boxY = 265;
      doc.roundedRect(80, boxY, 435, 230, 12).fill("#171725");
      doc.rect(80, boxY, 435, 230).lineWidth(1).stroke("#c9a84c33");

      const labelX = 110;
      const valX = 240;
      let curY = boxY + 28;
      const rowGap = 38;

      const ticketTypeLabel = {
        student: "تذكرة عادية (Standard)",
        guardian: "مرافق (Companion)",
        guest: "مدعو كريم (Guest)",
        vip: "شخصية هامة (VIP)",
      }[attendee.ticketType] || attendee.ticketType;

      const rows = [
        { label: "اسم الضيف الكريم:", val: attendee.fullName },
        { label: "رقم الهوية / الإقامة:", val: attendee.idNumber },
        { label: "فئة الدعوة:", val: ticketTypeLabel },
        { label: "رقم المقعد المخصص:", val: attendee.seatNumber ? `مقعد رقم (${attendee.seatNumber})` : "مقبول عام / مقاعد VIP" },
      ];

      rows.forEach((r, idx) => {
        doc.fillColor("#94a3b8").font("Helvetica", 11);
        doc.text(r.label, labelX, curY, { width: 120, align: "right" });
        doc.fillColor("#f8fafc").font("Helvetica-Bold", 12);
        doc.text(r.val, valX, curY, { width: 260, align: "right" });
        if (idx < rows.length - 1) {
          doc.moveTo(labelX, curY + 24).lineTo(515, curY + 24).lineWidth(0.5).stroke("#2a2a3d");
        }
        curY += rowGap;
      });

      // QR Code Box
      const qrBoxY = 515;
      doc.roundedRect(180, qrBoxY, 235, 215, 12).fill("#171725");
      doc.rect(180, qrBoxY, 235, 215).lineWidth(1).stroke("#c9a84c44");

      const qrBase64 = qrDataUrl.split(",")[1];
      const qrBuffer = Buffer.from(qrBase64, "base64");
      doc.image(qrBuffer, 227.5, qrBoxY + 15, { width: 140, height: 140 });

      doc.fillColor("#e2e8f0").font("Helvetica-Bold", 10);
      doc.text("امسح الرمز عند بوابة الدخول", 0, qrBoxY + 162, { width: 595, align: "center" });

      doc.fillColor("#64748b").font("Helvetica", 8);
      doc.text(`رمز التحقق: ${attendee.qrCode}`, 0, qrBoxY + 185, { width: 595, align: "center" });

      // Footer Note
      doc.fillColor("#64748b").font("Helvetica", 9);
      doc.text("نرجو إبراز هذه البطاقة عند بوابات الاستقبال. جميع الحقوق محفوظة لمدارس العقيق © 2026", 0, 765, { width: 595, align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

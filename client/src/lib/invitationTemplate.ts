export type InvitationTemplateAttendee = {
  fullName: string;
  idNumber: string;
  qrCode: string;
  seatNumber?: string | null;
};

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[character] ?? character);
}

export function buildInvitationCardHtml(attendee: InvitationTemplateAttendee, options: { ceremonyTitle: string; ceremonySubtitle: string; qrDataUrl: string }) {
  return `<div dir="rtl" style="width:720px;padding:42px;background:#13131c;color:#fff;border:4px solid #c9a84c;border-radius:28px;font-family:Arial,sans-serif;text-align:right;box-sizing:border-box"><div style="text-align:center;color:#c9a84c;font-size:22px;font-weight:700">مدارس العقيق الأهلية والدولية</div><div style="text-align:center;color:#a8a8b6;font-size:18px;margin-top:10px">${escapeHtml(options.ceremonyTitle)} — ${escapeHtml(options.ceremonySubtitle)}</div><div style="margin-top:28px;background:#1a1a2e;border:1px solid #554920;border-radius:18px;padding:24px"><div style="display:flex;justify-content:space-between;border-bottom:1px solid #333;padding-bottom:14px;font-size:20px"><span style="color:#a8a8b6">اسم الضيف الكريم:</span><strong>${escapeHtml(attendee.fullName)}</strong></div><div style="display:flex;justify-content:space-between;padding-top:14px;font-size:18px"><span style="color:#a8a8b6">رقم الهوية:</span><span>${escapeHtml(attendee.idNumber)}</span></div><div style="display:flex;justify-content:space-between;padding-top:14px;font-size:18px"><span style="color:#a8a8b6">المقعد:</span><span>${escapeHtml(attendee.seatNumber || "دعوة عامة")}</span></div></div><div style="text-align:center;margin-top:26px"><img src="${escapeHtml(options.qrDataUrl)}" style="width:220px;height:220px;background:#f5f0e8;padding:10px;border-radius:12px"/><div style="color:#c9a84c;font-size:18px;margin-top:12px">${escapeHtml(attendee.qrCode)}</div></div></div>`;
}

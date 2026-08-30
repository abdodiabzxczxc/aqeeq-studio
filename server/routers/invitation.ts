import { z } from "zod";
import { adminCoordinatorProcedure, protectedProcedure, router } from "../_core/trpc";
import { getAttendeeById, getActiveCeremony, getCeremonyById, getSetting } from "../db";
import { generateInvitationPDF } from "../pdf-generator";
import { storageGetSignedUrl } from "../storage";

async function getConfiguredCeremonyLogoUrl() {
  const configured = await getSetting("ceremony_logo");
  if (!configured) return undefined;
  if (configured.startsWith("/manus-storage/")) {
    return storageGetSignedUrl(configured.replace(/^\/manus-storage\//, ""));
  }
  return configured.startsWith("http") ? configured : undefined;
}

async function getInvitationEventInfo(ceremonyId?: number) {
  const ceremony = ceremonyId ? await getCeremonyById(ceremonyId) : await getActiveCeremony();
  return {
    eventTitle: ceremony?.title || await getSetting("event_title") || "منصة إدارة الفعاليات",
    eventSubtitle: ceremony?.subtitle || await getSetting("event_subtitle") || "بطاقة دعوة رسمية",
  };
}

export const invitationRouter = router({
  // Download invitation for authenticated user (self)
  downloadMine: protectedProcedure
    .input(z.object({ attendeeId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const attendee = await getAttendeeById(input.attendeeId);

      if (!attendee) {
        throw new Error("المسجل غير موجود");
      }

      if (ctx.user.role !== "admin" && ctx.user.id !== attendee.createdBy) {
        throw new Error("غير مصرح لك بتحميل هذه الدعوة");
      }

      try {
        const pdfBuffer = await generateInvitationPDF({
          id: attendee.id,
          fullName: attendee.fullName,
          idNumber: attendee.idNumber,
          ticketType: attendee.ticketType,
          qrCode: attendee.qrCode,
          seatNumber: attendee.seatNumber || undefined,
          logoUrl: await getConfiguredCeremonyLogoUrl(),
          ...(await getInvitationEventInfo(attendee.ceremonyId)),
        });

        return {
          success: true,
          pdfBase64: pdfBuffer.toString("base64"),
          filename: `${attendee.fullName}-دعوة.pdf`,
        };
      } catch (error) {
        console.error("[PDF Generation Error]", error);
        throw new Error("فشل في توليد الدعوة الرقمية");
      }
    }),

  // Admin: Download invitation for any attendee
    downloadForAttendee: adminCoordinatorProcedure
    .input(z.object({ attendeeId: z.number() }))
    .query(async ({ input }) => {
      const attendee = await getAttendeeById(input.attendeeId);

      if (!attendee) {
        throw new Error("المسجل غير موجود");
      }

      try {
        const pdfBuffer = await generateInvitationPDF({
          id: attendee.id,
          fullName: attendee.fullName,
          idNumber: attendee.idNumber,
          ticketType: attendee.ticketType,
          qrCode: attendee.qrCode,
          seatNumber: attendee.seatNumber || undefined,
          logoUrl: await getConfiguredCeremonyLogoUrl(),
          ...(await getInvitationEventInfo(attendee.ceremonyId)),
        });

        return {
          success: true,
          pdfBase64: pdfBuffer.toString("base64"),
          filename: `${attendee.fullName}-دعوة.pdf`,
        };
      } catch (error) {
        console.error("[PDF Generation Error]", error);
        throw new Error("فشل في توليد الدعوة الرقمية");
      }
    }),
});

import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getAllSettings, setSetting } from "../db";
import { storagePut } from "../storage";

const SETTING_KEYS = [
  "ceremony_logo",
  "school_logo",
  "event_title",
  "event_subtitle",
  "dashboard_title",
  "dashboard_subtitle",
  "attendee_form_title",
  "attendee_modal_desc",
  "brand_primary",
  "brand_secondary",
  "brand_surface",
  "brand_font",
] as const;
type SettingKey = (typeof SETTING_KEYS)[number];

export const settingsRouter = router({
  // Public read-only endpoint used by the website to render the active logos.
  getPublicLogos: publicProcedure.query(async () => {
    const all = await getAllSettings();
    return {
      ceremony_logo: all.ceremony_logo,
      school_logo: all.school_logo,
      event_title: all.event_title,
      event_subtitle: all.event_subtitle,
      dashboard_title: all.dashboard_title,
      dashboard_subtitle: all.dashboard_subtitle,
      attendee_form_title: all.attendee_form_title,
      attendee_modal_desc: all.attendee_modal_desc,
      brand_primary: all.brand_primary,
      brand_secondary: all.brand_secondary,
      brand_surface: all.brand_surface,
      brand_font: all.brand_font,
    };
  }),

  // Admin-only endpoint for the settings screen.
  getAll: adminProcedure.query(async () => getAllSettings()),

  // Admin-only logo upload/update endpoint.
  update: adminProcedure
    .input(
      z.object({
        key: z.enum(SETTING_KEYS),
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      let value = input.value;

      // Logo files arrive as data URLs from the admin UI, then are persisted in S3.
      if ((input.key === "ceremony_logo" || input.key === "school_logo") && value.startsWith("data:")) {
        const match = value.match(/^data:(image\/(?:png|jpeg|jpg|webp|svg\+xml));base64,(.+)$/);
        if (!match) {
          throw new Error("صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WEBP أو SVG");
        }

        const [, mimeType, encoded] = match;
        const fileBuffer = Buffer.from(encoded, "base64");
        if (fileBuffer.byteLength > 5 * 1024 * 1024) {
          throw new Error("حجم الشعار يجب ألا يتجاوز 5 ميجابايت");
        }

        const extension = mimeType === "image/svg+xml" ? "svg" : mimeType.split("/")[1].replace("jpeg", "jpg");
        const uploaded = await storagePut(`logos/${input.key}.${extension}`, fileBuffer, mimeType);
        value = uploaded.url;
      }

      await setSetting(input.key, value);
      return { success: true, url: value };
    }),
});

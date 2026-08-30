import { getAllSettings, listCustomPages, listPageSections, listPlatformContent, listVisualElementOverrides } from "../db";
import { publicProcedure, router } from "../_core/trpc";

/**
 * Public homepage data is deliberately served as one payload.  The browser must
 * never assemble the first paint from independent queries that resolve at
 * different times, because that causes visible swaps of brand and hero assets.
 */
export const homepageRouter = router({
  publicSnapshot: publicProcedure.query(async () => {
    const [settings, content, overrides, sections, pages] = await Promise.all([
      getAllSettings(),
      listPlatformContent(true),
      listVisualElementOverrides("/", "published"),
      listPageSections("/", "published"),
      listCustomPages("public"),
    ]);

    return { settings, content, overrides, sections, pages };
  }),
});

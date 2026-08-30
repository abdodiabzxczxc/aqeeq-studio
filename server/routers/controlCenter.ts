import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { ensurePlatformContentDefaults, listAuditLogs, listPlatformContent, listPlatformContentHistory, logAudit, resetPlatformContentWithHistory, undoPlatformContentHistory, updatePlatformContentWithHistory } from "../db";
import { contentDefaultByKey } from "../platformContent";

export const controlCenterRouter = router({
  content: router({
    public: publicProcedure.query(async () => {
      await ensurePlatformContentDefaults();
      return listPlatformContent(true);
    }),
    list: adminProcedure.query(async () => {
      await ensurePlatformContentDefaults();
      return listPlatformContent(false);
    }),
    update: adminProcedure.input(z.object({ key: z.string().min(1).max(128), value: z.string().min(1).max(6000) })).mutation(async ({ input, ctx }) => {
      if (!contentDefaultByKey(input.key)) throw new Error("لا يمكن تعديل هذا المفتاح من مركز التحكم");
      const updated = await updatePlatformContentWithHistory(input.key, input.value, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "content.update", details: JSON.stringify({ key: input.key, value: input.value }) });
      return updated;
    }),
    reset: adminProcedure.input(z.object({ key: z.string().min(1).max(128) })).mutation(async ({ input, ctx }) => {
      const updated = await resetPlatformContentWithHistory(input.key, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "content.reset", details: JSON.stringify({ key: input.key }) });
      return updated;
    }),
    history: adminProcedure.input(z.object({ limit: z.number().min(1).max(100).optional() }).optional()).query(({ input }) => listPlatformContentHistory(input?.limit ?? 30)),
    undo: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const updated = await undoPlatformContentHistory(input.id, ctx.user.id);
      await logAudit({ userId: ctx.user.id, userName: ctx.user.name, action: "content.undo", details: JSON.stringify({ historyId: input.id }) });
      return updated;
    }),
  }),
  activity: adminProcedure.input(z.object({ limit: z.number().min(1).max(100).optional() }).optional()).query(({ input }) => listAuditLogs(input?.limit ?? 30)),
});

import { describe, expect, it } from "vitest";
import { getEventLaunchReadiness } from "./eventLaunch";

describe("فحص جاهزية الفعالية", () => {
  it("يرصد متطلبات الموعد والضيوف والبوابات قبل الانطلاق", () => {
    expect(getEventLaunchReadiness({}, 0).readyCount).toBe(0);
    expect(getEventLaunchReadiness({ ceremonyDate: "2026-08-18", venue: "المسرح", gates: "البوابة الرئيسية" }, 12)).toEqual({ items: [{ key: "details", done: true }, { key: "guests", done: true }, { key: "gates", done: true }], readyCount: 3, totalCount: 3 });
  });
});

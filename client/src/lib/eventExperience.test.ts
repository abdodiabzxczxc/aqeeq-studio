import { describe, expect, it } from "vitest";
import { getEventExperience } from "./eventExperience";

const baseEvent = { isActive: true, ceremonyDate: "2026-08-20", venue: "القاعة الكبرى", logoUrl: "logo.png", invitationTitle: "دعوة", sections: "A", gates: "البوابة الرئيسية" };

describe("getEventExperience", () => {
  it("marks a fully prepared event as ready before scans begin", () => {
    const experience = getEventExperience(baseEvent, { total: 12, attended: 0 });
    expect(experience.readiness).toBe(100);
    expect(experience.phase).toBe("ready");
    expect(experience.nextAction.action).toBe("overview");
  });

  it("switches an active event with scans to live mode", () => {
    const experience = getEventExperience(baseEvent, { total: 12, attended: 3 });
    expect(experience.phase).toBe("live");
    expect(experience.nextAction.action).toBe("operations");
    expect(experience.attention.some((item) => item.id === "absent")).toBe(true);
  });

  it("lists the missing setup action for an incomplete event", () => {
    const experience = getEventExperience({ isActive: true }, { total: 0 });
    expect(experience.phase).toBe("preparing");
    expect(experience.nextAction.action).toBe("settings");
    expect(experience.readiness).toBe(0);
  });

  it("archives inactive events regardless of their data", () => {
    const experience = getEventExperience({ ...baseEvent, isActive: false }, { total: 12, attended: 12 });
    expect(experience.phase).toBe("archived");
    expect(experience.nextAction.action).toBe("reports");
  });
});

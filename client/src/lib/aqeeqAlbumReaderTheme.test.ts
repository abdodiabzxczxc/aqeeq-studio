import { describe, expect, it } from "vitest";
import { getAqeeqAlbumSpreadWatermark } from "./aqeeqAlbumReaderTheme";

describe("علامة قارئ ألبوم العقيق", () => {
  it("تظهر كبيرة ومقصوصة من الطرف في وايت مود مع لون الهوية الأصلي", () => {
    expect(getAqeeqAlbumSpreadWatermark({ url: "/logo.png", opacity: 12, tint: "#d6b96a", theme: "light" })).toMatchObject({ scale: 140, opacity: 12, position: "bottom-left", cropLeft: true, tint: "#d6b96a" });
  });

  it("تحول العلامة إلى أبيض في دارك مود", () => {
    expect(getAqeeqAlbumSpreadWatermark({ url: "/logo.png", opacity: 6, tint: "#d6b96a", theme: "dark" })).toMatchObject({ opacity: 10, tint: "#ffffff" });
  });
});

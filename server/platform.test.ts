import { describe, expect, it } from "vitest";
import { generateQrCode } from "./db";

describe("graduation platform primitives", () => {
  it("generates unique QR codes with the platform prefix", () => {
    const first = generateQrCode();
    const second = generateQrCode();
    expect(first).toMatch(/^AQ-[A-Z0-9_-]{12}$/);
    expect(second).toMatch(/^AQ-[A-Z0-9_-]{12}$/);
    expect(first).not.toBe(second);
  });

  it("keeps exported QR identifiers safe for filenames", () => {
    const code = generateQrCode();
    expect(code).not.toMatch(/[\\/:*?"<>|]/);
  });
});

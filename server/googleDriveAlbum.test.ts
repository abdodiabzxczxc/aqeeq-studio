import { describe, expect, it } from "vitest";
import { getDriveMediaType, getGoogleDriveFolderId, mapDriveFileToAlbumMedia, parsePublicDriveFolderHtml } from "./googleDriveAlbum";

describe("Google Drive album import", () => {
  it("يستخرج معرّف فولدر Drive من الروابط الشائعة ويرفض الروابط الخارجية", () => {
    expect(getGoogleDriveFolderId("https://drive.google.com/drive/folders/AQEEQ_2026-Album?usp=sharing")).toBe("AQEEQ_2026-Album");
    expect(getGoogleDriveFolderId("https://drive.google.com/open?id=album-folder_001")).toBe("album-folder_001");
    expect(() => getGoogleDriveFolderId("https://example.com/folders/nope")).toThrow("Google Drive");
  });

  it("يحوّل الصور والفيديوهات فقط إلى وسائط ألبوم قابلة للعرض", () => {
    expect(getDriveMediaType("image/jpeg")).toBe("image");
    expect(getDriveMediaType("video/mp4")).toBe("video");
    expect(getDriveMediaType("application/pdf")).toBeNull();
    expect(mapDriveFileToAlbumMedia({ id: "file_42", name: "لحظة التكريم.jpg", mimeType: "image/jpeg" })).toMatchObject({ driveFileId: "file_42", mediaType: "image", mediaUrl: "/api/drive-proxy/file_42" });
  });

  it("يقرأ أسماء ومعرّفات الصور والفيديوهات من صفحة فولدر عامة دون API Key", () => {
    const html = `<div aria-label="1.png Image Shared" ssk='5:auSv138:1AYSiRxeFYWvcDCLYJDNbFf3KmAmUcGmZ-0-16'></div><div aria-label="تكريم.mp4 Video Shared" ssk='5:auSv138:1M8eVjUALQKhmDmnPkz-Psc5n0vgcpz1m-0-16'></div>`;
    expect(parsePublicDriveFolderHtml(html)).toEqual([
      expect.objectContaining({ driveFileId: "1AYSiRxeFYWvcDCLYJDNbFf3KmAmUcGmZ", fileName: "1.png", mediaType: "image" }),
      expect.objectContaining({ driveFileId: "1M8eVjUALQKhmDmnPkz-Psc5n0vgcpz1m", fileName: "تكريم.mp4", mediaType: "video" }),
    ]);
  });
});

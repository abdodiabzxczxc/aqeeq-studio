import { describe, expect, it } from "vitest";
import { 
  getDriveMediaType, 
  getGoogleDriveFolderId, 
  mapDriveFileToAlbumMedia, 
  parsePublicDriveFolderHtml,
  parsePublicDriveFolderAudioHtml,
  formatSongMetadata,
  SUPPORTED_AUDIO_EXTENSIONS
} from "./googleDriveAlbum";

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

  it("يدعم جميع امتدادات الصوت ويقرأها بدقة من صفحة مجلد Google Drive", () => {
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("mp3")).toBe(true);
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("wav")).toBe(true);
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("m4a")).toBe(true);
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("flac")).toBe(true);
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("ogg")).toBe(true);
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("aac")).toBe(true);
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("opus")).toBe(true);
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("weba")).toBe(true);
    expect(SUPPORTED_AUDIO_EXTENSIONS.has("wma")).toBe(true);

    const mockAudioHtml = `
      <div aria-label="01 - النشيد الوطني السعودي.mp3 Audio Shared" ssk='5:auSv138:1AYSiRxeFYWvcDCLYJDNbFf3KmAmUcGmZ-0-16'></div>
      <div aria-label="كورال العقيق - نشيد التخرج.wav Audio not shared" ssk='5:auSv138:1M8eVjUALQKhmDmnPkz-Psc5n0vgcpz1m-0-16'></div>
      <div aria-label="موسيقى بيانو صباحية.flac" data-id="1K7e9jUALQKhmDmnPkz-Psc5n0vgcpz1x"></div>
      ["1P9e9jUALQKhmDmnPkz-Psc5n0vgcpz1z", ["إذاعة الصباح.m4a"]]
    `;

    const tracks = parsePublicDriveFolderAudioHtml(mockAudioHtml);
    expect(tracks.length).toBe(4);

    expect(tracks[0]).toMatchObject({
      driveFileId: "1AYSiRxeFYWvcDCLYJDNbFf3KmAmUcGmZ",
      title: "النشيد الوطني السعودي",
      extension: "mp3",
      category: "أغنية وطنية",
      mediaUrl: "/api/drive-audio-proxy/1AYSiRxeFYWvcDCLYJDNbFf3KmAmUcGmZ?ext=mp3"
    });

    expect(tracks[1]).toMatchObject({
      driveFileId: "1M8eVjUALQKhmDmnPkz-Psc5n0vgcpz1m",
      title: "نشيد التخرج",
      artist: "كورال العقيق",
      extension: "wav",
      category: "حفل تخرج"
    });

    expect(tracks[2]).toMatchObject({
      driveFileId: "1K7e9jUALQKhmDmnPkz-Psc5n0vgcpz1x",
      title: "موسيقى بيانو صباحية",
      extension: "flac",
      category: "بيانو وهدوء"
    });

    expect(tracks[3]).toMatchObject({
      driveFileId: "1P9e9jUALQKhmDmnPkz-Psc5n0vgcpz1z",
      title: "إذاعة الصباح",
      extension: "m4a",
      category: "طابور الصباح"
    });
  });

  it("ينظف أسماء الملفات ويستخرج العنوان والمنشد والتصنيف بذكاء", () => {
    const meta1 = formatSongMetadata("01 - نشيد_مدارس_العقيق_الرسمي.mp3");
    expect(meta1.title).toBe("نشيد مدارس العقيق الرسمي");
    expect(meta1.category).toBe("النشيد المدرسي");

    const meta2 = formatSongMetadata("فرقة الإنشاد - نشيد الفخر والوطن.wav");
    expect(meta2.title).toBe("نشيد الفخر والوطن");
    expect(meta2.artist).toBe("فرقة الإنشاد");
    expect(meta2.category).toBe("أغنية وطنية");
  });
});

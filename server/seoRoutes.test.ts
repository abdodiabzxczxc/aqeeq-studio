import { describe, it, expect, vi } from "vitest";
import { registerSeoRoutes } from "./seoRoutes";

describe("SEO Routes (/robots.txt and /sitemap.xml)", () => {
  it("serves robots.txt with sitemap directive and admin disallow", async () => {
    let capturedRoute = "";
    let capturedHandler: any = null;

    const mockApp: any = {
      get: vi.fn((route: string, handler: any) => {
        if (route === "/robots.txt") {
          capturedRoute = route;
          capturedHandler = handler;
        }
      }),
    };

    registerSeoRoutes(mockApp);
    expect(capturedRoute).toBe("/robots.txt");

    let responseStatus = 0;
    let responseBody = "";
    const headers: Record<string, string> = {};

    const req: any = {
      protocol: "https",
      get: vi.fn(() => "alaqeeq.edu.sa"),
    };
    const res: any = {
      header: vi.fn((k: string, v: string) => {
        headers[k.toLowerCase()] = v;
      }),
      status: vi.fn((s: number) => {
        responseStatus = s;
        return res;
      }),
      send: vi.fn((body: string) => {
        responseBody = body;
        return res;
      }),
    };

    await capturedHandler(req, res);

    expect(responseStatus).toBe(200);
    expect(headers["content-type"]).toContain("text/plain");
    expect(responseBody).toContain("User-agent: *");
    expect(responseBody).toContain("Disallow: /admin");
    expect(responseBody).toContain("Sitemap: https://alaqeeq.edu.sa/sitemap.xml");
  });

  it("serves sitemap.xml with valid XML structure and core routes", async () => {
    let capturedHandler: any = null;

    const mockApp: any = {
      get: vi.fn((route: string, handler: any) => {
        if (route === "/sitemap.xml") {
          capturedHandler = handler;
        }
      }),
    };

    registerSeoRoutes(mockApp);

    let responseStatus = 0;
    let responseBody = "";
    const headers: Record<string, string> = {};

    const req: any = {
      protocol: "https",
      get: vi.fn(() => "alaqeeq.edu.sa"),
    };
    const res: any = {
      header: vi.fn((k: string, v: string) => {
        headers[k.toLowerCase()] = v;
      }),
      status: vi.fn((s: number) => {
        responseStatus = s;
        return res;
      }),
      send: vi.fn((body: string) => {
        responseBody = body;
        return res;
      }),
    };

    await capturedHandler(req, res);

    expect(responseStatus).toBe(200);
    expect(headers["content-type"]).toContain("application/xml");
    expect(responseBody).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(responseBody).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(responseBody).toContain("/admissions");
    expect(responseBody).toContain("/articles");
    expect(responseBody).toContain("/albums");
    expect(responseBody).toContain("</urlset>");
  });
});

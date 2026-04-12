import { describe, it, expect } from "vitest";
import { getRequestContext } from "@/lib/audit";

describe("getRequestContext", () => {
  function makeRequest(headers: Record<string, string> = {}): Request {
    return new Request("http://localhost/api/test", {
      headers: new Headers(headers),
    });
  }

  it("extracts IP from x-forwarded-for header", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    const ctx = getRequestContext(req);
    expect(ctx.ipAddress).toBe("1.2.3.4");
  });

  it("extracts IP from x-real-ip when x-forwarded-for is missing", () => {
    const req = makeRequest({ "x-real-ip": "10.0.0.1" });
    const ctx = getRequestContext(req);
    expect(ctx.ipAddress).toBe("10.0.0.1");
  });

  it("returns 'unknown' when no IP headers present", () => {
    const req = makeRequest({});
    const ctx = getRequestContext(req);
    expect(ctx.ipAddress).toBe("unknown");
  });

  it("extracts user-agent header", () => {
    const req = makeRequest({ "user-agent": "Mozilla/5.0 Test" });
    const ctx = getRequestContext(req);
    expect(ctx.userAgent).toBe("Mozilla/5.0 Test");
  });

  it("returns 'unknown' when no user-agent present", () => {
    const req = makeRequest({});
    const ctx = getRequestContext(req);
    expect(ctx.userAgent).toBe("unknown");
  });

  it("handles whitespace in x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "  9.8.7.6  , 1.1.1.1" });
    const ctx = getRequestContext(req);
    expect(ctx.ipAddress).toBe("9.8.7.6");
  });
});

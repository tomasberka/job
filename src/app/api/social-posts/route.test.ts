import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("/api/social-posts integration", () => {
  it("returns catalog payload", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(Array.isArray(json.trending)).toBe(true);
    expect(Array.isArray(json.availablePlatforms)).toBe(true);
  });

  it("generates posts payload", async () => {
    const request = new NextRequest("http://localhost/api/social-posts", {
      method: "POST",
      body: JSON.stringify({
        platforms: ["instagram", "facebook"],
        numTopics: 2,
        tones: ["casual"],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(Array.isArray(json.posts)).toBe(true);
    expect(json.posts.length).toBeGreaterThan(0);
    expect(json.automation).toBeTruthy();
  });
});

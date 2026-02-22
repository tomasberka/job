import { NextRequest } from "next/server";
import { GET as getBatchStatus } from "./[batchId]/route";
import { GET as listBatches, POST as createBatch } from "./route";

describe("/api/social-posts/publish integration", () => {
  it("creates a batch and returns it in list + status endpoints", async () => {
    const request = new NextRequest("http://localhost/api/social-posts/publish", {
      method: "POST",
      body: JSON.stringify({
        provider: "meta-suite",
        jobs: [
          {
            assetName: "video-a.mp4",
            assetSizeBytes: 4000,
            assetType: "video",
            platforms: ["instagram", "facebook"],
            caption: "Caption A",
          },
        ],
      }),
    });

    const postResponse = await createBatch(request);
    expect(postResponse.status).toBe(200);

    const postJson = await postResponse.json();
    expect(postJson.batchId).toBeTruthy();

    const listRequest = new NextRequest("http://localhost/api/social-posts/publish?limit=5", {
      method: "GET",
    });

    const listResponse = await listBatches(listRequest);
    expect(listResponse.status).toBe(200);

    const listJson = await listResponse.json();
    expect(listJson.total).toBeGreaterThan(0);

    const statusRequest = new NextRequest(`http://localhost/api/social-posts/publish/${postJson.batchId}`, {
      method: "GET",
    });

    const statusResponse = await getBatchStatus(statusRequest, {
      params: Promise.resolve({ batchId: postJson.batchId }),
    });

    expect(statusResponse.status).toBe(200);

    const statusJson = await statusResponse.json();
    expect(statusJson.batch.batchId).toBe(postJson.batchId);
    expect(statusJson.summary.total).toBeGreaterThan(0);
  });
});

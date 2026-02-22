import {
    SocialPostRequestSchema,
    SocialPublishRequestSchema,
} from "./social-posts-contract";

describe("social-posts-contract", () => {
    it("applies defaults for social post request", () => {
        const parsed = SocialPostRequestSchema.parse({});

        expect(parsed.platforms.length).toBeGreaterThan(0);
        expect(parsed.numTopics).toBe(2);
        expect(parsed.tones).toEqual(["casual", "viral"]);
    });

    it("validates publish request payload", () => {
        const parsed = SocialPublishRequestSchema.parse({
            provider: "meta-suite",
            jobs: [
                {
                    assetName: "promo.mp4",
                    assetSizeBytes: 1024,
                    assetType: "video",
                    platforms: ["instagram", "facebook"],
                    caption: "Caption",
                },
            ],
        });

        expect(parsed.jobs).toHaveLength(1);
        expect(parsed.jobs[0].platforms).toContain("instagram");
    });
});

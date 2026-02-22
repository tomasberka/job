import {
    generateMockSocialPosts,
    getDefaultAutomation,
    getMockTrendingTopics,
} from "./social-posts-mock-generator";

describe("social-posts-mock-generator", () => {
    it("returns trending topics", () => {
        const topics = getMockTrendingTopics();
        expect(topics.length).toBeGreaterThan(0);
        expect(topics[0]).toHaveProperty("keyword");
    });

    it("generates posts for each platform x topic", () => {
        const result = generateMockSocialPosts({
            platforms: ["instagram", "facebook"],
            numTopics: 2,
            tones: ["casual", "professional"],
        });

        expect(result.posts).toHaveLength(4);
        expect(result.automation.readyForScheduling).toBe(true);
        expect(result.modelUsed).toBe("gemini-2.0-flash");
    });

    it("creates default automation for selected targets", () => {
        const automation = getDefaultAutomation(["instagram", "facebook"]);

        expect(automation.publishTargets).toEqual(["instagram", "facebook"]);
        expect(automation.workflowStage).toBe("draft");
    });
});

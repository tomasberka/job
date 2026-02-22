import { Metadata } from "next";
import { SocialPostsGenerator } from "@/features/content-generator/components/social-posts-generator";

export const metadata: Metadata = {
    title: "Trending Social Posts | HelloComp Dashboard",
    description:
        "Generate AI-powered trending social media posts optimized for TikTok, Instagram, Twitter, LinkedIn, and more.",
    openGraph: {
        title: "Trending Social Posts Generator",
        description: "Create professional gaming PC content for social media",
        type: "website",
    },
};

export default function SocialPostsPage() {
    return (
        <div className="space-y-8">
            <div className="pt-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    🎬 Trending Social Posts
                </h1>
                <p className="text-lg text-slate-600 mt-2">
                    Generate AI-powered, human-like posts that leverage real-time gaming trends.
                    Optimized for TikTok, Instagram, Twitter, LinkedIn, YouTube Shorts, and more.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
                {/* Features */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">✨ Features</h3>
                        <ul className="text-sm text-slate-600 space-y-2">
                            <li>✅ Real-time trending topics (gaming, tech, culture)</li>
                            <li>✅ Multi-platform optimization (6 platforms)</li>
                            <li>✅ 5 professional tones (casual, viral, professional, etc.)</li>
                            <li>✅ AI-powered via Google Gemini 2.0</li>
                            <li>✅ Template fallback for offline use</li>
                            <li>✅ One-click copy to clipboard</li>
                            <li>✅ Direct share links</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">🎯 Best For</h3>
                        <ul className="text-sm text-slate-600 space-y-2">
                            <li>• Quick social media content creation</li>
                            <li>• Capturing trending moments fast</li>
                            <li>• Multi-platform posting</li>
                            <li>• A/B testing different tones</li>
                            <li>• SEO-aware marketing posts</li>
                        </ul>
                    </div>
                </div>

                {/* Generator */}
                <div className="lg:col-span-3">
                    <SocialPostsGenerator
                        defaultPlatforms={["tiktok", "instagram", "twitter"]}
                        defaultNumTopics={2}
                    />
                </div>
            </div>

            {/* Usage Guide */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
                <h3 className="font-semibold text-slate-900">📖 How It Works</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="font-semibold text-slate-900 mb-2">1. Configure</p>
                        <p className="text-slate-600">
                            Select platforms (TikTok, Instagram, Twitter, etc.) and number of trending topics to cover.
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 mb-2">2. Generate</p>
                        <p className="text-slate-600">
                            AI analyzes current gaming trends and creates optimized posts for each platform + tone combination.
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 mb-2">3. Share</p>
                        <p className="text-slate-600">
                            Copy posts with one click or post directly to social media. No formatting needed.
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">❓ FAQ</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border border-slate-200">
                        <p className="font-semibold text-sm text-slate-900 mb-2">
                            What makes these posts &quot;professional&quot;?
                        </p>
                        <p className="text-sm text-slate-600">
                            Each post is optimized for platform specifics (length, emoji placement, hashtags),
                            follows HelloComp brand voice, mentions relevant GPUs, and leverages
                            current gaming trends with authentic human language.
                        </p>
                    </div>
                    <div className="p-4 rounded-lg border border-slate-200">
                        <p className="font-semibold text-sm text-slate-900 mb-2">
                            Do I need an API key?
                        </p>
                        <p className="text-sm text-slate-600">
                            No! Posts are generated using AI when you set `GEMINI_API_KEY`.
                            Without it, deterministic templates provide on-brand posts offline.
                        </p>
                    </div>
                    <div className="p-4 rounded-lg border border-slate-200">
                        <p className="font-semibold text-sm text-slate-900 mb-2">
                            Can I edit posts before posting?
                        </p>
                        <p className="text-sm text-slate-600">
                            Yes! Copy to clipboard and edit in your social media editor,
                            or save to drafts for later review and tweaking.
                        </p>
                    </div>
                    <div className="p-4 rounded-lg border border-slate-200">
                        <p className="font-semibold text-sm text-slate-900 mb-2">
                            What trends are tracked?
                        </p>
                        <p className="text-sm text-slate-600">
                            Current topics include: GTA VI, RTX 5090, budget gaming builds,
                            competitive 1440p gaming, PC vs console, and more.
                            Trends update automatically monthly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

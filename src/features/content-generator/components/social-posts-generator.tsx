"use client";

import { motion } from "framer-motion";
import {
    Copy,
    Download,
    ExternalLink,
    Loader2,
    RefreshCw,
    Settings2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    copyPostToClipboard,
    getPlatformEmoji,
    getToneColor,
    useSocialPostsGenerator,
} from "../services/social-posts-service";
import { SocialPost, SocialPlatform } from "../services/social-posts-contract";
import { SocialUploadAutomationStudio } from "./social-upload-automation-studio";

interface SocialPostCardProps {
    post: SocialPost;
    onCopy?: (success: boolean) => void;
}

/**
 * Single social media post card.
 * Shows platform, tone, content, hashtags, and CTAs.
 */
export function SocialPostCard({ post, onCopy }: SocialPostCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyPostToClipboard(post);
        setCopied(true);
        onCopy?.(success);
        setTimeout(() => setCopied(false), 2000);
    };

    const platformUrl: Record<string, string> = {
        tiktok: "https://www.tiktok.com",
        instagram: "https://www.instagram.com",
        twitter: "https://x.com",
        linkedin: "https://www.linkedin.com",
        "youtube-shorts": "https://www.youtube.com/shorts",
        facebook: "https://www.facebook.com",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                    {/* Header: Platform + Tone */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">
                                {getPlatformEmoji(post.platform)}
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-sm capitalize">
                                    {post.platform.replace("-", " ")}
                                </p>
                                <span
                                    className={`text-xs px-2 py-1 rounded ${getToneColor(
                                        post.tone
                                    )}`}
                                >
                                    {post.tone}
                                </span>
                            </div>
                        </div>
                        {post.trendingTopic && (
                            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                                📈 {post.trendingTopic}
                            </span>
                        )}
                    </div>

                    {/* Body */}
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                            {post.body}
                        </p>
                    </div>

                    {/* Hashtags + Emoji */}
                    <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((tag, i) => (
                            <span
                                key={i}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                        {post.emojis.length > 0 && (
                            <div className="flex gap-1">
                                {post.emojis.map((emoji, i) => (
                                    <span key={i} className="text-base">
                                        {emoji}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    {post.cta && (
                        <div className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2">
                            {post.cta}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopy}
                            className="flex-1"
                        >
                            {copied ? (
                                <>
                                    ✓ <span className="ml-1">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span className="ml-1">Copy</span>
                                </>
                            )}
                        </Button>
                        <a
                            href={platformUrl[post.platform] || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span className="ml-1">Post</span>
                        </a>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-slate-500 pt-1">
                        Generated: {new Date(post.createdAt).toLocaleString()}
                        {post.gpuMention && ` • GPU: ${post.gpuMention}`}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

interface SocialPostsGridProps {
    posts?: SocialPost[];
    isLoading?: boolean;
    error?: Error | null;
    onRetry?: () => void;
}

/**
 * Grid display for multiple social posts.
 */
export function SocialPostsGrid({
    posts = [],
    isLoading = false,
    error = null,
    onRetry,
}: SocialPostsGridProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                    <p className="text-sm text-slate-600">Generating trending posts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="space-y-2 text-center">
                        <p className="text-sm font-semibold text-red-900">
                            Error generating posts
                        </p>
                        <p className="text-xs text-red-700">{error.message}</p>
                        {onRetry && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onRetry}
                                className="mt-3"
                            >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Try Again
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Card className="p-6 text-center bg-slate-50">
                    <p className="text-sm text-slate-600">
                        No posts generated yet. Click &quot;Generate&quot; to create trending content.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
                <SocialPostCard key={i} post={post} />
            ))}
        </div>
    );
}

interface SocialPostsGeneratorProps {
    defaultPlatforms?: SocialPlatform[];
    defaultNumTopics?: number;
}

/**
 * Full social posts generator component with settings and controls.
 */
export function SocialPostsGenerator({
    defaultPlatforms = ["tiktok", "instagram", "twitter"],
    defaultNumTopics = 2,
}: SocialPostsGeneratorProps) {
    const [platforms, setPlatforms] = useState<SocialPlatform[]>(defaultPlatforms);
    const [numTopics, setNumTopics] = useState(defaultNumTopics);
    const [showSettings, setShowSettings] = useState(false);
    const [bossMode, setBossMode] = useState(false);

    const {
        data: result,
        isLoading,
        error,
        refetch,
        isFetching,
    } = useSocialPostsGenerator({
        platforms,
        numTopics,
        enabled: false, // manual trigger only
    });

    const handleGenerate = () => {
        refetch();
    };

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const buildMetaSuiteCsv = (posts: SocialPost[]) => {
        const header = [
            "platform",
            "message",
            "hashtags",
            "cta",
            "publish_time",
            "asset_url",
        ];

        const rows = posts
            .filter((post) => post.platform === "instagram" || post.platform === "facebook")
            .map((post) => [
                post.platform,
                post.body,
                post.hashtags.join(" "),
                post.cta || "",
                "",
                "",
            ]);

        return [header, ...rows].map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
    };

    const downloadMetaSuiteCsv = () => {
        const posts = result?.posts ?? [];
        const csv = buildMetaSuiteCsv(posts);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `meta-suite-upload-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const copyMetaCaptionBundle = async () => {
        const posts = (result?.posts ?? []).filter(
            (post) => post.platform === "instagram" || post.platform === "facebook"
        );

        const payload = posts
            .map(
                (post, index) =>
                    `${index + 1}. [${post.platform.toUpperCase()}] ${post.title}\n${post.body}\n${post.hashtags.join(" ")}\nCTA: ${post.cta || ""}`
            )
            .join("\n\n---\n\n");

        await navigator.clipboard.writeText(payload || "No Meta-ready posts generated yet.");
    };

    const availablePlatforms: Array<{ id: SocialPlatform; label: string }> = [
        { id: "tiktok", label: "🎵 TikTok" },
        { id: "instagram", label: "📸 Instagram" },
        { id: "twitter", label: "𝕏 Twitter" },
        { id: "linkedin", label: "💼 LinkedIn" },
        { id: "youtube-shorts", label: "▶️ YouTube Shorts" },
        { id: "facebook", label: "👍 Facebook" },
    ];

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">🚀 Trending Social Posts</h2>
                        <p className="text-sm text-slate-600 mt-1">
                            AI-powered posts optimized for real-time trends across platforms
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setBossMode((prev) => !prev)}
                        >
                            {bossMode ? "Disable Boss Mode" : "Enable Boss Mode"}
                        </Button>

                        {!bossMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSettings(!showSettings)}
                            >
                                <Settings2 className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="p-4 bg-slate-50 border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">🎯 Guided demo flow</p>
                    <ol className="mt-2 space-y-1 text-xs text-slate-700 list-decimal pl-4">
                        <li>Generate fresh trend posts</li>
                        <li>Open Social Upload Studio and attach videos</li>
                        <li>Prepare batch and open Meta Business Suite</li>
                    </ol>
                </Card>

                {/* Settings Panel */}
                {!bossMode && showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4"
                    >
                        {/* Platform Selection */}
                        <div>
                            <label className="text-sm font-semibold text-slate-900 mb-2 block">
                                Platforms
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availablePlatforms.map((p) => (
                                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={platforms.includes(p.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setPlatforms([...platforms, p.id]);
                                                } else {
                                                    setPlatforms(
                                                        platforms.filter((x) => x !== p.id)
                                                    );
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-sm">{p.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Topics Selection */}
                        <div>
                            <label className="text-sm font-semibold text-slate-900 mb-2 block">
                                Trending Topics: {numTopics}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={numTopics}
                                onChange={(e) => setNumTopics(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-xs text-slate-600 mt-1">
                                More topics = more posts (exponential)
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Generate Button */}
                <Button
                    onClick={handleGenerate}
                    disabled={isLoading || isFetching || platforms.length === 0}
                    size="lg"
                    className="w-full"
                >
                    {isLoading || isFetching ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generate Trending Posts
                        </>
                    )}
                </Button>
            </div>

            {/* Trending Topics Info */}
            {!bossMode && result?.trendingTopics && result.trendingTopics.length > 0 && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-blue-900">📈 Topics:</p>
                        <div className="flex flex-wrap gap-2">
                            {result.trendingTopics.map((topic, i) => (
                                <div
                                    key={i}
                                    className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200"
                                >
                                    {topic.keyword}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                            ⏱️ Generated in {result.generationTimeMs}ms using {result.modelUsed}
                        </p>
                        {result.automation && (
                            <div className="mt-2 rounded border border-blue-200 bg-white p-2.5">
                                <p className="text-xs font-semibold text-slate-800">⚙️ Automation pipeline</p>
                                <p className="mt-1 text-xs text-slate-600">
                                    {result.automation.pipeline.join(" → ")}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Stage: <span className="font-semibold capitalize">{result.automation.workflowStage}</span>
                                    {" • "}
                                    Scheduling ready: {result.automation.readyForScheduling ? "yes" : "no"}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {!bossMode && result?.posts && result.posts.length > 0 && (
                <Card className="p-4 border-slate-200 bg-white">
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">📤 Meta Suite Upload Automation</p>
                            <p className="text-xs text-slate-600 mt-1">
                                Export ready captions for Instagram/Facebook, then upload media in Meta Business Suite.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={downloadMetaSuiteCsv}>
                                <Download className="w-4 h-4 mr-1" />
                                Export Meta CSV
                            </Button>

                            <Button size="sm" variant="outline" onClick={copyMetaCaptionBundle}>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy Caption Bundle
                            </Button>

                            <a
                                href="https://business.facebook.com/latest/content_calendar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Open Meta Suite
                            </a>
                        </div>
                    </div>
                </Card>
            )}

            <SocialUploadAutomationStudio generatedPosts={result?.posts} />

            {/* Posts Grid */}
            <SocialPostsGrid
                posts={result?.posts}
                isLoading={isLoading || isFetching}
                error={error}
                onRetry={handleGenerate}
            />
        </div>
    );
}

"use client";

import { UploadCloud, Video, CalendarClock, Rocket, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    type SocialPlatform,
    type SocialPost,
    type SocialPublishResponse,
} from "../services/social-posts-contract";
import { SocialPostsClient } from "../services/social-posts-service";

interface SocialUploadAutomationStudioProps {
    generatedPosts?: SocialPost[];
}

type UploadDraft = {
    id: string;
    file: File;
    platforms: SocialPlatform[];
    caption: string;
    scheduledAt?: string;
};

const META_DEFAULT_PLATFORMS: SocialPlatform[] = ["instagram", "facebook"];

export function SocialUploadAutomationStudio({ generatedPosts = [] }: SocialUploadAutomationStudioProps) {
    const [drafts, setDrafts] = useState<UploadDraft[]>([]);
    const [provider, setProvider] = useState<"meta-suite" | "multi-platform">("meta-suite");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<SocialPublishResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const client = new SocialPostsClient();

    const defaultCaption = useMemo(() => {
        const first = generatedPosts[0];
        if (!first) return "";
        return `${first.body}\n\n${first.hashtags.join(" ")}`;
    }, [generatedPosts]);

    const onFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);

        const newDrafts: UploadDraft[] = files.map((file, index) => ({
            id: `${file.name}_${Date.now()}_${index}`,
            file,
            platforms: provider === "meta-suite" ? META_DEFAULT_PLATFORMS : ["instagram", "facebook", "tiktok"],
            caption: defaultCaption || `Nové video: ${file.name}`,
            scheduledAt: "",
        }));

        setDrafts((prev) => [...prev, ...newDrafts]);
        event.target.value = "";
    };

    const updateDraft = (id: string, patch: Partial<UploadDraft>) => {
        setDrafts((prev) => prev.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)));
    };

    const removeDraft = (id: string) => {
        setDrafts((prev) => prev.filter((draft) => draft.id !== id));
    };

    const togglePlatform = (draft: UploadDraft, platform: SocialPlatform) => {
        const exists = draft.platforms.includes(platform);
        if (exists) {
            updateDraft(draft.id, {
                platforms: draft.platforms.filter((item) => item !== platform),
            });
            return;
        }

        updateDraft(draft.id, {
            platforms: [...draft.platforms, platform],
        });
    };

    const submitBatch = async () => {
        try {
            setError(null);
            setIsSubmitting(true);

            const payload = {
                provider,
                jobs: drafts.map((draft) => ({
                    assetName: draft.file.name,
                    assetSizeBytes: draft.file.size,
                    assetType: "video" as const,
                    platforms: draft.platforms,
                    caption: draft.caption,
                    scheduledAt: draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : undefined,
                })),
            };

            const response = await client.createPublishBatch(payload);
            setResult(response);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Failed to prepare upload batch.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const platforms: SocialPlatform[] = [
        "instagram",
        "facebook",
        "tiktok",
        "youtube-shorts",
        "twitter",
        "linkedin",
    ];

    return (
        <Card className="p-5 border-slate-200 bg-white space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">🎥 Social Upload Studio</h3>
                    <p className="text-xs text-slate-600 mt-1">
                        Upload videos, attach captions, choose platforms and prepare automated publish batch.
                    </p>
                </div>

                <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
                    <button
                        type="button"
                        className={`px-2.5 py-1 text-xs rounded ${provider === "meta-suite" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
                        onClick={() => setProvider("meta-suite")}
                    >
                        Meta Suite
                    </button>
                    <button
                        type="button"
                        className={`px-2.5 py-1 text-xs rounded ${provider === "multi-platform" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
                        onClick={() => setProvider("multi-platform")}
                    >
                        Multi-platform
                    </button>
                </div>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-700 hover:bg-slate-100">
                <UploadCloud className="h-4 w-4" />
                <span>Add video files</span>
                <input type="file" accept="video/*" multiple className="hidden" onChange={onFileAdd} />
            </label>

            {drafts.length === 0 && (
                <p className="text-xs text-slate-500">No videos yet. Upload files to start automation batch.</p>
            )}

            <div className="space-y-3">
                {drafts.map((draft) => (
                    <div key={draft.id} className="rounded-lg border border-slate-200 p-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900 truncate">{draft.file.name}</p>
                            <button
                                type="button"
                                className="text-xs text-slate-500 hover:text-red-600"
                                onClick={() => removeDraft(draft.id)}
                            >
                                Remove
                            </button>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {(draft.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                            <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> optional schedule</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {platforms.map((platform) => {
                                const active = draft.platforms.includes(platform);
                                return (
                                    <button
                                        key={platform}
                                        type="button"
                                        onClick={() => togglePlatform(draft, platform)}
                                        className={`rounded px-2 py-1 text-xs border ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}
                                    >
                                        {platform}
                                    </button>
                                );
                            })}
                        </div>

                        <textarea
                            className="w-full min-h-20 rounded border border-slate-200 p-2 text-sm"
                            value={draft.caption}
                            onChange={(event) => updateDraft(draft.id, { caption: event.target.value })}
                            placeholder="Caption for this video"
                        />

                        <input
                            type="datetime-local"
                            className="w-full rounded border border-slate-200 px-2 py-2 text-sm"
                            value={draft.scheduledAt || ""}
                            onChange={(event) => updateDraft(draft.id, { scheduledAt: event.target.value })}
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={submitBatch}
                    disabled={isSubmitting || drafts.length === 0 || drafts.some((item) => item.platforms.length === 0 || !item.caption.trim())}
                >
                    {isSubmitting ? "Preparing batch..." : "Prepare Automation Batch"}
                    <Rocket className="ml-1 h-4 w-4" />
                </Button>

                <a
                    href="https://business.facebook.com/latest/content_calendar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                    Open Meta Business Suite
                </a>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {result && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                    <p className="text-sm font-semibold text-emerald-900 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Batch ready: {result.batchId}
                    </p>
                    <p className="text-xs text-emerald-800">
                        {result.summary.total} jobs prepared via {result.summary.provider}. Queued: {result.summary.queued}
                    </p>
                    <ul className="text-xs text-emerald-800 list-disc pl-5 space-y-1">
                        {result.nextSteps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
}

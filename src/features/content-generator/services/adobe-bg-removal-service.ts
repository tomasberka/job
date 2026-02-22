import { z } from "zod";

const RemoveBackgroundInputSchema = z.object({
    imageUrl: z.string().url(),
    outputFormat: z.enum(["png", "jpeg", "webp"]).optional(),
});

export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

type RemoveBackgroundResult = {
    provider: "adobe";
    outputImageUrl?: string;
    outputImageDataUrl?: string;
    mimeType?: string;
};

export class AdobeBgRemovalError extends Error {
    constructor(message: string, public status = 500) {
        super(message);
        this.name = "AdobeBgRemovalError";
    }
}

function readRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
        throw new AdobeBgRemovalError(`Missing required environment variable: ${name}`, 503);
    }
    return value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.floor(parsed);
}

function inferExtensionFromMime(mimeType: string): string {
    if (mimeType.includes("png")) return "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
    if (mimeType.includes("webp")) return "webp";
    return "bin";
}

function extractFirstUrl(value: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === "string") {
        const candidate = value.trim();
        if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
            return candidate;
        }
        return undefined;
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            const found = extractFirstUrl(item);
            if (found) return found;
        }
        return undefined;
    }
    if (typeof value === "object") {
        const objectValue = value as Record<string, unknown>;
        for (const objectKey of Object.keys(objectValue)) {
            const found = extractFirstUrl(objectValue[objectKey]);
            if (found) return found;
        }
    }
    return undefined;
}

function arrayBufferToDataUrl(buffer: ArrayBuffer, mimeType: string): string {
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${mimeType};base64,${base64}`;
}

function isHostAllowed(rawUrl: string): boolean {
    const allowedHosts = process.env.ADOBE_BG_REMOVE_ALLOWED_HOSTS;
    if (!allowedHosts || allowedHosts.trim().length === 0) return true;

    let host: string;
    let hostname: string;
    try {
        const parsed = new URL(rawUrl);
        host = parsed.host;
        hostname = parsed.hostname;
    } catch {
        return false;
    }

    const entries = allowedHosts
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    return entries.some((entry) => {
        if (entry.startsWith("*.")) {
            const base = entry.slice(2);
            return hostname === base || hostname.endsWith(`.${base}`);
        }
        return entry === host || entry === hostname;
    });
}

export async function removeBackgroundWithAdobe(rawInput: RemoveBackgroundInput): Promise<RemoveBackgroundResult> {
    const enabled = process.env.ADOBE_BG_REMOVE_ENABLED === "true";
    if (!enabled) {
        throw new AdobeBgRemovalError(
            "Background removal is disabled. Set ADOBE_BG_REMOVE_ENABLED=true to activate.",
            503,
        );
    }

    const input = RemoveBackgroundInputSchema.parse(rawInput);
    if (!isHostAllowed(input.imageUrl)) {
        throw new AdobeBgRemovalError("Image host is not allowed for background removal.", 403);
    }
    const apiUrl = readRequiredEnv("ADOBE_BG_REMOVE_API_URL");
    const apiKey = readRequiredEnv("ADOBE_API_KEY");
    const apiKeyHeaderName = process.env.ADOBE_API_KEY_HEADER || "x-api-key";
    const imageFieldName = process.env.ADOBE_BG_REMOVE_IMAGE_FIELD || "image";
    const timeoutMs = parsePositiveInt(process.env.ADOBE_BG_REMOVE_TIMEOUT_MS, 30000);
    const maxBytes = parsePositiveInt(process.env.ADOBE_BG_REMOVE_MAX_INPUT_BYTES, 15_000_000);

    const sourceResponse = await fetch(input.imageUrl, {
        cache: "no-store",
    });

    if (!sourceResponse.ok) {
        throw new AdobeBgRemovalError(
            `Failed to download source image (${sourceResponse.status} ${sourceResponse.statusText})`,
            400,
        );
    }

    const sourceMimeType = sourceResponse.headers.get("content-type") || "application/octet-stream";
    if (!sourceMimeType.startsWith("image/")) {
        throw new AdobeBgRemovalError("Provided imageUrl does not point to an image resource.", 400);
    }

    const sourceBytes = await sourceResponse.arrayBuffer();
    if (sourceBytes.byteLength > maxBytes) {
        throw new AdobeBgRemovalError(
            `Input image is too large (${sourceBytes.byteLength} bytes). Max allowed is ${maxBytes} bytes.`,
            413,
        );
    }

    const fileExtension = inferExtensionFromMime(sourceMimeType);
    const requestFormData = new FormData();
    requestFormData.set(
        imageFieldName,
        new Blob([sourceBytes], { type: sourceMimeType }),
        `source.${fileExtension}`,
    );

    const effectiveOutputFormat = input.outputFormat || process.env.ADOBE_BG_REMOVE_OUTPUT_FORMAT;
    const outputFormatFieldName = process.env.ADOBE_BG_REMOVE_OUTPUT_FORMAT_FIELD || "output_format";
    if (effectiveOutputFormat) {
        requestFormData.set(outputFormatFieldName, effectiveOutputFormat);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let adobeResponse: Response;
    try {
        adobeResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
                [apiKeyHeaderName]: apiKey,
            },
            body: requestFormData,
            signal: controller.signal,
            cache: "no-store",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "unknown request error";
        throw new AdobeBgRemovalError(`Adobe request failed: ${message}`, 502);
    } finally {
        clearTimeout(timeout);
    }

    if (!adobeResponse.ok) {
        const errorBody = await adobeResponse.text();
        throw new AdobeBgRemovalError(
            `Adobe API error (${adobeResponse.status} ${adobeResponse.statusText}): ${errorBody.slice(0, 400)}`,
            502,
        );
    }

    const responseContentType = adobeResponse.headers.get("content-type") || "application/octet-stream";

    if (responseContentType.startsWith("application/json")) {
        const payload = (await adobeResponse.json()) as unknown;
        const outputImageUrl = extractFirstUrl(payload);
        if (!outputImageUrl) {
            throw new AdobeBgRemovalError("Adobe JSON response did not include an output image URL.", 502);
        }
        return {
            provider: "adobe",
            outputImageUrl,
            mimeType: "application/json",
        };
    }

    if (responseContentType.startsWith("image/")) {
        const outputBytes = await adobeResponse.arrayBuffer();
        return {
            provider: "adobe",
            outputImageDataUrl: arrayBufferToDataUrl(outputBytes, responseContentType),
            mimeType: responseContentType,
        };
    }

    const fallbackBody = await adobeResponse.text();
    throw new AdobeBgRemovalError(
        `Unsupported Adobe response content-type: ${responseContentType}. Body preview: ${fallbackBody.slice(0, 200)}`,
        502,
    );
}

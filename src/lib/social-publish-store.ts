import { promises as fs } from "node:fs";
import path from "node:path";
import {
  type SocialPublishBatch,
  type SocialPublishBatchStatusResponse,
  SocialPublishBatchSchema,
} from "@/features/content-generator/services/social-posts-contract";

type StoreShape = {
  batches: SocialPublishBatch[];
};

const STORE_PATH = path.join(process.cwd(), "data", "social-publish-batches.json");
const MAX_BATCHES = 20;

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    const initial: StoreShape = { batches: [] };
    await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore(): Promise<StoreShape> {
  await ensureStoreFile();
  const content = await fs.readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(content) as StoreShape;
  return {
    batches: Array.isArray(parsed.batches)
      ? parsed.batches.map((batch) => SocialPublishBatchSchema.parse(batch))
      : [],
  };
}

async function writeStore(store: StoreShape) {
  await ensureStoreFile();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function savePublishBatch(batch: SocialPublishBatch) {
  const store = await readStore();
  const next = [batch, ...store.batches.filter((item) => item.batchId !== batch.batchId)].slice(0, MAX_BATCHES);
  await writeStore({ batches: next });
}

export async function listPublishBatches(limit = MAX_BATCHES) {
  const store = await readStore();
  return store.batches.slice(0, Math.max(1, Math.min(limit, MAX_BATCHES)));
}

export async function getPublishBatch(batchId: string) {
  const store = await readStore();
  return store.batches.find((item) => item.batchId === batchId) ?? null;
}

function resolveJobStatus(batchCreatedAt: string, currentStatus: SocialPublishBatch["jobs"][number]["status"], scheduledAt?: string) {
  if (scheduledAt) {
    const scheduleDate = new Date(scheduledAt).getTime();
    if (!Number.isNaN(scheduleDate) && scheduleDate > Date.now()) {
      return "scheduled" as const;
    }
  }

  if (currentStatus === "failed") return currentStatus;

  const ageMs = Date.now() - new Date(batchCreatedAt).getTime();

  if (ageMs < 20_000) return "queued" as const;
  if (ageMs < 50_000) return "processing" as const;
  return "published" as const;
}

export async function resolveBatchStatus(batchId: string): Promise<SocialPublishBatchStatusResponse | null> {
  const batch = await getPublishBatch(batchId);
  if (!batch) return null;

  const updatedJobs = batch.jobs.map((job) => ({
    ...job,
    status: resolveJobStatus(batch.createdAt, job.status, job.scheduledAt),
  }));

  const updatedBatch: SocialPublishBatch = {
    ...batch,
    jobs: updatedJobs,
    updatedAt: new Date().toISOString(),
  };

  await savePublishBatch(updatedBatch);

  const summary = {
    total: updatedJobs.length,
    queued: updatedJobs.filter((job) => job.status === "queued").length,
    processing: updatedJobs.filter((job) => job.status === "processing").length,
    scheduled: updatedJobs.filter((job) => job.status === "scheduled").length,
    published: updatedJobs.filter((job) => job.status === "published").length,
    failed: updatedJobs.filter((job) => job.status === "failed").length,
  };

  return {
    batch: updatedBatch,
    summary,
  };
}

import type { AdapterModel } from "@paperclipai/adapter-utils";

let cached: { until: number; models: AdapterModel[] } | undefined;
let pending: Promise<AdapterModel[]> | undefined;

/** OpenCode Go's public catalog does not require access to anyone's credentials. */
export async function listOpenCodeGoModels(refresh = false): Promise<AdapterModel[]> {
  if (!refresh && cached && cached.until > Date.now()) return cached.models;
  if (pending) return pending;
  pending = (async () => {
    const response = await fetch("https://opencode.ai/zen/go/v1/models", { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error("Could not load OpenCode Go models. Retry or enter a model ID manually.");
    const body = await response.json() as { data?: Array<{ id?: unknown; name?: unknown }> };
    if (!Array.isArray(body.data)) throw new Error("OpenCode Go returned an invalid model catalog.");
    const models = body.data.flatMap(model => typeof model.id === "string" && model.id.trim()
      ? [{ id: `opencode-go/${model.id.trim()}`, label: typeof model.name === "string" && model.name.trim() ? model.name : model.id.trim() }]
      : []);
    cached = { until: Date.now() + 60_000, models };
    return models;
  })();
  try { return await pending; } finally { pending = undefined; }
}

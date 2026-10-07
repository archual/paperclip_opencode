import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it("lists and caches the public OpenCode Go catalog with prefixed ids and no credentials", async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [
    { id: "deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash" },
    { id: "kimi-k3", name: "Kimi K3" },
    { id: 42 },
    { id: "   " },
  ] }) });
  vi.stubGlobal("fetch", fetch);
  const { listOpenCodeGoModels } = await import("./opencode-go-models.js");
  expect(await listOpenCodeGoModels()).toEqual([
    { id: "opencode-go/deepseek-v4.1-flash", label: "DeepSeek V4.1 Flash" },
    { id: "opencode-go/kimi-k3", label: "Kimi K3" },
  ]);
  await listOpenCodeGoModels();
  expect(fetch).toHaveBeenCalledTimes(1);
  // The public catalog needs no authorization, so no credential headers go out.
  expect(fetch).toHaveBeenCalledWith("https://opencode.ai/zen/go/v1/models", { signal: expect.any(AbortSignal) });
  expect(fetch.mock.calls[0]?.[1]).toEqual({ signal: expect.any(AbortSignal) });
  await listOpenCodeGoModels(true);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("falls back to the raw id when a catalog entry has no name", async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [{ id: "hy3" }] }) });
  vi.stubGlobal("fetch", fetch);
  const { listOpenCodeGoModels } = await import("./opencode-go-models.js");
  expect(await listOpenCodeGoModels()).toEqual([{ id: "opencode-go/hy3", label: "hy3" }]);
});

it("allows retry after a public catalog failure", async () => {
  const fetch = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
  vi.stubGlobal("fetch", fetch);
  const { listOpenCodeGoModels } = await import("./opencode-go-models.js");
  await expect(listOpenCodeGoModels()).rejects.toThrow("Retry or enter a model ID manually");
  await expect(listOpenCodeGoModels()).resolves.toEqual([]);
});

import { describe, expect, it } from "vitest";
import { defaultAiConnectionForHire } from "./agent-ai-connection-default.js";

const pool = { mode: "router", connectionId: "11111111-1111-4111-8111-111111111111" } as const;
const shared = {
  provider: "opencode-go", method: "api_key", mode: "shared",
  connectionId: "11111111-1111-4111-8111-111111111111", grantId: "22222222-2222-4222-8222-222222222222",
} as const;
const responsible = { provider: "opencode-go", method: "api_key", mode: "responsible_user" } as const;
const openCodeModel = "opencode-go/deepseek-v4.1-flash";

describe("defaultAiConnectionForHire OpenCode child auth", () => {
  it("does not inherit a pool when the OpenCode child brings either key family", () => {
    // The OpenCode harness reads both families. A child that brings either key
    // must keep it: inheriting the pool binding would strip it at runtime.
    expect(defaultAiConnectionForHire("opencode_local", { env: { OPENROUTER_API_KEY: "fixture" } }, pool)).toBeUndefined();
    expect(defaultAiConnectionForHire("opencode_local", { env: { OPENCODE_API_KEY: "fixture" } }, pool)).toBeUndefined();
    expect(defaultAiConnectionForHire("paperclip_runner", { provider: "opencode", env: { OPENROUTER_API_KEY: "fixture" } }, pool)).toBeUndefined();
    expect(defaultAiConnectionForHire("paperclip_runner", { provider: "opencode", env: { OPENCODE_API_KEY: "fixture" } }, pool)).toBeUndefined();
  });

  it("does not inherit a shared OpenCode binding when the child brings either key family", () => {
    expect(defaultAiConnectionForHire("opencode_local", { env: { OPENROUTER_API_KEY: "fixture" } }, shared)).toBeUndefined();
    expect(defaultAiConnectionForHire("opencode_local", { env: { OPENCODE_API_KEY: "fixture" } }, shared)).toBeUndefined();
  });

  it("does not inherit a responsible_user OpenCode binding when the child brings either key family", () => {
    expect(defaultAiConnectionForHire("opencode_local", { model: openCodeModel, env: { OPENROUTER_API_KEY: "fixture" } }, responsible)).toBeUndefined();
    expect(defaultAiConnectionForHire("opencode_local", { model: openCodeModel, env: { OPENCODE_API_KEY: "fixture" } }, responsible)).toBeUndefined();
  });

  it("still inherits a compatible OpenCode binding when the child carries no provider auth", () => {
    expect(defaultAiConnectionForHire("opencode_local", { env: { KEEP: "fixture" } }, pool)).toEqual(pool);
    expect(defaultAiConnectionForHire("opencode_local", { env: { KEEP: "fixture" } }, shared)).toEqual(shared);
    expect(defaultAiConnectionForHire("opencode_local", { model: openCodeModel, env: { KEEP: "fixture" } }, responsible)).toEqual(responsible);
  });
});

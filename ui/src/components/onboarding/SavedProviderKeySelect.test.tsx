// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { aiConnectionsApi } from "@/api/ai-connections";
import { secretsApi } from "@/api/secrets";
import { useSavedProviderKeys } from "./SavedProviderKeySelect";

vi.mock("@/api/ai-connections", () => ({ aiConnectionsApi: { list: vi.fn() } }));
vi.mock("@/api/secrets", () => ({ secretsApi: { listMyUserSecrets: vi.fn(), list: vi.fn() } }));
vi.mock("@/api/agents", () => ({ agentsApi: { getClaudeOAuthTokenStatus: vi.fn() } }));

let root: Root | undefined;
let client: QueryClient | undefined;
let result: ReturnType<typeof useSavedProviderKeys> | undefined;

beforeEach(() => {
  vi.mocked(secretsApi.listMyUserSecrets).mockResolvedValue([]);
  vi.mocked(secretsApi.list).mockResolvedValue([]);
});

afterEach(async () => {
  await act(async () => root?.unmount());
  client?.clear();
  vi.resetAllMocks();
});

async function mount(envKey: string) {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  root = createRoot(document.createElement("div"));
  function Probe() {
    result = useSavedProviderKeys("company", envKey);
    return null;
  }
  await act(async () => root!.render(<QueryClientProvider client={client!}><Probe /></QueryClientProvider>));
}

it("surfaces a saved OpenCode Go account for the opencode_local env key", async () => {
  vi.mocked(aiConnectionsApi.list).mockResolvedValue({
    currentUserId: "you",
    canManageConnections: true,
    connections: [{
      id: "go-connection", grantId: "go-grant", companyId: "company", provider: "opencode-go", method: "api_key",
      name: "My OpenCode Go API", ownership: "personal", ownerUserId: "you", isDefault: true, status: "connected",
    }],
  });

  await mount("OPENCODE_API_KEY");

  await vi.waitFor(() => expect(result?.options).toHaveLength(1));
  expect(aiConnectionsApi.list).toHaveBeenCalledWith("company");
  expect(result?.options[0]).toMatchObject({
    id: "ai:go-grant",
    label: "My OpenCode Go API (Your default)",
    aiConnection: { provider: "opencode-go", method: "api_key", mode: "responsible_user" },
  });
});

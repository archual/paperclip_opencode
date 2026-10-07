export const type = "opencode_local";
export const label = "OpenCode";

// Use OpenCode's official installer instead of `npm install -g opencode-ai`.
// The npm package reifies four large Linux x64 prebuilt-binary subpackages
// (linux-x64, linux-x64-musl, linux-x64-baseline, linux-x64-baseline-musl) in
// parallel even though only one matches the sandbox; on bandwidth-constrained
// sandboxes (e.g. Cloudflare) that exceeded the 240s install budget. The
// official installer fetches a single arch-specific binary into
// `$HOME/.opencode/bin` and tries to add it to PATH via `~/.bashrc`. That
// rc-file path is only sourced by interactive/login shells, so non-login
// `sh -c` probe invocations (used by the runtime PATH check) cannot find the
// binary. We fix that by symlinking the installed binary into a directory on
// the non-login `sh -c` PATH: prefer `/usr/local/bin` (universally on the
// default PATH on Linux distros) when root or passwordless sudo is available,
// otherwise fall back to `$HOME/.local/bin` (which is on the default PATH on
// the exe.dev sandbox image and most modern home-managed Linux images).
//
// Security tradeoff: this is `curl | bash` without a SHA-256 verification of
// the install script. We accept this because:
//   1. The install runs inside an isolated, ephemeral sandbox — blast radius
//      is bounded to that sandbox's secrets and disk.
//   2. The prior `npm install -g opencode-ai` is also unverified code
//      execution from a third-party registry; this is not strictly worse.
//   3. OpenCode does not publish per-release SHA-256 checksums in a stable
//      location, and pinning a version + hash here would require manual
//      version bumps on every OpenCode release.
// The `set -e` (implied by Bash's default with `-fsSL` upstream of a piped
// shell) and `curl -fsSL` give us fail-fast behavior on HTTP errors. If
// OpenCode starts publishing a stable checksum/signature, switch to fetching
// a versioned tarball + verifying the digest before exec.
export const SANDBOX_INSTALL_COMMAND =
  'curl -fsSL https://opencode.ai/install | bash && ' +
  'if [ -x "$HOME/.opencode/bin/opencode" ]; then ' +
  'if [ "$(id -u)" -eq 0 ]; then ' +
  'ln -sf "$HOME/.opencode/bin/opencode" /usr/local/bin/opencode; ' +
  'elif command -v sudo >/dev/null 2>&1 && sudo -n true >/dev/null 2>&1; then ' +
  'sudo ln -sf "$HOME/.opencode/bin/opencode" /usr/local/bin/opencode; ' +
  'else ' +
  'mkdir -p "$HOME/.local/bin" && ' +
  'ln -sf "$HOME/.opencode/bin/opencode" "$HOME/.local/bin/opencode"; ' +
  'fi; ' +
  'fi';

export const DEFAULT_OPENCODE_LOCAL_MODEL = "opencode-go/deepseek-v4.1-flash";

export function isValidOpenCodeModelId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  const slashIndex = trimmed.indexOf("/");
  return Boolean(trimmed) && slashIndex > 0 && slashIndex !== trimmed.length - 1;
}

export const models: Array<{ id: string; label: string }> = [
  { id: DEFAULT_OPENCODE_LOCAL_MODEL, label: DEFAULT_OPENCODE_LOCAL_MODEL },
  // OpenCode Go catalog, https://opencode.ai/zen/go/v1/models. Static fallback
  // for hosts where `opencode models` discovery cannot run.
  { id: "opencode-go/minimax-m3", label: "opencode-go/minimax-m3" },
  { id: "opencode-go/minimax-m2.7", label: "opencode-go/minimax-m2.7" },
  { id: "opencode-go/minimax-m2.5", label: "opencode-go/minimax-m2.5" },
  { id: "opencode-go/kimi-k3", label: "opencode-go/kimi-k3" },
  { id: "opencode-go/kimi-k2.7-code", label: "opencode-go/kimi-k2.7-code" },
  { id: "opencode-go/kimi-k2.6", label: "opencode-go/kimi-k2.6" },
  { id: "opencode-go/kimi-k2.5", label: "opencode-go/kimi-k2.5" },
  { id: "opencode-go/longcat-2.0", label: "opencode-go/longcat-2.0" },
  { id: "opencode-go/glm-5.2", label: "opencode-go/glm-5.2" },
  { id: "opencode-go/glm-5.3-flash", label: "opencode-go/glm-5.3-flash" },
  { id: "opencode-go/glm-5.3", label: "opencode-go/glm-5.3" },
  { id: "opencode-go/glm-5.1", label: "opencode-go/glm-5.1" },
  { id: "opencode-go/glm-5", label: "opencode-go/glm-5" },
  { id: "opencode-go/deepseek-v4-pro", label: "opencode-go/deepseek-v4-pro" },
  { id: "opencode-go/deepseek-v4-flash", label: "opencode-go/deepseek-v4-flash" },
  { id: "opencode-go/deepseek-flash", label: "opencode-go/deepseek-flash" },
  { id: "opencode-go/deepseek-v4.1-flash", label: "opencode-go/deepseek-v4.1-flash" },
  { id: "opencode-go/deepseek-v4-flash-vision-exp", label: "opencode-go/deepseek-v4-flash-vision-exp" },
  { id: "opencode-go/qwen3.7-max", label: "opencode-go/qwen3.7-max" },
  { id: "opencode-go/qwen3.8-max", label: "opencode-go/qwen3.8-max" },
  { id: "opencode-go/qwen3.8-flash", label: "opencode-go/qwen3.8-flash" },
  { id: "opencode-go/qwen3.7-plus", label: "opencode-go/qwen3.7-plus" },
  { id: "opencode-go/qwen3.6-plus", label: "opencode-go/qwen3.6-plus" },
  { id: "opencode-go/qwen3.5-plus", label: "opencode-go/qwen3.5-plus" },
  { id: "opencode-go/mimo-v2-pro", label: "opencode-go/mimo-v2-pro" },
  { id: "opencode-go/mimo-v2-omni", label: "opencode-go/mimo-v2-omni" },
  { id: "opencode-go/mimo-v2.6-pro", label: "opencode-go/mimo-v2.6-pro" },
  { id: "opencode-go/mimo-v2.6-flash", label: "opencode-go/mimo-v2.6-flash" },
  { id: "opencode-go/longcat-2.5-preview-free", label: "opencode-go/longcat-2.5-preview-free" },
  { id: "opencode-go/mimo-v2.5-pro", label: "opencode-go/mimo-v2.5-pro" },
  { id: "opencode-go/mimo-v2.5", label: "opencode-go/mimo-v2.5" },
  { id: "opencode-go/hy4-preview", label: "opencode-go/hy4-preview" },
  { id: "opencode-go/hy3", label: "opencode-go/hy3" },
  { id: "opencode-go/hy3-preview", label: "opencode-go/hy3-preview" },
  { id: "opencode-go/gpt-5.6-luna", label: "opencode-go/gpt-5.6-luna" },
  { id: "opencode-go/grok-4.5", label: "opencode-go/grok-4.5" },
  { id: "opencode-go/grok-4.7", label: "opencode-go/grok-4.7" },
  { id: "opencode-go/grok-4.6", label: "opencode-go/grok-4.6" },
  { id: "opencode-go/muse-spark-1.3-contributor", label: "opencode-go/muse-spark-1.3-contributor" },
  { id: "opencode-go/muse-spark-1.2-contributor", label: "opencode-go/muse-spark-1.2-contributor" },
  { id: "opencode-go/omen-alpha", label: "opencode-go/omen-alpha" },
  { id: "opencode-go/gpt-6-luna", label: "opencode-go/gpt-6-luna" },
  { id: "opencode-go/space-bunny", label: "opencode-go/space-bunny" },
  { id: "openai/gpt-6-astra", label: "openai/gpt-6-astra" },
  { id: "openai/gpt-6.1-sol", label: "openai/gpt-6.1-sol" },
  { id: "openai/gpt-6-sol", label: "openai/gpt-6-sol" },
  { id: "openai/gpt-6-luna", label: "openai/gpt-6-luna" },
  { id: "openai/gpt-5.6-sol", label: "openai/gpt-5.6-sol" },
  { id: "openai/gpt-5.6-terra", label: "openai/gpt-5.6-terra" },
  { id: "openai/gpt-5.6-luna", label: "openai/gpt-5.6-luna" },
  { id: "anthropic/claude-opus-5-5", label: "anthropic/claude-opus-5-5" },
  { id: "anthropic/claude-opus-5", label: "anthropic/claude-opus-5" },
  { id: "anthropic/claude-fable-5-1", label: "anthropic/claude-fable-5-1" },
  { id: "anthropic/claude-sonnet-5-5", label: "anthropic/claude-sonnet-5-5" },
  { id: "anthropic/claude-sonnet-5", label: "anthropic/claude-sonnet-5" },
  { id: "google/gemini-3.8-flash", label: "google/gemini-3.8-flash" },
  { id: "xai/grok-4.7", label: "xai/grok-4.7" },
  { id: "openai/gpt-5.5", label: "openai/gpt-5.5" },
  { id: "openai/gpt-5.4", label: "openai/gpt-5.4" },
  { id: "openai/gpt-5.4-mini", label: "openai/gpt-5.4-mini" },
  { id: "openai/gpt-5.2", label: "openai/gpt-5.2" },
  { id: "openai/gpt-5.1-codex-max", label: "openai/gpt-5.1-codex-max" },
  { id: "openai/gpt-5.1-codex-mini", label: "openai/gpt-5.1-codex-mini" },
];

export const agentConfigurationDoc = `# opencode_local agent configuration

Adapter: opencode_local

Use when:
- You want Paperclip to run OpenCode locally as the agent runtime
- You want provider/model routing in OpenCode format (provider/model)
- You want OpenCode session resume across heartbeats via --session

Don't use when:
- You need webhook-style external invocation (use openclaw_gateway or http)
- You only need one-shot shell commands (use process)
- OpenCode CLI is not installed on the machine

Core fields:
- cwd (string, optional): default absolute working directory fallback for the agent process (created if missing when possible)
- instructionsFilePath (string, optional): absolute path to a markdown instructions file prepended to the run prompt
- model (string, required): OpenCode model id in provider/model format (for example anthropic/claude-sonnet-4-5)
- variant (string, optional): provider-specific reasoning/profile variant passed as --variant (for example minimal|low|medium|high|xhigh|max)
- dangerouslySkipPermissions (boolean, optional): inject a runtime OpenCode config with \`permission=allow\` for all tools and connections; defaults to true for unattended Paperclip runs
- promptTemplate (string, optional): run prompt template
- command (string, optional): defaults to "opencode"
- extraArgs (string[], optional): additional CLI args
- env (object, optional): KEY=VALUE environment variables

Operational fields:
- timeoutSec (number, optional): run timeout in seconds
- graceSec (number, optional): SIGTERM grace period in seconds

Notes:
- OpenCode supports multiple providers and models. Use \
  \`opencode models\` to list available options in provider/model format.
- Paperclip requires an explicit \`model\` value for \`opencode_local\` agents.
- Runs are executed with: opencode run --format json ...
- Sessions are resumed with --session when stored session cwd matches current cwd.
- The adapter sets OPENCODE_DISABLE_PROJECT_CONFIG=true to prevent OpenCode from \
  writing an opencode.json config file into the project working directory. Model \
  selection is passed via the --model CLI flag instead.
- When \`dangerouslySkipPermissions\` is enabled, Paperclip injects a temporary \
  runtime config with \`permission=allow\` so headless runs do \
  not stall on approval prompts.
`;

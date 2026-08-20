# AWS Kiro Agents

These profiles implement the SDD V2 workflow as Kiro IDE 1.0 custom agents:

```text
analyst -> designer -> planner -> implementer -> reviewer
```

They use Kiro's Markdown agent format and capability-based `permissions.rules`. The role prompts preserve the same artifact contract as the GitHub Copilot variants.

## Install

Copy the files in `kiro/agents/` to the target workspace:

```text
<workspace>/.kiro/agents/
|-- analyst.md
|-- designer.md
|-- planner.md
|-- implementer.md
`-- reviewer.md
```

Open the trusted workspace in Kiro, open chat, and select the agent from the agent selector in the input bar. Workspace agents take precedence over global agents with the same name.

The permissions assume the workflow artifact convention:

```text
docs/work-items/<ticket-or-stable-slug>/
```

If a project deliberately uses another location, change the `fs_write` patterns in the installed profiles before use. Do not broaden them to unrestricted writes for artifact-only roles.

## Permission Model

| Agent | Available capabilities | Silent writes | Shell behavior |
|---|---|---|---|
| Analyst | Read, write, web | `docs/work-items/**/requirements.md` only | Unavailable |
| Designer | Read, write, web | `docs/work-items/**/design.md` only | Unavailable |
| Planner | Read, write, web | `docs/work-items/**/tasks.md` only | Unavailable |
| Implementer | Read, write, shell, web, task tracking | Workspace implementation files and task checkbox updates; governing artifacts excluded from file tools | Narrow metadata-only Git commands pre-approved; other commands ask |
| Reviewer | Read, write, shell, web, task tracking | `docs/work-items/**/verification.md` only through file tools | Narrow metadata-only Git commands pre-approved; diff, PR inspection, and verification commands ask |

The profiles enumerate exact built-in tools rather than broad categories, preventing future category expansion from silently adding capabilities. Workspace reads are trusted through explicit `fs_read` rules; likely environment, key, credential, and secret paths ask for approval, as do reads and Implementer writes outside the workspace. Artifact-only and Reviewer writes outside their one artifact are denied. Web access is available but not silently trusted. MCP servers, Powers, code rewriting/intelligence, background-process controls, and sub-agent delegation are disabled by default.

Diff, log, PR inspection, test, lint, type-check, static-analysis, build, and repository-script commands require user approval. This keeps project-specific commands viable without silently trusting arbitrary repository code or broad command-prefix patterns. Only `pwd`, basic Git status/current-basis discovery, and tracked-file listing are pre-approved.

The profiles deny common destructive or external-side-effect operations, including:

- `rm`, `sudo`, and other privilege escalation
- Git push, merge, rebase, branch deletion, and PR mutation
- Package publication and release scripts
- Common deployment and infrastructure mutation commands for Docker registries, Kubernetes, Helm, Terraform, Pulumi, Serverless, SAM, and CDK

The Implementer asks before local Git staging/commit and other unlisted worktree-changing Git operations. The Reviewer denies common worktree/index/history mutations and asks on unlisted shell commands; its prompt prohibits every repository-state change to preserve independence.

Implementer writes to Kiro steering, skills, Powers, hooks, agent instructions, and common cross-agent instruction files require explicit approval. Kiro settings remain denied by Kiro's hardcoded policy.

Kiro evaluates `fs_write` and `shell` separately. File-path rules do not sandbox a shell process: after approval, a command can write using output flags, redirection, repository scripts, symlinks, or child processes, and it inherits the user's environment, credentials, and network access. Inspect every requested command and use a container or operating-system sandbox when a hard filesystem or network boundary is required. The role prompts prohibit shell-based permission bypasses, but this remains an instruction boundary rather than a Kiro filesystem guarantee.

Permission is not workflow approval. Agents must still validate artifact status, lane, task readiness, and user gates before acting.

By default, Kiro custom agents may inherit steering files, skills, and `AGENTS.md`. Each profile treats inherited material as repository context that cannot override its role or artifact boundary. If instruction isolation is required, enable Kiro's `chat.disableInheritingDefaultResources` setting and verify behavior on the installed IDE/CLI version; built-in agents always inherit default resources.

## Validate

Run the repository's static contract check:

```bash
node kiro/validate-agents.mjs
```

It recursively validates the five-agent inventory, rejects unsupported or duplicate frontmatter structure, compares the entire reviewed tools and permissions contract, and exercises representative allow/ask/deny command examples. It is intentionally not a replacement for Kiro's runtime schema and permission evaluator.

After installation:

1. Confirm all five profiles appear as Workspace agents in Kiro's selector.
2. Confirm each artifact-only agent can update only its expected file.
3. Confirm the Implementer's file tools cannot edit requirements or verification and that focused checks ask for approval.
4. Confirm the Reviewer can create `verification.md` but its file tools cannot edit implementation files.
5. Review any user-, workspace-, or administrator-scoped Kiro permissions; the most restrictive matching rule wins.

Kiro CLI users can also inspect the current schema with `/agent schema` and list loaded profiles with `/agent list`.

## References

- [Kiro custom agents](https://kiro.dev/docs/custom-agents/)
- [Agent configuration reference](https://kiro.dev/docs/custom-agents/configuration-reference/)
- [Kiro permissions](https://kiro.dev/docs/permissions/)
- [Built-in tools](https://kiro.dev/docs/tools/)

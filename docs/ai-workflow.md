# AI Workflow Guide V2

This guide defines the Spec-Driven Development workflow used with GitHub Copilot in VS Code and AWS Kiro IDE.

The platform-specific source agent definitions are in:

```text
github-copilot/agents/
|-- analyst.agent.md
|-- designer.agent.md
|-- planner.agent.md
|-- implementer.agent.md
`-- reviewer.agent.md

kiro/agents/
|-- analyst.md
|-- designer.md
|-- planner.md
|-- implementer.md
`-- reviewer.md
```

The Copilot definitions target VS Code (`target: vscode`); install them in the target workspace's `.github/agents/` directory. The Kiro definitions use the IDE 1.0 custom-agent Markdown format; install them in the target workspace's `.kiro/agents/` directory. Both variants implement the same V2 artifact and responsibility contract, while their tool, permission, and handoff configuration remains platform-specific.

This workflow is designed for one user. The user owns every product, technical, execution, and risk decision. Agents prepare artifacts, enforce phase boundaries, execute approved work, and present evidence; they never approve decisions on the user's behalf.

## 1. Purpose

The workflow separates five questions:

| Phase | Question | Agent | Output |
|---|---|---|---|
| Requirements | What must be true, and why? | `analyst` | `requirements.md` |
| Technical design | How should the system satisfy it? | `designer` | `design.md` |
| Tasking | What executable work is required, and in what order? | `planner` | `tasks.md` |
| Implementation | Does each approved task work in the real codebase? | `implementer` | Code, tests, supporting changes, task progress |
| Review | Does the result satisfy the approved contract and production bar? | `reviewer` | `verification.md` |

The full flow is:

```text
intake.md
  -> analyst
  -> requirements.md
  -> USER REQUIREMENTS APPROVAL
  -> designer
  -> design.md
  -> USER TECHNICAL APPROVAL
  -> planner
  -> tasks.md
  -> implementer
  -> code and tests, one task at a time
  -> reviewer
  -> verification.md
  -> remediation when needed
  -> user PR decision
```

Quick work uses a shorter approved path:

```text
intake.md
  -> analyst
  -> requirements.md (Lane: Quick, Approved)
  -> implementer
  -> reviewer
  -> verification.md
```

## 2. Core Principles

- **One phase, one owner:** each agent has one primary responsibility and one stable artifact boundary.
- **The user decides:** the user approves WHAT, WHY, HOW, exceptions, risk, and progression.
- **Artifacts are the contract:** downstream agents use persisted artifacts rather than relying on prior chat history.
- **No silent assumptions:** proposed behavior, technical decisions, deviations, and waivers are visible.
- **Traceability is end to end:** requirements map to acceptance criteria, design, tasks, code evidence, findings, and the PR.
- **Implementation is incremental:** the Implementer completes and verifies one task before marking it done.
- **Review is independent:** the Reviewer reports findings but never fixes the implementation.
- **Rigor follows risk:** Quick, Standard, and Deep lanes use the same responsibility model at different depth.
- **Production concerns are lifecycle concerns:** accessibility, security, reliability, compatibility, observability, rollout, and rollback appear at the appropriate phase.
- **Smallest correct change:** agents avoid speculative architecture, drive-by refactors, and process that does not improve safety.

## 3. Work-Item Folder

Use one stable folder per work item:

```text
docs/
`-- work-items/
    `-- JIRA-123-stable-slug/
        |-- intake.md
        |-- requirements.md
        |-- design.md
        |-- tasks.md
        `-- verification.md
```

Rules:

- Keep the Jira key when one exists.
- Do not rename the folder when the ticket title changes.
- Keep scratch prompts, transcripts, and temporary output outside the folder.
- Keep artifact names lowercase and exact.
- Quick work omits only `design.md` and `tasks.md` under the lane rules below.
- `verification.md` is the only durable post-implementation review artifact.
- Do not create maintained `review.md` or `pr-summary.md` files; verification contains the review record, and the PR body is derived from current artifacts.

## 4. Artifact Model

### `intake.md`

`intake.md` is the user-controlled source snapshot, not the approved requirements contract.

Capture applicable content:

- Jira title, description, acceptance criteria, comments, and dependencies
- Design links, screenshots, Figma references, and UX notes
- Stakeholder constraints and previous decisions
- Incident, bug, or reproduction evidence
- External contract or policy references
- Source revision or capture date

Every lane starts from `intake.md`. Keep Quick intake concise when the source is already clear.

Agents never edit the intake. If source material changes, the user deliberately refreshes the snapshot, records the new source revision or capture date, and reruns the Analyst. This invalidates downstream approval until the requirements are reviewed again.

### `requirements.md`

`requirements.md` is the WHAT and WHY contract.

It contains:

- Source references and lane
- Problem, outcome, users, and current behavior
- In-scope and out-of-scope behavior
- `FR-*` functional requirements
- `NFR-*` non-functional requirements
- `AC-*` acceptance criteria
- UI states, API/data obligations, security, privacy, permissions, and accessibility
- Assumptions, proposed implied requirements, and open questions
- Risks, dependencies, waivers, and user approval
- Definition of Ready and next-phase handoff

It does not contain architecture, affected-file plans, implementation sequencing, or tasks.

The Analyst writes it as Draft. Only explicit user approval changes it to Approved. For Quick work, that approval also authorizes direct implementation unless the user states otherwise.

### `design.md`

`design.md` is the HOW contract for Standard and Deep work.

It contains:

- Current architecture relevant to the change
- Proposed architecture and affected boundaries
- Data and state flow
- Interfaces and contracts
- UI and accessibility implementation approach
- Requirement-to-design coverage
- `D-*` decisions and alternatives
- Technical test strategy
- Compatibility, migration, security, reliability, performance, and observability design
- Rollout, rollback, dependencies, risks, and technical questions
- User technical approval and Definition of Ready for Tasking

It does not contain atomic implementation tasks or task progress.

The Designer writes it as Draft. Only explicit user approval changes it to Approved.

### `tasks.md`

`tasks.md` is the execution contract for Standard and Deep work.

It contains:

- `T-*` tasks in dependency order
- Stage and multi-PR boundaries when applicable
- `FR/NFR/AC/D` traceability
- Affected areas
- Completion conditions
- Focused verification commands or evidence methods
- Coverage matrix and stage gates
- Objective Definition of Ready for Implementation

Task-list readiness is factual rather than a new product or technical approval. The Planner marks it Ready only after approved requirements and design can be executed without unresolved decisions.

The Planner owns task definitions. The Implementer may edit only `[ ]` to `[x]` for a fully implemented and verified task.

### `verification.md`

`verification.md` is both the factual verification record and independent quality review.

It contains:

- Lane and artifact readiness
- Exact change-set basis
- Verdict and conditions
- Per-`AC` evidence and result
- Automated command results
- Severity-ranked `F-*` findings
- `DV-*` requirements, design, task, or lane deviations
- Non-functional spot checks
- Re-review history

There is no separate required `review.md`. Splitting evidence and findings into two files would not add independence because the same Reviewer owns both.

There is no maintained `pr-summary.md`. Generate the PR body from the current requirements, design, tasks, implementation evidence, and verification verdict at the reviewed commit.

## 5. Traceability

Use these stable identifiers:

| ID | Meaning | Created by |
|---|---|---|
| `FR-*` | Functional requirement | Analyst |
| `NFR-*` | Non-functional requirement | Analyst |
| `AC-*` | Acceptance criterion | Analyst |
| `A-*` | Cross-phase assumption, only when needed | Analyst |
| `Q-*` | Cross-phase open question, only when needed | Analyst or Designer |
| `D-*` | Technical decision | Designer |
| `T-*` | Implementation task | Planner |
| `F-*` | Review finding | Reviewer |
| `DV-*` | Artifact or lane deviation | Reviewer |

The expected chain is:

```text
FR-1 / NFR-1
      |
      v
    AC-1
      |
      v
design section / D-1
      |
      v
    T-2
      |
      v
code, tests, implementation evidence
      |
      +--> AC result in verification.md
      +--> F-1 when defective
      `--> DV-1 when the approved artifact package was not followed
```

Identifier lifecycle rules:

- Append identifiers; never renumber them.
- Never reuse an identifier.
- Preserve withdrawn approved requirements or decisions with a reason.
- Create a new identifier when normative meaning changes materially.
- Keep the existing identifier for editorial clarification that does not change meaning.
- Do not add requirement IDs as comments throughout production code. Keep traceability in artifacts, tests where useful, implementation checkpoints, commits, and the PR.

## 6. EARS Requirements

Use EARS selectively in `requirements.md` for normative obligations:

```text
Ubiquitous:       THE <system> SHALL <behavior>
Event-driven:     WHEN <event>, THE <system> SHALL <behavior>
State-driven:     WHILE <state>, THE <system> SHALL <behavior>
Optional feature: WHERE <configuration>, THE <system> SHALL <behavior>
Unwanted event:   IF <condition>, THEN THE <system> SHALL <mitigation>
```

Example:

```markdown
- FR-1 [Event-driven] | Status: Approved | Source: JIRA-123 AC-2
  WHEN an authorized user submits a valid order,
  THE checkout UI SHALL submit exactly one order request.

- NFR-1 [State-driven] | Status: Approved | Source: Accessibility policy
  WHILE order submission is pending,
  THE checkout UI SHALL expose its busy state programmatically and prevent duplicate submission.

- AC-1 (verifies FR-1, NFR-1):
  Given an authorized user and a valid order,
  When the user activates Submit,
  Then one request is sent and the control remains unavailable until completion.
```

Guidance:

- Keep one testable obligation per requirement.
- Give normative UI, API, data, security, privacy, permission, accessibility, and production behavior an `FR-*` or `NFR-*` identifier.
- Use Given/When/Then for concrete scenarios when scenario context adds value.
- Do not repeat the same obligation in both EARS and Given/When/Then without a reason.
- Do not use EARS for scope lists, assumptions, questions, design decisions, tasks, commands, or findings.

## 7. Assumptions and Implied Requirements

The Analyst separates facts from unconfirmed behavior.

Use an assumption when a low-impact, reversible unknown allows work to continue. Record evidence, impact, and its validation point.

Use an open question when an answer materially changes behavior, contracts, data, security, accessibility, acceptance criteria, or rollout.

When behavior is implied by code, design, policy, or convention:

1. Create a proposed `FR-*` or `NFR-*` entry.
2. Record `Status: Proposed` and the source of the inference.
3. Ask the user to approve it, reject it into Out of Scope, or waive it.
4. Do not advance while a material implied requirement remains unresolved.

Only cross-phase assumptions and questions need `A-*` or `Q-*` identifiers.

## 8. Workflow Lanes

Lanes control depth, not quality or authority.

Selection order:

1. Select Deep when any Deep trigger applies.
2. Select Quick only when every Quick condition applies.
3. Otherwise select Standard.

### Quick

Use Quick only when all are true:

- Behavior and acceptance criteria are clear.
- The change is localized and reversible.
- It follows an established implementation pattern.
- Focused automated verification is available.
- There is no material security, privacy, compliance, migration, public-contract, shared-platform, new-dependency, or coordinated-rollout impact.

Required flow:

```text
analyst -> approved requirements.md -> implementer -> reviewer -> verification.md
```

Required artifacts:

- `intake.md`
- Condensed `requirements.md`
- Code and tests
- Condensed `verification.md`

If implementation needs a material technical choice, stop and return to the Analyst to change the lane to Standard.

### Standard

Standard is the default for daily Jira Story work within known architecture.

Typical characteristics:

- One application or a limited package set
- Multiple UI states or components
- Moderate implementation decisions
- Existing contracts and dependencies
- Normal accessibility, test, analytics, and rollout concerns

Required flow and artifacts:

```text
intake.md
  -> requirements.md
  -> design.md
  -> tasks.md
  -> code/tests
  -> verification.md
```

Use concise artifacts and omit irrelevant optional detail.

### Deep

Use Deep for any of these:

- Authentication, authorization, security, privacy, or compliance changes
- Public API, schema, or event-contract changes
- Persisted browser-state or data migration
- Shared design-system, build-tooling, or broad multi-app impact
- New dependency or infrastructure
- Cross-team deployment ordering
- Irreversible behavior or difficult rollback
- Complex feature-flag rollout
- Staged or multi-PR work
- Critical NFR without an established verification mechanism

Deep uses the same workflow artifacts as Standard with fuller analysis, explicit stage gates, broader evidence, and operational planning. Existing ADRs, policies, or runbooks may be referenced, but they are not additional V2 work-item outputs.

### Lane Changes

- Escalate immediately when a higher-risk trigger is discovered.
- Return to the Analyst to update `requirements.md` and reset approval when the lane changes.
- Update design and tasks after requirements are re-approved.
- Keep the same folder and identifiers.
- Do not downgrade a lane merely to avoid an artifact or gate.

## 9. Agent Responsibilities

### Analyst

The Analyst:

- Reads intake, tickets, designs, relevant code behavior, contracts, and documentation.
- Selects the lane.
- Creates `FR-*`, `NFR-*`, and `AC-*` identifiers.
- Uses EARS selectively.
- Captures scope, states, risks, assumptions, questions, and waivers.
- Writes only `requirements.md`.
- Never selects architecture, creates tasks, implements, or self-approves.

Handoff:

- Quick -> Implementer after user approval.
- Standard or Deep -> Designer after user approval.

### Designer

The Designer:

- Reads approved requirements and relevant repository architecture.
- Defines technical boundaries, mechanisms, contracts, and data flow.
- Records `D-*` decisions and alternatives.
- Maps requirements to design and verification mechanisms.
- Defines applicable migration, compatibility, security, observability, rollout, and rollback design.
- Writes only `design.md`.
- Never changes product behavior, writes tasks or code, or self-approves.

Handoff:

- Approved design -> Planner.
- Product gap -> Analyst.

### Planner

The Planner:

- Reads approved requirements and design.
- Creates atomic, ordered, dependency-aware `T-*` tasks.
- Maps each task to `FR/NFR/AC/D` identifiers.
- Includes completion and verification conditions.
- Includes tests and production work with the relevant implementation increment.
- Writes only `tasks.md`.
- Never changes behavior, architecture, or code.

Handoff:

- Ready task list -> Implementer.
- Design gap -> Designer.
- Requirements gap -> Analyst.

### Implementer

The Implementer:

- Requires approved Quick requirements or the complete Standard/Deep artifact package.
- Establishes the repository and change-set baseline.
- Executes one ready task at a time.
- Implements code, tests, configuration, migrations, observability, and required documentation together.
- Runs focused checks before changing `[ ]` to `[x]`.
- Runs broader checks before review.
- Preserves unrelated work and reports deviations.
- Never edits requirements, design, findings, or task definitions.
- Never pushes, merges, deploys, or creates a PR unless explicitly requested outside the normal role.

Handoff:

- Ready implementation -> Reviewer.
- Behavior gap -> Analyst.
- Technical gap -> Designer.
- Task gap -> Planner.

### Reviewer

The Reviewer:

- Establishes the exact reviewable change-set basis.
- Verifies required artifact approval and readiness.
- Verifies every `AC-*` as Pass, Fail, or Not Verifiable.
- Runs or collects tests, lint, type checks, builds, and other applicable evidence.
- Reviews correctness, scope, architecture, tests, accessibility, security, reliability, performance, migrations, compatibility, observability, and operability.
- Records `F-*` findings and `DV-*` deviations.
- Writes only `verification.md`.
- Never fixes code or accepts risk on the user's behalf.

Handoff:

- Assigned findings -> Implementer.
- Requirement/design decision -> governing agent and user.
- Current Ready verdict -> user PR decision.

## 10. User Gates and Approval

The user is the sole decision owner.

### Requirements Gate

The user confirms:

- Problem, outcome, scope, and lane are correct.
- Requirements and acceptance criteria express the intended behavior.
- Proposed implied requirements are accepted, rejected, or waived.
- Blocking questions are resolved.
- Risks and production constraints are understood.

The Analyst records approval in `requirements.md`.

### Technical Design Gate

For Standard and Deep work, the user confirms:

- The approach fits the codebase.
- Boundaries, contracts, data flow, and compatibility are correct.
- Consequential `D-*` decisions are acceptable.
- Test, rollout, rollback, and production mechanisms are sufficient.
- No technical decision is deferred to implementation.

The Designer records approval in `design.md`.

### Task Readiness

Task readiness is an objective gate, not another product or architecture approval.

The Planner confirms:

- Approved inputs are referenced.
- Tasks are complete, ordered, traceable, and executable.
- Verification and production work are included.
- No unresolved decision remains.

The user controls the handoff to Implementation and may inspect or revise tasks before proceeding. Copilot uses `send: false`; Kiro requires an explicit agent switch.

### Review and PR Gate

The user decides:

- Which findings to remediate.
- Whether a disputed finding requires a requirements or design decision.
- Whether a Major risk can be accepted.
- Whether verification conditions are sufficient.
- Whether to create or update a PR.

`Ready` is a Reviewer verdict, not permission to merge.

## 11. Artifact Invalidation

Approved artifacts must not remain approved after their normative contract changes.

- A material requirements change resets `requirements.md` to Draft.
- A material requirements change requires design and tasks to be reviewed and updated.
- A material technical approach change resets `design.md` to Draft and requires task regeneration or review.
- A task-definition correction returns to the Planner; the Implementer does not repair it silently.
- A lane change resets requirements approval and invalidates downstream readiness.
- Completed task state is preserved only when changed artifacts do not invalidate the implementation.
- A Reviewer verdict becomes stale when the change-set basis moves without re-review.

Editorial clarification that does not change normative meaning may keep approval, but the agent must state why approval remains valid.

## 12. Implementation Discipline

For Standard and Deep work:

1. Select the first incomplete task whose dependencies are complete.
2. Inspect relevant code and one or two analogous implementations.
3. Implement the smallest complete vertical increment.
4. Add or update tests and required safeguards.
5. Run focused verification from the task.
6. Inspect the diff for scope creep and unintended files.
7. Change only that task's `[ ]` to `[x]` after verification passes.
8. Stop and return the task checkpoint.
9. On a later invocation, select the next ready task.
10. When the final task completes, run broader affected checks and record the exact review basis before handoff.

For Quick work, use the same discipline against the approved Quick scope and ACs without creating `T-*` identifiers.

Stop and return to the governing phase when discovery changes behavior, architecture, contracts, security, migration, rollout, dependencies, or lane.

## 13. Review and Remediation

The Reviewer uses one evidence and findings artifact.

Verdicts:

- **Not ready:** an AC fails, a Blocker is open, an unaccepted Major is open, a required artifact is incomplete, or required evidence has no approved completion condition.
- **Ready with conditions:** no Not-ready rule applies, but a user-accepted Major follow-up or user-approved verification condition remains.
- **Ready:** no gating finding or condition remains.

A Blocker cannot be accepted or waived. It must be resolved and independently re-reviewed.

Remediation loop:

1. Reviewer writes findings to `verification.md`.
2. User chooses the findings to address.
3. Implementer reads but never edits `verification.md`.
4. Implementer fixes only assigned findings and related regressions.
5. Reviewer independently re-reviews and updates finding status.
6. Repeat until the current verdict is acceptable to the user.

Use a delta review only when an immutable checkpoint proves the delta. Otherwise perform a fresh full review. A verdict is stale if the branch moves beyond its recorded basis.

## 14. Production Frontend Checks

Apply these proportionally across Requirements, Design, Tasking, Implementation, and Review:

- Loading, empty, success, error, disabled, read-only, and permission states
- Responsive layout and supported browsers
- Keyboard navigation, focus management, semantic structure, labels, contrast, and screen-reader output
- Shared design-system and package public API compatibility
- Affected package and downstream dependent checks
- Backend compatibility while old frontend bundles remain active
- Generated clients, schemas, lockfiles, and package boundaries
- Routing, deep links, SSR, hydration, service workers, and cache behavior
- Feature-flag enabled, disabled, rollout, rollback, and cleanup behavior
- Analytics event contracts and PII handling
- Persisted local state, IndexedDB, and cache migrations
- Bundle-size, rendering, runtime, and Core Web Vitals impact
- Authentication and authorization at the correct security boundary
- Structured logging and telemetry without sensitive data

Hiding a frontend control is never sufficient authorization enforcement.

## 15. Using the Agents

The work-item artifacts, not the previous chat thread, are the handoff contract on both platforms. A visible next-agent option or preserved conversation does not prove that an artifact is approved or ready; check the artifact gate before proceeding.

### GitHub Copilot

All handoffs use `send: false`. The user reviews the current artifact and explicitly starts the next agent. GitHub Copilot displays handoff buttons unconditionally; a visible button does not prove the artifact is approved or ready. Check the artifact gate before using it.

Expected buttons:

```text
analyst    --[Create Technical Design]----> designer
analyst    --[Implement Quick Change]-----> implementer
designer   --[Create Implementation Tasks]-> planner
planner    --[Start Implementation]--------> implementer
implementer--[Review Implementation]-------> reviewer
reviewer   --[Fix Review Findings]----------> implementer
```

In VS Code, select the custom agent from the agent picker and use **Add Context** or a `#file:` reference to attach the required artifact. If a handoff button is unavailable, select the next agent manually.

### AWS Kiro IDE

Copy the five files from `kiro/agents/` into the target workspace's `.kiro/agents/` directory and trust that workspace. In Kiro chat, use the agent selector in the input bar to choose a Workspace agent. Switch agents only while the current agent is idle.

Kiro does not use the Copilot handoff metadata. At each approved gate, manually select the next agent:

```text
analyst    --[approved Standard/Deep requirements]--> designer
analyst    --[approved Quick requirements]---------> implementer
designer   --[approved design]----------------------> planner
planner    --[ready task list]----------------------> implementer
implementer--[complete implementation]--------------> reviewer
reviewer   --[assigned findings]--------------------> implementer
```

Use Kiro's `#` context picker to attach the exact work-item file, or include its workspace-relative path in the prompt. The profiles intentionally do not enable sub-agent delegation: user-controlled phase gates and independent review must not be collapsed into an autonomous pipeline.

Example prompts:

```text
Analyst:     Define requirements from #file:docs/work-items/JIRA-123/intake.md
Designer:    Design #file:docs/work-items/JIRA-123/requirements.md
Planner:     Create tasks using the requirements and design files in docs/work-items/JIRA-123
Implementer: Implement only the next ready task in #file:docs/work-items/JIRA-123/tasks.md, then stop
Reviewer:    Review the docs/work-items/JIRA-123 implementation against origin/main
```

The same prompt wording works in Kiro when the workspace-relative paths are resolvable.

## 16. Tool and Safety Model

GitHub Copilot agent frontmatter grants broad tool aliases such as `read`, `search`, `edit`, `execute`, and `web`. Its artifact boundaries remain instruction-enforced.

Kiro uses exact built-in tool names plus agent-scoped capability rules:

- Workspace reads are pre-approved through explicit `fs_read` rules. Likely environment, key, credential, and secret paths, plus paths outside the workspace, ask for approval.
- Analyst, Designer, and Planner have read/search, approval-gated web access, and write permission only for their respective artifact under `docs/work-items/**`.
- Implementer's file tools can edit workspace files and only task completion state among workflow artifacts. File-tool writes to intake, requirements, design, and verification are denied. Sensitive files and AI instruction/configuration paths require explicit approval or are denied by Kiro.
- Reviewer's file tools can write only `docs/work-items/**/verification.md`. File-tool edits to source, tests, configuration, and tasks are denied.
- Implementer and Reviewer pre-approve only a narrow set of metadata-only Git commands (`status`, current branch/root/HEAD discovery, and tracked-file listing).
- Diff, log, PR inspection, tests, lint, type checks, static analysis, builds, and all repository-controlled scripts prompt for approval. This keeps normal commands viable while making their arguments and side effects visible before execution.
- Dependency installation, code generation, migrations, containers, local services, and networked operations are deliberately not pre-approved.
- Representative direct invocations of common destructive filesystem commands, privilege escalation, Git/PR mutation, publishing, release commands, and deployment or infrastructure mutation commands are denied. Unmatched forms still ask and remain prohibited by the role prompt; command globs are defense in depth, not a complete shell sandbox.
- Profiles enumerate exact built-in tools rather than broad categories. Workspace MCP servers, installed Powers, code rewriting/intelligence, background-process controls, and sub-agents are not included. Add a narrowly scoped tool only when a concrete workflow need justifies it.
- Kiro custom agents may inherit default steering, skills, and `AGENTS.md`. The profiles treat inherited material as repository context that cannot override role boundaries. Use `chat.disableInheritingDefaultResources` when instruction isolation is required, and verify it on the installed Kiro version.
- A Kiro permission allows an operation technically; it never bypasses artifact readiness, role boundaries, repository policy, or user approval gates.
- Kiro evaluates permissions across all scopes using deny over ask over allow. A more restrictive Kiro, administrator, user, or workspace rule still applies.

Important limitations:

- Copilot edit permissions are not path-scoped by these prompts.
- Kiro `fs_write` path rules constrain file tools, not shell processes, and cannot constrain a write to one Markdown checkbox. The Implementer's task-checkbox boundary is instruction-enforced.
- Shell commands run with the user's operating-system access, environment, credentials, and network. An approved command can bypass file-tool path rules through output flags, redirection, scripts, symlinks, or child processes.
- Build and test commands therefore require approval and execute repository-controlled code that may create files or contact external systems. Inspect the command and relevant script before approving it; use an OS/container sandbox when a hard write or network boundary is required.
- The prompts prohibit using shell to evade role boundaries, but Kiro permissions alone cannot technically sandbox an approved shell process to the role's file paths.
- Kiro web access remains approval-gated; fetched pages, tickets, comments, repository text, and tool output are untrusted input, not agent instructions.
- Agents must not expose secrets or client-sensitive data.
- Implementer and Reviewer must not run deployments or commands with production side effects.
- Independent user inspection and normal repository controls remain required.

## 17. PR and Delivery

After a current acceptable Reviewer verdict, derive the PR description from the artifacts.

Include:

- Jira or intake reference
- Lane
- Requirements covered
- Technical design and consequential `D-*` decisions
- Completed `T-*` tasks when applicable
- Tests and checks executed
- `DV-*` deviations
- Open conditions or accepted risks
- Migration, flag, rollout, rollback, and observability notes when applicable
- Link to `verification.md`

The PR still requires normal CI and any desired human or code-owner review.

For production-facing changes, verify applicable post-deployment signals such as health metrics, errors, logs, traces, alerts, feature flags, migration progress, and rollback triggers. The user owns deployment and post-deployment decisions; these agents do not deploy.

## 18. Quick Reference

```text
Agents
  analyst     -> requirements.md
  designer    -> design.md
  planner     -> tasks.md
  implementer -> code/tests/supporting changes; task checkboxes
  reviewer    -> verification.md

Lanes
  Quick       requirements -> implementation -> verification
  Standard    requirements -> design -> tasks -> implementation -> verification
  Deep        same artifacts as Standard, with deeper gates and evidence

User decisions
  approve requirements
  approve technical design
  initiate implementation
  disposition review risk
  decide PR, merge, and deployment

Artifacts
  intake.md -> requirements.md -> design.md -> tasks.md
            -> code/tests -> verification.md -> PR
```

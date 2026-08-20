# AGENTS.md

## Overview

This repository contains a personal AI-first SDD V2 workflow for GitHub Copilot and AWS Kiro.

The platform-specific agent definitions are located in:

```txt
./github-copilot/agents
./kiro/agents
```

The workflow has five focused agents:

```txt
analyst → designer → planner → implementer → reviewer
```

## Current Flow

```txt
intake.md → requirements.md → design.md → tasks.md → code changes → verification.md
```

Quick-lane work may proceed directly from approved `requirements.md` to the Implementer and Reviewer.

## Documentation

Workflow documentation lives in:

```txt
docs/
```

The main guide is:

```txt
docs/ai-workflow.md
```

## Guidelines

* Keep changes small and focused.
* Keep each agent focused on its artifact and responsibility boundary.
* Keep the GitHub Copilot and Kiro variants behaviorally aligned when a role contract changes.
* Update `docs/ai-workflow.md` whenever workflow behavior changes.
* Treat V2 artifacts as the only supported workflow contract.
* Keep platform-specific tools, permissions, and handoff mechanics in their respective variants.

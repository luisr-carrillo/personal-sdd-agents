import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const agentsDirectory = fileURLToPath(new URL("./agents/", import.meta.url));

const expectedAgents = new Map([
  ["analyst", "docs/work-items/**/requirements.md"],
  ["designer", "docs/work-items/**/design.md"],
  ["planner", "docs/work-items/**/tasks.md"],
  ["implementer", null],
  ["reviewer", "docs/work-items/**/verification.md"],
]);

const readTools = ["read_file", "read_files", "list_directory", "file_search", "grep_search"];
const artifactTools = [
  ...readTools,
  "fs_write",
  "fs_append",
  "str_replace",
  "web_fetch",
  "web_search",
];
const implementerTools = [
  ...readTools,
  "fs_write",
  "fs_append",
  "str_replace",
  "delete_file",
  "execute_bash",
  "web_fetch",
  "web_search",
  "todo_list",
];
const reviewerTools = [
  ...readTools,
  "fs_write",
  "fs_append",
  "str_replace",
  "execute_bash",
  "web_fetch",
  "web_search",
  "todo_list",
];

const sensitivePaths = [
  "**/.env",
  "**/.env.*",
  "**/*.pem",
  "**/*.key",
  "**/credentials*",
  "**/secrets/**",
];
const governingArtifacts = [
  "docs/work-items/**/intake.md",
  "docs/work-items/**/requirements.md",
  "docs/work-items/**/design.md",
  "docs/work-items/**/verification.md",
];
const protectedInstructionPaths = [
  ".git/**",
  ".kiro/agents/**",
  ".kiro/hooks/**",
  ".kiro/steering/**",
  ".kiro/skills/**",
  ".kiro/powers/**",
  ".kiroignore",
  "**/AGENTS.md",
  "**/CLAUDE.md",
  "**/GEMINI.md",
  ".github/copilot-instructions.md",
  ".github/agents/**",
  ".github/instructions/**",
  ".cursor/rules/**",
];
const hardDeniedWritePaths = [...governingArtifacts, ".kiro/settings/**"];
const approvalGatedWritePaths = [...protectedInstructionPaths, ...sensitivePaths];
const implementationWriteExclusions = [
  ...hardDeniedWritePaths,
  ...approvalGatedWritePaths,
];

const safeShellCommands = [
  "pwd",
  "git status",
  "git status --short",
  "git status --porcelain",
  "git branch",
  "git branch --show-current",
  "git rev-parse HEAD",
  "git rev-parse --show-toplevel",
  "git rev-parse --is-inside-work-tree",
  "git ls-files",
];

const additionalDeniedShellPatterns = [
  "git -C * push",
  "git -C * push *",
  "git -C * pull",
  "git -C * pull *",
  "git -C * merge",
  "git -C * merge *",
  "git -C * rebase",
  "git -C * rebase *",
  "git branch --delete *",
  "git branch -f *",
  "git branch --force *",
  "git tag --delete *",
  "git tag -f *",
  "git tag --force *",
  "git apply",
  "git -C * apply",
  "git -C * apply *",
  "git am",
  "git -C * am",
  "git -C * am *",
  "gh pr update-branch*",
  "gh pr lock*",
  "gh pr unlock*",
  "gh pr revert*",
  "gh * pr create*",
  "gh * pr merge*",
  "gh * pr close*",
  "gh * pr edit*",
  "gh * pr ready*",
  "gh * pr reopen*",
  "gh * pr review*",
  "gh * pr comment*",
  "gh * pr update-branch*",
  "gh * pr lock*",
  "gh * pr unlock*",
  "gh * pr revert*",
  "gh * issue create*",
  "gh * issue close*",
  "gh * issue edit*",
  "gh * issue comment*",
  "gh release create*",
  "gh release delete*",
  "gh release edit*",
  "gh release upload*",
  "gh * release create*",
  "gh * release delete*",
  "gh * release edit*",
  "gh * release upload*",
  "gh api --method POST*",
  "gh api --method PUT*",
  "gh api --method PATCH*",
  "gh api --method DELETE*",
  "gh api --method=POST*",
  "gh api --method=PUT*",
  "gh api --method=PATCH*",
  "gh api --method=DELETE*",
  "gh api -X POST*",
  "gh api -X PUT*",
  "gh api -X PATCH*",
  "gh api -X DELETE*",
  "gh api * --method POST*",
  "gh api * --method PUT*",
  "gh api * --method PATCH*",
  "gh api * --method DELETE*",
  "gh api * --method=POST*",
  "gh api * --method=PUT*",
  "gh api * --method=PATCH*",
  "gh api * --method=DELETE*",
  "gh api * -X POST*",
  "gh api * -X PUT*",
  "gh api * -X PATCH*",
  "gh api * -X DELETE*",
  "gh api -f *",
  "gh api -f*",
  "gh api -F *",
  "gh api -F*",
  "gh api --field *",
  "gh api --field=*",
  "gh api --raw-field *",
  "gh api --raw-field=*",
  "gh api --input *",
  "gh api --input=*",
  "gh api * -f *",
  "gh api * -f*",
  "gh api * -F *",
  "gh api * -F*",
  "gh api * --field *",
  "gh api * --field=*",
  "gh api * --raw-field *",
  "gh api * --raw-field=*",
  "gh api * --input *",
  "gh api * --input=*",
  "gh * api --method POST*",
  "gh * api --method PUT*",
  "gh * api --method PATCH*",
  "gh * api --method DELETE*",
  "gh * api --method=POST*",
  "gh * api --method=PUT*",
  "gh * api --method=PATCH*",
  "gh * api --method=DELETE*",
  "gh * api -X POST*",
  "gh * api -X PUT*",
  "gh * api -X PATCH*",
  "gh * api -X DELETE*",
  "gh * api -f*",
  "gh * api -F*",
  "gh * api --field *",
  "gh * api --field=*",
  "gh * api --raw-field *",
  "gh * api --raw-field=*",
  "gh * api --input *",
  "gh * api --input=*",
  "npm * run deploy",
  "npm * run deploy *",
  "npm * run deploy:*",
  "npm * run publish",
  "npm * run publish *",
  "npm * run publish:*",
  "npm * run release",
  "npm * run release *",
  "npm * run release:*",
  "pnpm * deploy",
  "pnpm * deploy *",
  "pnpm * run deploy",
  "pnpm * run deploy *",
  "pnpm * run deploy:*",
  "pnpm * run publish",
  "pnpm * run publish *",
  "pnpm * run publish:*",
  "pnpm * run release",
  "pnpm * run release *",
  "pnpm * run release:*",
  "yarn * deploy",
  "yarn * deploy *",
  "yarn * deploy:*",
  "yarn * run deploy",
  "yarn * run deploy *",
  "yarn * run deploy:*",
  "yarn * run publish",
  "yarn * run publish *",
  "yarn * run publish:*",
  "yarn * run release",
  "yarn * run release *",
  "yarn * run release:*",
  "bun * run deploy",
  "bun * run deploy *",
  "bun * run deploy:*",
  "bun * run publish",
  "bun * run publish *",
  "bun * run publish:*",
  "bun * run release",
  "bun * run release *",
  "bun * run release:*",
  "mvn release:*",
  "mvn release:* *",
  "mvn * release:*",
  "mvn * release:* *",
  "./mvnw release:*",
  "./mvnw release:* *",
  "./mvnw * release:*",
  "./mvnw * release:* *",
  "gradle *:publish",
  "gradle *:publish *",
  "./gradlew *:publish",
  "./gradlew *:publish *",
];

const implementerDeniedShell = [
  "rm",
  "rm *",
  "sudo",
  "sudo *",
  "su",
  "su *",
  "doas *",
  "git push",
  "git push *",
  "git pull",
  "git pull *",
  "git merge",
  "git merge *",
  "git rebase",
  "git rebase *",
  "git branch -d *",
  "git branch -D *",
  "git tag -d *",
  "git apply *",
  "git am *",
  "gh pr create*",
  "gh pr merge*",
  "gh pr close*",
  "gh pr edit*",
  "gh pr ready*",
  "gh pr reopen*",
  "gh pr review*",
  "gh pr comment*",
  "gh issue create*",
  "gh issue close*",
  "gh issue edit*",
  "gh issue comment*",
  "npm publish*",
  "npm run deploy",
  "npm run deploy *",
  "npm run deploy:*",
  "npm run-script deploy",
  "npm run-script deploy *",
  "npm run-script deploy:*",
  "npm run publish",
  "npm run publish *",
  "npm run publish:*",
  "npm run-script publish",
  "npm run-script publish *",
  "npm run-script publish:*",
  "npm run release",
  "npm run release *",
  "npm run release:*",
  "npm run-script release",
  "npm run-script release *",
  "npm run-script release:*",
  "pnpm publish*",
  "pnpm deploy",
  "pnpm deploy *",
  "pnpm run deploy",
  "pnpm run deploy *",
  "pnpm run deploy:*",
  "pnpm run publish",
  "pnpm run publish *",
  "pnpm run publish:*",
  "pnpm run release",
  "pnpm run release *",
  "pnpm run release:*",
  "yarn publish*",
  "yarn npm publish*",
  "yarn deploy",
  "yarn deploy *",
  "yarn deploy:*",
  "yarn run deploy",
  "yarn run deploy *",
  "yarn run deploy:*",
  "yarn run publish",
  "yarn run publish *",
  "yarn run publish:*",
  "yarn run release",
  "yarn run release *",
  "yarn run release:*",
  "yarn release",
  "yarn release *",
  "yarn release:*",
  "bun publish*",
  "bun run deploy",
  "bun run deploy *",
  "bun run deploy:*",
  "bun run publish",
  "bun run publish *",
  "bun run publish:*",
  "bun run release",
  "bun run release *",
  "bun run release:*",
  "cargo publish*",
  "mvn deploy",
  "mvn deploy *",
  "mvn * deploy",
  "mvn * deploy *",
  "mvn deploy:*",
  "mvn * deploy:*",
  "./mvnw deploy",
  "./mvnw deploy *",
  "./mvnw * deploy",
  "./mvnw * deploy *",
  "./mvnw deploy:*",
  "./mvnw * deploy:*",
  "gradle publish",
  "gradle publish *",
  "gradle * publish",
  "gradle * publish *",
  "./gradlew publish",
  "./gradlew publish *",
  "./gradlew * publish",
  "./gradlew * publish *",
  "dotnet nuget push*",
  "twine upload*",
  "docker push*",
  "kubectl apply*",
  "kubectl create*",
  "kubectl delete*",
  "kubectl patch*",
  "helm install*",
  "helm upgrade*",
  "helm uninstall*",
  "terraform apply*",
  "terraform destroy*",
  "pulumi up*",
  "pulumi destroy*",
  "serverless deploy*",
  "sam deploy*",
  "cdk deploy*",
  "make deploy",
  "make deploy *",
  "make * deploy",
  "make * deploy *",
  "make publish",
  "make publish *",
  "make * publish",
  "make * publish *",
  "make release",
  "make release *",
  "make * release",
  "make * release *",
  ...additionalDeniedShellPatterns,
];

const reviewerOnlyDeniedShell = [
  "git add *",
  "git commit*",
  "git checkout*",
  "git switch*",
  "git restore*",
  "git reset*",
  "git clean*",
  "git stash*",
  "git cherry-pick*",
  "git revert*",
];

function rule(capability, effect, { match = [], exclude = [] } = {}) {
  const value = { capability };
  if (match.length > 0) value.match = match;
  if (exclude.length > 0) value.exclude = exclude;
  value.effect = effect;
  return value;
}

function commonReadRules() {
  return [
    rule("fs_read", "allow", { match: ["./**"], exclude: sensitivePaths }),
    rule("fs_read", "ask", { exclude: ["./**"] }),
    rule("fs_read", "ask", { match: sensitivePaths }),
  ];
}

function artifactRules(artifactPath) {
  return [
    ...commonReadRules(),
    rule("fs_write", "allow", { match: [artifactPath] }),
    rule("fs_write", "deny", { exclude: [artifactPath] }),
    rule("web_fetch", "ask"),
    rule("web_search", "ask"),
  ];
}

function implementationRules() {
  return [
    ...commonReadRules(),
    rule("fs_write", "allow", {
      match: ["./**"],
      exclude: implementationWriteExclusions,
    }),
    rule("fs_write", "deny", { match: hardDeniedWritePaths }),
    rule("fs_write", "ask", { match: approvalGatedWritePaths }),
    rule("fs_write", "ask", { exclude: ["./**"] }),
    rule("shell", "allow", { match: safeShellCommands }),
    rule("shell", "ask", { exclude: safeShellCommands }),
    rule("shell", "deny", { match: implementerDeniedShell }),
    rule("web_fetch", "ask"),
    rule("web_search", "ask"),
  ];
}

function reviewerRules() {
  return [
    ...commonReadRules(),
    rule("fs_write", "allow", { match: ["docs/work-items/**/verification.md"] }),
    rule("fs_write", "deny", { exclude: ["docs/work-items/**/verification.md"] }),
    rule("shell", "allow", { match: safeShellCommands }),
    rule("shell", "ask", { exclude: safeShellCommands }),
    rule("shell", "deny", {
      match: [
        "rm",
        "rm *",
        "sudo",
        "sudo *",
        "su",
        "su *",
        "doas *",
        ...reviewerOnlyDeniedShell,
        ...implementerDeniedShell.slice(7),
      ],
    }),
    rule("web_fetch", "ask"),
    rule("web_search", "ask"),
  ];
}

function matchesShellPattern(command, pattern) {
  const regex = pattern
    .split("*")
    .map((part) => part.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${regex}$`).test(command);
}

function classifyShell(command, deniedPatterns) {
  if (deniedPatterns.some((pattern) => matchesShellPattern(command, pattern))) return "deny";
  if (safeShellCommands.includes(command)) return "allow";
  return "ask";
}

const shellPolicyExamples = [
  ["npm run test -- src/deployment.test.ts", "ask"],
  ["npm run build -- --mode release", "ask"],
  ["mvn test -Dtest=DeploymentTest", "ask"],
  ["gh api repos/example/project/pulls/1/comments", "ask"],
  ["pnpm --silent run deploy", "deny"],
  ["mvn release:perform", "deny"],
  ["./gradlew :lib:publish", "deny"],
  ["gh release create v1.2.3", "deny"],
  ["git apply", "deny"],
  ["git branch --delete old", "deny"],
  ["gh pr update-branch 42", "deny"],
  ["gh pr lock 42", "deny"],
  ["gh api --method POST repos/example/project/issues", "deny"],
  ["gh api repos/example/project/issues -f title=test", "deny"],
  ["gh api --method=POST repos/example/project/actions/runs/1/rerun", "deny"],
  ["gh api repos/example/project/issues -ftitle=test", "deny"],
  ["gh --repo example/project pr merge 42", "deny"],
  ["git -C . push origin main", "deny"],
  ["git tag --delete old", "deny"],
];

for (const [command, expectedEffect] of shellPolicyExamples) {
  const actualEffect = classifyShell(command, implementerDeniedShell);
  if (actualEffect !== expectedEffect) {
    throw new Error(
      `shell policy example classified incorrectly: ${JSON.stringify(command)} (${actualEffect} !== ${expectedEffect})`,
    );
  }
}

function fail(message) {
  throw new Error(message);
}

function parseScalar(value, file, lineNumber) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "[]") return [];
  if (trimmed.startsWith('"') || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      fail(`${file}:${lineNumber}: invalid JSON-compatible YAML scalar (${error.message})`);
    }
  }
  if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(trimmed)) return trimmed;
  fail(`${file}:${lineNumber}: unsupported or malformed scalar: ${trimmed}`);
}

function parseAgentFrontmatter(frontmatter, file) {
  const lines = frontmatter.split("\n");
  const config = {};
  let index = 0;

  while (index < lines.length) {
    const lineNumber = index + 2;
    const line = lines[index];
    const topLevel = line.match(/^([A-Za-z][A-Za-z0-9]*):(?: (.*))?$/);
    if (!topLevel) fail(`${file}:${lineNumber}: unsupported frontmatter syntax`);

    const [, key, rawValue] = topLevel;
    if (Object.hasOwn(config, key)) fail(`${file}:${lineNumber}: duplicate field ${key}`);

    if (key !== "permissions") {
      if (rawValue === undefined) fail(`${file}:${lineNumber}: ${key} requires a value`);
      config[key] = parseScalar(rawValue, file, lineNumber);
      index += 1;
      continue;
    }

    if (rawValue !== undefined) fail(`${file}:${lineNumber}: permissions must be a mapping`);
    if (lines[index + 1] !== "  rules:") fail(`${file}:${lineNumber + 1}: expected permissions.rules`);
    index += 2;
    const rules = [];

    while (index < lines.length && lines[index].startsWith("    ")) {
      const ruleLineNumber = index + 2;
      const capability = lines[index].match(/^    - capability: ([a-z_]+)$/)?.[1];
      if (!capability) fail(`${file}:${ruleLineNumber}: expected permission capability`);
      index += 1;
      const current = { capability };
      const seenProperties = new Set();

      while (index < lines.length && lines[index].startsWith("      ")) {
        const propertyLineNumber = index + 2;
        const property = lines[index].match(/^      (match|exclude|effect):(?: (.*))?$/);
        if (!property) fail(`${file}:${propertyLineNumber}: unsupported permission property`);
        const [, propertyName, propertyValue] = property;
        if (seenProperties.has(propertyName)) {
          fail(`${file}:${propertyLineNumber}: duplicate permission property ${propertyName}`);
        }
        seenProperties.add(propertyName);
        if (propertyName === "effect") {
          if (!/^(allow|ask|deny)$/.test(propertyValue ?? "")) {
            fail(`${file}:${propertyLineNumber}: invalid permission effect`);
          }
          current.effect = propertyValue;
          index += 1;
          continue;
        }

        if (propertyValue !== undefined) {
          const parsed = parseScalar(propertyValue, file, propertyLineNumber);
          if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
            fail(`${file}:${propertyLineNumber}: ${propertyName} must be a string array`);
          }
          current[propertyName] = parsed;
          index += 1;
          continue;
        }

        index += 1;
        const values = [];
        while (index < lines.length) {
          const item = lines[index].match(/^        - (".*")$/)?.[1];
          if (!item) break;
          const parsed = parseScalar(item, file, index + 2);
          if (typeof parsed !== "string") fail(`${file}:${index + 2}: permission item must be a string`);
          values.push(parsed);
          index += 1;
        }
        if (values.length === 0) fail(`${file}:${propertyLineNumber}: ${propertyName} must not be empty`);
        current[propertyName] = values;
      }

      if (!current.effect) fail(`${file}:${ruleLineNumber}: permission rule is missing effect`);
      rules.push(current);
    }

    config.permissions = { rules };
  }

  return config;
}

function canonical(value) {
  if (Array.isArray(value)) {
    const items = value.map(canonical);
    return items.every((item) => typeof item === "string") ? items.sort() : items;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function assertEqual(actual, expected, message) {
  const difference = firstDifference(canonical(actual), canonical(expected));
  if (difference) fail(`${message}: ${difference}`);
}

function firstDifference(actual, expected, path = "config") {
  if (Array.isArray(actual) || Array.isArray(expected)) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      return `${path} type differs`;
    }
    if (actual.length !== expected.length) {
      if (actual.every((item) => typeof item === "string") && expected.every((item) => typeof item === "string")) {
        const missing = expected.filter((item) => !actual.includes(item));
        const extra = actual.filter((item) => !expected.includes(item));
        return `${path} values differ (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"})`;
      }
      return `${path} length differs (${actual.length} !== ${expected.length})`;
    }
    for (let index = 0; index < actual.length; index += 1) {
      const difference = firstDifference(actual[index], expected[index], `${path}[${index}]`);
      if (difference) return difference;
    }
    return null;
  }

  if (actual && expected && typeof actual === "object" && typeof expected === "object") {
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
      return `${path} keys differ (${actualKeys.join(", ")} !== ${expectedKeys.join(", ")})`;
    }
    for (const key of actualKeys) {
      const difference = firstDifference(actual[key], expected[key], `${path}.${key}`);
      if (difference) return difference;
    }
    return null;
  }

  if (actual !== expected) return `${path} differs (${JSON.stringify(actual)} !== ${JSON.stringify(expected)})`;
  return null;
}

function expectedConfig(agent, artifactPath, actual) {
  const tools = agent === "implementer" ? implementerTools : agent === "reviewer" ? reviewerTools : artifactTools;
  const allowedTools = agent === "implementer" || agent === "reviewer" ? ["todo_list"] : [];
  const rules = agent === "implementer" ? implementationRules() : agent === "reviewer" ? reviewerRules() : artifactRules(artifactPath);

  return {
    name: agent,
    description: actual.description,
    tools,
    allowedTools,
    includeMcpJson: false,
    includePowers: false,
    permissions: { rules },
    welcomeMessage: actual.welcomeMessage,
  };
}

function listAgentProfiles(directory, prefix = "") {
  const profiles = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      profiles.push(...listAgentProfiles(`${directory}/${entry.name}`, relativePath));
    } else if (entry.isFile() && /\.(md|json)$/.test(entry.name)) {
      profiles.push(relativePath);
    }
  }
  return profiles.sort();
}

const actualFiles = listAgentProfiles(agentsDirectory);
const expectedFiles = [...expectedAgents.keys()].map((name) => `${name}.md`).sort();
assertEqual(actualFiles, expectedFiles, `agent inventory mismatch: expected ${expectedFiles.join(", ")}; found ${actualFiles.join(", ")}`);

for (const [agent, artifactPath] of expectedAgents) {
  const file = `${agent}.md`;
  const text = readFileSync(`${agentsDirectory}/${file}`, "utf8");
  const document = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/);
  if (!document) fail(`${file}: invalid Markdown frontmatter delimiters or missing prompt body`);

  const [, frontmatter, prompt] = document;
  if (!prompt.trim()) fail(`${file}: prompt body is empty`);
  const config = parseAgentFrontmatter(frontmatter, file);
  if (typeof config.description !== "string" || !config.description) fail(`${file}: description is missing`);
  if (typeof config.welcomeMessage !== "string" || !config.welcomeMessage) fail(`${file}: welcomeMessage is missing`);

  assertEqual(
    config,
    expectedConfig(agent, artifactPath, config),
    `${file}: frontmatter differs from the reviewed least-privilege contract`,
  );

  console.log(`valid ${file}`);
}

console.log("Kiro agent static contract validation passed.");

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const reportsDir = path.join(rootDir, "reports");
const rawDir = path.join(reportsDir, "raw");

fs.mkdirSync(rawDir, { recursive: true });

for (const entry of fs.readdirSync(rawDir)) {
  fs.rmSync(path.join(rawDir, entry), { recursive: true, force: true });
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pythonCommand = resolvePythonCommand(rootDir);
const modelXmlPath = path.join(rawDir, "model-results.xml");
const e2eXmlPath = path.join(rawDir, "e2e-results.xml");

const suites = [
  {
    key: "backend",
    label: "Backend",
    category: "whitebox",
    commandType: "npm",
    command: npmCommand,
    args: ["run", "test:json"],
    cwd: path.join(rootDir, "Backend"),
  },
  {
    key: "frontend",
    label: "Frontend",
    category: "whitebox",
    commandType: "npm",
    command: npmCommand,
    args: ["run", "test:json"],
    cwd: path.join(rootDir, "Frontend"),
  },
  {
    key: "model",
    label: "Model",
    category: "whitebox",
    command: pythonCommand,
    args: [
      "-m",
      "pytest",
      "tests/whitebox/model",
      "--junitxml",
      modelXmlPath,
    ],
    cwd: rootDir,
  },
  {
    key: "e2e",
    label: "E2E",
    category: "blackbox",
    command: pythonCommand,
    args: [
      "-m",
      "pytest",
      "tests/blackbox/e2e",
      "--junitxml",
      e2eXmlPath,
    ],
    cwd: rootDir,
  },
];

const summary = [];
let overallExitCode = 0;

for (const suite of suites) {
  const startedAt = Date.now();
  const invocation =
    process.platform === "win32" && suite.commandType === "npm"
      ? {
        command: "cmd.exe",
        args: ["/c", suite.command, ...suite.args],
        shell: false,
      }
      : {
        command: suite.command,
        args: suite.args,
        shell: false,
      };

  const result = spawnSync(invocation.command, invocation.args, {
    cwd: suite.cwd,
    stdio: "inherit",
    shell: invocation.shell,
  });
  const finishedAt = Date.now();
  const exitCode = result.status ?? 1;

  summary.push({
    key: suite.key,
    label: suite.label,
    category: suite.category,
    command: [invocation.command, ...invocation.args].join(" "),
    exitCode,
    startedAt,
    finishedAt,
    durationMs: finishedAt - startedAt,
  });

  if (exitCode !== 0) {
    overallExitCode = 1;
  }
}

fs.writeFileSync(
  path.join(rawDir, "execution-summary.json"),
  JSON.stringify(summary, null, 2),
);

const mergeResult = spawnSync("node", [path.join(__dirname, "merge-test-reports.js")], {
  cwd: rootDir,
  stdio: "inherit",
  shell: false,
});

if ((mergeResult.status ?? 1) !== 0) {
  overallExitCode = 1;
}

process.exit(overallExitCode);

function resolvePythonCommand(rootPath) {
  const candidates = process.platform === "win32"
    ? [
      path.join(rootPath, "Model", ".venv310", "Scripts", "python.exe"),
      path.join(rootPath, "Model", "venv", "Scripts", "python.exe"),
      path.join(rootPath, "Model", ".venv", "Scripts", "python.exe"),
    ]
    : [
      path.join(rootPath, "Model", ".venv310", "bin", "python"),
      path.join(rootPath, "Model", "venv", "bin", "python"),
      path.join(rootPath, "Model", ".venv", "bin", "python"),
    ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return process.platform === "win32" ? "python.exe" : "python3";
}

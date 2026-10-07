import {
  Callout,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
} from "cursor/canvas";

// Template: replace every array below with real data. Example rows must not remain.

type Tone = "success" | "warning" | "info" | "danger";

const title = "<repo> – branch status";
const subtitle = "Improvements across <main branches>. Based on git history on origin, <date>.";

// Main branches in merge-flow order (upstream first).
const mains = ["release", "develop", "product-a"];

const gaps: { value: string; label: string; tone?: Tone }[] = [
  { value: "0", label: "develop commits missing in product-a", tone: "success" },
  { value: "120", label: "product-a commits not in develop", tone: "info" },
  { value: "15", label: "develop commits missing in release", tone: "warning" },
  { value: "3", label: "release commits missing in develop", tone: "danger" },
];

const flowNote = "Last sync: release → develop <date>, develop → product-a <date>.";

type Improvement = { area: string; item: string; ref: string; present: boolean[]; tone: Tone };

const improvements: Improvement[] = [
  { area: "Bugfix", item: "Example hotfix only on release", ref: "PR 101", present: [true, false, false], tone: "danger" },
  { area: "Test", item: "Example test setup only on product-a", ref: "PR 102", present: [false, false, true], tone: "info" },
  { area: "Quality", item: "Example refactor not released", ref: "PR 103", present: [false, true, true], tone: "warning" },
  { area: "Platform", item: "Example upgrade everywhere", ref: "PR 104", present: [true, true, true], tone: "success" },
];

const toneLabel: Record<Tone, string> = {
  danger: "Only upstream – merge down",
  warning: "Not released",
  info: "Only downstream",
  success: "Everywhere",
};

const callouts: { tone: Tone; title: string; body: string }[] = [
  { tone: "danger", title: "Must be merged down", body: "Example: PR 101 is only on release." },
  { tone: "warning", title: "Candidates to bring upstream", body: "Example: generic items only on product-a." },
];

type PendingTone = "warning" | "info" | "neutral";
const pending: { branch: string; base: string; state: string; content: string; next: string; tone: PendingTone }[] = [
  { branch: "bugfix/example", base: "release", state: "Pushed, 1 commit", content: "Example fix", next: "Open PR", tone: "warning" },
  { branch: "feature/example-wip", base: "develop", state: "Local only, WIP", content: "Example WIP", next: "Finish and push", tone: "info" },
  { branch: "feature/example-old", base: "develop", state: "Stale", content: "Superseded by PR 103", next: "Delete", tone: "neutral" },
];
const pendingLegend = "Yellow: ready for PR. Blue: in progress. Grey: can be cleaned up.";

const filters: { key: "all" | Tone; label: string }[] = [
  { key: "all", label: "All" },
  { key: "danger", label: toneLabel.danger },
  { key: "warning", label: toneLabel.warning },
  { key: "info", label: toneLabel.info },
  { key: "success", label: toneLabel.success },
];

export default function BranchStatus() {
  const [filter, setFilter] = useCanvasState<"all" | Tone>("filter", "all");
  const shown = improvements.filter((i) => filter === "all" || i.tone === filter);

  return (
    <Stack gap={20} style={{ padding: 24 }}>
      <Stack gap={6}>
        <H1>{title}</H1>
        <Text tone="secondary">{subtitle}</Text>
      </Stack>

      <Grid columns={gaps.length} gap={16}>
        {gaps.map((g) => (
          <Stat key={g.label} value={g.value} label={g.label} tone={g.tone} />
        ))}
      </Grid>

      <Text tone="secondary" size="small">
        Flow:{" "}
        {mains.map((m, i) => (
          <Text as="span" key={m}>
            <Code>{m}</Code>
            {i < mains.length - 1 ? " → " : ""}
          </Text>
        ))}
        . {flowNote}
      </Text>

      <Divider />

      <Stack gap={10}>
        <H2>Improvements per branch</H2>
        <Row gap={8} wrap>
          {filters.map((f) => (
            <Pill key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </Pill>
          ))}
        </Row>
        <Table
          headers={["Area", "Improvement", "Ref", ...mains, "Status"]}
          rows={shown.map((i) => [
            i.area,
            i.item,
            <Text size="small" tone="secondary">{i.ref}</Text>,
            ...i.present.map((p) => (
              <Text weight={p ? "semibold" : "normal"} tone={p ? "primary" : "tertiary"}>
                {p ? "Yes" : "Missing"}
              </Text>
            )),
            <Text size="small" tone="secondary">{toneLabel[i.tone]}</Text>,
          ])}
          rowTone={shown.map((i) => i.tone)}
          columnAlign={["left", "left", "left", ...mains.map(() => "center" as const), "left"]}
          striped
        />
      </Stack>

      <Grid columns={callouts.length} gap={16}>
        {callouts.map((c) => (
          <Callout key={c.title} tone={c.tone} title={c.title}>
            {c.body}
          </Callout>
        ))}
      </Grid>

      <Divider />

      <Stack gap={10}>
        <H2>Open and stale branches</H2>
        <Table
          headers={["Branch", "Base", "State", "Content", "Next step"]}
          rows={pending.map((p) => [<Code>{p.branch}</Code>, p.base, p.state, p.content, p.next])}
          rowTone={pending.map((p) => p.tone)}
        />
        <Text tone="tertiary" size="small">{pendingLegend}</Text>
      </Stack>
    </Stack>
  );
}

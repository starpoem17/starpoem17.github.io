# Agent instructions

## 0. Permission before implementation and downloads

**Arbitrary implementation and download are strictly prohibited.** They start only after the user's explicit permission. Agents may ask the user whether implementation or a download may proceed.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- Check existing dependencies and implementations before adding a dependency. Add compatibility code and workarounds only for verified needs in supported environments.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For performance changes, compare representative workloads under comparable conditions. Verify required result accuracy and behavioral contracts alongside execution time or memory use. Do not claim improvements without measurements.

For multi-step tasks, state a brief plan:

```text
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Wording

**Remove all mannered prose.**

Mannered prose substitutes metaphor and flourish for direct statement. Instead of "a parameter worth varying," the mannered writer produces "a dial worth turning." Instead of "this point still matters," they write "this point earns its keep." The phrases exist to display the writer, not to convey the idea, and readers can tell. That is why mannered prose irritates: it makes the reader work harder so the writer can perform. It is also imprecise.

Write concisely, for a reader who does not have the conversation: no cryptic abbreviations, no transcripts, and no undefined identifiers (§11).

## 6. Repository layout

Keep agent documentation, including skill-generated records, in English Markdown under `docs/`; user deliverables may use the requested language.

- `user/` and root `README.md`: optional reading; no modification, deletion, or moving.
- `src/`: maintained features and reusable code. `experiments/`: hypothesis-testing code and evidence (§15).
- `tmp/YYYYMMDD_HHMMSS_<short-summary>/`: task-isolated temporary work. Retain until the user explicitly asks for deletion, even after completion or copying; delete only the specified scope and update references.
- `output/YYYYMMDD_HHMMSS_<short-summary>/`: final user deliverable bundles, Git-excluded but not disposable. Link their provenance where relevant.
- In existing projects, preserve code, record and test layouts and required tooling, configuration, dependency and build locations. Migrate layouts or paths only when requested or necessary for the task.

Name every new immediate child directory under `experiments/`, `tmp/` and `output/` as `YYYYMMDD_HHMMSS_<short-summary>`, in one project timezone recorded in `docs/README.md`. Use the run start time for experiments and the initial creation time for temporary and deliverable bundles. Keep names stable after creation and append numeric suffixes for collisions. Link related experiment, temporary and output paths explicitly.

## 7. Document types

Every document under `docs/`, or every section when one document mixes them, has one of three types. The type decides how it changes.

| Type | Examples | How it changes |
|---|---|---|
| State | The current state of `docs/README.md`; the current conclusion and open questions of a synthesis; Status columns of indexes | Rewritten to describe the present. Superseded sentences are replaced or removed, not annotated. No chronology of how the state was reached. |
| Record | Run reports, plans, ADRs, task verification records, the History section of a document | Written for an event, then only appended to. A record may update its leading current judgment; earlier judgments stay below it with dates. |
| Reference | Rules, glossary, architecture, data descriptions, index descriptions | Edited in place so that it is correct now. Rationale worth keeping goes to a record, such as an ADR, and is linked. |

- History is preserved in records. Before removing a sentence from a state section, confirm that its content exists in a record or in the owner document (§8); move it there first if it does not.
- A document holding both state and history keeps the state first and a dated History section last; do not interleave them.
- Outside state sections, write status with its date ("adopted as of 2026-03-02") or in the past tense. Do not write "current", "latest" or "now" there without a date.

## 8. One owner per volatile fact

A volatile fact is a value expected to change during the project: the best verified result, the adopted method or version, the delivered or deployed files, the status of a plan or task, deadlines, open questions.

- Each volatile fact has one owner document, which states its value, scope and reason. Other documents link to the owner instead of restating the value. The only exception is the current state of `docs/README.md`, which restates the headline value with a link to the owner (§10). Explanations likewise have one primary place; link to it.
- Non-owner documents link instead of restating: a glossary defines the name, an architecture document states what the code does, and rules for plans or records state how to write them; each links the owner for decisions, statuses and measured values.
- Before creating a document, extend the existing one whose scope covers the fact.
- Do not lay out a document so that one volatile fact appears in two sections. When related facts differ, such as the best measured result and the adopted method, state both in one section and explain the difference there.
- Index descriptions say what a child contains and, for records, what it found at the time. An index that needs a status gives it a Status column, updated together with the owner.
- Keep open questions in one list per area, in its owner document. When work tests or decides an item, move it out of the open list in the same task, into History with the date and a link to the result.

## 9. Change propagation

When a volatile fact changes, complete these steps in the same task. They are part of the change, not unrelated cleanup (§3).

1. Rewrite the owner's state section; move the replaced statement to its History section with the date and reason.
2. Rewrite the current state of `docs/README.md` if the change affects it.
3. Search `docs/` for the previous value, its identifiers (the previous version's name, file paths, status words) and the paths of changed records. Replace every sentence outside records that restates the value, previous or current, with a link to the owner (step 2 covers `docs/README.md`). In records, keep dated statements and add a replacement link where a reader would otherwise act on them.
4. Move the open questions the change tested or decided (§8).
5. Define new identifiers (§11), connect new documents to their immediate index, and check that every link in the edited files resolves.

## 10. Entry and the global index

Read `AGENTS.md`, then `docs/README.md` (create it if absent), then the owner document for the question at hand, before historical indexes or individual records. Follow its links to the evidence and code needed for the task.

Standard for entry documents: an agent without the conversation should be able to act correctly after reading `AGENTS.md`, `docs/README.md` and one owner document.

`docs/README.md` contains, in this order:

1. The project timezone.
2. **Current state** (a state section):
   - goal and deadlines;
   - the adopted or delivered state and where its files are;
   - for each question with results, the verified best result and its scope, or a statement that no comparable best is established, with a link to the owner;
   - decisions and constraints that affect the next work;
   - open questions, briefly, with links;
   - where the history is.

   It does not contain the chronology of how the state was reached, detailed metrics, comparisons, rationale or per-run outcomes; those belong in owner documents and records. Update it by rewriting, not appending. Before adding an item, remove or move items that are superseded or belong in an owner document. Each item is one or two sentences ending in a link; numbers are limited to headline values.
3. Brief project purpose, success criteria, constraints and working approach.
4. A table linking every child document or index, with a short description of its contents.

Every index links its children with short descriptions. Link `docs/architecture/README.md`, `docs/CONTEXT.md`, and, when they exist, `docs/experiments/README.md` and `docs/adr/README.md` from the global index.

If an entry or owner document is missing, stale or inconsistent, reconcile it from the relevant records and evidence before relying on it; mark unresolved comparisons explicitly.

Before a new project's first implementation, record its confirmed purpose, initial success criteria, known constraints and unresolved decisions in `docs/README.md`; mark unknowns without inventing requirements.

## 11. Names

- `docs/CONTEXT.md` is solely the glossary, including when skills request a root `CONTEXT.md`.
- Define every new identifier (version, candidate, dataset, code name, abbreviation) in the glossary, or in a lineage table of its owner document, when it first appears in a state section. For an item derived from another, record what it was built from and what changed.

## 12. Before editing

Identify existing changes in affected files and inspect relevant entry points, callers, checks and decisions; preserve work of unclear ownership and record unresolved gaps. Recover missing context only as needed for the task, separating verified facts from assumptions. Apply §1 to unresolved requirements affecting behavior, compatibility, scope or costly reversals. Resolve routine implementation choices from conventions; record consequential temporary choices as provisional, with reasons and revisit conditions. State material assumptions and continue independent work while clarification is pending.

## 13. Judgments and decisions

- For adopted decisions, record the basis and scope of adoption, and distinguish user requirements from agent choices. Record changed user directions and their scope.
- Correct factual errors with evidence, distinguishing corrections from changed decisions. Never invent user intent.
- Execution success is separate from adoption; failure alone does not disprove an approach.
- Use `docs/adr/` for consequential tradeoffs whose rationale is hard to recover from code; a directory alone needs no ADR. Maintain statuses, replacement links and `docs/adr/README.md`.

## 14. Architecture

Apply `codebase-design` before implementation and inspect actual code using its Module/Interface principles. Establish expected behavior from the request, documented contracts and decision history; design checks that exercise the affected behavior. Code establishes current behavior, not necessarily intended behavior: resolve discrepancies from evidence and clarify unresolved intent rather than automatically changing code or documentation to match the other.

- Normalize external library return formats and calling conventions at the integration boundary. Do not spread library-specific handling across shared internal code and callers.
- Do not silently change input data, computation methods or settings to avoid errors. Recovery and fallback behavior must follow requirements or explicit contracts; make changes that affect result interpretation visible.
- For §§2–3, prefer the smallest change that fixes the cause and check affected callers when shared behavior changes. Distinguish Modules hiding existing complexity from speculative extension structures; caller count alone does not justify or prohibit responsibility separation.
- Under §2, treat a scenario as impossible only when enforced invariants or verified preconditions rule it out across relevant paths; a documented prohibition is insufficient.
- Skills do not expand task scope; replacement tests must preserve relevant behavioral coverage. Use `improve-codebase-architecture` for architecture improvement reviews.

`docs/architecture/README.md` identifies areas and Modules by responsibility, source location and detail link; area documents need not mirror directories or files. Each area document owns its implementation status (§8) and records responsibilities, Interface and caller constraints, dependencies, verification locations, proposed changes with reasons and effects, verification evidence with the revision and date checked, and links to consequential history and decisions. Distinguish proposals, adopted plans, and partial and complete implementation; retain rejected rationale worth remembering.

## 15. Experiments (projects that run experiments)

An experiment investigates a stated question to support reusable conclusions or adoption and exclusion decisions; a run is an identifiable execution under recorded conditions. Routine checks and transient diagnostics need only task verification records unless they are used for those conclusions or decisions.

**Layout and navigation**
- Runs live in `experiments/<run-id>/`, with the run ID from the run start time (§6). One report per run at `docs/experiments/<area>/YYYY-MM/<run-id>.md`.
- From an area's first experiment: `docs/README.md` → `docs/experiments/README.md` → `<area>/README.md` → `YYYY-MM/README.md` → `<run-id>.md`. Area indexes state their scope and list synthesis links before period links; period indexes summarize work and findings with search terms. Organize by problem, then date; create only needed areas and periods; split large indexes while preserving paths where practical. Search relevant areas before broadening, and read raw logs only as needed.
- `docs/experiments/README.md` defines run granularity: when a sweep counts as one run, and when retries or condition changes need new IDs. A further execution caused by a run's results gets a new ID even under unchanged conditions; link predecessor and follow-up both ways, with the reason and which conditions changed.

**Run reports** (records)
- Lead with the current judgment, scope and reason. Then: the question, conditions affecting the conclusion, actions, observations, judgment at the time, material changes with reasons and evidence, untested conditions, and links to the execution directory, related reports and temporary paths. Keep a run's current and historical judgments in its report, without separate `current/` or `records/` directories.
- Preserve evidence as retained content or immutable, retrievable references: commands and configuration, source revision and uncommitted change contents, inputs, environment, status and results. Record what was verified about rerunning and reproducing results, and any evidence-access or reproducibility limits. Copy essential temporary evidence into the run directory; `tmp/` and Git-excluded `output/` must not be its only location. Execution metadata links back to the report; use the project's metadata format, if any.

**Syntheses** (owners of each question's volatile facts)
- For each experimental question with results, keep one synthesis under `docs/experiments/<area>/`, created with the first results and linked from the global and area indexes.
- Sections in order: question and scope; metrics and required constraints; comparison conditions; current conclusion; lineage of candidates, when candidates build on each other; open questions; History. The current conclusion is one section holding the verified best result and its supporting runs (or the statement that no comparable best is established), the adopted method and its implementation status, and the reason when they differ.
- Identify the best result only among measured candidates that satisfy required correctness and behavioral constraints under comparable data, workloads, environments and resource limits. Keep separate conclusions for materially different conditions or competing objectives. When a comparable result is better, update the conclusion without waiting for the user to reject the previous method, and move the previous best to History as superseded within the supported scope, with a link. Supersession does not imply invalidity under other conditions. Performance evidence alone does not imply user adoption or authorize integration into maintained code.

**Reuse and integration**
- Before reusing a result, read its synthesis, check run judgments and replacement links, and compare material conditions. Do not silently revive excluded approaches, extend exclusions to untested conditions, infer validity from modification time or search order, treat the absence of explicit rejection as evidence that an older result is still best, or generalize unclear applicability.
- On user-requested integration into maintained code, identify the source runs and the exact source revision or retained code snapshot, integrate reusable code into `src/`, and verify its Interface and behavior. Preserve the source run evidence, link the maintained code, and apply §9 to the synthesis and architecture documents.

## 16. Finishing a task and commits

- Complete §9 for every changed volatile fact, then check links in the version you commit, evidence availability and temporary-file retention. Do not reread or rebuild unrelated documentation.
- Separate pre-existing failures from regressions. Report passed, failed and unperformed checks with reasons and remaining uncertainty. Keep implementation status and verification status separate; mark verification incomplete when required checks fail or were not performed. Do not claim verification beyond the evidence.
- After required verification and documentation updates, commit task-related repository changes before reporting completion. Inspect the status and diff, and stage only changes belonging to the task; preserve unrelated and pre-existing user changes. Do not create empty commits or force-add Git-excluded deliverables.
- Report the commit ID and verification status. A commit does not establish that verification passed. If no committable changes remain, the work is outside a Git repository, or a commit fails, state the reason instead of claiming a commit; do not initialize a repository solely to satisfy this rule.
- Push only when the user explicitly requests it.

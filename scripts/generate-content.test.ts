import assert from "node:assert"
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import test, { describe } from "node:test"
import {
  assertNoBrokenMathHeadings,
  buildGeneratedContentPlan,
  buildRelativeAssetLink,
  extractDescription,
  type GeneratedContentPlan,
  normalizeBrokenMathHeadings,
  rewriteAssetLinks,
  type VaultInput,
  writeGeneratedContentPlan,
} from "./generate-content"

function fakeVaultInput(options: {
  files: string[]
  text?: Record<string, string>
  mtimes?: Record<string, Date>
  sourceRoot?: string
  contentRoot?: string
}): VaultInput {
  const text = options.text ?? {}
  const mtimes = options.mtimes ?? {}
  return {
    sourceRoot: options.sourceRoot ?? "/source",
    contentRoot: options.contentRoot ?? "/content",
    cleanupRoot: options.contentRoot ?? "/content",
    sourceFiles: options.files,
    readSourceText: async (sourceRelativePath) => text[sourceRelativePath] ?? "",
    getSourceMtime: async (sourceRelativePath) =>
      mtimes[sourceRelativePath] ?? new Date("2024-01-02T03:04:05.000Z"),
  }
}

async function withTempRoots(
  run: (roots: { sourceRoot: string; contentRoot: string }) => Promise<void>,
): Promise<void> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "generate-content-test-"))
  const sourceRoot = path.join(tempRoot, "source")
  const contentRoot = path.join(tempRoot, "content")
  await fs.mkdir(sourceRoot, { recursive: true })
  await fs.mkdir(contentRoot, { recursive: true })

  try {
    await run({ sourceRoot, contentRoot })
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true })
  }
}

describe("normalizeBrokenMathHeadings", () => {
  test("rewrites multiline math headings into a hooked block math", () => {
    const input = ["# $$", "V(s) = r + \\gamma V(s')", "$$", "Following text."].join("\n")

    const normalized = normalizeBrokenMathHeadings(input, "obsidian/RL/test.md")

    assert.strictEqual(
      normalized,
      [
        '<div class="math-heading-block" data-heading-level="1"></div>',
        "",
        "$$",
        "V(s) = r + \\gamma V(s')",
        "$$",
        "Following text.",
      ].join("\n"),
    )
  })

  test("rewrites inline math headings into a hooked block math", () => {
    const normalized = normalizeBrokenMathHeadings("# $$ a + b $$", "obsidian/RL/test.md")

    assert.strictEqual(
      normalized,
      [
        '<div class="math-heading-block" data-heading-level="1"></div>',
        "",
        "$$",
        "a + b",
        "$$",
      ].join("\n"),
    )
  })

  test("rewrites standalone single-line block math into Quartz-compatible multiline block math", () => {
    const normalized = normalizeBrokenMathHeadings(
      "$$ V^{\\pi}(s) = \\mathbb E_{\\pi}[G_t] $$",
      "obsidian/RL/test.md",
    )

    assert.strictEqual(normalized, ["$$", "V^{\\pi}(s) = \\mathbb E_{\\pi}[G_t]", "$$"].join("\n"))
  })

  test("throws on unclosed math headings", () => {
    assert.throws(
      () => normalizeBrokenMathHeadings(["## $$", "Q(s, a)"].join("\n"), "obsidian/RL/test.md"),
      /Unclosed math heading/,
    )
  })
})

describe("assertNoBrokenMathHeadings", () => {
  test("allows normalized math headings", () => {
    assert.doesNotThrow(() =>
      assertNoBrokenMathHeadings(
        [
          '<div class="math-heading-block" data-heading-level="2"></div>',
          "$$",
          "\\delta_t = r_{t+1}",
          "$$",
        ].join("\n"),
        "content/rl/test.md",
      ),
    )
  })

  test("rejects leftover broken heading syntax", () => {
    assert.throws(
      () => assertNoBrokenMathHeadings(["### $$", "x", "$$"].join("\n"), "content/rl/test.md"),
      /Unsupported math heading pattern remains/,
    )
  })

  test("rejects leftover single-line block math syntax", () => {
    assert.throws(
      () => assertNoBrokenMathHeadings("$$ a+b $$", "content/rl/test.md"),
      /Unsupported math heading pattern remains/,
    )
  })
})

describe("extractDescription", () => {
  test("skips math heading hooks and block math", () => {
    const markdown = [
      '<div class="math-heading-block" data-heading-level="1"></div>',
      "$$",
      "V^{\\pi}(s) = \\mathbb E_{\\pi}[G_t]",
      "$$",
      "Bellman Equation explains recursive value decomposition.",
    ].join("\n")

    assert.strictEqual(
      extractDescription(markdown),
      "Bellman Equation explains recursive value decomposition.",
    )
  })
})

describe("buildRelativeAssetLink", () => {
  test("builds note-relative links for nested note assets", () => {
    assert.strictEqual(
      buildRelativeAssetLink(
        "model-architecture/transformer/paper-reading/sink-attention.md",
        "model-architecture/transformer/figures/pasted-image-20260413003945.png",
      ),
      "../figures/pasted-image-20260413003945.png",
    )
  })
})

describe("rewriteAssetLinks", () => {
  test("rewrites Obsidian image embeds to note-relative markdown image links", () => {
    const assetMap = new Map([
      [
        "Pasted image 20260413003945.png",
        {
          sourcePath:
            "obsidian/Model Architecture/Transformer/figures/Pasted image 20260413003945.png",
          outputRelativePath:
            "model-architecture/transformer/figures/pasted-image-20260413003945.png",
        },
      ],
    ])

    const rewritten = rewriteAssetLinks(
      "![[Pasted image 20260413003945.png]]",
      {
        sourceRelativePath: "Model Architecture/Transformer/paper reading/Sink Attention.md",
        outputRelativePath: "model-architecture/transformer/paper-reading/sink-attention.md",
      },
      assetMap,
    )

    assert.strictEqual(rewritten, "![](../figures/pasted-image-20260413003945.png)")
  })

  test("rewrites markdown image links to note-relative paths", () => {
    const assetMap = new Map([
      [
        "pasted-image-20260413003945.png",
        {
          sourcePath:
            "content/model-architecture/transformer/figures/pasted-image-20260413003945.png",
          outputRelativePath:
            "model-architecture/transformer/figures/pasted-image-20260413003945.png",
        },
      ],
    ])

    const rewritten = rewriteAssetLinks(
      "![](./model-architecture/transformer/figures/pasted-image-20260413003945.png)",
      {
        sourceRelativePath:
          "content/model-architecture/transformer/paper-reading/sink-attention.md",
        outputRelativePath: "model-architecture/transformer/paper-reading/sink-attention.md",
      },
      assetMap,
    )

    assert.strictEqual(rewritten, "![](../figures/pasted-image-20260413003945.png)")
  })

  test("throws when a local image target cannot be resolved", () => {
    assert.throws(
      () =>
        rewriteAssetLinks(
          "![](./model-architecture/transformer/figures/missing.png)",
          {
            sourceRelativePath:
              "content/model-architecture/transformer/paper-reading/sink-attention.md",
            outputRelativePath: "model-architecture/transformer/paper-reading/sink-attention.md",
          },
          new Map(),
        ),
      /Missing linked asset/,
    )
  })

  test("keeps external image targets unchanged", () => {
    const rewritten = rewriteAssetLinks(
      "![remote](https://example.com/image.png)",
      {
        sourceRelativePath:
          "obsidian/Model Architecture/Transformer/paper reading/Sink Attention.md",
        outputRelativePath: "model-architecture/transformer/paper-reading/sink-attention.md",
      },
      new Map(),
    )

    assert.strictEqual(rewritten, "![remote](https://example.com/image.png)")
  })
})

describe("buildGeneratedContentPlan", () => {
  test("builds deterministic entries and transforms notes without mutating roots", async () => {
    const plan = await buildGeneratedContentPlan(
      fakeVaultInput({
        files: [
          "Area/Sub/B Note.md",
          "Area/Sub/figure B.png",
          "Area/A Note.md",
          "Area/Sub/figure A.png",
        ],
        text: {
          "Area/A Note.md": [
            "---",
            "title: Ignored",
            "---",
            "# $$ x + y $$",
            "See [[Sub/B Note#Main Result|the result]].",
            "![[figure A.png]]",
          ].join("\n"),
          "Area/Sub/B Note.md": "Main Result\n\n![](./Area/Sub/figure B.png)",
        },
        mtimes: {
          "Area/A Note.md": new Date("2024-05-06T23:59:59.000Z"),
          "Area/Sub/B Note.md": new Date("2024-05-07T00:00:00.000Z"),
        },
      }),
    )

    assert.deepStrictEqual(
      plan.files.map((entry) => entry.outputRelativePath),
      [
        "index.md",
        "area/index.md",
        "area/sub/index.md",
        "area/sub/figure-a.png",
        "area/sub/figure-b.png",
        "area/a-note.md",
        "area/sub/b-note.md",
      ],
    )

    const firstNote = plan.files.find(
      (entry) => entry.kind === "text" && entry.outputRelativePath === "area/a-note.md",
    )
    assert.ok(firstNote && firstNote.kind === "text")
    assert.match(firstNote.contents, /date: 2024-05-06/)
    assert.match(
      firstNote.contents,
      /<div class="math-heading-block" data-heading-level="1"><\/div>/,
    )
    assert.match(firstNote.contents, /\[the result\]\(\.\/sub\/b-note\.md#main-result\)/)
    assert.match(firstNote.contents, /!\[\]\(\.\/sub\/figure-a\.png\)/)
  })

  test("throws for missing and ambiguous wiki links", async () => {
    await assert.rejects(
      buildGeneratedContentPlan(
        fakeVaultInput({
          files: ["A.md"],
          text: { "A.md": "[[Missing]]" },
        }),
      ),
      /Missing linked note "Missing" in A\.md/,
    )

    await assert.rejects(
      buildGeneratedContentPlan(
        fakeVaultInput({
          files: ["A.md", "One/Target.md", "Two/Target.md"],
          text: {
            "A.md": "[[Target]]",
            "One/Target.md": "",
            "Two/Target.md": "",
          },
        }),
      ),
      /Ambiguous wiki link "Target" in A\.md\. Use a more specific path\./,
    )
  })

  test("throws for missing, ambiguous, and duplicate assets", async () => {
    await assert.rejects(
      buildGeneratedContentPlan(
        fakeVaultInput({
          files: ["A.md"],
          text: { "A.md": "![[missing.png]]" },
        }),
      ),
      /Missing embedded asset "missing\.png" in A\.md/,
    )

    await assert.rejects(
      buildGeneratedContentPlan(
        fakeVaultInput({
          files: ["A.md", "One/Same.png", "Two/Same.png"],
          text: { "A.md": "" },
        }),
      ),
      /Duplicate asset basename detected: Same\.png/,
    )

    await assert.rejects(
      buildGeneratedContentPlan(
        fakeVaultInput({
          files: ["A.md", "One/My Image.png", "Two/My-Image.png"],
          text: { "A.md": "![](my-image.png)" },
        }),
      ),
      /Ambiguous linked asset "my-image\.png" in A\.md/,
    )
  })
})

describe("writeGeneratedContentPlan", () => {
  function buildPlan(
    roots: { sourceRoot: string; contentRoot: string },
    files: GeneratedContentPlan["files"],
  ): GeneratedContentPlan {
    return {
      sourceRoot: roots.sourceRoot,
      contentRoot: roots.contentRoot,
      cleanupRoot: roots.contentRoot,
      files,
    }
  }

  test("cleans, creates directories, writes text, and copies assets", async () => {
    await withTempRoots(async (roots) => {
      await fs.mkdir(path.join(roots.sourceRoot, "assets"), { recursive: true })
      await fs.writeFile(path.join(roots.sourceRoot, "assets/source.png"), "asset")
      await fs.writeFile(path.join(roots.contentRoot, "stale.md"), "stale")

      await writeGeneratedContentPlan(
        buildPlan(roots, [
          { kind: "text", outputRelativePath: "notes/a.md", contents: "hello\n" },
          {
            kind: "copy",
            sourceRelativePath: "assets/source.png",
            outputRelativePath: "assets/source.png",
          },
        ]),
      )

      await assert.rejects(fs.stat(path.join(roots.contentRoot, "stale.md")))
      assert.strictEqual(
        await fs.readFile(path.join(roots.contentRoot, "notes/a.md"), "utf8"),
        "hello\n",
      )
      assert.strictEqual(
        await fs.readFile(path.join(roots.contentRoot, "assets/source.png"), "utf8"),
        "asset",
      )
    })
  })

  test("validates roots before cleanup or writes", async () => {
    await withTempRoots(async (roots) => {
      const sentinel = path.join(roots.contentRoot, "sentinel.md")
      await fs.writeFile(sentinel, "keep")

      await assert.rejects(
        writeGeneratedContentPlan({
          ...buildPlan(roots, [{ kind: "text", outputRelativePath: "a.md", contents: "" }]),
          sourceRoot: "relative-source",
        }),
        /sourceRoot must be an absolute path/,
      )

      await assert.rejects(
        writeGeneratedContentPlan({
          ...buildPlan(roots, [{ kind: "text", outputRelativePath: "a.md", contents: "" }]),
          cleanupRoot: roots.sourceRoot,
        }),
        /cleanupRoot must equal contentRoot/,
      )

      assert.strictEqual(await fs.readFile(sentinel, "utf8"), "keep")
    })
  })

  test("rejects normalized duplicate output paths before cleanup", async () => {
    await withTempRoots(async (roots) => {
      const sentinel = path.join(roots.contentRoot, "sentinel.md")
      await fs.writeFile(sentinel, "keep")

      await assert.rejects(
        writeGeneratedContentPlan(
          buildPlan(roots, [
            { kind: "text", outputRelativePath: "a.md", contents: "" },
            { kind: "text", outputRelativePath: "./a.md", contents: "" },
          ]),
        ),
        /Duplicate output path in generated content plan: a\.md/,
      )

      assert.strictEqual(await fs.readFile(sentinel, "utf8"), "keep")
    })
  })

  test("rejects output and source path traversal before cleanup", async () => {
    await withTempRoots(async (roots) => {
      const sentinel = path.join(roots.contentRoot, "sentinel.md")
      await fs.writeFile(sentinel, "keep")

      await assert.rejects(
        writeGeneratedContentPlan(
          buildPlan(roots, [{ kind: "text", outputRelativePath: "../escape.md", contents: "" }]),
        ),
        /outputRelativePath must not escape its root/,
      )

      await assert.rejects(
        writeGeneratedContentPlan(
          buildPlan(roots, [
            { kind: "copy", sourceRelativePath: "../secret.png", outputRelativePath: "asset.png" },
          ]),
        ),
        /sourceRelativePath must not escape its root/,
      )

      assert.strictEqual(await fs.readFile(sentinel, "utf8"), "keep")
    })
  })
})

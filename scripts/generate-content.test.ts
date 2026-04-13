import assert from "node:assert"
import test, { describe } from "node:test"
import {
  assertNoBrokenMathHeadings,
  buildRelativeAssetLink,
  extractDescription,
  normalizeBrokenMathHeadings,
  rewriteAssetLinks,
} from "./generate-content"

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

    assert.strictEqual(
      normalized,
      ["$$", "V^{\\pi}(s) = \\mathbb E_{\\pi}[G_t]", "$$"].join("\n"),
    )
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
          sourcePath: "obsidian/Model Architecture/Transformer/figures/Pasted image 20260413003945.png",
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
        sourceRelativePath: "content/model-architecture/transformer/paper-reading/sink-attention.md",
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
        sourceRelativePath: "obsidian/Model Architecture/Transformer/paper reading/Sink Attention.md",
        outputRelativePath: "model-architecture/transformer/paper-reading/sink-attention.md",
      },
      new Map(),
    )

    assert.strictEqual(rewritten, "![remote](https://example.com/image.png)")
  })
})

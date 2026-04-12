import assert from "node:assert"
import test, { describe } from "node:test"
import {
  assertNoBrokenMathHeadings,
  extractDescription,
  normalizeBrokenMathHeadings,
} from "./generate-content"

describe("normalizeBrokenMathHeadings", () => {
  test("rewrites multiline math headings into a hooked block math", () => {
    const input = ["# $$", "V(s) = r + \\gamma V(s')", "$$", "Following text."].join("\n")

    const normalized = normalizeBrokenMathHeadings(input, "obsidian/RL/test.md")

    assert.strictEqual(
      normalized,
      [
        '<div class="math-heading-block" data-heading-level="1"></div>',
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
        "$$",
        "a + b",
        "$$",
      ].join("\n"),
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

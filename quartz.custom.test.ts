import assert from "node:assert"
import test, { describe } from "node:test"
import { explorerMapFn } from "./quartz.custom"
import { ContentDetails } from "./quartz/plugins/emitters/contentIndex"
import { FileTrieNode } from "./quartz/util/fileTrie"
import { FilePath, FullSlug } from "./quartz/util/path"

function content(slug: FullSlug, title: string, filePath: FilePath): ContentDetails {
  return {
    slug,
    title,
    filePath,
    links: [],
    tags: [],
    content: "",
  }
}

describe("custom Explorer map function", () => {
  test("counts recursive leaf notes without counting folder index data", () => {
    const trie = FileTrieNode.fromEntries<ContentDetails>([
      [
        "topic/nested/index" as FullSlug,
        content("topic/nested/index" as FullSlug, "Nested", "topic/nested/index.md" as FilePath),
      ],
      [
        "topic/index" as FullSlug,
        content("topic/index" as FullSlug, "Topic", "topic/index.md" as FilePath),
      ],
      [
        "topic/intro" as FullSlug,
        content("topic/intro" as FullSlug, "Intro", "topic/intro.md" as FilePath),
      ],
      [
        "topic/nested/deep-note" as FullSlug,
        content(
          "topic/nested/deep-note" as FullSlug,
          "Deep Note",
          "topic/nested/deep-note.md" as FilePath,
        ),
      ],
      [
        "topic/empty/index" as FullSlug,
        content("topic/empty/index" as FullSlug, "Empty", "topic/empty/index.md" as FilePath),
      ],
    ])

    const topic = trie.findNode(["topic"])
    const nested = trie.findNode(["topic", "nested"])
    const empty = trie.findNode(["topic", "empty"])
    assert.ok(topic)
    assert.ok(nested)
    assert.ok(empty)

    topic.displayName = "Topic (99)"

    explorerMapFn(topic)
    explorerMapFn(nested)
    explorerMapFn(empty)

    assert.strictEqual(topic.displayName, "Topic (2)")
    assert.strictEqual(nested.displayName, "Nested (1)")
    assert.strictEqual(empty.displayName, "Empty (0)")
  })
})

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  CATEGORIES,
  GENERATED_CONTENT_PATH,
  NOTES,
  NOTES_ROOT_SLUG,
  PROFILE,
  PROFILE_LINKS,
  SITE_TITLE,
  SOURCE_VAULT_PATH,
} from "../site.config"

const SOURCE_ROOT = path.resolve(SOURCE_VAULT_PATH)
const CONTENT_ROOT = path.resolve(GENERATED_CONTENT_PATH)
const NOTES_ROOT = path.join(CONTENT_ROOT, NOTES_ROOT_SLUG)

const MARKDOWN_EXTENSIONS = new Set([".md"])
const ASSET_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"])

type NoteConfig = (typeof NOTES)[number]

function toPosix(value: string): string {
  return value.split(path.sep).join(path.posix.sep)
}

function categoryByKey(categoryKey: NoteConfig["category"]) {
  const category = CATEGORIES.find((entry) => entry.key === categoryKey)
  if (!category) {
    throw new Error(`Unknown category: ${categoryKey}`)
  }

  return category
}

function stripLeadingFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---\n")) {
    return markdown
  }

  const closingIndex = markdown.indexOf("\n---\n", 4)
  if (closingIndex === -1) {
    return markdown
  }

  return markdown.slice(closingIndex + "\n---\n".length).replace(/^\n+/, "")
}

function slugifyHeading(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
}

function ensureRelativeLink(targetPath: string): string {
  if (
    targetPath.startsWith("./") ||
    targetPath.startsWith("../") ||
    targetPath.startsWith("http://") ||
    targetPath.startsWith("https://") ||
    targetPath.startsWith("mailto:")
  ) {
    return targetPath
  }

  return `./${targetPath}`
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function truncateDescription(value: string, maxLength = 160): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

function yamlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
}

function extractDescription(markdown: string): string {
  const cleaned = markdown
    .replace(/!\[\[[^\]]+\]\]/g, " ")
    .replace(/(?<!!)\[\[([^\]|#]+)(#[^\]|]+)?(\|([^\]]+))?\]\]/g, "$4$1")
    .replace(/`+/g, " ")
    .replace(/[*_>#-]/g, " ")
    .replace(/\$+/g, " ")

  const candidate = cleaned
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0)

  return truncateDescription(candidate ?? "Technical note.")
}

async function listFiles(rootDir: string): Promise<string[]> {
  const entries = await fs.readdir(rootDir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(rootDir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === ".obsidian") {
          return []
        }

        return listFiles(fullPath)
      }

      return [fullPath]
    }),
  )

  return files.flat()
}

function noteOutputRelativePath(note: NoteConfig): string {
  return path.posix.join(NOTES_ROOT_SLUG, note.category, `${note.slug}.md`)
}

function assetOutputRelativePath(sourceRelativePath: string): string {
  const [sourceDir, ...rest] = toPosix(sourceRelativePath).split("/")
  const category = CATEGORIES.find((entry) => entry.sourceDir === sourceDir)
  if (!category) {
    throw new Error(`Cannot map asset path to category: ${sourceRelativePath}`)
  }

  return path.posix.join(NOTES_ROOT_SLUG, category.key, ...rest)
}

function buildFrontmatter(note: NoteConfig, description: string, date: string): string {
  return [
    "---",
    `title: ${yamlString(note.title)}`,
    `description: ${yamlString(description)}`,
    "draft: false",
    `date: ${date}`,
    "tags:",
    '  - "datascience"',
    `  - "${note.category}"`,
    '  - "notes"',
    `category: ${yamlString(note.category)}`,
    "---",
    "",
  ].join("\n")
}

function buildRootIndex(): string {
  const introParagraphs = PROFILE.intro.map((line) => `<p>${line}</p>`).join("\n")
  const profileLinks = PROFILE_LINKS.map(
    (link) => `<a href="${link.href}" class="home-link">${link.label}</a>`,
  ).join("\n")
  const categoryCards = CATEGORIES.map(
    (category) => `<a class="category-card" href="./${category.route}">
  <h2>${category.title}</h2>
  <p>${category.description}</p>
</a>`,
  ).join("\n")

  return `---
title: ${yamlString(PROFILE.name)}
description: ${yamlString(PROFILE.role)}
draft: false
cssclasses:
  - home-page
---

<div class="home-hero">
  <p class="home-eyebrow">${PROFILE.role}</p>
  <h1>${PROFILE.name}</h1>
  <div class="home-copy">
${introParagraphs}
  </div>
  <div class="home-links">
${profileLinks}
  </div>
</div>

## Notes

This site publishes the notes I maintain in my Obsidian vault, organized for browsing in Quartz.

<div class="category-grid">
${categoryCards}
</div>
`
}

function buildNotesRootIndex(): string {
  const categoryLinks = CATEGORIES.map(
    (category) => `- [${category.title}](./${category.key}): ${category.description}`,
  ).join("\n")

  return `---
title: ${yamlString("Notes")}
description: ${yamlString("Category entry points for my data science notes.")}
draft: false
cssclasses:
  - section-page
---

These notes are grouped by topic and published without modifying the original Markdown files in \`${SOURCE_VAULT_PATH}\`.

${categoryLinks}
`
}

function buildCategoryIndex(categoryKey: NoteConfig["category"]): string {
  const category = categoryByKey(categoryKey)
  return `---
title: ${yamlString(category.title)}
description: ${yamlString(category.description)}
draft: false
cssclasses:
  - section-page
---

${category.description}
`
}

async function ensureDirectory(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

async function writeTextFile(filePath: string, contents: string): Promise<void> {
  await ensureDirectory(filePath)
  await fs.writeFile(filePath, contents, "utf8")
}

async function copyFile(sourcePath: string, targetPath: string): Promise<void> {
  await ensureDirectory(targetPath)
  await fs.copyFile(sourcePath, targetPath)
}

function parseWikiTarget(rawTarget: string): { target: string; anchor?: string } {
  const [target, anchor] = rawTarget.split("#")
  return {
    target: path.parse(target).name || target,
    anchor,
  }
}

async function main(): Promise<void> {
  const allSourceFiles = await listFiles(SOURCE_ROOT)
  const sourceMarkdownFiles = allSourceFiles
    .filter((filePath) => MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => toPosix(path.relative(SOURCE_ROOT, filePath)))
    .sort()
  const configuredMarkdownFiles = Array.from<string>(NOTES.map((note) => note.sourcePath)).sort()

  const missingFromConfig = sourceMarkdownFiles.filter(
    (filePath) => !configuredMarkdownFiles.includes(filePath),
  )
  const missingFromSource = configuredMarkdownFiles.filter(
    (filePath) => !sourceMarkdownFiles.includes(filePath),
  )

  if (missingFromConfig.length > 0 || missingFromSource.length > 0) {
    throw new Error(
      [
        "Configured note list does not match source files.",
        missingFromConfig.length > 0
          ? `Missing config entries: ${missingFromConfig.join(", ")}`
          : "",
        missingFromSource.length > 0 ? `Missing source files: ${missingFromSource.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    )
  }

  const assetFiles = allSourceFiles.filter((filePath) =>
    ASSET_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
  )

  const assetMap = new Map<string, { sourcePath: string; outputRelativePath: string }>()
  for (const assetPath of assetFiles) {
    const basename = path.basename(assetPath)
    if (assetMap.has(basename)) {
      throw new Error(`Duplicate asset basename detected: ${basename}`)
    }

    const sourceRelativePath = toPosix(path.relative(SOURCE_ROOT, assetPath))
    assetMap.set(basename, {
      sourcePath: assetPath,
      outputRelativePath: assetOutputRelativePath(sourceRelativePath),
    })
  }

  const noteMap = new Map(
    NOTES.map((note) => [
      path.parse(note.sourcePath).name,
      {
        ...note,
        outputRelativePath: noteOutputRelativePath(note),
      },
    ]),
  )

  await fs.rm(NOTES_ROOT, { recursive: true, force: true })
  await writeTextFile(path.join(CONTENT_ROOT, "index.md"), buildRootIndex())
  await writeTextFile(path.join(NOTES_ROOT, "index.md"), buildNotesRootIndex())

  for (const category of CATEGORIES) {
    await writeTextFile(
      path.join(CONTENT_ROOT, NOTES_ROOT_SLUG, category.key, "index.md"),
      buildCategoryIndex(category.key),
    )
  }

  for (const asset of assetMap.values()) {
    await copyFile(asset.sourcePath, path.join(CONTENT_ROOT, asset.outputRelativePath))
  }

  for (const note of NOTES) {
    const sourcePath = path.join(SOURCE_ROOT, note.sourcePath)
    const rawMarkdown = await fs.readFile(sourcePath, "utf8")
    const markdownBody = stripLeadingFrontmatter(rawMarkdown)
    const currentNoteOutputRelativePath = noteOutputRelativePath(note)

    const transformedBody = markdownBody
      .replace(/!\[\[([^\]]+)\]\]/g, (_match, rawTarget: string) => {
        const [targetName] = rawTarget.split("|")
        const assetName = path.basename(targetName)
        const asset = assetMap.get(assetName)
        if (!asset) {
          throw new Error(`Missing embedded asset "${assetName}" in ${note.sourcePath}`)
        }

        const relativePath = ensureRelativeLink(
          toPosix(
            path.relative(
              path.dirname(path.join(CONTENT_ROOT, currentNoteOutputRelativePath)),
              path.join(CONTENT_ROOT, asset.outputRelativePath),
            ),
          ),
        )

        return `![](${relativePath})`
      })
      .replace(/(?<!!)\[\[([^\]]+)\]\]/g, (_match, rawTarget: string) => {
        const [targetPart, alias] = rawTarget.split("|")
        const { target, anchor } = parseWikiTarget(targetPart)
        const targetNote = noteMap.get(target)
        if (!targetNote) {
          throw new Error(`Missing linked note "${target}" in ${note.sourcePath}`)
        }

        const relativePath = ensureRelativeLink(
          toPosix(
            path.relative(
              path.dirname(path.join(CONTENT_ROOT, currentNoteOutputRelativePath)),
              path.join(CONTENT_ROOT, targetNote.outputRelativePath),
            ),
          ),
        )
        const anchorSuffix = anchor ? `#${slugifyHeading(anchor)}` : ""
        const linkLabel = alias ?? targetNote.title
        return `[${linkLabel}](${relativePath}${anchorSuffix})`
      })

    const sourceStat = await fs.stat(sourcePath)
    const frontmatter = buildFrontmatter(
      note,
      extractDescription(markdownBody),
      formatDate(sourceStat.mtime),
    )
    const outputPath = path.join(CONTENT_ROOT, currentNoteOutputRelativePath)

    await writeTextFile(outputPath, `${frontmatter}${transformedBody.trimEnd()}\n`)
  }

  console.log(`Generated ${NOTES.length} notes into ${path.relative(process.cwd(), CONTENT_ROOT)}`)
  console.log(`Site title: ${SITE_TITLE}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

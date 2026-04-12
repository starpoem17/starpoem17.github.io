import { promises as fs } from "node:fs"
import path from "node:path"
import {
  FOLDER_DEFINITIONS,
  GENERATED_CONTENT_PATH,
  HOME_NOTES_DESCRIPTION,
  HOME_NOTES_HEADING,
  NOTES_ROOT_SLUG,
  PROFILE,
  PROFILE_IMAGE_OUTPUT_PATH,
  PROFILE_IMAGE_SOURCE_PATH,
  PROFILE_LINKS,
  SECTION_DEFINITIONS,
  SITE_TITLE,
  SOURCE_OBSIDIAN_ROOT,
  prettifySegment,
  slugifySegment,
  sourceFolderToSlug,
  sourceNoteToSlug,
} from "../site.config"

const SOURCE_ROOT = path.resolve(SOURCE_OBSIDIAN_ROOT)
const CONTENT_ROOT = path.resolve(GENERATED_CONTENT_PATH)
const NOTES_ROOT = path.join(CONTENT_ROOT, NOTES_ROOT_SLUG)
const PROFILE_IMAGE_SOURCE = path.resolve(PROFILE_IMAGE_SOURCE_PATH)
const PROFILE_IMAGE_OUTPUT = path.join(CONTENT_ROOT, PROFILE_IMAGE_OUTPUT_PATH)

const MARKDOWN_EXTENSIONS = new Set([".md"])
const ASSET_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"])

type NoteEntry = {
  basename: string
  sourceRelativePath: string
  sourceRelativeStem: string
  outputSlug: string
  outputRelativePath: string
  title: string
  topSection: string
}

function toPosix(value: string): string {
  return value.split(path.sep).join(path.posix.sep)
}

function yamlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
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

function slugifyHeading(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
}

function truncateDescription(value: string, maxLength = 160): string {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`
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

function sourcePathToOutputRelativePath(sourceRelativePath: string): string {
  const normalized = toPosix(sourceRelativePath)
  const parsed = path.posix.parse(normalized)
  const folderSegments = parsed.dir.split("/").filter(Boolean).map(slugifySegment)
  return path.posix.join(NOTES_ROOT_SLUG, ...folderSegments, `${slugifySegment(parsed.name)}.md`)
}

function assetSourcePathToOutputRelativePath(sourceRelativePath: string): string {
  const normalized = toPosix(sourceRelativePath)
  const parsed = path.posix.parse(normalized)
  const folderSegments = parsed.dir.split("/").filter(Boolean).map(slugifySegment)
  return path.posix.join(NOTES_ROOT_SLUG, ...folderSegments, parsed.base)
}

function buildFrontmatter(note: NoteEntry, description: string, date: string): string {
  return [
    "---",
    `title: ${yamlString(note.title)}`,
    `description: ${yamlString(description)}`,
    "draft: false",
    `date: ${date}`,
    "tags:",
    '  - "notes"',
    `  - ${yamlString(slugifySegment(note.topSection))}`,
    `topSection: ${yamlString(note.topSection)}`,
    "---",
    "",
  ].join("\n")
}

function folderDefinitionMap() {
  return new Map(
    [...SECTION_DEFINITIONS, ...FOLDER_DEFINITIONS].map((entry) => [
      toPosix(entry.sourcePath),
      entry,
    ]),
  )
}

function topSectionLinks(sectionFolders: string[]): string {
  return sectionFolders
    .map((folderPath) => {
      const definition = SECTION_DEFINITIONS.find((entry) => entry.sourcePath === folderPath)
      const title = definition?.title ?? prettifySegment(path.posix.basename(folderPath))
      return `- [${title}](./${sourceFolderToSlug(folderPath)})`
    })
    .join("\n")
}

function buildRootIndex(sectionFolders: string[]): string {
  const introParagraphs = PROFILE.intro.map((line) => `      <p>${line}</p>`).join("\n")
  const profileLinks = PROFILE_LINKS.map(
    (link) => `      <a href="${link.href}" class="profile-link">${link.label}</a>`,
  ).join("\n")

  return `---
title: ${yamlString(PROFILE.name)}
description: ${yamlString(PROFILE.role)}
draft: false
cssclasses:
  - home-page
---

<section class="about-me">
  <div class="about-me__media">
    <img src="./${PROFILE_IMAGE_OUTPUT_PATH}" alt="${PROFILE.name}" class="profile-photo" />
  </div>
  <div class="about-me__content">
    <p class="about-me__eyebrow">About me</p>
    <h1>${PROFILE.name}</h1>
    <p class="about-me__role">${PROFILE.role}</p>
    <div class="about-me__copy">
${introParagraphs}
    </div>
    <div class="about-me__links">
${profileLinks}
    </div>
  </div>
</section>

## ${HOME_NOTES_HEADING}

${HOME_NOTES_DESCRIPTION}

${topSectionLinks(sectionFolders)}
`
}

function buildNotesRootIndex(sectionFolders: string[]): string {
  const listItems = topSectionLinks(sectionFolders)
  return `---
title: ${yamlString("obsidian")}
description: ${yamlString("Root of the published Obsidian note tree.")}
draft: false
cssclasses:
  - section-page
---

The note tree below mirrors the high-level structure of the files stored in \`${SOURCE_OBSIDIAN_ROOT}/\`.

${listItems}
`
}

function buildFolderIndex(folderPath: string, hasOverrideDescription: string | undefined): string {
  const title =
    folderPath === ""
      ? "obsidian"
      : (folderDefinitionMap().get(folderPath)?.title ??
        prettifySegment(path.posix.basename(folderPath)))
  const description =
    hasOverrideDescription ??
    (folderPath === ""
      ? "Browse the note tree stored in my Obsidian vault."
      : `Notes and subfolders inside ${title}.`)

  return `---
title: ${yamlString(title)}
description: ${yamlString(description)}
draft: false
cssclasses:
  - section-page
---

${description}
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
    target: target.trim(),
    anchor,
  }
}

function buildNoteEntries(sourceMarkdownFiles: string[]): NoteEntry[] {
  return sourceMarkdownFiles.map((sourceRelativePath) => {
    const normalizedSourcePath = toPosix(sourceRelativePath)
    const parsed = path.posix.parse(normalizedSourcePath)
    const topSection = normalizedSourcePath.split("/")[0] ?? "Notes"
    return {
      basename: parsed.name,
      sourceRelativePath: normalizedSourcePath,
      sourceRelativeStem: path.posix.join(parsed.dir, parsed.name),
      outputSlug: sourceNoteToSlug(normalizedSourcePath),
      outputRelativePath: sourcePathToOutputRelativePath(normalizedSourcePath),
      title: parsed.name,
      topSection,
    }
  })
}

function buildNoteLookup(notes: NoteEntry[]) {
  const basenameMap = new Map<string, NoteEntry[]>()
  const stemMap = new Map<string, NoteEntry>()

  for (const note of notes) {
    const current = basenameMap.get(note.basename) ?? []
    current.push(note)
    basenameMap.set(note.basename, current)
    stemMap.set(note.sourceRelativeStem, note)
  }

  return { basenameMap, stemMap }
}

function resolveWikiLinkTarget(
  rawTarget: string,
  currentNote: NoteEntry,
  notes: ReturnType<typeof buildNoteLookup>,
): NoteEntry {
  const { target } = parseWikiTarget(rawTarget)
  const normalizedTarget = toPosix(target)
  const exactStem = notes.stemMap.get(normalizedTarget)
  if (exactStem) {
    return exactStem
  }

  const currentDir = path.posix.dirname(currentNote.sourceRelativeStem)
  const relativeStem = path.posix.normalize(path.posix.join(currentDir, normalizedTarget))
  const relativeMatch = notes.stemMap.get(relativeStem)
  if (relativeMatch) {
    return relativeMatch
  }

  const basename = path.posix.basename(normalizedTarget)
  const basenameMatches = notes.basenameMap.get(basename) ?? []
  if (basenameMatches.length === 1) {
    return basenameMatches[0]
  }

  if (basenameMatches.length > 1) {
    throw new Error(
      `Ambiguous wiki link "${rawTarget}" in ${currentNote.sourceRelativePath}. Use a more specific path.`,
    )
  }

  throw new Error(`Missing linked note "${rawTarget}" in ${currentNote.sourceRelativePath}`)
}

function folderAncestors(folderPath: string): string[] {
  const normalizedPath = toPosix(folderPath)
  if (!normalizedPath || normalizedPath === ".") {
    return [""]
  }

  const parts = normalizedPath.split("/").filter(Boolean)
  const result = [""]
  for (let index = 0; index < parts.length; index += 1) {
    result.push(parts.slice(0, index + 1).join("/"))
  }

  return result
}

async function main(): Promise<void> {
  const allSourceFiles = await listFiles(SOURCE_ROOT)
  const sourceMarkdownFiles = allSourceFiles
    .filter((filePath) => MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => toPosix(path.relative(SOURCE_ROOT, filePath)))
    .sort()

  const noteEntries = buildNoteEntries(sourceMarkdownFiles)
  const noteLookup = buildNoteLookup(noteEntries)

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
      outputRelativePath: assetSourcePathToOutputRelativePath(sourceRelativePath),
    })
  }

  const folderDefinitionLookup = folderDefinitionMap()
  const folderSet = new Set<string>()
  for (const note of noteEntries) {
    for (const folderPath of folderAncestors(path.posix.dirname(note.sourceRelativePath))) {
      folderSet.add(folderPath)
    }
  }

  const sectionFolders = Array.from(
    new Set(noteEntries.map((note) => note.sourceRelativePath.split("/")[0]).filter(Boolean)),
  )

  await fs.rm(NOTES_ROOT, { recursive: true, force: true })
  await writeTextFile(path.join(CONTENT_ROOT, "index.md"), buildRootIndex(sectionFolders))
  await writeTextFile(path.join(NOTES_ROOT, "index.md"), buildNotesRootIndex(sectionFolders))

  for (const folderPath of Array.from(folderSet).sort((a, b) => a.localeCompare(b))) {
    if (folderPath === "") {
      continue
    }

    const outputPath = path.join(CONTENT_ROOT, sourceFolderToSlug(folderPath), "index.md")
    const description = folderDefinitionLookup.get(folderPath)?.description
    await writeTextFile(outputPath, buildFolderIndex(folderPath, description))
  }

  for (const asset of assetMap.values()) {
    await copyFile(asset.sourcePath, path.join(CONTENT_ROOT, asset.outputRelativePath))
  }

  await copyFile(PROFILE_IMAGE_SOURCE, PROFILE_IMAGE_OUTPUT)

  for (const note of noteEntries) {
    const sourcePath = path.join(SOURCE_ROOT, note.sourceRelativePath)
    const rawMarkdown = await fs.readFile(sourcePath, "utf8")
    const markdownBody = stripLeadingFrontmatter(rawMarkdown)
    const outputPath = path.join(CONTENT_ROOT, note.outputRelativePath)

    const transformedBody = markdownBody
      .replace(/!\[\[([^\]]+)\]\]/g, (_match, rawTarget: string) => {
        const [targetName] = rawTarget.split("|")
        const assetName = path.basename(targetName.trim())
        const asset = assetMap.get(assetName)
        if (!asset) {
          throw new Error(`Missing embedded asset "${assetName}" in ${note.sourceRelativePath}`)
        }

        const relativePath = ensureRelativeLink(
          toPosix(
            path.relative(
              path.dirname(outputPath),
              path.join(CONTENT_ROOT, asset.outputRelativePath),
            ),
          ),
        )
        return `![](${relativePath})`
      })
      .replace(/(?<!!)\[\[([^\]]+)\]\]/g, (_match, rawTarget: string) => {
        const [targetPart, alias] = rawTarget.split("|")
        const linkedNote = resolveWikiLinkTarget(targetPart, note, noteLookup)
        const { anchor } = parseWikiTarget(targetPart)
        const relativePath = ensureRelativeLink(
          toPosix(
            path.relative(
              path.dirname(outputPath),
              path.join(CONTENT_ROOT, linkedNote.outputRelativePath),
            ),
          ),
        )
        const anchorSuffix = anchor ? `#${slugifyHeading(anchor)}` : ""
        return `[${alias ?? linkedNote.title}](${relativePath}${anchorSuffix})`
      })

    const sourceStat = await fs.stat(sourcePath)
    const frontmatter = buildFrontmatter(
      note,
      extractDescription(markdownBody),
      formatDate(sourceStat.mtime),
    )
    await writeTextFile(outputPath, `${frontmatter}${transformedBody.trimEnd()}\n`)
  }

  console.log(
    `Generated ${noteEntries.length} notes into ${path.relative(process.cwd(), CONTENT_ROOT)}`,
  )
  console.log(`Site title: ${SITE_TITLE}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

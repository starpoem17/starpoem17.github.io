import type { Options as ExplorerOptions } from "./quartz/components/Explorer"
import type { SortFn } from "./quartz/components/PageList"
import type { QuartzPluginData } from "./quartz/plugins/vfile"
import { EXPLORER_TITLE, FOLDER_ORDER, NOTE_ORDER } from "./site.config"

const folderOrder = new Map<string, number>(FOLDER_ORDER.map((slug, index) => [slug, index]))
const noteOrder = new Map<string, number>(NOTE_ORDER.map((slug, index) => [slug, index]))

function normalizeSlug(slug?: string): string {
  return (slug ?? "").replace(/\/index$/, "")
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

function pathDepth(slug: string): number {
  return normalizeSlug(slug).split("/").filter(Boolean).length
}

function getRank(slug?: string): number {
  const normalizedSlug = normalizeSlug(slug)
  return (
    noteOrder.get(normalizedSlug) ?? folderOrder.get(normalizedSlug) ?? Number.POSITIVE_INFINITY
  )
}

function isFolderSlug(slug?: string): boolean {
  return (slug ?? "").endsWith("/index")
}

function compareStructuredSlugs(aSlug?: string, bSlug?: string): number {
  const aNormalized = normalizeSlug(aSlug)
  const bNormalized = normalizeSlug(bSlug)

  const aRank = getRank(aNormalized)
  const bRank = getRank(bNormalized)
  if (aRank !== bRank && (Number.isFinite(aRank) || Number.isFinite(bRank))) {
    return aRank - bRank
  }

  const depthDiff = pathDepth(aNormalized) - pathDepth(bNormalized)
  if (depthDiff !== 0) {
    return depthDiff
  }

  return compareText(aNormalized, bNormalized)
}

// Explorer functions are serialized into the page and re-hydrated in the browser via `new Function`.
// Keep them self-contained so they don't depend on module-scope helpers that won't exist at runtime.
const explorerFilterFnSource = `(node) => {
  const normalizedSlug = (node.slug ?? "").replace(/\\/index$/, "")
  if (normalizedSlug === "index") {
    return false
  }

  return node.slugSegment !== "tags"
}`

const explorerSortFnSource = `(a, b) => {
  const folderOrder = ${JSON.stringify(FOLDER_ORDER)}
  const noteOrder = ${JSON.stringify(NOTE_ORDER)}
  const folderRanks = Object.fromEntries(folderOrder.map((slug, index) => [slug, index]))
  const noteRanks = Object.fromEntries(noteOrder.map((slug, index) => [slug, index]))
  const normalizeSlug = (slug) => (slug ?? "").replace(/\\/index$/, "")
  const compareText = (left, right) =>
    left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" })
  const pathDepth = (slug) => normalizeSlug(slug).split("/").filter(Boolean).length
  const getRank = (slug) => {
    const normalizedSlug = normalizeSlug(slug)
    return (
      noteRanks[normalizedSlug] ??
      folderRanks[normalizedSlug] ??
      Number.POSITIVE_INFINITY
    )
  }
  const compareStructuredSlugs = (aSlug, bSlug) => {
    const aNormalized = normalizeSlug(aSlug)
    const bNormalized = normalizeSlug(bSlug)
    const aRank = getRank(aNormalized)
    const bRank = getRank(bNormalized)

    if (aRank !== bRank && (Number.isFinite(aRank) || Number.isFinite(bRank))) {
      return aRank - bRank
    }

    const depthDiff = pathDepth(aNormalized) - pathDepth(bNormalized)
    if (depthDiff !== 0) {
      return depthDiff
    }

    return compareText(aNormalized, bNormalized)
  }

  if (a.isFolder !== b.isFolder) {
    return a.isFolder ? -1 : 1
  }

  const structuredDiff = compareStructuredSlugs(a.slug, b.slug)
  if (structuredDiff !== 0) {
    return structuredDiff
  }

  return compareText(a.displayName, b.displayName)
}`

export const explorerFilterFn = new Function(
  `return ${explorerFilterFnSource}`,
)() as ExplorerOptions["filterFn"]

export const explorerSortFn = new Function(
  `return ${explorerSortFnSource}`,
)() as ExplorerOptions["sortFn"]

export const folderSortFn: SortFn = (a: QuartzPluginData, b: QuartzPluginData) => {
  const aIsFolder = isFolderSlug(a.slug)
  const bIsFolder = isFolderSlug(b.slug)
  if (aIsFolder !== bIsFolder) {
    return aIsFolder ? -1 : 1
  }

  const structuredDiff = compareStructuredSlugs(a.slug, b.slug)
  if (structuredDiff !== 0) {
    return structuredDiff
  }

  const aTitle = a.frontmatter?.title ?? ""
  const bTitle = b.frontmatter?.title ?? ""
  return compareText(aTitle, bTitle)
}

export const explorerTitle = EXPLORER_TITLE

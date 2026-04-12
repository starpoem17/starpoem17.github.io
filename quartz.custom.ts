import type { Options as ExplorerOptions } from "./quartz/components/Explorer"
import type { SortFn } from "./quartz/components/PageList"
import type { QuartzPluginData } from "./quartz/plugins/vfile"
import { FOLDER_ORDER, NOTE_ORDER, PROFILE_LINKS, SECTION_ORDER, SITE_TITLE } from "./site.config"

const sectionOrder = new Map<string, number>(SECTION_ORDER.map((slug, index) => [slug, index]))
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
    noteOrder.get(normalizedSlug) ??
    folderOrder.get(normalizedSlug) ??
    sectionOrder.get(normalizedSlug) ??
    Number.POSITIVE_INFINITY
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

export const explorerFilterFn: ExplorerOptions["filterFn"] = (node) => {
  const normalizedSlug = normalizeSlug(node.slug)
  if (normalizedSlug === "index") {
    return false
  }

  return node.slugSegment !== "tags"
}

export const explorerSortFn: ExplorerOptions["sortFn"] = (a, b) => {
  if (a.isFolder !== b.isFolder) {
    return a.isFolder ? -1 : 1
  }

  const structuredDiff = compareStructuredSlugs(a.slug, b.slug)
  if (structuredDiff !== 0) {
    return structuredDiff
  }

  return compareText(a.displayName, b.displayName)
}

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

export const footerLinks = Object.fromEntries(PROFILE_LINKS.map((link) => [link.label, link.href]))
export const explorerTitle = SITE_TITLE

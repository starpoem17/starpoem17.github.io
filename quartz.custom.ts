import type { SortFn } from "./quartz/components/PageList"
import type { Options as ExplorerOptions } from "./quartz/components/Explorer"
import type { QuartzPluginData } from "./quartz/plugins/vfile"
import { EXPLORER_CATEGORY_ORDER, EXPLORER_NOTE_ORDER, PROFILE_LINKS } from "./site.config"

const categoryOrder = new Map<string, number>(
  EXPLORER_CATEGORY_ORDER.map((slug, index) => [slug, index]),
)
const noteOrder = new Map<string, number>(EXPLORER_NOTE_ORDER.map((slug, index) => [slug, index]))

function normalizeSlug(slug?: string): string {
  return (slug ?? "").replace(/\/index$/, "")
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

function getRank(slug?: string): number {
  const normalizedSlug = normalizeSlug(slug)
  return (
    noteOrder.get(normalizedSlug) ?? categoryOrder.get(normalizedSlug) ?? Number.POSITIVE_INFINITY
  )
}

function isFolderSlug(slug?: string): boolean {
  return (slug ?? "").endsWith("/index")
}

export const explorerSortFn: ExplorerOptions["sortFn"] = (a, b) => {
  if (a.isFolder !== b.isFolder) {
    return a.isFolder ? -1 : 1
  }

  const aRank = getRank(a.slug)
  const bRank = getRank(b.slug)
  if (aRank !== bRank && (Number.isFinite(aRank) || Number.isFinite(bRank))) {
    return aRank - bRank
  }

  return compareText(a.displayName, b.displayName)
}

export const folderSortFn: SortFn = (a: QuartzPluginData, b: QuartzPluginData) => {
  const aIsFolder = isFolderSlug(a.slug)
  const bIsFolder = isFolderSlug(b.slug)
  if (aIsFolder !== bIsFolder) {
    return aIsFolder ? -1 : 1
  }

  const aRank = getRank(a.slug)
  const bRank = getRank(b.slug)
  if (aRank !== bRank && (Number.isFinite(aRank) || Number.isFinite(bRank))) {
    return aRank - bRank
  }

  const aTitle = a.frontmatter?.title ?? ""
  const bTitle = b.frontmatter?.title ?? ""
  return compareText(aTitle, bTitle)
}

export const footerLinks = Object.fromEntries(PROFILE_LINKS.map((link) => [link.label, link.href]))

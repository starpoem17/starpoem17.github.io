import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import type { QuartzComponent } from "./quartz/components/types"
import { explorerFilterFn, explorerSortFn, explorerTitle } from "./quartz.custom"

const EmptyFooter: QuartzComponent = () => null

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: EmptyFooter,
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left: [
    Component.Search(),
    Component.Explorer({
      title: explorerTitle,
      folderClickBehavior: "collapse",
      folderDefaultState: "open",
      useSavedState: true,
      filterFn: explorerFilterFn,
      sortFn: explorerSortFn,
    }),
  ],
  right: [],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.Search(),
    Component.Explorer({
      title: explorerTitle,
      folderClickBehavior: "collapse",
      folderDefaultState: "open",
      useSavedState: true,
      filterFn: explorerFilterFn,
      sortFn: explorerSortFn,
    }),
  ],
  right: [],
}

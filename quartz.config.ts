import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { folderSortFn } from "./quartz.custom"
import { SITE_BASE_URL, SITE_LOCALE, SITE_TITLE } from "./site.config"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: SITE_TITLE,
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: SITE_LOCALE,
    baseUrl: SITE_BASE_URL,
    ignorePatterns: ["private", "templates", ".obsidian", "obsidian", "personal", "plans"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Cardo",
        body: "Lora",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f5f0e8",
          lightgray: "#d8d0c3",
          gray: "#aba293",
          darkgray: "#5c554c",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(132, 165, 157, 0.18)",
          textHighlight: "#efd99899",
        },
        darkMode: {
          light: "#1f1c19",
          lightgray: "#413a34",
          gray: "#766f67",
          darkgray: "#d6d0c6",
          dark: "#f3eee5",
          secondary: "#9cbfcb",
          tertiary: "#9ab8af",
          highlight: "rgba(132, 165, 157, 0.2)",
          textHighlight: "#b39d4888",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage({ sort: folderSortFn }),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config

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
        header: "IBM Plex Sans KR",
        body: "Noto Sans KR",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f5f2eb",
          lightgray: "#ddd5c7",
          gray: "#b6ad9d",
          darkgray: "#4d4a45",
          dark: "#1f2430",
          secondary: "#155e75",
          tertiary: "#c07f00",
          highlight: "rgba(21, 94, 117, 0.12)",
          textHighlight: "#ffe08a88",
        },
        darkMode: {
          light: "#11161d",
          lightgray: "#26313d",
          gray: "#77808c",
          darkgray: "#d5dce3",
          dark: "#f5f7fa",
          secondary: "#67b7d1",
          tertiary: "#f3b74b",
          highlight: "rgba(103, 183, 209, 0.16)",
          textHighlight: "#f0c75e66",
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

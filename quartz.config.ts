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
        header: "Schibsted Grotesk",
        body: "Source Serif 4",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#fffdf8",
          lightgray: "#e7e0d5",
          gray: "#b6ab9a",
          darkgray: "#55514a",
          dark: "#201f1d",
          secondary: "#1d5f8c",
          tertiary: "#b76c3d",
          highlight: "rgba(29, 95, 140, 0.1)",
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

import path from "node:path"

export const SITE_TITLE = "Hwajoong Kim"
export const SITE_BASE_URL = "starpoem17.github.io"
export const SITE_LOCALE = "en-US"

export const SOURCE_OBSIDIAN_ROOT = "obsidian"
export const GENERATED_CONTENT_PATH = "content"
export const NOTES_ROOT_SLUG = "obsidian"

export const PROFILE_IMAGE_SOURCE_PATH = "profile.jpg"
export const PROFILE_IMAGE_OUTPUT_PATH = `${NOTES_ROOT_SLUG}/assets/profile.jpg`

export const PROFILE = {
  name: "Hwajoong Kim",
  role: "AI/ML Researcher & Developer | Data Science",
  intro: [
    "I study and build AI/ML systems with a focus on machine learning, data science, and clear technical communication.",
    "This site publishes the notes I keep in Obsidian and turns them into a browsable public knowledge base.",
    "My goal is to make complex topics easier to revisit, connect, and extend over time.",
  ],
  githubUrl: "https://github.com/starpoem17",
  linkedInUrl: "https://www.linkedin.com/in/%ED%99%94%EC%A4%91-%EA%B9%80-687287400/",
  email: "coolkhj2003@hanyang.ac.kr",
} as const

export const PROFILE_LINKS = [
  { label: "Email", href: `mailto:${PROFILE.email}` },
  { label: "LinkedIn", href: PROFILE.linkedInUrl },
  { label: "GitHub", href: PROFILE.githubUrl },
] as const

export const HOME_NOTES_HEADING = "Notes"
export const HOME_NOTES_DESCRIPTION =
  "Browse the note tree on the left. The structure follows the folders inside my Obsidian vault and is designed to scale to deeper hierarchies over time."

export const SECTION_DEFINITIONS = [
  {
    sourcePath: "Datascience",
    title: "Datascience",
    description:
      "Notes on reinforcement learning, recurrent neural networks, transformers, and related machine learning topics.",
  },
] as const

export const FOLDER_DEFINITIONS = [
  {
    sourcePath: "Datascience/RL",
    title: "RL",
    description:
      "Reinforcement learning notes on value functions, Bellman equations, exploration, and temporal-difference methods.",
  },
  {
    sourcePath: "Datascience/RNN",
    title: "RNN",
    description:
      "Recurrent network notes from vanilla RNNs and BPTT to bidirectional architectures, LSTMs, and sequence applications.",
  },
  {
    sourcePath: "Datascience/Transformer",
    title: "Transformer",
    description:
      "Transformer implementation notes focused on multi-head attention and tensor-shape reasoning.",
  },
] as const

export const MANUAL_NOTE_SOURCE_ORDER = [
  "Datascience/RL/Value Function.md",
  "Datascience/RL/Bellman Equation of V-function.md",
  "Datascience/RL/Bellman Equation of Q-function.md",
  "Datascience/RL/Bellman Optimality Equation.md",
  "Datascience/RL/Exploration.md",
  "Datascience/RL/Temporal Difference.md",
  "Datascience/RL/SARSA.md",
  "Datascience/RL/Q-Learning.md",
  "Datascience/RNN/Vanilla RNN.md",
  "Datascience/RNN/BPTT.md",
  "Datascience/RNN/Bidirectional-RNN.md",
  "Datascience/RNN/LSTM.md",
  "Datascience/RNN/RNN - 활용 방식.md",
  "Datascience/Transformer/Multi Head Attention - Tensor 차원 흐름.md",
] as const

function toPosix(value: string): string {
  return value.split(path.sep).join(path.posix.sep)
}

export function slugifySegment(segment: string): string {
  return segment
    .trim()
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function prettifySegment(segment: string): string {
  return segment.replace(/[-_]/g, " ").trim() || segment
}

export function sourceFolderToSlug(folderPath: string): string {
  const parts = toPosix(folderPath).split("/").filter(Boolean).map(slugifySegment)
  return [NOTES_ROOT_SLUG, ...parts].join("/")
}

export function sourceNoteToSlug(noteSourcePath: string): string {
  const normalizedSourcePath = toPosix(noteSourcePath)
  const parsed = path.posix.parse(normalizedSourcePath)
  const folderParts = parsed.dir.split("/").filter(Boolean).map(slugifySegment)
  return [NOTES_ROOT_SLUG, ...folderParts, slugifySegment(parsed.name)].join("/")
}

export const SECTION_ORDER = SECTION_DEFINITIONS.map((section) =>
  sourceFolderToSlug(section.sourcePath),
)

export const FOLDER_ORDER = FOLDER_DEFINITIONS.map((folder) =>
  sourceFolderToSlug(folder.sourcePath),
)
export const NOTE_ORDER = MANUAL_NOTE_SOURCE_ORDER.map((note) => sourceNoteToSlug(note))

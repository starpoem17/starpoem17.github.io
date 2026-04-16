import path from "node:path"

export const SITE_TITLE = "Hwajoong Kim"
export const SITE_BASE_URL = "starpoem17.github.io"
export const SITE_LOCALE = "en-US"

export const SOURCE_OBSIDIAN_ROOT = "obsidian"
export const GENERATED_CONTENT_PATH = "content"
export const EXPLORER_TITLE = ""
export const PROFILE_IMAGE_PUBLIC_PATH = "static/profile.jpg"

export const PROFILE = {
  name: "Hwajoong Kim",
  role: "Undergraduate in Data Science at Hanyang University",
  intro: [
    "Currently exploring robotics and embodied AI at BAIK LAB.",
    "This site turns my Obsidian notes into a public knowledge base of what I am learning. My goal is to make complex topics easier to revisit, connect, and extend over time.",
  ],
  focusLead: "My interests lie in agents that can perceive, reason, and act, with a focus on:",
  focusAreas: ["Multimodal", "Embodied AI"],
  githubUrl: "https://github.com/starpoem17",
  linkedInUrl: "https://www.linkedin.com/in/%ED%99%94%EC%A4%91-%EA%B9%80-687287400/",
  email: "coolkhj2003@hanyang.ac.kr",
  cvUrl: "./static/main.pdf",
} as const

export const PROFILE_LINKS = [
  { label: "Email", href: `mailto:${PROFILE.email}` },
  { label: "LinkedIn", href: PROFILE.linkedInUrl },
  { label: "GitHub", href: PROFILE.githubUrl },
  { label: "CV", href: PROFILE.cvUrl, newTab: true },
] as const

export const FOLDER_METADATA = [
  {
    sourcePath: "RL",
    title: "RL",
    description:
      "Reinforcement learning notes on value functions, Bellman equations, exploration, and temporal-difference methods.",
  },
  {
    sourcePath: "Model Architecture",
    title: "Model Architecture",
    description:
      "Notes on neural architectures and implementation details across recurrent and transformer-based models.",
  },
  {
    sourcePath: "Model Architecture/RNN",
    title: "RNN",
    description:
      "Recurrent network notes from vanilla RNNs and BPTT to bidirectional architectures, LSTMs, and sequence applications.",
  },
  {
    sourcePath: "Model Architecture/Transformer",
    title: "Transformer",
    description:
      "Transformer implementation notes focused on multi-head attention and tensor-shape reasoning.",
  },
] as const

export const MANUAL_FOLDER_SOURCE_ORDER = [
  "RL",
  "Model Architecture",
  "Model Architecture/RNN",
  "Model Architecture/Transformer",
] as const

export const MANUAL_NOTE_SOURCE_ORDER = [
  "RL/Value Function.md",
  "RL/Bellman Equation of V-function.md",
  "RL/Bellman Equation of Q-function.md",
  "RL/Bellman Optimality Equation.md",
  "RL/Exploration.md",
  "RL/Temporal Difference.md",
  "RL/SARSA.md",
  "RL/Q-Learning.md",
  "Model Architecture/RNN/Vanilla RNN.md",
  "Model Architecture/RNN/BPTT.md",
  "Model Architecture/RNN/Bidirectional-RNN.md",
  "Model Architecture/RNN/LSTM.md",
  "Model Architecture/RNN/RNN - 활용 방식.md",
  "Model Architecture/Transformer/Multi Head Attention - Tensor 차원 흐름.md",
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
  return parts.join("/")
}

export function sourceNoteToSlug(noteSourcePath: string): string {
  const normalizedSourcePath = toPosix(noteSourcePath)
  const parsed = path.posix.parse(normalizedSourcePath)
  const folderParts = parsed.dir.split("/").filter(Boolean).map(slugifySegment)
  return [...folderParts, slugifySegment(parsed.name)].join("/")
}

export const FOLDER_ORDER = MANUAL_FOLDER_SOURCE_ORDER.map((folder) => sourceFolderToSlug(folder))
export const NOTE_ORDER = MANUAL_NOTE_SOURCE_ORDER.map((note) => sourceNoteToSlug(note))

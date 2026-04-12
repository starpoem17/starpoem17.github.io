export type CategoryKey = "rl" | "rnn" | "transformer"

export const SITE_TITLE = "Hwajoong Kim Notes"
export const SITE_BASE_URL = "starpoem17.github.io"
export const SITE_LOCALE = "en-US"
export const SOURCE_VAULT_PATH = "obsidian/Datascience"
export const GENERATED_CONTENT_PATH = "content"
export const NOTES_ROOT_SLUG = "datascience"

export const PROFILE = {
  name: "Hwajoong Kim",
  role: "AI/ML Researcher & Developer | Data Science",
  intro: [
    "I study and build AI/ML systems with a focus on data science.",
    "This site collects the notes I wrote while learning reinforcement learning, recurrent neural networks, and transformers.",
    "It serves as a public archive of concepts I want to revisit, connect, and apply in practice.",
  ],
  githubUrl: "https://github.com/starpoem17",
  linkedInUrl: "https://www.linkedin.com/in/%ED%99%94%EC%A4%91-%EA%B9%80-687287400/",
  email: "coolkhj2003@hanyang.ac.kr",
} as const

export const PROFILE_LINKS = [
  { label: "GitHub", href: PROFILE.githubUrl },
  { label: "LinkedIn", href: PROFILE.linkedInUrl },
  { label: "Email", href: `mailto:${PROFILE.email}` },
] as const

export const CATEGORIES = [
  {
    key: "rl" as const,
    title: "RL",
    sourceDir: "RL",
    route: `${NOTES_ROOT_SLUG}/rl`,
    description:
      "Reinforcement learning notes on value functions, Bellman equations, exploration, and temporal-difference methods.",
  },
  {
    key: "rnn" as const,
    title: "RNN",
    sourceDir: "RNN",
    route: `${NOTES_ROOT_SLUG}/rnn`,
    description:
      "Recurrent network notes from vanilla RNNs and BPTT to bidirectional architectures, LSTMs, and sequence applications.",
  },
  {
    key: "transformer" as const,
    title: "Transformer",
    sourceDir: "Transformer",
    route: `${NOTES_ROOT_SLUG}/transformer`,
    description:
      "Transformer implementation notes focused on multi-head attention and tensor-shape reasoning.",
  },
] as const

export const NOTES = [
  {
    category: "rl" as const,
    title: "Value Function",
    slug: "value-function",
    sourcePath: "RL/Value Function.md",
  },
  {
    category: "rl" as const,
    title: "Bellman Equation of V-function",
    slug: "bellman-equation-of-v-function",
    sourcePath: "RL/Bellman Equation of V-function.md",
  },
  {
    category: "rl" as const,
    title: "Bellman Equation of Q-function",
    slug: "bellman-equation-of-q-function",
    sourcePath: "RL/Bellman Equation of Q-function.md",
  },
  {
    category: "rl" as const,
    title: "Bellman Optimality Equation",
    slug: "bellman-optimality-equation",
    sourcePath: "RL/Bellman Optimality Equation.md",
  },
  {
    category: "rl" as const,
    title: "Exploration",
    slug: "exploration",
    sourcePath: "RL/Exploration.md",
  },
  {
    category: "rl" as const,
    title: "Temporal Difference",
    slug: "temporal-difference",
    sourcePath: "RL/Temporal Difference.md",
  },
  {
    category: "rl" as const,
    title: "SARSA",
    slug: "sarsa",
    sourcePath: "RL/SARSA.md",
  },
  {
    category: "rl" as const,
    title: "Q-Learning",
    slug: "q-learning",
    sourcePath: "RL/Q-Learning.md",
  },
  {
    category: "rnn" as const,
    title: "Vanilla RNN",
    slug: "vanilla-rnn",
    sourcePath: "RNN/Vanilla RNN.md",
  },
  {
    category: "rnn" as const,
    title: "BPTT",
    slug: "bptt",
    sourcePath: "RNN/BPTT.md",
  },
  {
    category: "rnn" as const,
    title: "Bidirectional-RNN",
    slug: "bidirectional-rnn",
    sourcePath: "RNN/Bidirectional-RNN.md",
  },
  {
    category: "rnn" as const,
    title: "LSTM",
    slug: "lstm",
    sourcePath: "RNN/LSTM.md",
  },
  {
    category: "rnn" as const,
    title: "RNN - 활용 방식",
    slug: "rnn-applications",
    sourcePath: "RNN/RNN - 활용 방식.md",
  },
  {
    category: "transformer" as const,
    title: "Multi Head Attention - Tensor 차원 흐름",
    slug: "multi-head-attention-tensor-dimensions",
    sourcePath: "Transformer/Multi Head Attention - Tensor 차원 흐름.md",
  },
] as const

export const EXPLORER_CATEGORY_ORDER = CATEGORIES.map((category) => category.route)
export const EXPLORER_NOTE_ORDER = NOTES.map(
  (note) => `${NOTES_ROOT_SLUG}/${note.category}/${note.slug}`,
)

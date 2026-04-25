import path from "path"
import { FilePath } from "./path"
import { globby } from "globby"
import { GENERATED_CONTENT_PATH } from "../../site.config"

export function toPosixPath(fp: string): string {
  return fp.split(path.sep).join("/")
}

export async function glob(
  pattern: string,
  cwd: string,
  ignorePatterns: string[],
): Promise<FilePath[]> {
  const generatedContentRoot = path.resolve(GENERATED_CONTENT_PATH)
  const resolvedCwd = path.resolve(cwd)
  const relativeToGeneratedContent = path.relative(generatedContentRoot, resolvedCwd)
  const isGeneratedContentPath =
    relativeToGeneratedContent === "" ||
    (relativeToGeneratedContent !== "" &&
      !relativeToGeneratedContent.startsWith("..") &&
      !path.isAbsolute(relativeToGeneratedContent))
  const fps = (
    await globby(pattern, {
      cwd,
      ignore: ignorePatterns,
      gitignore: !isGeneratedContentPath,
    })
  ).map(toPosixPath)
  return fps as FilePath[]
}

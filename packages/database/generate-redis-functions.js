import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'

async function generateRedisFunctions(sourceDir, targetFile) {
  const sourceFiles = await readdir(sourceDir, { recursive: true })
  const embedFiles = []

  for (const fileName of sourceFiles.sort()) {
    if (fileName === '.gitkeep') {
      continue
    }

    const filePath = join(sourceDir, fileName)
    const fileStat = await stat(filePath)

    if (!fileStat.isFile()) {
      continue
    }

    const fileBody = await readFile(filePath, 'utf8')

    embedFiles.push([fileName, fileBody])
  }

  const targetBody = `// Auto-generated file. Do not edit manually!

/**
 * @category none
 * @internal
 */
export const redisFunctions: Map<string, string> = new Map(${JSON.stringify(embedFiles, null, 2)})`

  await writeFile(targetFile, targetBody, 'utf8')
}

try {
  await generateRedisFunctions('redis-functions', 'src/redis-functions.ts')
} catch (error) {
  console.error(`Generate redis-functions failed`, { error })
}

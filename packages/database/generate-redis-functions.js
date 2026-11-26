import { readdir, readFile, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { gzipSync, gunzipSync } from "node:zlib"

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

    embedFiles.push(fileBody)
  }

  const embedFile = gzipSync(Buffer.from(embedFiles.join('\n'), 'utf8'), { level: 9 })
    .toString('base64')
    .match(/.{1,76}/g)?.join('\n') ?? ''

  const targetBody = `// Auto-generated file. Do not edit manually!

import { gunzipSync } from 'noze:zlib'

const REDIS_FUNCTIONS = \`
${embedFile}
\`

/**
 * @category none
 * @internal
 */
export function redisFunctions(): string {
  return gunzipSync(Buffer.from(REDIS_FUNCTIONS, 'base64'))toString('utf-8')
}
`

  await writeFile(targetFile, targetBody, 'utf8')
}

try {
  await generateRedisFunctions('redis-functions', 'src/redis-functions.ts')
} catch (error) {
  console.error(error)
}

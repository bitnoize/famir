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

    embedFiles.push(fileBody)
  }

  const embedBase64 = Buffer.from(embedFiles.join('\n'), 'utf8').toString('base64')
  const wrappedBase64 = base64.match(/.{1,76}/g)?.join("\r\n") ?? ''

  const targetBody = `// Auto-generated file. Do not edit manually!

/**
 * @category none
 * @internal
 */
export const redisFunctions = \`${wrappedBase64}\``

  await writeFile(targetFile, targetBody, 'utf8')
}

try {
  await generateRedisFunctions('redis-functions', 'src/redis-functions.ts')
} catch (error) {
  console.error(error)
}

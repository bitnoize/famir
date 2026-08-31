const changelogFunctions = {
  getReleaseLine: (changeset, type) => {
    const [firstLine, ...futureLines] = changeset.summary.split('\n').map((l) => l.trimEnd())

    let returnVal = `- ${firstLine}`

    if (futureLines.length > 0) {
      returnVal += `\n${futureLines.map((l) => `  ${l}`).join('\n')}`
    }

    return returnVal
  },

  getDependencyReleaseLine: (changesets, dependenciesUpdated) => {
    if (changesets.length === 0 || dependenciesUpdated.length === 0) {
      return ''
    }

    const dependencyLines = dependenciesUpdated.map((dep) => `  - ${dep.name}@${dep.newVersion}`)

    return [`- Updated dependencies:`, ...dependencyLines].join('\n')
  },
}

export default changelogFunctions

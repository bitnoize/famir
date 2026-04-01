export interface RewriteUrlTarget {
  donorSecure: boolean
  donorHost: string
  mirrorSecure: boolean
  mirrorHost: string
}

export type RewriteUrlScheme = [string, boolean] // separator, withProto

/*
 * Rewrite target urls in text
 */
export function rewriteUrl(
  text: string,
  rev: boolean,
  targets: RewriteUrlTarget[],
  schemes: RewriteUrlScheme[]
) {
  targets.forEach((target) => {
    const [oldSecure, newSecure] = rev
      ? [target.mirrorSecure, target.donorSecure]
      : [target.donorSecure, target.mirrorSecure]

    const oldProto = oldSecure ? 'https' : 'http'
    const newProto = newSecure ? 'https' : 'http'

    const [oldHost, newHost] = rev
      ? [target.mirrorHost, target.donorHost]
      : [target.donorHost, target.mirrorHost]

    schemes.forEach(([separator, withProto]) => {
      const pattern = withProto
        ? [oldProto, separator, oldHost].join('')
        : [separator, oldHost].join('')

      const replacement = withProto
        ? [newProto, separator, newHost].join('')
        : [separator, newHost].join('')

      text = text.replaceAll(pattern, replacement)
    })
  })

  return text
}

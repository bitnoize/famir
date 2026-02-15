export interface RewriteUrlTarget {
  donorSecure: boolean
  donorHost: string
  mirrorSecure: boolean
  mirrorHost: string
}

export type RewriteUrlScheme = [string, boolean] // separator, withProto

export function rewriteUrl(
  text: string,
  rev: boolean,
  targets: RewriteUrlTarget[],
  schemes: RewriteUrlScheme[]
) {
  targets.forEach((target) => {
    const [fromSecure, toSecure] = rev
      ? [target.mirrorSecure, target.donorSecure]
      : [target.donorSecure, target.mirrorSecure]

    const fromProto = fromSecure ? 'https' : 'http'
    const toProto = toSecure ? 'https' : 'http'

    const [fromHost, toHost] = rev
      ? [target.mirrorHost, target.donorHost]
      : [target.donorHost, target.mirrorHost]

    schemes.forEach(([separator, withProto]) => {
      const pattern = withProto
        ? [fromProto, separator, fromHost].join('')
        : [separator, fromHost].join('')

      const replacement = withProto
        ? [toProto, separator, toHost].join('')
        : [separator, toHost].join('')

      text = text.replaceAll(pattern, replacement)
    })
  })

  return text
}

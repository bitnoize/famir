/**
 * @category none
 * @internal
 */
export interface RewriteUrlTarget {
  donorSecure: boolean
  donorHost: string
  mirrorSecure: boolean
  mirrorHost: string
}

/**
 * @category none
 * @internal
 */
export type RewriteUrlScheme = [string, boolean] // separator, withProto

/**
 * Rewrite URLs in text content for proxy/mirror scenarios.
 *
 * @param text - Source text containing URLs to rewrite
 * @param rev - Reverse mode (mirror → donor instead of donor → mirror)
 * @param targets - Array of target configurations with donor/mirror hosts
 * @param schemes - URL schemes to match (e.g., ['://', true] for protocol + separator)
 * @returns Text with rewritten URLs
 *
 * @category none
 * @internal
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

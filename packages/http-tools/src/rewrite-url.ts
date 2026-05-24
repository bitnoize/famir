/**
 * Target configuration for URL rewriting.
 *
 * Contains both donor and mirror host information for the rewrite operation.
 *
 * @internal
 */
export interface RewriteUrlTarget {
  /** Whether the donor server uses HTTPS. */
  donorSecure: boolean
  /** The donor server host. */
  donorHost: string
  /** Whether the mirror server uses HTTPS. */
  mirrorSecure: boolean
  /** The mirror server host. */
  mirrorHost: string
}

/**
 * URL scheme configuration for rewriting.
 *
 * @internal
 */
export type RewriteUrlScheme = [string, boolean] // separator, withProto

/**
 * Rewrite URLs in text content.
 *
 * @param text - Source text containing URLs to rewrite
 * @param rev - Reverse mode (mirror - donor instead of donor - mirror)
 * @param targets - Array of target configurations with hosts
 * @param schemes - URL schemes to match
 * @returns Text with rewritten URLs
 *
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

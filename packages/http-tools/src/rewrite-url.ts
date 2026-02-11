export interface RewriteUrlTarget {
  donorSecure: boolean
  donorHost: string
  mirrorSecure: boolean
  mirrorHost: string
}

export type RewriteUrlScheme = [string, boolean] // separator, withProto

export type RewriteUrlHtmlTag = [string, string?] // tag, attrName

export function rewriteUrl(
  text: string,
  rev: boolean,
  targets: RewriteUrlTarget[],
  schemes: RewriteUrlScheme[]
) {
  targets.forEach((target) => {
    const [srcSecure, dstSecure] = rev
      ? [target.mirrorSecure, target.donorSecure]
      : [target.donorSecure, target.mirrorSecure]

    const srcProto = srcSecure ? 'https' : 'http'
    const dstProto = dstSecure ? 'https' : 'http'

    const [srcHost, dstHost] = rev
      ? [target.mirrorHost, target.donorHost]
      : [target.donorHost, target.mirrorHost]

    schemes.forEach(([separator, withProto]) => {
      const pattern = withProto
        ? [srcProto, separator, srcHost].join('')
        : [separator, srcHost].join('')

      const replacement = withProto
        ? [dstProto, separator, dstHost].join('')
        : [separator, dstHost].join('')

      text = text.replaceAll(pattern, replacement)
    })
  })

  return text
}

/*
export function rewriteHtmlUrls(
  $: CheerioAPI,
  rev: boolean,
  targets: RewriteUrlsTarget[],
  schemes: RewriteUrlsScheme[],
  htmlTags: RewriteUrlsHtmlTag[]
) {
  htmlTags.forEach(([tag, attrName]) => {
    $(tag).each((index, element) => {
      if (attrName) {
        const text = $(element).attr(attrName)
        if (text) {
          const rewritedText = rewriteTextUrls(text, rev, targets, schemes)

          $(element).attr(attrName, rewritedText)
        }
      } else {
        const text = $(element).text()
        if (text) {
          const rewritedText = rewriteTextUrls(text, rev, targets, schemes)

          $(element).text(rewritedText)
        }
      }
    })
  })
}
*/

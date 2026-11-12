import { DIContainer } from '@famir/common'
import {
  HttpServerError,
  Logger,
  LOGGER,
  TEMPLATER,
  Templater,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { HTTP_SERVER_ASSETS, HttpServerAssets, HttpServerMiddleware } from '@famir/http-server'
import { ReverseTenant, ReverseTenantClass } from './reverse-tenant.js'

/**
 * DI token for a reverse tenant switch implementation.
 */
export const REVERSE_TENANT_SWITCH = Symbol('ReverseTenantSwitch')

/**
 * Represents the reverse tenant switch.
 */
export class ReverseTenantSwitch {
  /**
   * Registers the reverse tenant switch as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer, tenantClasses: ReverseTenantClass[]) {
    container.registerSingleton<ReverseTenantSwitch>(
      REVERSE_TENANT_SWITCH,
      (c) =>
        new this(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<HttpServerAssets>(HTTP_SERVER_ASSETS),
          tenantClasses
        )
    )
  }

  /**
   * Creates a new reverse tenant switch instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param tenantClasses - The list of tenant classes.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly assets: HttpServerAssets,
    tenantClasses: ReverseTenantClass[]
  ) {
    for (const tenantClass of tenantClasses) {
      const tenant = new tenantClass(this.validator, this.logger, this.templater, this.assets)

      if (this.tenants.has(tenant.targetLabel)) {
        throw new Error(`Tenant already exists: ${tenant.targetLabel}`)
      }

      this.tenants.set(tenant.targetLabel, tenant.init())
    }
  }

  /** Mapping of targetLabels to reverse tenants. */
  protected readonly tenants: Map<string, ReverseTenant> = new Map()

  /**
   *
   */
  find(controllerName: string, targetLabel: string): HttpServerMiddleware {
    const tenant = this.tenants.get(targetLabel)

    if (!tenant) {
      throw HttpServerError.serviceUnavailable(`Service unavailable`, {
        reason: `Tenant not found`,
        controllerName,
        targetLabel,
      })
    }

    return tenant.hooks[controllerName] ?? this.skipHook
  }

  protected readonly skipHook: HttpServerMiddleware = async (ctx, next) => {
    await next()
  }
}

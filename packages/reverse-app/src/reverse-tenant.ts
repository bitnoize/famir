import { Logger, Templater, Validator } from '@famir/domain'
import { type HttpServerAssets, HttpServerContext, HttpServerMiddleware } from '@famir/http-server'
import { ReverseContextState } from './reverse-context-state.js'

export type ReverseTenantHooks = Record<string, HttpServerMiddleware>

/**
 * Represents reverse tenant.
 */
export interface ReverseTenant {
  readonly targetLabel: string
  init(): this
  hooks: ReverseTenantHooks
}

/**
 * Represents constructor for reverse tenant.
 */
export type ReverseTenantClass = new (
  validator: Validator,
  logger: Logger,
  templater: Templater,
  assets: HttpServerAssets
) => ReverseTenant

/**
 * Abstract base class for reverse tenant.
 *
 * @category none
 */
export abstract class BaseReverseTenant implements ReverseTenant {
  /**
   * Creates a new reverse tenant instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly assets: HttpServerAssets
  ) {}

  /** Reference to target via label. */
  abstract readonly targetLabel: string

  /**
   * Initialize tenant.
   */
  abstract init(): this

  /**
   *
   */
  abstract readonly hooks: ReverseTenantHooks

  protected getState<T extends ReverseContextState, K extends keyof T>(
    ctx: HttpServerContext,
    key: K
  ): NonNullable<T[K]> {
    return ctx.getState(key)
  }
}

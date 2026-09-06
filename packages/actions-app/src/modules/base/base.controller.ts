import { type ConsumerAssets, type ConsumerRouter } from '@famir/consumer'
import { Logger, Templater, Validator } from '@famir/domain'

/**
 * Abstract base class for all application controllers.
 *
 * All specific controller implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
 *
 * @category none
 */
export abstract class BaseController {
  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly assets: ConsumerAssets,
    protected readonly router: ConsumerRouter
  ) {}
}

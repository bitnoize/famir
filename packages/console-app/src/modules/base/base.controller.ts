import { Logger } from '@famir/logger'
import { ReplServerAssets, ReplServerError, ReplServerRouter } from '@famir/repl-server'
import { Templater } from '@famir/templater'
import { Validator } from '@famir/validator'
import { Console } from 'node:console'
import { parse as yamlParse } from 'yaml'

/**
 * Abstract base class for all application controllers.
 *
 * All specific controller implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
 *
 * @category none
 * @internal
 */
export abstract class BaseController {
  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The repl-server router instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly assets: ReplServerAssets,
    protected readonly router: ReplServerRouter
  ) {}

  protected confirmAlert(console: Console) {
    console.error(`Confirmation required, use --force flag if you are sure`)
  }

  /**
   * Decodes a JSON string to an object.
   *
   * @param str - The JSON string to decode.
   * @returns The decoded object.
   * @throws {@link ReplServerError} If decoding fails.
   */
  protected decodeJson(str: string): unknown {
    try {
      return JSON.parse(str)
    } catch (error) {
      throw ReplServerError.badRequest(`Decode JSON failed`, null, error)
    }
  }

  /**
   * Parses an YAML string to an object.
   *
   * @param str - The YAML string to parse.
   * @returns The parsed object.
   * @throws {@link ReplServerError} If decoding fails.
   */
  protected parseYaml(str: string): unknown {
    try {
      return yamlParse(str)
    } catch (error) {
      throw ReplServerError.badRequest(`Parse YAML failed`, null, error)
    }
  }

  /**
   * Validates data against a registered JSON Schema.
   *
   * @typeParam T - The expected type of the data after validation.
   * @param schemaName - The name of the schema to validate against.
   * @param data - The data to validate.
   * @throws {@link ReplServerError} If validation fails.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected validateData<T>(schemaName: string, value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(schemaName, value)
    } catch (error) {
      throw ReplServerError.badRequest(`Validate data failed`, null, error)
    }
  }
}

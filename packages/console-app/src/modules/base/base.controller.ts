import { Logger } from '@famir/logger'
import { ReplServerError, ReplServerRouter } from '@famir/repl-server'
import { Validator } from '@famir/validator'
import { readFile, writeFile } from 'fs/promises'
import { Console } from 'node:console'

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
   * @param router - The repl-server router instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: ReplServerRouter
  ) {}

  protected confirmAlert(console: Console) {
    console.error(`Confirmation required, use --force flag if you are sure`)
  }

  protected async readFile(filePath: string): Promise<Buffer> {
    try {
      return await readFile(filePath)
    } catch (error) {
      throw new ReplServerError(`Read file error`, {
        cause: error,
        code: 'BAD_REQUEST',
      })
    }
  }

  protected async writeFile(filePath: string, body: Buffer): Promise<void> {
    try {
      await writeFile(filePath, body)
    } catch (error) {
      throw new ReplServerError(`Write file error`, {
        cause: error,
        code: 'BAD_REQUEST',
      })
    }
  }

  /**
   * Encodes an object to a JSON string.
   *
   * @param obj - The object to encode.
   * @returns The JSON string representation.
   * @throws {@link ReplServerError} If encoding fails.
   */
  protected encodeJson(obj: object): string {
    try {
      return JSON.stringify(obj)
    } catch (error) {
      throw ReplServerError.internal(`Encode JSON failed`, null, error)
    }
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
      throw ReplServerError.internal(`Decode JSON failed`, null, error)
    }
  }

  /**
   * Encodes a Buffer to a Base64 string.
   *
   * @param buf - The Buffer to encode.
   * @returns The Base64 string representation.
   * @throws {@link ReplServerError} If encoding fails.
   */
  protected encodeBase64(buf: Buffer): string {
    try {
      return buf.toString('base64')
    } catch (error) {
      throw ReplServerError.internal(`Encode Base64 failed`, null, error)
    }
  }

  /**
   * Decodes a Base64 string to a Buffer.
   *
   * @param str - The Base64 string to decode.
   * @returns The decoded Buffer.
   * @throws {@link ReplServerError} If decoding fails.
   */
  protected decodeBase64(str: string): Buffer {
    try {
      return Buffer.from(str, 'base64')
    } catch (error) {
      throw ReplServerError.internal(`Decode Base64 failed`, null, error)
    }
  }

  /**
   * Converts a Buffer to a UTF-8 string.
   *
   * @param buf - The Buffer.
   * @returns The UTF-8 string.
   * @throws {@link ReplServerError} If operation fails.
   */
  protected buf2str(buf: Buffer): string {
    try {
      return buf.toString('utf-8')
    } catch (error) {
      throw ReplServerError.badRequest(`Convert Buffer to String failed`, null, error)
    }
  }

  /**
   * Converts a UTF-8 string to a Buffer.
   *
   * @param str - The UTF-8 string.
   * @returns The Buffer.
   * @throws {@link ReplServerError} If operation fails.
   */
  protected str2buf(str: string): Buffer {
    try {
      return Buffer.from(str, 'utf-8')
    } catch (error) {
      throw ReplServerError.badRequest(`Decode UTF-8 failed`, null, error)
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

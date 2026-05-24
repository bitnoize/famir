import { Validator } from '@famir/validator'
import yargsParser from 'yargs-parser'
import { ReplServerError } from './repl-server.error.js'

/**
 * Represents the repl-server command option.
 */
export interface ReplServerCommandOption {
  readonly name: string
  readonly description: string
  readonly type: 'boolean' | 'number' | 'string'
  readonly alias?: string
  readonly default?: boolean | number | string | null
}

/**
 * Represents the repl-server command spec.
 */
export interface ReplServerCommandSpec {
  readonly name: string
  readonly description: string
  readonly schemaName: string
  readonly options: ReplServerCommandOption[]
  readonly params?: string[]
}

/**
 * Represents the repl-server command help function.
 */
export type ReplServerCommandHelp = (console: Console, spec: ReplServerCommandSpec) => void

/**
 * Represents the repl-server command args.
 */
export interface ReplServerCommandArgs {
  _: unknown[]
  help?: unknown
}

/**
 * Represents the repl-server context.
 */
export interface ReplServerCommandContext {
  famir: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Represents the repl-server command action function.
 */
export type ReplServerCommandAction<T extends ReplServerCommandArgs> = (
  console: Console,
  spec: ReplServerCommandSpec,
  args: T,
  context: ReplServerCommandContext
) => Promise<void>

/**
 * Represents the repl-server command state.
 */
interface ReplServerCommandState {
  readonly boolean: string[]
  readonly number: string[]
  readonly string: string[]
  readonly alias: Record<string, string>
  readonly default: Record<string, unknown>
}

/**
 * Represents the repl-server command.
 */
export class ReplServerCommand<T extends ReplServerCommandArgs> {
  /**
   * Creates a new command instance.
   *
   * @param validator - The validator instance.
   * @param spec - The spec object.
   * @param help - The help function.
   * @param action - The action function.
   */
  constructor(
    protected readonly validator: Validator,
    public readonly spec: ReplServerCommandSpec,
    protected readonly help: ReplServerCommandHelp,
    protected readonly action: ReplServerCommandAction<T>
  ) {
    const hasHelpOption = spec.options.some((option) => option.name === 'help')

    if (!hasHelpOption) {
      spec.options.push({
        name: 'help',
        description: `Show help screen with command usage`,
        type: 'boolean',
        alias: 'h',
      })
    }
  }

  /**
   * Parses command arguments with yargs-parser.
   *
   * @param args - The raw string.
   * @returns Parsed command args.
   */
  parseArgs(args: string): ReplServerCommandArgs {
    try {
      const state: ReplServerCommandState = {
        boolean: [],
        number: [],
        string: [],
        alias: {},
        default: {},
      }

      this.spec.options.forEach((option) => {
        if (option.type === 'boolean') {
          state.boolean.push(option.name)
        } else if (option.type === 'number') {
          state.number.push(option.name)
        } else if (option.type === 'string') {
          state.string.push(option.name)
        } else {
          throw new Error(`Unknown command option type`)
        }

        if (option.alias) {
          state.alias[option.name] = option.alias
        }

        if (option.default !== undefined) {
          state.default[option.name] = option.default
        }
      })

      const parsedArgs = yargsParser(args, {
        configuration: {
          'camel-case-expansion': true,
          'parse-numbers': false,
          'parse-positional-numbers': false,
          'boolean-negation': false,
          'duplicate-arguments-array': false,
          'flatten-duplicate-arrays': false,
          'set-placeholder-key': false,
          'halt-at-non-option': false,
          'strip-aliased': true,
          'unknown-options-as-args': false,
        },
        boolean: state.boolean,
        number: state.number,
        string: state.string,
        alias: state.alias,
        default: state.default,
      })

      return parsedArgs
    } catch (error) {
      this.handleCommandError(error, 'parse-args', args)
    }
  }

  /**
   * Shows command help screen.
   *
   * @param console - The underlying Console instance.
   */
  showHelp(console: Console, detail = false) {
    console.log()

    const usage: string = [
      `.${this.spec.name}`,
      this.spec.params ? this.spec.params.map((param) => `<${param}>`).join(' ') : '',
      this.spec.options.length > 0 ? `[OPTION]... ` : ``,
    ].join(' ')

    console.log(`Usage: ${usage}\n\n${this.spec.description}\n`)

    if (this.spec.options.length > 0) {
      console.log(`Options:`)

      this.spec.options.forEach((option) => {
        const line: string = [
          option.alias ? `--${option.name}, -${option.alias}` : `--${option.name}`,
          option.type !== 'boolean'
            ? option.default !== undefined
              ? `[${option.type}], default: "${String(option.default)}"`
              : `<${option.type}>`
            : '',
        ].join(' ')

        console.log(`  ${line}\n    ${option.description}\n`)
      })
    }

    try {
      if (detail) {
        this.help(console, this.spec)
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Executes command with arguments.
   *
   * @param console - The underlying Console instance.
   * @param args - The parsed command args.
   * @throws {@link ReplServerError} If validation fails.
   */
  async execute(
    console: Console,
    args: ReplServerCommandArgs,
    context: ReplServerCommandContext
  ): Promise<void> {
    try {
      this.validateArgs(args)

      await this.action(console, this.spec, args, context)
    } catch (error) {
      this.handleCommandError(error, 'execute', args)
    }
  }

  /**
   * Handles command operation errors.
   *
   * Re-throws `ReplServerError` instances with additional context, or wraps
   * unknown errors into a `ReplServerError` with an `INTERNAL_ERROR` code.
   *
   * @param error - The caught error.
   * @param args - The args that were being processed.
   * @returns Never returns, always throws.
   */
  protected handleCommandError(error: unknown, level: string, args: unknown): never {
    if (error instanceof ReplServerError) {
      error.context['level'] = level
      error.context['spec'] = this.spec
      error.context['args'] = args

      throw error
    } else {
      throw new ReplServerError(`Unknown error`, {
        cause: error,
        context: {
          level,
          spec: this.spec,
          args,
        },
        code: 'INTERNAL_ERROR',
      })
    }
  }

  /**
   * Validates args against a registered JSON Schema.
   *
   * @param value - The args to validate.
   * @throws {@link ReplServerError} If validation fails.
   */
  protected validateArgs(value: unknown): asserts value is T {
    try {
      this.validator.assertSchema<T>(this.spec.schemaName, value)
    } catch (error) {
      throw new ReplServerError(`Validate args failed`, {
        cause: error,
        code: 'BAD_REQUEST',
      })
    }
  }
}

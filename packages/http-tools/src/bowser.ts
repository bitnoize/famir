import Bowser from 'bowser'

/**
 * User-agent string parser.
 *
 * @internal
 */
export const bowserParse = Bowser.parse

/**
 * Result of parsing a user-agent string.
 *
 * @internal
 */
export type BowserResult = Bowser.Parser.ParsedResult

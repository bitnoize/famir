import util from 'util'

/**
 * Configure Node.js util.inspect defaults for better debugging output.
 *
 * @category none
 */
Object.assign(util.inspect.defaultOptions, {
  depth: 8,
  showHidden: false,
})

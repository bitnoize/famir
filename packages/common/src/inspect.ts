import util from 'util'

Object.assign(util.inspect.defaultOptions, {
  depth: 8,
  showHidden: false,
})

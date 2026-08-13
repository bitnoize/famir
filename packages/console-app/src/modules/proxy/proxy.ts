/**
 * @category Proxy
 * @internal
 */
export interface CreateProxyArgs {
  _: [string, string]
  url: string
}

/**
 * @category Proxy
 * @internal
 */
export interface ReadProxyArgs {
  _: [string, string]
}

/**
 * @category Proxy
 * @internal
 */
export interface ToggleProxyArgs {
  _: [string, string]
}

/**
 * @category Proxy
 * @internal
 */
export interface DeleteProxyArgs {
  _: [string, string]
}

/**
 * @category Proxy
 * @internal
 */
export interface ListProxiesArgs {
  _: [string]
}

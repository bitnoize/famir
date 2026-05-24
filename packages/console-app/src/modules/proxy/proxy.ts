/**
 * Arguments for creating a proxy.
 *
 * @category Proxy
 * @internal
 */
export interface CreateProxyArgs {
  _: [string, string]
  url: string
  lockSecret: string
}

/**
 * Arguments for reading the proxy.
 *
 * @category Proxy
 * @internal
 */
export interface ReadProxyArgs {
  _: [string, string]
}

/**
 * Arguments for toggling the proxy.
 *
 * @category Proxy
 * @internal
 */
export interface ToggleProxyArgs {
  _: [string, string]
  lockSecret: string
}

/**
 * Arguments for deleting the proxy.
 *
 * @category Proxy
 * @internal
 */
export interface DeleteProxyArgs {
  _: [string, string]
  lockSecret: string
}

/**
 * Arguments for listing proxies.
 *
 * @category Proxy
 * @internal
 */
export interface ListProxiesArgs {
  _: [string]
}

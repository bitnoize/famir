/**
 * Check array includes a value, type-safe version.
 *
 * This function provides a type-guard version of Array.includes that properly
 * narrows the type of the element after checking.
 *
 * @category none
 * @param coll - The collection to search in
 * @param el - The element to check for
 * @returns Type guard indicating if the element is in the collection
 * @example
 * ```ts
 * const colors = ['red', 'green', 'blue'] as const
 * const value = 'red'
 *
 * if (arrayIncludes(colors, value)) {
 *   // value is now typed as 'red' | 'green' | 'blue'
 *   console.log(value)
 * }
 * ```
 * @see https://oida.dev/typescript-array-includes/
 */
export const arrayIncludes = <T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T => {
  return coll.includes(el as T)
}

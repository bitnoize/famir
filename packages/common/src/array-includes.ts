/**
 * Check array includes a value, type-safe version
 * @category none
 * @see https://oida.dev/typescript-array-includes/
 */
export const arrayIncludes = <T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T => {
  return coll.includes(el as T)
}

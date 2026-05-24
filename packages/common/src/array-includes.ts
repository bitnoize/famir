/**
 * A type-safe wrapper for `Array.includes()`.
 *
 * This function acts as a type predicate, narrowing the type of the element
 * after a successful check. It is useful for filtering or validating array contents.
 *
 * @typeParam T - The type of elements in the array.
 * @param coll - The read-only array to search within.
 * @param el - The element to search for.
 * @returns `true` if the element exists in the array, and narrows the type of `el` to `T`.
 */
export function arrayIncludes<T>(coll: ReadonlyArray<T>, el: unknown): el is T {
  return coll.includes(el as T)
}

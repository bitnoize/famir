import { Transform, TransformCallback } from 'node:stream'

/**
 * A stream transform that limits the total size of data passing through.
 *
 * This transform monitors the total size of data chunks and stops pushing
 * further data once the limit is exceeded. It can be used to enforce
 * size limits on response streams.
 *
 * @internal
 */
export class LimiterTransform extends Transform {
  /** The total size of data processed so far. */
  private totalSize: number = 0

  /** Whether the size limit has been exceeded. */
  private limitExceeded: boolean = false

  /**
   * Creates a new LimiterTransform instance.
   *
   * @param sizeLimit - The maximum total size in bytes.
   */
  constructor(private readonly sizeLimit: number) {
    super()
  }

  /**
   * Transforms a chunk of data.
   *
   * Checks if adding the current chunk would exceed the limit.
   * If not, pushes the chunk through. Otherwise, stops processing.
   *
   * @param chunk - The data chunk to process.
   * @param encoding - The encoding of the chunk.
   * @param callback - The callback to signal completion.
   */
  override _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
    if (this.limitExceeded) {
      callback()

      return
    }

    if (this.totalSize + chunk.length > this.sizeLimit) {
      this.limitExceeded = true

      callback()

      return
    }

    this.push(chunk)

    this.totalSize += chunk.length

    callback()
  }
}

import { Transform, TransformCallback } from 'node:stream'

/**
 * Stream transform limiter
 * @category Utils
 */
export class LimiterTransform extends Transform {
  private totalSize: number = 0
  private limitExceeded: boolean = false

  constructor(private readonly sizeLimit: number) {
    super()
  }

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

import { Transform, TransformCallback } from 'node:stream'

export class LimiterTransform extends Transform {
  protected totalSize: number = 0
  protected limitExceeded: boolean = false

  constructor(protected readonly sizeLimit: number) {
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

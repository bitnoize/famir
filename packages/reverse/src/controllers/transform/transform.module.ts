import { DIContainer } from '@famir/common'
import { TransformController } from './transform.controller.js'

export const composeTransformModule = (container: DIContainer): TransformController => {
  TransformController.inject(container)

  return TransformController.resolve(container)
}

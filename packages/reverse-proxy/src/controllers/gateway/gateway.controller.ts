import {
  HttpServerError,
  RequestLocals,
  Router,
  WrapRequest,
  WrapResponse
} from '@famir/http-server'
import { Validator } from '@famir/validator'
import { GatewayUseCase } from '../../use-cases/index.js'
import { validateRequestTargetId } from './gateway.utils.js'

export class GatewayController {
  constructor(
    validator: Validator,
    router: Router,
    protected readonly gatewayUseCase: GatewayUseCase
  ) {
    router.addRoute('all', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (
    locals: RequestLocals,
    request: WrapRequest
  ): Promise<WrapResponse | undefined> => {
    const targetId = request.headers['x-famir-target-id']

    validateRequestTargetId(targetId, 'x-famir-target-id')

    const gateway = await this.gatewayUseCase.execute({ targetId })

    if (gateway === null) {
      throw new HttpServerError(503, {}, `Gateway use-case failed`)
    }

    locals['campaign'] = gateway.campaign
    locals['target'] = gateway.target

    return undefined
  }
}

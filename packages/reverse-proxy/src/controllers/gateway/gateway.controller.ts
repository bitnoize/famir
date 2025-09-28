import {
  HttpServerLocals,
  HttpServerRouter,
  HttpServerRequest,
  HttpServerResponse,
  Validator
} from '@famir/domain'
import { GatewayUseCase } from '../../use-cases/index.js'
import { validateRequestTarget } from './gateway.utils.js'

export class GatewayController {
  constructor(
    validator: Validator,
    router: HttpServerRouter,
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

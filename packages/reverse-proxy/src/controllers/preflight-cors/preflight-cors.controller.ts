import { Router, WrapResponse } from '@famir/http-server'

export class PreflightCorsController {
  constructor(router: Router) {
    router.addRoute('options', '{*splat}', this.defaultHandler)
  }

  private readonly defaultHandler = async (): Promise<WrapResponse | undefined> => {
    return {
      status: 204,
      headers: {
        'content-type': 'text/plain',
        'access-control-allow-origin': '*',
        'access-control-allow-methods': '*',
        'access-control-allow-headers': '*',
        'access-control-expose-headers': '*',
        'access-control-allow-credentials': 'true',
        'access-control-max-age': '86400'
      },
      cookies: {},
      body: Buffer.from('')
    }
  }
}

import { RequestLocals } from '../../http-server.js'

declare module 'express-serve-static-core' {
  interface Request {
    locals?: RequestLocals | undefined
  }
}

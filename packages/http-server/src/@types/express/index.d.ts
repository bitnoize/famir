import { HttpServerRequestLocals } from '@famir/domain'

declare module 'express-serve-static-core' {
  interface Request {
    locals?: HttpServerRequestLocals | undefined
  }
}

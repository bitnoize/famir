import { HttpServerLocals } from '@famir/domain'

declare module 'express-serve-static-core' {
  interface Request {
    locals?: HttpServerLocals
  }
}

export {} // module context

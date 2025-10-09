import { HTTPServerRequestLocals } from '@famir/domain'

declare module 'express-serve-static-core' {
  interface Request {
    locals?: HTTPServerRequestLocals
  }
}

export {} // module context

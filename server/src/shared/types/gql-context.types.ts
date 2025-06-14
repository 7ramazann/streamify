import type { Request as ExpressRequest } from 'express'
import type { Session } from 'express-session'

export interface GqlContext {
  req: ExpressRequest & { session: Session; sessionID: string }
  res: Response
}

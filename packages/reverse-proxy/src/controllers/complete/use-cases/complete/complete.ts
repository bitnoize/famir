import { CreateMessageModel, EnabledTargetModel, HttpServerResponse } from '@famir/domain'

export interface CompleteData {
  target: EnabledTargetModel
  createMessage: CreateMessageModel
  response: HttpServerResponse
}

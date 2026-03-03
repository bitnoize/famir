import { DIComposer } from '@famir/common'
import {
  CampaignController,
  DatabaseController,
  LureController,
  MessageController,
  ProxyController,
  RedirectorController,
  SessionController,
  TargetController
} from './controllers/index.js'
import {
  CampaignService,
  DatabaseService,
  LureService,
  MessageService,
  ProxyService,
  RedirectorService,
  SessionService,
  TargetService
} from './services/index.js'

export const autoLoad: DIComposer = (container) => {
  DatabaseService.inject(container)
  CampaignService.inject(container)
  ProxyService.inject(container)
  TargetService.inject(container)
  RedirectorService.inject(container)
  LureService.inject(container)
  SessionService.inject(container)
  MessageService.inject(container)

  DatabaseController.inject(container)
  CampaignController.inject(container)
  ProxyController.inject(container)
  TargetController.inject(container)
  RedirectorController.inject(container)
  LureController.inject(container)
  SessionController.inject(container)
  MessageController.inject(container)
}

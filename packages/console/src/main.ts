import { DIComposer } from '@famir/common'
import {
  CampaignController,
  DatabaseController,
  LureController,
  MessageController,
  PhishmapController,
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
  PhishmapService,
  ProxyService,
  RedirectorService,
  SessionService,
  TargetService
} from './services/index.js'

export const autoLoad: DIComposer = (container) => {
  DatabaseService.register(container)
  CampaignService.register(container)
  ProxyService.register(container)
  TargetService.register(container)
  RedirectorService.register(container)
  LureService.register(container)
  SessionService.register(container)
  MessageService.register(container)
  PhishmapService.register(container)

  DatabaseController.register(container)
  CampaignController.register(container)
  ProxyController.register(container)
  TargetController.register(container)
  RedirectorController.register(container)
  LureController.register(container)
  SessionController.register(container)
  MessageController.register(container)
  PhishmapController.register(container)
}

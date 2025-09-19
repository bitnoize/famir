import { filterSecrets } from '@famir/common'
import { WorkflowConfig, WorkflowConnectorOptions, WorkflowQueueOptions } from './workflow.js'

export function buildConnectorOptions(data: WorkflowConfig): WorkflowConnectorOptions {
  return {
    connectionUrl: data.WORKFLOW_CONNECTION_URL
  }
}

export function buildQueueOptions(data: WorkflowConfig): WorkflowQueueOptions {
  return {
    prefix: data.WORKFLOW_PREFIX
  }
}

export function filterOptionsSecrets(data: object) {
  return filterSecrets(data, ['connectionUrl'])
}

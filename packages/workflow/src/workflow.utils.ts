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

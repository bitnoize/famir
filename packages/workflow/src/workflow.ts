export interface WorkflowConfig {
  WORKFLOW_CONNECTION_URL: string
  WORKFLOW_PREFIX: string
}

export interface WorkflowConnectorOptions {
  connectionUrl: string
}

export interface WorkflowQueueOptions {
  prefix: string
}

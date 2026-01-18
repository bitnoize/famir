export interface BullWorkflowConfig {
  WORKFLOW_CONNECTION_URL: string
  WORKFLOW_PREFIX: string
}

export interface RedisWorkflowConnectorOptions {
  connectionUrl: string
}

export interface BullWorkflowQueueOptions {
  prefix: string
}

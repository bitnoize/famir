import { type Redis } from 'ioredis'

export const PRODUCE_CONNECTOR = Symbol('ProduceConnector')

/*
 * Produce connector contract
 */
export interface ProduceConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T
  //connect(): Promise<void>
  close(): Promise<void>
}

export type RedisProduceConnection = Redis

export interface BullProduceConfig {
  PRODUCE_CONNECTION_URL: string
  PRODUCE_PREFIX: string
}

export interface RedisProduceConnectorOptions {
  connectionUrl: string
}

export interface BullProduceQueueOptions {
  prefix: string
}

import { type Redis } from 'ioredis'

export const CONSUME_CONNECTOR = Symbol('ConsumeConnector')
export const CONSUME_SPECS = Symbol('ConsumeSpecs')
export const CONSUME_ASSETS = Symbol('ConsumeAssets')
export const CONSUME_ROUTER = Symbol('ConsumeRouter')

/*
 * Consume connector contract
 */
export interface ConsumeConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getConnection<T>(): T
  //connect(): Promise<void>
  close(): Promise<void>
}

export type RedisConsumeConnection = Redis

export type ConsumeProcessor = (data: unknown) => Promise<unknown>

export interface ConsumeSpec {
  readonly concurrency: number
  readonly limiterMax: number
  readonly limiterDuration: number
}

export type ConsumeSpecs = [string, ConsumeSpec][]

export type ConsumeAssets = [string, string][]

export interface BullConsumeConfig {
  CONSUME_CONNECTION_URL: string
  CONSUME_PREFIX: string
}

export interface RedisConsumeConnectorOptions {
  connectionUrl: string
}

export interface BullConsumeWorkerOptions {
  prefix: string
}

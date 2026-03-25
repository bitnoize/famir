import { JSONSchemaType, ValidatorSchemas, randomIdentSchema } from '@famir/validator'
import { ActionDatabaseData } from '../../services/index.js'

const actionDatabaseDataSchema: JSONSchemaType<ActionDatabaseData> = {
  type: 'object',
  required: [],
  properties: {
    confirmSecret: {
      ...randomIdentSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const

export const databaseSchemas: ValidatorSchemas = {
  'console-action-database-data': actionDatabaseDataSchema
} as const

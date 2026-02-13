import { JSONSchemaType } from '@famir/validator'

export const configHttpServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const configHttpServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 0,
  maximum: 65535
} as const

const DEFAULT_ERROR_PAGE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Error</title>
  </head>
  <body>
    <div>
      <h1><%= data.status %></h1>
      <p><%= data.message %></p>
    </div>
  </body>
</html>`

export const configHttpServerErrorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  default: DEFAULT_ERROR_PAGE
} as const

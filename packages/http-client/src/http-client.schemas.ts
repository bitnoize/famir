import { JSONSchemaType } from '@famir/common'

export const configHttpClientVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false
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

export const configHttpClientErrorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  default: DEFAULT_ERROR_PAGE
} as const

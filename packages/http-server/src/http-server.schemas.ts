import { JSONSchemaType } from '@famir/validator'

export const configHttpServerAddressSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const configHttpServerPortSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 65535
} as const

export const configHttpServerVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false
} as const

const DEFAULT_ERROR_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background-color: #f4f4f4;
            color: #2e2e2e;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            line-height: 1.5;
        }

        .error-card {
            max-width: 620px;
            width: 100%;
            background-color: #ffffff;
            border: 1px solid #d1d1d1;
            border-radius: 24px;
            padding: 3rem 2.5rem;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.02);
            text-align: center;
            transition: all 0.1s ease;
        }

        .error-status {
            font-size: 7rem;
            font-weight: 700;
            line-height: 1;
            color: #9f9f9f;
            letter-spacing: -0.02em;
            margin-bottom: 0.75rem;
            text-shadow: 0 2px 5px rgba(128, 128, 128, 0.10);
        }

        .error-message {
            font-size: 1.8rem;
            font-weight: 400;
            color: #5a5a5a;
            margin-bottom: 1.5rem;
            border-bottom: 1px dashed #c9c9c9;
            padding-bottom: 1.5rem;
            word-break: break-word;
        }

        .error-footnote {
            font-size: 0.95rem;
            color: #8e8e8e;
            border-top: 1px solid #e2e2e2;
            padding-top: 1.5rem;
            margin-top: 0.5rem;
        }

        .error-footnote a {
            color: #6f6f6f;
            text-decoration: none;
            border-bottom: 1px dotted #bebebe;
        }

        .error-footnote a:hover {
            color: #3a3a3a;
            border-bottom: 1px solid #7f7f7f;
        }

        @media (max-width: 480px) {
            .error-card {
                padding: 2rem 1.5rem;
            }
            .error-status {
                font-size: 5rem;
            }
            .error-message {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="error-status"><%= data.status %></div>

        <div class="error-message"><%= data.message %></div>

        <div class="error-footnote">
            Something went wrong. You can refresh the page or go to the <a href="/">main</a> page.
        </div>
    </div>
</body>
</html>`

export const configHttpServerErrorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 100 * 1024,
  default: DEFAULT_ERROR_PAGE
} as const

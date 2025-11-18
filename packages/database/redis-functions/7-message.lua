#!lua name=message

--[[
  Create message
--]]
local function create_message(keys, args)
  if not (#keys == 5 and #args == 21) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', message_key) == 0) then
    return redis.status_reply('CONFLICT Message allready exists')
  end

  if not (redis.call('EXISTS', proxy_key) == 1) then
    return redis.status_reply('NOT_FOUND Proxy not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND Target not found')
  end

  if not (redis.call('EXISTS', session_key) == 1) then
    return redis.status_reply('NOT_FOUND Session not found')
  end

  local model = {
    campaign_id = args[1],
    message_id = args[2],
    proxy_id = args[3],
    target_id = args[4],
    session_id = args[5],
    method = args[6],
    url = args[7],
    is_streaming = args[8],
    request_headers = args[9],
    request_cookies = args[10],
    request_body = args[11],
    response_headers = args[12],
    response_cookies = args[13],
    response_body = args[14],
    client_ip = args[15],
    status = tonumber(args[16]),
    score = tonumber(args[17]),
    start_time = tonumber(args[18]),
    finish_time = tonumber(args[19]),
    logs = args[20],
    created_at = tonumber(args[21]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  if not (model.campaign_id and #model.campaign_id > 0) then
    return redis.error_reply('ERR Wrong model.campaign_id')
  end

  if not (model.message_id and #model.message_id > 0) then
    return redis.error_reply('ERR Wrong model.message_id')
  end

  if not (model.proxy_id and #model.proxy_id > 0) then
    return redis.error_reply('ERR Wrong model.proxy_id')
  end

  if not (model.target_id and #model.target_id > 0) then
    return redis.error_reply('ERR Wrong model.target_id')
  end

  if not (model.session_id and #model.session_id > 0) then
    return redis.error_reply('ERR Wrong model.session_id')
  end

  local stash = {
    message_expire = tonumber(redis.call('HGET', campaign_key, 'message_expire')),
  }

  if not (stash.message_expire and stash.message_expire > 0) then
    return redis.error_reply('ERR Malform stash.message_expire')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', message_key, unpack(store))

  redis.call('HINCRBY', proxy_key, 'message_count', 1)
  redis.call('HINCRBY', target_key, 'message_count', 1)
  redis.call('HINCRBY', session_key, 'message_count', 1)

  redis.call('PEXPIRE', message_key, stash.message_expire)

  return redis.status_reply('OK Message created')
end

redis.register_function({
  function_name = 'create_message',
  callback = create_message,
  description = 'Create message',
})

--[[
  Read message
--]]
local function read_message(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  if not (redis.call('EXISTS', message_key) == 1) then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', message_key,
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'method',
    'url',
    'is_streaming',
    'status',
    'score',
    'start_time',
    'finish_time',
    'created_at'
  )

  if not (#values == 13) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    message_id = values[2],
    proxy_id = values[3],
    target_id = values[4],
    session_id = values[5],
    method = values[6],
    url = values[7],
    is_streaming = tonumber(values[8]),
    status = tonumber(values[9]),
    score = tonumber(values[10]),
    start_time = tonumber(values[11]),
    finish_time = tonumber(values[12]),
    created_at = tonumber(values[13]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_message',
  callback = read_message,
  flags = { 'no-writes' },
  description = 'Read message',
})

--[[
  Read full message
--]]
local function read_full_message(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  if not (redis.call('EXISTS', message_key) == 1) then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', message_key,
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'method',
    'url',
    'is_streaming',
    'request_headers',
    'request_cookies',
    'request_body',
    'response_headers',
    'response_cookies',
    'response_body',
    'client_ip',
    'status',
    'score',
    'start_time',
    'finish_time',
    'logs',
    'created_at'
  )

  if not (#values == 21) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    message_id = values[2],
    proxy_id = values[3],
    target_id = values[4],
    session_id = values[5],
    method = values[6],
    url = values[7],
    is_streaming = tonumber(values[8]),
    request_headers = values[9],
    request_cookies = values[10],
    request_body = values[11],
    response_headers = values[12],
    response_cookies = values[13],
    response_body = values[14],
    client_ip = values[15],
    status = tonumber(values[16]),
    score = tonumber(values[17]),
    start_time = tonumber(values[18]),
    finish_time = tonumber(values[19]),
    logs = values[20],
    created_at = tonumber(values[21]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_full_message',
  callback = read_full_message,
  flags = { 'no-writes' },
  description = 'Read full_message',
})

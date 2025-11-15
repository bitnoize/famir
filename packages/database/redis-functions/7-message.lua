#!lua name=message

--[[
  Create message
--]]
local function create_message(keys, args)
  if not (#keys == 5 and #args == 22) then
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
    origin_url = args[7],
    url_path = args[8],
    url_query = args[9],
    url_hash = args[10],
    is_streaming = args[11],
    request_headers = args[12],
    request_cookies = args[13],
    request_body = args[14],
    response_headers = args[15],
    response_cookies = args[16],
    response_body = args[17],
    client_ip = args[18],
    status = tonumber(args[19]),
    score = tonumber(args[20]),
    total_time = tonumber(args[21]),
    created_at = tonumber(args[22]),
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
    'origin_url',
    'url_path',
    'url_query',
    'url_hash',
    'is_streaming',
    'status',
    'score',
    'total_time',
    'created_at'
  )

  if not (#values == 15) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    message_id = values[2],
    proxy_id = values[3],
    target_id = values[4],
    session_id = values[5],
    method = values[6],
    origin_url = values[7],
    url_path = values[8],
    url_query = values[9],
    url_hash = values[10],
    is_streaming = tonumber(values[11]),
    status = tonumber(values[12]),
    score = tonumber(values[13]),
    total_time = tonumber(values[14]),
    created_at = tonumber(values[15]),
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
    'origin_url',
    'url_path',
    'url_query',
    'url_hash',
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
    'total_time',
    'created_at'
  )

  if not (#values == 22) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    message_id = values[2],
    proxy_id = values[3],
    target_id = values[4],
    session_id = values[5],
    method = values[6],
    origin_url = values[7],
    url_path = values[8],
    url_query = values[9],
    url_hash = values[10],
    is_streaming = tonumber(values[11]),
    request_headers = values[12],
    request_cookies = values[13],
    request_body = values[14],
    status = tonumber(values[15]),
    response_headers = values[16],
    response_cookies = values[17],
    response_body = values[18],
    client_ip = values[19],
    score = tonumber(values[20]),
    total_time = tonumber(values[21]),
    created_at = tonumber(values[22]),
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

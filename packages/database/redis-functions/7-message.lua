#!lua name=message

--[[
  Create message
--]]
local function create_message(keys, args)
  if #keys ~= 5 or #args ~= 19 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', message_key) ~= 0 then
    return redis.status_reply('CONFLICT Message allready exists')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Proxy not exists')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Session not exists')
  end

  local stash = {
    message_expire = tonumber(redis.call('HGET', campaign_key, 'message_expire')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'message_expire' and value <= 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
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
    request_body = args[10],
    response_headers = args[11],
    response_body = args[12],
    client_ip = args[13],
    status = tonumber(args[14]),
    score = tonumber(args[15]),
    start_time = tonumber(args[16]),
    finish_time = tonumber(args[17]),
    connection = args[18],
    created_at = tonumber(args[19]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end

    if
      (
        field == 'campaign_id'
        or field == 'message_id'
        or field == 'proxy_id'
        or field == 'target_id'
        or field == 'session_id'
      ) and value == ''
    then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', message_key, unpack(store))

  redis.call('HINCRBY', campaign_key, 'message_count', 1)
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
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', message_key) ~= 1 then
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
    'created_at'
  )

  if #values ~= 11 then
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
    created_at = tonumber(values[11]),
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
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', message_key) ~= 1 then
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
    'request_body',
    'response_headers',
    'response_body',
    'client_ip',
    'status',
    'score',
    'start_time',
    'finish_time',
    'connection',
    'created_at'
  )

  if #values ~= 19 then
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
    request_body = values[10],
    response_headers = values[11],
    response_body = values[12],
    client_ip = values[13],
    status = tonumber(values[14]),
    score = tonumber(values[15]),
    start_time = tonumber(values[16]),
    finish_time = tonumber(values[17]),
    connection = values[18],
    created_at = tonumber(values[19]),
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
  description = 'Read full message',
})

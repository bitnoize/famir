#!lua name=message

--[[
  Create message
--]]
local function create_message(keys, args)
  if #keys ~= 6 or #args ~= 20 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]
  local message_history_key = keys[6]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', message_key) ~= 0 then
    return redis.status_reply('CONFLICT Message already exists')
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

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if k == 'message_expire' and v <= 0 then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  local model = {
    campaign_id = args[1],
    message_id = args[2],
    proxy_id = args[3],
    target_id = args[4],
    session_id = args[5],
    type = args[6],
    method = args[7],
    url = args[8],
    request_headers = args[9],
    request_body = args[10],
    status = tonumber(args[11]),
    response_headers = args[12],
    response_body = args[13],
    connection = args[14],
    payload = args[15],
    errors = args[16],
    analyze = args[17],
    start_time = tonumber(args[18]),
    finish_time = tonumber(args[19]),
    created_at = tonumber(args[20]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Wrong model.' .. k)
    end

    if
      (
        k == 'campaign_id'
        or k == 'message_id'
        or k == 'proxy_id'
        or k == 'target_id'
        or k == 'session_id'
        or k == 'type'
        or k == 'method'
        or k == 'url'
      ) and v == ''
    then
      return redis.error_reply('ERR Wrong model.' .. k)
    end
  end

  local history_threshold = model.created_at - stash.message_expire

  if history_threshold <= 0 then
    return redis.error_reply('ERR Wrong history_threshold')
  end

  -- Point of no return

  local store = {}

  for k, v in pairs(model) do
    table.insert(store, k)
    table.insert(store, v)
  end

  redis.call('HSET', message_key, unpack(store))

  redis.call('HINCRBY', campaign_key, 'message_count', 1)
  redis.call('HINCRBY', proxy_key, 'message_count', 1)
  redis.call('HINCRBY', target_key, 'message_count', 1)
  redis.call('HINCRBY', session_key, 'message_count', 1)

  redis.call('PEXPIRE', message_key, stash.message_expire)

  redis.call('ZREMRANGEBYSCORE', message_history_key, '-inf', '(' .. history_threshold)

  redis.call('ZADD', message_history_key, model.created_at, model.message_id)

  redis.call('PEXPIRE', message_history_key, stash.message_expire)

  return redis.status_reply('OK Message created')
end

redis.register_function({
  function_name = 'create_message',
  callback = create_message,
  description = 'Create message',
})

--[[
  Create dummy message
--]]
local function create_dummy_message(keys, args)
  if #keys ~= 5 or #args ~= 0 then
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
    return redis.status_reply('CONFLICT Message already exists')
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

  -- Point of no return

  redis.call('HINCRBY', campaign_key, 'message_count', 1)
  redis.call('HINCRBY', proxy_key, 'message_count', 1)
  redis.call('HINCRBY', target_key, 'message_count', 1)
  redis.call('HINCRBY', session_key, 'message_count', 1)

  return redis.status_reply('OK Dummy message created')
end

redis.register_function({
  function_name = 'create_dummy_message',
  callback = create_dummy_message,
  description = 'Create dummy message',
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
    'type',
    'method',
    'url',
    'status',
    'analyze',
    'start_time',
    'finish_time',
    'created_at'
  )

  if #values ~= 13 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    message_id = values[2],
    proxy_id = values[3],
    target_id = values[4],
    session_id = values[5],
    type = values[6],
    method = values[7],
    url = values[8],
    status = tonumber(values[9]),
    analyze = values[10],
    start_time = tonumber(values[11]),
    finish_time = tonumber(values[12]),
    created_at = tonumber(values[13]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Malform model.' .. k)
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
    'type',
    'method',
    'url',
    'request_headers',
    'request_body',
    'status',
    'response_headers',
    'response_body',
    'connection',
    'payload',
    'errors',
    'analyze',
    'start_time',
    'finish_time',
    'created_at'
  )

  if #values ~= 20 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    message_id = values[2],
    proxy_id = values[3],
    target_id = values[4],
    session_id = values[5],
    type = values[6],
    method = values[7],
    url = values[8],
    request_headers = values[9],
    request_body = values[10],
    status = tonumber(values[11]),
    response_headers = values[12],
    response_body = values[13],
    connection = values[14],
    payload = values[15],
    errors = values[16],
    analyze = values[17],
    start_time = tonumber(values[18]),
    finish_time = tonumber(values[19]),
    created_at = tonumber(values[20]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Malform model.' .. k)
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

--[[
  Read message history
--]]
local function read_message_history(keys, args)
  if #keys ~= 2 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_history_key = keys[2]

  local limit = tonumber(args[1])

  if not (limit and limit > 0) then
    return redis.error_reply('ERR Wrong limimt')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  return redis.call('ZRANGE', message_history_key, 0, limit - 1, 'REV')
end

redis.register_function({
  function_name = 'read_message_history',
  callback = read_message_history,
  flags = { 'no-writes' },
  description = 'Read message history',
})

--[[
  Delete message
--]]
local function delete_message(keys, args)
  if #keys ~= 3 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local message_history_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', message_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Message not exists')
  end

  local stash = {
    message_id = redis.call('HGET', message_key, 'message_id'),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if k == 'message_id' and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  -- Point of no return

  redis.call('DEL', message_key)

  redis.call('ZREM', message_history_key, stash.message_id)

  return redis.status_reply('OK message deleted')
end

redis.register_function({
  function_name = 'delete_message',
  callback = delete_message,
  description = 'Delete message',
})

#!lua name=proxy

--[[
  Create proxy
--]]
local function create_proxy(keys, args)
  if not (#keys == 4 and #args == 3) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]
  local proxy_unique_url_key = keys[3]
  local proxy_index_key = keys[4]

  local params = {
    id = args[1],
    url = args[2],
    is_enabled = 0,
    total_count = 0,
    success_count = 0,
    failure_count = 0,
    created_at = tonumber(args[3]),
  }

  if not (params.id and params.id ~= '') then
    return redis.error_reply('ERR Wrong params.id')
  end

  if not (params.url and params.url ~= '') then
    return redis.error_reply('ERR Wrong params.url')
  end

  if not (params.created_at and params.created_at > 0) then
    return redis.error_reply('ERR Wrong params.created_at')
  end

  params.updated_at = params.created_at

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', proxy_key) ~= 0 then
    return redis.status_reply('EXISTS Proxy allready exists')
  end

  if redis.call('SISMEMBER', proxy_unique_url_key, params.url) ~= 0 then
    return redis.status_reply('NOT_UNIQUE Proxy url allready taken')
  end

  -- Point of no return

  local save = {}

  for field, value in pairs(params) do
    table.insert(save, field)
    table.insert(save, value)
  end

  redis.call('HSET', proxy_key, unpack(save))

  redis.call('SADD', proxy_unique_url_key, params.url)

  redis.call('ZADD', proxy_index_key, params.created_at, params.id)

  return redis.status_reply('OK Proxy created')
end

redis.register_function({
  function_name = 'create_proxy',
  callback = create_proxy,
  description = 'Create proxy',
})

--[[
  Read proxy
--]]
local function read_proxy(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', proxy_key,
    'id',
    'url',
    'is_enabled',
    'total_count',
    'success_count',
    'failure_count',
    'created_at',
    'updated_at'
  )

  if not (values and #values == 8) then
    return redis.error_reply('ERR Malform values')
  end

  local data = {
    id = values[1],
    url = values[2],
    is_enabled = tonumber(values[3]),
    total_count = tonumber(values[4]),
    success_count = tonumber(values[5]),
    failure_count = tonumber(values[6]),
    created_at = tonumber(values[7]),
    updated_at = tonumber(values[8]),
  }

  if not (data.id and data.id ~= '') then
    return redis.error_reply('ERR Malform data.id')
  end

  if not (data.url and data.url ~= '') then
    return redis.error_reply('ERR Malform data.url')
  end

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if not (data.total_count and data.total_count >= 0) then
    return redis.error_reply('ERR Malform data.total_count')
  end

  if not (data.success_count and data.success_count >= 0) then
    return redis.error_reply('ERR Malform data.success_count')
  end

  if not (data.failure_count and data.failure_count >= 0) then
    return redis.error_reply('ERR Malform data.failure_count')
  end

  if not (data.created_at and data.created_at > 0) then
    return redis.error_reply('ERR Malform data.created_at')
  end

  if not (data.updated_at and data.updated_at > 0) then
    return redis.error_reply('ERR Malform data.updated_at')
  end

  return { map = data }
end

redis.register_function({
  function_name = 'read_proxy',
  callback = read_proxy,
  flags = { 'no-writes' },
  description = 'Read proxy',
})

--[[
  Read proxy index
--]]
local function read_proxy_index(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_index_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  return redis.call('ZRANGE', proxy_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_proxy_index',
  callback = read_proxy_index,
  flags = { 'no-writes' },
  description = 'Read proxy index',
})

--[[
  Enable proxy
--]]
local function enable_proxy(keys, args)
  if not (#keys == 2 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]

  local params = {
    updated_at = tonumber(args[1]),
  }

  if not (params.updated_at and params.updated_at > 0) then
    return redis.error_reply('ERR Wrong params.updated_at')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Proxy not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled == 1 then
    return redis.status_reply('OK Proxy allready enabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', proxy_key,
    'is_enabled', 1,
    'updated_at', params.updated_at
  )

  return redis.status_reply('OK Proxy enabled')
end

redis.register_function({
  function_name = 'enable_proxy',
  callback = enable_proxy,
  description = 'Enable proxy',
})

--[[
  Disable proxy
--]]
local function disable_proxy(keys, args)
  if not (#keys == 2 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]

  local params = {
    updated_at = tonumber(args[1]),
  }

  if not (params.updated_at and params.updated_at > 0) then
    return redis.error_reply('ERR Wrong params.updated_at')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Proxy not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled == 0 then
    return redis.status_reply('OK Proxy allready disabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', proxy_key,
    'is_enabled', 0,
    'updated_at', params.updated_at
  )

  return redis.status_reply('OK Proxy disabled')
end

redis.register_function({
  function_name = 'disable_proxy',
  callback = disable_proxy,
  description = 'Disable proxy',
})

--[[
  Delete proxy
--]]
local function delete_proxy(keys, args)
  if not (#keys == 4 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]
  local proxy_unique_url_key = keys[3]
  local proxy_index_key = keys[4]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Proxy not found')
  end

  local data = {
    id = redis.call('HGET', proxy_key, 'id'),
    url = redis.call('HGET', proxy_key, 'url'),
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  if not (data.id and data.id ~= '') then
    return redis.error_reply('ERR Malform data.id')
  end

  if not (data.url and data.url ~= '') then
    return redis.error_reply('ERR Malform data.url')
  end

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled == 1 then
    return redis.status_reply('FROZEN Proxy not disabled')
  end

  -- Point of no return

  redis.call('DEL', proxy_key)

  redis.call('SREM', proxy_unique_url_key, data.url)

  redis.call('ZREM', proxy_index_key, data.id)

  return redis.status_reply('OK Proxy deleted')
end

redis.register_function({
  function_name = 'delete_proxy',
  callback = delete_proxy,
  description = 'Delete proxy',
})

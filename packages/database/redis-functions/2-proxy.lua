#!lua name=proxy

--[[
  Create proxy
--]]
local function create_proxy(keys, args)
  if not (#keys == 4 and #args == 4) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]
  local proxy_unique_url_key = keys[3]
  local proxy_index_key = keys[4]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', proxy_key) == 0) then
    return redis.status_reply('CONFLICT Proxy allready exists')
  end

  local model = {
    campaign_id = args[1],
    proxy_id = args[2],
    url = args[3],
    is_enabled = 0,
    message_count = 0,
    created_at = tonumber(args[4]),
    updated_at = tonumber(args[4]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  if not (#model.campaign_id > 0) then
    return redis.error_reply('ERR Wrong model.campaign_id')
  end

  if not (#model.proxy_id > 0) then
    return redis.error_reply('ERR Wrong model.proxy_id')
  end

  if not (#model.url > 0) then
    return redis.error_reply('ERR Wrong model.url')
  end

  if not (redis.call('SISMEMBER', proxy_unique_url_key, model.url) == 0) then
    return redis.status_reply('CONFLICT Proxy url allready taken')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', proxy_key, unpack(store))

  redis.call('SADD', proxy_unique_url_key, model.url)

  redis.call('ZADD', proxy_index_key, model.created_at, model.proxy_id)

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

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  if not (redis.call('EXISTS', proxy_key) == 1) then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', proxy_key,
    'campaign_id',
    'proxy_id',
    'url',
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  )

  if not (#values == 7) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    proxy_id = values[2],
    url = values[3],
    is_enabled = tonumber(values[4]),
    message_count = tonumber(values[5]),
    created_at = tonumber(values[6]),
    updated_at = tonumber(values[7]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
    end
  end

  return { map = model }
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

  if not (redis.call('EXISTS', campaign_key) == 1) then
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
  if not (#keys == 3 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]
  local enabled_proxy_index_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', proxy_key) == 1) then
    return redis.status_reply('NOT_FOUND Proxy not found')
  end

  local stash = {
    updated_at = tonumber(args[1]),
    proxy_id = redis.call('HGET', proxy_key, 'proxy_id'),
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  if not stash.updated_at then
    return redis.error_reply('ERR Wrong stash.updated_at')
  end

  if not (stash.proxy_id and #stash.proxy_id > 0) then
    return redis.error_reply('ERR Malform stash.proxy_id')
  end

  if not stash.is_enabled then
    return redis.error_reply('ERR Malform stash.is_enabled')
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('OK Proxy allready enabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', proxy_key,
    'is_enabled', 1,
    'updated_at', stash.updated_at
  )

  redis.call('SADD', enabled_proxy_index_key, stash.proxy_id)

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
  if not (#keys == 3 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]
  local enabled_proxy_index_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', proxy_key) == 1) then
    return redis.status_reply('NOT_FOUND Proxy not found')
  end

  local stash = {
    updated_at = tonumber(args[1]),
    proxy_id = redis.call('HGET', proxy_key, 'proxy_id'),
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  if not stash.updated_at then
    return redis.error_reply('ERR Wrong stash.updated_at')
  end

  if not (stash.proxy_id and #stash.proxy_id > 0) then
    return redis.error_reply('ERR Malform stash.proxy_id')
  end

  if not stash.is_enabled then
    return redis.error_reply('ERR Malform stash.is_enabled')
  end

  if stash.is_enabled == 0 then
    return redis.status_reply('OK Proxy allready disabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', proxy_key,
    'is_enabled', 0,
    'updated_at', stash.updated_at
  )

  redis.call('SREM', enabled_proxy_index_key, stash.proxy_id)

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

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', proxy_key) == 1) then
    return redis.status_reply('NOT_FOUND Proxy not found')
  end

  local stash = {
    proxy_id = redis.call('HGET', proxy_key, 'proxy_id'),
    url = redis.call('HGET', proxy_key, 'url'),
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  if not (stash.proxy_id and #stash.proxy_id > 0) then
    return redis.error_reply('ERR Malform stash.proxy_id')
  end

  if not (stash.url and #stash.url > 0) then
    return redis.error_reply('ERR Malform stash.url')
  end

  if not stash.is_enabled then
    return redis.error_reply('ERR Malform stash.is_enabled')
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('FORBIDDEN Proxy not disabled')
  end

  -- Point of no return

  redis.call('DEL', proxy_key)

  redis.call('SREM', proxy_unique_url_key, stash.url)

  redis.call('ZREM', proxy_index_key, stash.proxy_id)

  return redis.status_reply('OK Proxy deleted')
end

redis.register_function({
  function_name = 'delete_proxy',
  callback = delete_proxy,
  description = 'Delete proxy',
})

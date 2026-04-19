#!lua name=proxy

--[[
  Create proxy
--]]
local function create_proxy(keys, args)
  if #keys ~= 5 or #args ~= 5 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local proxy_key = keys[3]
  local proxy_urls_key = keys[4]
  local proxy_index_key = keys[5]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', proxy_key) ~= 0 then
    return redis.status_reply('CONFLICT Proxy allready exists')
  end

  local stash = {
    lock_secret = args[5],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  local model = {
    campaign_id = args[1],
    proxy_id = args[2],
    url = args[3],
    is_enabled = 0,
    message_count = 0,
    created_at = args[4],
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Wrong model.' .. k)
    end

    if (k == 'campaign_id' or k == 'proxy_id' or k == 'url') and v == '' then
      return redis.error_reply('ERR Wrong model.' .. k)
    end
  end

  if redis.call('SISMEMBER', proxy_urls_key, model.url) ~= 0 then
    return redis.status_reply('CONFLICT Proxy url allready taken')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  local store = {}

  for k, v in pairs(model) do
    table.insert(store, k)
    table.insert(store, v)
  end

  redis.call('HSET', proxy_key, unpack(store))

  redis.call('SADD', proxy_urls_key, model.url)

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
  if #keys ~= 2 or #args ~= 0 then
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
    'campaign_id',
    'proxy_id',
    'url',
    'is_enabled',
    'message_count',
    'created_at'
  )

  if #values ~= 6 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    proxy_id = values[2],
    url = values[3],
    is_enabled = tonumber(values[4]),
    message_count = tonumber(values[5]),
    created_at = tonumber(values[6]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Malform model.' .. k)
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
  if #keys ~= 2 or #args ~= 0 then
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
  if #keys ~= 4 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local proxy_key = keys[3]
  local enabled_proxy_index_key = keys[4]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Proxy not exists')
  end

  local stash = {
    lock_secret = args[1],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    proxy_id = redis.call('HGET', proxy_key, 'proxy_id'),
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret' or k == 'proxy_id') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('OK Proxy allready enabled')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('HSET', proxy_key, 'is_enabled', 1)

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
  if #keys ~= 4 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local proxy_key = keys[3]
  local enabled_proxy_index_key = keys[4]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Proxy not exists')
  end

  local stash = {
    lock_secret = args[1],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    proxy_id = redis.call('HGET', proxy_key, 'proxy_id'),
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret' or k == 'proxy_id') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if stash.is_enabled == 0 then
    return redis.status_reply('OK Proxy allready disabled')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('HSET', proxy_key, 'is_enabled', 0)

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
  if #keys ~= 5 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local proxy_key = keys[3]
  local proxy_urls_key = keys[4]
  local proxy_index_key = keys[5]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Proxy not exists')
  end

  local stash = {
    lock_secret = args[1],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    proxy_id = redis.call('HGET', proxy_key, 'proxy_id'),
    url = redis.call('HGET', proxy_key, 'url'),
    is_enabled = tonumber(redis.call('HGET', proxy_key, 'is_enabled')),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if
      (k == 'lock_secret' or k == 'orig_lock_secret' or k == 'proxy_id' or k == 'url') and v == ''
    then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('FORBIDDEN Proxy not disabled')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('DEL', proxy_key)

  redis.call('SREM', proxy_urls_key, stash.url)

  redis.call('ZREM', proxy_index_key, stash.proxy_id)

  return redis.status_reply('OK Proxy deleted')
end

redis.register_function({
  function_name = 'delete_proxy',
  callback = delete_proxy,
  description = 'Delete proxy',
})

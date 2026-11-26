--
-- Proxy methods
--

local function create_proxy(keys, raw_args)
  if #keys ~= 5 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local proxy_key = keys[3]
  local proxy_urls_key = keys[4]
  local proxy_index_key = keys[5]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'url', kind = 'str' },
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', proxy_key) == 1 then
    return redis.status_reply('CONFLICT proxy already exists')
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= args.campaign_id then
    return redis.status_reply('FORBIDDEN proxy campaign_id mismatch')
  end

  if redis.call('SISMEMBER', proxy_urls_key, args.url) == 1 then
    return redis.status_reply('CONFLICT proxy url already taken')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', proxy_key,
    'campaign_id', args.campaign_id,
    'proxy_id', args.proxy_id,
    'url', args.url,
    'is_enabled', 0,
    'message_count', 0,
    'created_at', now
  )

  redis.call('SADD', proxy_urls_key, args.url)
  redis.call('ZADD', proxy_index_key, now, args.proxy_id)

  return redis.status_reply('OK proxy created')
end

redis.register_function({
  function_name = 'create_proxy',
  callback = create_proxy,
  description = 'Create proxy',
})

local function read_proxy(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local proxy_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', proxy_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_proxy = redis.call(
    'HMGET', proxy_key,
    'campaign_id',
    'proxy_id',
    'url',
    'is_enabled',
    'message_count',
    'created_at'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'url', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
    { name = 'message_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if proxy_err then
    return redis.error_reply('ERR normalize proxy: ' .. proxy_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= proxy.campaign_id then
    return redis.error_reply('ERR proxy campaign_id mismatch')
  end

  proxy.is_enabled = proxy.is_enabled == 1

  return { map = proxy }
end

redis.register_function({
  function_name = 'read_proxy',
  callback = read_proxy,
  flags = { 'no-writes' },
  description = 'Read proxy',
})

local function read_proxy_index(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local proxy_index_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
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

local function enable_proxy(keys, raw_args)
  if #keys ~= 4 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local proxy_key = keys[3]
  local enabled_proxy_index_key = keys[4]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', proxy_key) == 0 then
    return redis.status_reply('NOT_FOUND proxy not exists')
  end

  -- stylua: ignore
  local raw_proxy = redis.call(
    'HMGET', proxy_key,
    'campaign_id',
    'proxy_id',
    'is_enabled'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if proxy_err then
    return redis.error_reply('ERR normalize proxy: ' .. proxy_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= proxy.campaign_id then
    return redis.status_reply('FORBIDDEN proxy campaign_id mismatch')
  end

  if proxy.is_enabled == 1 then
    return redis.status_reply('OK proxy already enabled')
  end

  -- Point of no return

  redis.call('HSET', proxy_key, 'is_enabled', 1)
  redis.call('SADD', enabled_proxy_index_key, proxy.proxy_id)

  return redis.status_reply('OK proxy enabled')
end

redis.register_function({
  function_name = 'enable_proxy',
  callback = enable_proxy,
  description = 'Enable proxy',
})

local function disable_proxy(keys, raw_args)
  if #keys ~= 4 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local proxy_key = keys[3]
  local enabled_proxy_index_key = keys[4]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', proxy_key) == 0 then
    return redis.status_reply('NOT_FOUND proxy not exists')
  end

  -- stylua: ignore
  local raw_proxy = redis.call(
    'HMGET', proxy_key,
    'campaign_id',
    'proxy_id',
    'is_enabled'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if proxy_err then
    return redis.error_reply('ERR normalize proxy: ' .. proxy_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= proxy.campaign_id then
    return redis.status_reply('FORBIDDEN proxy campaign_id mismatch')
  end

  if proxy.is_enabled == 0 then
    return redis.status_reply('OK proxy already disabled')
  end

  -- Point of no return

  redis.call('HSET', proxy_key, 'is_enabled', 0)
  redis.call('SREM', enabled_proxy_index_key, proxy.proxy_id)

  return redis.status_reply('OK proxy disabled')
end

redis.register_function({
  function_name = 'disable_proxy',
  callback = disable_proxy,
  description = 'Disable proxy',
})

local function delete_proxy(keys, raw_args)
  if #keys ~= 5 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local proxy_key = keys[3]
  local proxy_urls_key = keys[4]
  local proxy_index_key = keys[5]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', proxy_key) == 0 then
    return redis.status_reply('NOT_FOUND proxy not exists')
  end

  -- stylua: ignore
  local raw_proxy = redis.call(
    'HMGET', proxy_key,
    'campaign_id',
    'proxy_id',
    'url',
    'is_enabled'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'url', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if proxy_err then
    return redis.error_reply('ERR normalize proxy: ' .. proxy_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= proxy.campaign_id then
    return redis.status_reply('FORBIDDEN proxy campaign_id mismatch')
  end

  if proxy.is_enabled == 1 then
    return redis.status_reply('FORBIDDEN proxy not disabled')
  end

  -- Point of no return

  redis.call('DEL', proxy_key)
  redis.call('SREM', proxy_urls_key, proxy.url)
  redis.call('ZREM', proxy_index_key, proxy.proxy_id)

  return redis.status_reply('OK proxy deleted')
end

redis.register_function({
  function_name = 'delete_proxy',
  callback = delete_proxy,
  description = 'Delete proxy',
})

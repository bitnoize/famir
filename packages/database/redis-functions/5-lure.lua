--
-- Lure methods
--

local function create_lure(keys, raw_args)
  if #keys ~= 6 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local lure_key = keys[3]
  local lure_paths_key = keys[4]
  local lure_index_key = keys[5]
  local redirector_key = keys[6]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'lure_id', kind = 'str' },
    { name = 'path', kind = 'str' },
    { name = 'redirector_id', kind = 'str' },
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

  if redis.call('EXISTS', lure_key) == 1 then
    return redis.status_reply('CONFLICT lure already exists')
  end

  if redis.call('EXISTS', redirector_key) == 0 then
    return redis.status_reply('NOT_FOUND redirector not exists')
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
    return redis.status_reply('FORBIDDEN lure campaign_id mismatch')
  end

  if redis.call('HEXISTS', lure_paths_key, args.path) == 1 then
    return redis.status_reply('CONFLICT lure path already taken')
  end

  -- stylua: ignore
  local raw_redirector = redis.call(
    'HMGET', redirector_key,
    'campaign_id',
    'redirector_id'
  )

  local redirector, redirector_err = normalize(raw_redirector, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'redirector_id', kind = 'str' },
  })

  if redirector_err then
    return redis.error_reply('ERR normalize redirector: ' .. redirector_err)
  end

  if
    redirector.campaign_id ~= args.campaign_id or redirector.redirector_id ~= args.redirector_id
  then
    return redis.status_reply('FORBIDDEN lure redirector_id mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', lure_key,
    'campaign_id', args.campaign_id,
    'lure_id', args.lure_id,
    'path', args.path,
    'redirector_id', args.redirector_id,
    'is_enabled', 0,
    'session_count', 0,
    'created_at', now
  )

  redis.call('HSET', lure_paths_key, args.path, args.lure_id)
  redis.call('ZADD', lure_index_key, now, args.lure_id)
  redis.call('HINCRBY', redirector_key, 'lure_count', 1)

  return redis.status_reply('OK lure created')
end

redis.register_function({
  function_name = 'create_lure',
  callback = create_lure,
  description = 'Create lure',
})

local function read_lure(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', lure_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_lure = redis.call(
    'HMGET', lure_key,
    'campaign_id',
    'lure_id',
    'path',
    'redirector_id',
    'is_enabled',
    'session_count',
    'created_at'
  )

  local lure, lure_err = normalize(raw_lure, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'lure_id', kind = 'str' },
    { name = 'path', kind = 'str' },
    { name = 'redirector_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
    { name = 'session_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if lure_err then
    return redis.error_reply('ERR normalize lure: ' .. lure_err)
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

  if campaign.campaign_id ~= lure.campaign_id then
    return redis.error_reply('ERR lure campaign_id mismatch')
  end

  lure.is_enabled = lure.is_enabled == 1

  return { map = lure }
end

redis.register_function({
  function_name = 'read_lure',
  callback = read_lure,
  flags = { 'no-writes' },
  description = 'Read lure',
})

local function find_lure_id(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local lure_paths_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'path', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('HEXISTS', lure_paths_key, args.path) == 0 then
    return nil
  end

  local lure_id = redis.call('HGET', lure_paths_key, args.path)

  if not lure_id or lure_id == '' then
    return redis.error_reply('ERR malform lure_id')
  end

  return lure_id
end

redis.register_function({
  function_name = 'find_lure_id',
  callback = find_lure_id,
  flags = { 'no-writes' },
  description = 'Find lure id',
})

local function read_lure_index(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local lure_index_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  return redis.call('ZRANGE', lure_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_lure_index',
  callback = read_lure_index,
  flags = { 'no-writes' },
  description = 'Read lure index',
})

local function enable_lure(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local lure_key = keys[3]

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

  if redis.call('EXISTS', lure_key) == 0 then
    return redis.status_reply('NOT_FOUND lure not exists')
  end

  -- stylua: ignore
  local raw_lure = redis.call(
    'HMGET', lure_key,
    'campaign_id',
    'lure_id',
    'is_enabled'
  )

  local lure, lure_err = normalize(raw_lure, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'lure_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if lure_err then
    return redis.error_reply('ERR normalize lure: ' .. lure_err)
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

  if campaign.campaign_id ~= lure.campaign_id then
    return redis.status_reply('FORBIDDEN lure campaign_id mismatch')
  end

  if lure.is_enabled == 1 then
    return redis.status_reply('OK lure already enabled')
  end

  -- Point of no return

  redis.call('HSET', lure_key, 'is_enabled', 1)

  return redis.status_reply('OK lure enabled')
end

redis.register_function({
  function_name = 'enable_lure',
  callback = enable_lure,
  description = 'Enable lure',
})

local function disable_lure(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local lure_key = keys[3]

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

  if redis.call('EXISTS', lure_key) == 0 then
    return redis.status_reply('NOT_FOUND lure not exists')
  end

  -- stylua: ignore
  local raw_lure = redis.call(
    'HMGET', lure_key,
    'campaign_id',
    'lure_id',
    'is_enabled'
  )

  local lure, lure_err = normalize(raw_lure, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'lure_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if lure_err then
    return redis.error_reply('ERR normalize lure: ' .. lure_err)
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

  if campaign.campaign_id ~= lure.campaign_id then
    return redis.status_reply('FORBIDDEN lure campaign_id mismatch')
  end

  if lure.is_enabled == 0 then
    return redis.status_reply('OK lure already disabled')
  end

  -- Point of no return

  redis.call('HSET', lure_key, 'is_enabled', 0)

  return redis.status_reply('OK lure disabled')
end

redis.register_function({
  function_name = 'disable_lure',
  callback = disable_lure,
  description = 'Disable lure',
})

local function delete_lure(keys, raw_args)
  if #keys ~= 6 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local lure_key = keys[3]
  local lure_paths_key = keys[4]
  local lure_index_key = keys[5]
  local redirector_key = keys[6]

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

  if redis.call('EXISTS', lure_key) == 0 then
    return redis.status_reply('NOT_FOUND lure not exists')
  end

  if redis.call('EXISTS', redirector_key) == 0 then
    return redis.status_reply('NOT_FOUND redirector not exists')
  end

  -- stylua: ignore
  local raw_lure = redis.call(
    'HMGET', lure_key,
    'campaign_id',
    'lure_id',
    'path',
    'redirector_id',
    'is_enabled'
  )

  local lure, lure_err = normalize(raw_lure, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'lure_id', kind = 'str' },
    { name = 'path', kind = 'str' },
    { name = 'redirector_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if lure_err then
    return redis.error_reply('ERR normalize lure: ' .. lure_err)
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

  if campaign.campaign_id ~= lure.campaign_id then
    return redis.status_reply('FORBIDDEN lure campaign_id mismatch')
  end

  -- stylua: ignore
  local raw_redirector = redis.call(
    'HMGET', redirector_key,
    'campaign_id',
    'redirector_id'
  )

  local redirector, redirector_err = normalize(raw_redirector, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'redirector_id', kind = 'str' },
  })

  if redirector_err then
    return redis.error_reply('ERR normalize redirector: ' .. redirector_err)
  end

  if
    lure.campaign_id ~= redirector.campaign_id or lure.redirector_id ~= redirector.redirector_id
  then
    return redis.status_reply('FORBIDDEN lure redirector_id mismatch')
  end

  if lure.is_enabled == 1 then
    return redis.status_reply('FORBIDDEN lure not disabled')
  end

  -- Point of no return

  redis.call('DEL', lure_key)
  redis.call('HDEL', lure_paths_key, lure.path)
  redis.call('ZREM', lure_index_key, lure.lure_id)
  redis.call('HINCRBY', redirector_key, 'lure_count', -1)

  return redis.status_reply('OK lure deleted')
end

redis.register_function({
  function_name = 'delete_lure',
  callback = delete_lure,
  description = 'Delete lure',
})

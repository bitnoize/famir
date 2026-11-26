--
-- Redirector methods
--

local function create_redirector(keys, raw_args)
  if #keys ~= 4 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_index_key = keys[4]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'redirector_id', kind = 'str' },
    { name = 'page', kind = 'any' },
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

  if redis.call('EXISTS', redirector_key) == 1 then
    return redis.status_reply('CONFLICT redirector already exists')
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
    return redis.status_reply('FORBIDDEN redirector campaign_id mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', redirector_key,
    'campaign_id', args.campaign_id,
    'redirector_id', args.redirector_id,
    'page', args.page,
    'lure_count', 0,
    'created_at', now
  )

  redis.call('ZADD', redirector_index_key, now, args.redirector_id)

  return redis.status_reply('OK redirector created')
end

redis.register_function({
  function_name = 'create_redirector',
  callback = create_redirector,
  description = 'Create redirector',
})

local function read_redirector(keys, args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]
  local redirector_fields_key = keys[3]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', redirector_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_redirector = redis.call(
    'HMGET', redirector_key,
    'campaign_id',
    'redirector_id',
    'page',
    'lure_count',
    'created_at'
  )

  local redirector, redirector_err = normalize(raw_redirector, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'redirector_id', kind = 'str' },
    { name = 'page', kind = 'any' },
    { name = 'lure_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if redirector_err then
    return redis.error_reply('ERR normalize redirector: ' .. redirector_err)
  end

  redirector.fields = redis.call('SMEMBERS', redirector_fields_key)

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

  if campaign.campaign_id ~= redirector.campaign_id then
    return redis.error_reply('ERR redirector campaign_id mismatch')
  end

  return { map = redirector }
end

redis.register_function({
  function_name = 'read_redirector',
  callback = read_redirector,
  flags = { 'no-writes' },
  description = 'Read redirector',
})

local function read_redirector_index(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local redirector_index_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  return redis.call('ZRANGE', redirector_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_redirector_index',
  callback = read_redirector_index,
  flags = { 'no-writes' },
  description = 'Read redirector index',
})

local function update_redirector(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]

  local args, args_err = normalize(raw_args, {
    { name = 'page', kind = 'any' },
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

  if redis.call('EXISTS', redirector_key) == 0 then
    return redis.status_reply('NOT_FOUND redirector not exists')
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

  if campaign.campaign_id ~= redirector.campaign_id then
    return redis.status_reply('FORBIDDEN redirector campaign_id mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', redirector_key,
    'page', args.page
  )

  return redis.status_reply('OK redirector updated')
end

redis.register_function({
  function_name = 'update_redirector',
  callback = update_redirector,
  description = 'Update redirector',
})

local function append_redirector_field(keys, raw_args)
  if #keys ~= 4 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_fields_key = keys[4]

  local args, args_err = normalize(raw_args, {
    { name = 'field', kind = 'str' },
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

  if redis.call('EXISTS', redirector_key) == 0 then
    return redis.status_reply('NOT_FOUND redirector not exists')
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

  if campaign.campaign_id ~= redirector.campaign_id then
    return redis.status_reply('FORBIDDEN redirector campaign_id mismatch')
  end

  if redis.call('SISMEMBER', redirector_fields_key, args.field) == 1 then
    return redis.status_reply('OK redirector field already exists')
  end

  -- Point of no return

  redis.call('SADD', redirector_fields_key, args.field)

  return redis.status_reply('OK redirector field appended')
end

redis.register_function({
  function_name = 'append_redirector_field',
  callback = append_redirector_field,
  description = 'Append redirector field',
})

local function clear_redirector_fields(keys, raw_args)
  if #keys ~= 4 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_fields_key = keys[4]

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

  if redis.call('EXISTS', redirector_key) == 0 then
    return redis.status_reply('NOT_FOUND redirector not exists')
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

  if campaign.campaign_id ~= redirector.campaign_id then
    return redis.status_reply('FORBIDDEN redirector campaign_id mismatch')
  end

  if redis.call('EXISTS', redirector_fields_key) == 0 then
    return redis.status_reply('OK redirector fields is empty')
  end

  -- Point of no return

  redis.call('DEL', redirector_fields_key)

  return redis.status_reply('OK redirector fields removed')
end

redis.register_function({
  function_name = 'clear_redirector_fields',
  callback = clear_redirector_fields,
  description = 'Clear redirector fields',
})

local function delete_redirector(keys, raw_args)
  if #keys ~= 5 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_fields_key = keys[4]
  local redirector_index_key = keys[5]

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

  if redis.call('EXISTS', redirector_key) == 0 then
    return redis.status_reply('NOT_FOUND redirector not exists')
  end

  -- stylua: ignore
  local raw_redirector = redis.call(
    'HMGET', redirector_key,
    'campaign_id',
    'redirector_id',
    'lure_count'
  )

  local redirector, redirector_err = normalize(raw_redirector, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'redirector_id', kind = 'str' },
    { name = 'lure_count', kind = 'int', min = 0 },
  })

  if redirector_err then
    return redis.error_reply('ERR normalize redirector: ' .. redirector_err)
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

  if campaign.campaign_id ~= redirector.campaign_id then
    return redis.status_reply('FORBIDDEN redirector campaign_id mismatch')
  end

  if redirector.lure_count > 0 then
    return redis.status_reply('FORBIDDEN lures exists')
  end

  -- Point of no return

  redis.call('DEL', redirector_key, redirector_fields_key)
  redis.call('ZREM', redirector_index_key, redirector.redirector_id)

  return redis.status_reply('OK redirector deleted')
end

redis.register_function({
  function_name = 'delete_redirector',
  callback = delete_redirector,
  description = 'Delete redirector',
})

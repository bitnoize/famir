--
-- Session methods
--

local function create_session(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]
  local enabled_proxy_index_key = keys[3]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
    { name = 'secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', session_key) == 1 then
    return redis.status_reply('CONFLICT session already exists')
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'new_session_expire'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'new_session_expire', kind = 'int', min = 1000 },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= args.campaign_id then
    return redis.status_reply('FORBIDDEN session campaign_id mismatch')
  end

  if redis.call('SCARD', enabled_proxy_index_key) == 0 then
    return redis.status_reply('NOT_FOUND no enabled proxies found')
  end

  local enabled_proxy_id = redis.call('SRANDMEMBER', enabled_proxy_index_key)

  if not enabled_proxy_id or enabled_proxy_id == '' then
    return redis.error_reply('ERR malform enabled_proxy_id')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', session_key,
    'campaign_id', args.campaign_id,
    'session_id', args.session_id,
    'proxy_id', enabled_proxy_id,
    'secret', args.secret,
    'is_upgraded', 0,
    'is_revoked', 0,
    'message_count', 0,
    'created_at', now,
    'authorized_at', 0
  )

  redis.call('HINCRBY', campaign_key, 'session_count', 1)
  redis.call('PEXPIRE', session_key, campaign.new_session_expire)

  return redis.status_reply('OK session created')
end

redis.register_function({
  function_name = 'create_session',
  callback = create_session,
  description = 'Create session',
})

local function read_session(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', session_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_session = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'session_id',
    'proxy_id',
    'is_upgraded',
    'is_revoked',
    'message_count',
    'created_at',
    'authorized_at'
  )

  local session, session_err = normalize(raw_session, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'is_upgraded', kind = 'int', min = 0, max = 1 },
    { name = 'is_revoked', kind = 'int', min = 0, max = 1 },
    { name = 'message_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
    { name = 'authorized_at', kind = 'int', min = 0 },
  })

  if session_err then
    return redis.error_reply('ERR normalize session: ' .. session_err)
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

  if campaign.campaign_id ~= session.campaign_id then
    return redis.error_reply('ERR session campaign_id mismatch')
  end

  session.is_upgraded = session.is_upgraded == 1
  session.is_revoked = session.is_revoked == 1

  return { map = session }
end

redis.register_function({
  function_name = 'read_session',
  callback = read_session,
  flags = { 'no-writes' },
  description = 'Read session',
})

local function read_session_history(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local session_history_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  return redis.call('ZRANGE', session_history_key, 0, -1, 'REV')
end

redis.register_function({
  function_name = 'read_session_history',
  callback = read_session_history,
  flags = { 'no-writes' },
  description = 'Read session history',
})

local function auth_session(keys, args)
  if #keys ~= 4 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]
  local session_history_key = keys[3]
  local enabled_proxy_index_key = keys[4]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', session_key) == 0 then
    return redis.status_reply('FORBIDDEN session not exists')
  end

  -- stylua: ignore
  local raw_session = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'session_id',
    'proxy_id',
    'is_revoked'
  )

  local session, session_err = normalize(raw_session, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'is_revoked', kind = 'int', min = 0, max = 1 },
  })

  if session_err then
    return redis.error_reply('ERR normalize session: ' .. session_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'session_expire'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_expire', kind = 'int', min = 1000 },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= session.campaign_id then
    return redis.status_reply('FORBIDDEN session campaign_id mismatch')
  end

  if session.is_revoked == 1 then
    return redis.status_reply('FORBIDDEN session is revoked')
  end

  if redis.call('SCARD', enabled_proxy_index_key) == 0 then
    return redis.status_reply('NOT_FOUND no enabled proxies found')
  end

  local history_threshold = math.max(0, now - campaign.session_expire * 2)

  -- Point of no return

  if redis.call('SISMEMBER', enabled_proxy_index_key, session.proxy_id) == 0 then
    local enabled_proxy_id = redis.call('SRANDMEMBER', enabled_proxy_index_key)

    if not enabled_proxy_id or enabled_proxy_id == '' then
      return redis.error_reply('ERR malform enabled_proxy_id')
    end

    -- stylua: ignore
    redis.call(
      'HSET', session_key,
      'proxy_id', enabled_proxy_id,
      'authorized_at', now
    )
  else
    -- stylua: ignore
    redis.call(
      'HSET', session_key,
      'authorized_at', now
    )
  end

  redis.call('PEXPIRE', session_key, campaign.session_expire)
  redis.call('ZREMRANGEBYSCORE', session_history_key, '-inf', '(' .. history_threshold)
  redis.call('ZADD', session_history_key, now, session.session_id)
  redis.call('PEXPIRE', session_history_key, campaign.session_expire * 2)

  return redis.status_reply('OK session authorized')
end

redis.register_function({
  function_name = 'auth_session',
  callback = auth_session,
  description = 'Auth session',
})

local function upgrade_session(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]
  local session_key = keys[3]

  local args, args_err = normalize(raw_args, {
    { name = 'secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', lure_key) == 0 then
    return redis.status_reply('NOT_FOUND lure not exists')
  end

  if redis.call('EXISTS', session_key) == 0 then
    return redis.status_reply('FORBIDDEN session not exists')
  end

  -- stylua: ignore
  local raw_session = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'session_id',
    'secret',
    'is_revoked',
    'is_upgraded'
  )

  local session, session_err = normalize(raw_session, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
    { name = 'secret', kind = 'str' },
    { name = 'is_revoked', kind = 'int', min = 0, max = 1 },
    { name = 'is_upgraded', kind = 'int', min = 0, max = 1 },
  })

  if session_err then
    return redis.error_reply('ERR normalize session: ' .. session_err)
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

  if campaign.campaign_id ~= session.campaign_id then
    return redis.status_reply('FORBIDDEN session campaign_id mismatch')
  end

  -- stylua: ignore
  local raw_lure = redis.call(
    'HMGET', lure_key,
    'campaign_id'
  )

  local lure, lure_err = normalize(raw_lure, {
    { name = 'campaign_id', kind = 'str' },
  })

  if lure_err then
    return redis.error_reply('ERR normalize lure: ' .. lure_err)
  end

  if lure.campaign_id ~= session.campaign_id then
    return redis.status_reply('FORBIDDEN lure campaign_id mismatch')
  end

  if lure.is_enabled == 0 then
    return redis.status_reply('FORBIDDEN lure is disabled')
  end

  if session.secret ~= args.secret then
    return redis.status_reply('FORBIDDEN session secret mismatch')
  end

  if session.is_revoked == 1 then
    return redis.status_reply('FORBIDDEN session is revoked')
  end

  if session.is_upgraded == 1 then
    return redis.status_reply('OK session already upgraded')
  end

  -- Point of no return

  redis.call('HSET', session_key, 'is_upgraded', 1)
  redis.call('HINCRBY', lure_key, 'session_count', 1)

  return redis.status_reply('OK session upgraded')
end

redis.register_function({
  function_name = 'upgrade_session',
  callback = upgrade_session,
  description = 'Upgrade session',
})

local function revoke_session(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', session_key) == 0 then
    return redis.status_reply('NOT_FOUND session not exists')
  end

  -- stylua: ignore
  local raw_session = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'session_id',
    'is_revoked'
  )

  local session, session_err = normalize(raw_session, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
    { name = 'is_revoked', kind = 'int', min = 0, max = 1 },
  })

  if session_err then
    return redis.error_reply('ERR normalize session: ' .. session_err)
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

  if campaign.campaign_id ~= session.campaign_id then
    return redis.status_reply('FORBIDDEN session campaign_id mismatch')
  end

  if session.is_revoked == 1 then
    return redis.status_reply('OK session already revoked')
  end

  -- Point of no return

  redis.call('HSET', session_key, 'is_revoked', 1)

  return redis.status_reply('OK session revoked')
end

redis.register_function({
  function_name = 'revoke_session',
  callback = revoke_session,
  description = 'Revoke session',
})



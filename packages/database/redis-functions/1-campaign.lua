local function current_time()
  local t = redis.call('TIME')

  return tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
end

local function coerce(value, spec)
  if value == nil then
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

    if n == nil or n ~= n or n == math.huge or n == -math.huge then
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

    if n == nil or n ~= math.floor(n) then
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

    if value == nil then
      return nil, err
    end

    out[spec.name] = value
  end

  return out
end

--[[
  Create campaign
--]]
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
    { name = 'session_expire', kind = 'int', min = 1 },
    { name = 'new_session_expire', kind = 'int', min = 1 },
    { name = 'message_expire', kind = 'int', min = 1 },
    { name = 'limiter_burst', kind = 'int', min = 1, max = 1000 },
    { name = 'limiter_rate', kind = 'int', min = 1, max = 1000 },
  })

  if args == nil then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) ~= 0 then
    return redis.status_reply('CONFLICT campaign already exists')
  end

  if redis.call('SISMEMBER', campaign_mirror_domains_key, args.mirror_domain) ~= 0 then
    return redis.status_reply('CONFLICT campaign mirror_domain already taken')
  end

  if redis.call('SISMEMBER', campaign_session_cookie_names_key, args.session_cookie_name) ~= 0 then
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
})

--[[
  Read campaign
--]]
local function read_campaign(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
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

  if campaign == nil then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  campaign.is_locked = redis.call('EXISTS', campaign_lock_key) ~= 0

  return { map = campaign }
end

redis.register_function({
  function_name = 'read_campaign',
  callback = read_campaign,
  flags = { 'no-writes' },
})

--[[
  Read full campaign
--]]
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
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

  if campaign == nil then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  campaign.session_cookie_names = redis.call('SMEMBERS', campaign_session_cookie_names_key)
  campaign.is_locked = redis.call('EXISTS', campaign_lock_key) ~= 0
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
})

--[[
  Read campaign index
--]]
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
})

--[[
  Lock campaign
--]]
local function lock_campaign(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
    { name = 'lock_timeout', kind = 'int', min = 1000, max = 3600 * 1000 },
  })

  if args == nil then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 0 then
    return redis.status_reply('FORBIDDEN campaign already locked')
  end

  -- Point of no return

  redis.call('SET', campaign_lock_key, args.lock_secret, 'PX', args.lock_timeout)

  return redis.status_reply('OK campaign locked')
end

redis.register_function({
  function_name = 'lock_campaign',
  callback = lock_campaign,
})

--[[
  Unlock campaign
--]]
local function unlock_campaign(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
  })

  if args == nil then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('OK campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if lock_secret == nil or lock_secret == '' then
    return redis.error_reply('ERR wrong campaign lock_secret')
  end

  if lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('DEL', campaign_lock_key)

  return redis.status_reply('OK campaign unlocked')
end

redis.register_function({
  function_name = 'unlock_campaign',
  callback = unlock_campaign,
})

--[[
  Update campaign
--]]
local function update_campaign(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'description', kind = 'any' },
    { name = 'session_expire', kind = 'int', min = 1 },
    { name = 'new_session_expire', kind = 'int', min = 1 },
    { name = 'message_expire', kind = 'int', min = 1 },
    { name = 'limiter_burst', kind = 'int', min = 1, max = 1000 },
    { name = 'limiter_rate', kind = 'int', min = 1000 },
    { name = 'lock_secret', kind = 'str' },
  })

  if args == nil then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if lock_secret == nil or lock_secret == '' then
    return redis.error_reply('ERR wrong campaign lock_secret')
  end

  if lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret not match')
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
})

--[[
  Append campaign flag
--]]
local function append_campaign_flag(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_flags_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'flag', kind = 'str' },
  })

  if args == nil then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('SISMEMBER', campaign_flags_key, args.flag) ~= 0 then
    return redis.status_reply('OK campaign flag already exists')
  end

  -- Point of no return

  redis.call('SADD', campaign_flags_key, args.flag)

  return redis.status_reply('OK campaign flag appended')
end

redis.register_function({
  function_name = 'append_campaign_flag',
  callback = append_campaign_flag,
})

--[[
  Remove campaign flag
--]]
local function remove_campaign_flag(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_flags_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'flag', kind = 'str' },
  })

  if args == nil then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
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
})

--[[
  Delete campaign
--]]
local function delete_campaign(keys, raw_args)
  if #keys ~= 10 then
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

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
  })

  if args == nil then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if lock_secret == nil or lock_secret == '' then
    return redis.error_reply('ERR wrong campaign lock_secret')
  end

  if lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret not match')
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

  if campaign == nil then
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

  redis.call('DEL', campaign_key, campaign_lock_key, campaign_flags_key)
  redis.call('SREM', campaign_mirror_domains_key, campaign.mirror_domain)
  redis.call('SREM', campaign_session_cookie_names_key, campaign.session_cookie_name)
  redis.call('ZREM', campaign_index_key, campaign.campaign_id)

  return redis.status_reply('OK campaign deleted')
end

redis.register_function({
  function_name = 'delete_campaign',
  callback = delete_campaign,
})

--[[
  Check campaign limiter
--]]
local function check_campaign_limiter(keys, raw_args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_limiter_key = keys[2]

  local args, args_err = normalize(raw_args, {
    { name = 'limiter_cost', kind = 'num', min = 0.000001, max = 1000 },
  })

  if args == nil then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'limiter_burst',
    'limiter_rate'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'limiter_burst', kind = 'int', min = 1, max = 1000 },
    { name = 'limiter_rate', kind = 'int', min = 1, max = 1000 },
  })

  if campaign == nil then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if args.limiter_cost > campaign.limiter_burst then
    return redis.error_reply('ERR arg limiter_cost exceeds campaign limiter_burst')
  end

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

  if limiter == nil then
    return redis.error_reply('ERR normalize limiter: ' .. limiter_err)
  end

  limiter.tokens = math.min(campaign.limiter_burst, limiter.tokens)

  local elapsed = math.max(0, now - limiter.ts) / 1000
  limiter.tokens =
    math.min(campaign.limiter_burst, limiter.tokens + elapsed * campaign.limiter_rate)

  limiter.ts = now

  -- Point of no return

  local is_allowed = false

  if limiter.tokens >= args.limiter_cost then
    limiter.tokens = limiter.tokens - args.limiter_cost

    is_allowed = true
  end

  if limiter.tokens < 0 then
    limiter.tokens = 0
  end

  local limiter_expire = math.ceil((campaign.limiter_burst / campaign.limiter_rate) * 1000) + 1000

  -- stylua: ignore
  redis.call(
    'HSET', campaign_limiter_key,
    'tokens', limiter.tokens,
    'ts', limiter.ts
  )

  redis.call('PEXPIRE', campaign_limiter_key, limiter_expire)

  return {
    map = {
      is_allowed = is_allowed,
      tokens = limiter.tokens,
      ts = limiter.ts,
    },
  }
end

redis.register_function({
  function_name = 'check_campaign_limiter',
  callback = check_campaign_limiter,
})

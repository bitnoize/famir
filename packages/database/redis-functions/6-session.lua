#!lua name=session

--[[
  Create session
--]]
local function create_session(keys, args)
  if #keys ~= 3 or #args ~= 4 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]
  local enabled_proxy_index_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', session_key) ~= 0 then
    return redis.status_reply('CONFLICT Session allready exists')
  end

  local stash = {
    new_session_expire = tonumber(redis.call('HGET', campaign_key, 'new_session_expire')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'new_session_expire' and value <= 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if redis.call('SCARD', enabled_proxy_index_key) == 0 then
    return redis.status_reply('NOT_FOUND No enabled proxies found')
  end

  local model = {
    campaign_id = args[1],
    session_id = args[2],
    proxy_id = redis.call('SRANDMEMBER', enabled_proxy_index_key),
    secret = args[3],
    is_landing = 0,
    message_count = 0,
    created_at = tonumber(args[4]),
    last_auth_at = tonumber(args[4]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end

    if
      (field == 'campaign_id' or field == 'session_id' or field == 'proxy_id' or field == 'secret')
      and value == ''
    then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', session_key, unpack(store))

  redis.call('HINCRBY', campaign_key, 'session_count', 1)

  redis.call('PEXPIRE', session_key, stash.new_session_expire)

  return redis.status_reply('OK Session created')
end

redis.register_function({
  function_name = 'create_session',
  callback = create_session,
  description = 'Create session',
})

--[[
  Read session
--]]
local function read_session(keys, args)
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'session_id',
    'proxy_id',
    'secret',
    'is_landing',
    'message_count',
    'created_at',
    'last_auth_at'
  )

  if #values ~= 8 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    session_id = values[2],
    proxy_id = values[3],
    secret = values[4],
    is_landing = tonumber(values[5]),
    message_count = tonumber(values[6]),
    created_at = tonumber(values[7]),
    last_auth_at = tonumber(values[8]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_session',
  callback = read_session,
  flags = { 'no-writes' },
  description = 'Read session',
})

--[[
  Auth session
--]]
local function auth_session(keys, args)
  if #keys ~= 3 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]
  local enabled_proxy_index_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Session not exists')
  end

  local stash = {
    last_auth_at = tonumber(args[1]),
    proxy_id = redis.call('HGET', session_key, 'proxy_id'),
    session_expire = tonumber(redis.call('HGET', campaign_key, 'session_expire')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'proxy_id' and value == '' then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'session_expire' and value <= 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if redis.call('SCARD', enabled_proxy_index_key) == 0 then
    return redis.status_reply('NOT_FOUND No enabled proxies found')
  end

  -- Point of no return

  if redis.call('SISMEMBER', enabled_proxy_index_key, stash.proxy_id) == 0 then
    local enabled_proxy_id = redis.call('SRANDMEMBER', enabled_proxy_index_key)

    if not enabled_proxy_id or enabled_proxy_id == '' then
      return redis.error_reply('ERR Wrong enabled_proxy_id')
    end

    -- stylua: ignore
    redis.call(
      'HSET', session_key,
      'proxy_id', enabled_proxy_id,
      'last_auth_at', stash.last_auth_at
    )
  else
    redis.call('HSET', session_key, 'last_auth_at', stash.last_auth_at)
  end

  redis.call('PEXPIRE', session_key, stash.session_expire)

  return redis.status_reply('OK Session authorized')
end

redis.register_function({
  function_name = 'auth_session',
  callback = auth_session,
  description = 'Auth session',
})

--[[
  Upgrade session
--]]
local function upgrade_session(keys, args)
  if #keys ~= 3 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]
  local session_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Lure not exists')
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Session not exists')
  end

  local stash = {
    secret = args[1],
    orig_secret = redis.call('HGET', session_key, 'secret'),
    is_landing = tonumber(redis.call('HGET', session_key, 'is_landing')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if (field == 'secret' or field == 'orig_secret') and value == '' then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if stash.orig_secret ~= stash.secret then
    return redis.status_reply('FORBIDDEN Session secret not match')
  end

  if stash.is_landing ~= 0 then
    return redis.status_reply('OK Session allready upgraded')
  end

  -- Point of no return

  redis.call('HSET', session_key, 'is_landing', 1)

  redis.call('HINCRBY', lure_key, 'session_count', 1)

  return redis.status_reply('OK Session upgraded')
end

redis.register_function({
  function_name = 'upgrade_session',
  callback = upgrade_session,
  description = 'Upgrade session',
})

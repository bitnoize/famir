#!lua name=session

--[[
  Create session
--]]
local function create_session(keys, args)
  if not (#keys == 3 and #args == 4) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]
  local enabled_proxy_index_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', session_key) == 0) then
    return redis.status_reply('CONFLICT Session allready exists')
  end

  if not (redis.call('SCARD', enabled_proxy_index_key) > 0) then
    return redis.status_reply('SERVICE_UNAVAILABLE No enabled proxies found')
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
  end

  if not (#model.campaign_id > 0) then
    return redis.error_reply('ERR Wrong model.campaign_id')
  end

  if not (#model.session_id > 0) then
    return redis.error_reply('ERR Wrong model.session_id')
  end

  if not (#model.proxy_id > 0) then
    return redis.error_reply('ERR Wrong model.proxy_id')
  end

  local stash = {
    new_session_expire = tonumber(redis.call('HGET', campaign_key, 'new_session_expire')),
  }

  if not (stash.new_session_expire and stash.new_session_expire > 0) then
    return redis.error_reply('ERR Malform stash.new_session_expire')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', session_key, unpack(store))

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
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  if not (redis.call('EXISTS', session_key) == 1) then
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

  if not (#values == 8) then
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
  if not (#keys == 3 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]
  local enabled_proxy_index_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', session_key) == 1) then
    return redis.status_reply('NOT_FOUND Session not found')
  end

  if not (redis.call('SCARD', enabled_proxy_index_key) > 0) then
    return redis.status_reply('SERVICE_UNAVAILABLE No enabled proxies found')
  end

  local stash = {
    last_auth_at = tonumber(args[1]),
    proxy_id = redis.call('HGET', session_key, 'proxy_id'),
    session_expire = tonumber(redis.call('HGET', campaign_key, 'session_expire')),
  }

  if not stash.last_auth_at then
    return redis.error_reply('ERR Wrong stash.last_auth_at')
  end

  if not (stash.proxy_id and #stash.proxy_id > 0) then
    return redis.error_reply('ERR Malform stash.proxy_id')
  end

  if not (stash.session_expire and stash.session_expire > 0) then
    return redis.error_reply('ERR Malform stash.session_expire')
  end

  if redis.call('SISMEMBER', enabled_proxy_index_key, stash.proxy_id) == 0 then
    stash.proxy_id = redis.call('SRANDMEMBER', enabled_proxy_index_key)

    if not (stash.proxy_id and #stash.proxy_id > 0) then
      return redis.error_reply('ERR Malform stash.proxy_id')
    end
  end

  -- stylua: ignore
  redis.call(
    'HSET', session_key,
    'proxy_id', stash.proxy_id,
    'last_auth_at', stash.last_auth_at
  )

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
  if not (#keys == 3 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]
  local session_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', lure_key) == 1) then
    return redis.status_reply('NOT_FOUND Lure not found')
  end

  if not (redis.call('EXISTS', session_key) == 1) then
    return redis.status_reply('NOT_FOUND Session not found')
  end

  local stash = {
    test_secret = args[1],
    orig_secret = redis.call('HGET', session_key, 'secret'),
    is_landing = tonumber(redis.call('HGET', session_key, 'is_landing')),
  }

  if not (stash.test_secret and #stash.test_secret > 0) then
    return redis.error_reply('ERR Wrong stash.test_secret')
  end

  if not (stash.orig_secret and #stash.orig_secret > 0) then
    return redis.error_reply('ERR Malform stash.orig_secret')
  end

  if not stash.is_landing then
    return redis.error_reply('ERR Malform stash.is_landing')
  end

  if stash.test_secret ~= stash.orig_secret then
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

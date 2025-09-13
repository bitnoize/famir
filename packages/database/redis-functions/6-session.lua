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

  local model = {
    campaign_id = args[1],
    id = args[2],
    proxy_id = nil,
    secret = args[3],
    is_landing = 0,
    message_count = 0,
    created_at = tonumber(args[4]),
    last_auth_at = nil,
  }

  if not #model.campaign_id > 0 then
    return redis.error_reply('ERR Wrong model.campaign_id')
  end

  if not #model.id > 0 then
    return redis.error_reply('ERR Wrong model.id')
  end

  if not #model.secret > 0 then
    return redis.error_reply('ERR Wrong model.secret')
  end

  if not (model.created_at and model.created_at > 0) then
    return redis.error_reply('ERR Wrong model.created_at')
  end

  model.last_auth_at = model.created_at

  if not redis.call('EXISTS', campaign_key) == 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not redis.call('EXISTS', session_key) == 0 then
    return redis.status_reply('CONFLICT Session allready exists')
  end

  if not redis.call('SCARD', enabled_proxy_index_key) > 0 then
    return redis.status_reply('FORBIDDEN No enabled proxies found')
  end

  model.proxy_id = redis.call('SRANDMEMBER', enabled_proxy_index_key)

  if not (model.proxy_id and #model.proxy_id > 0) then
    return redis.error_reply('ERR Malform model.proxy_id')
  end

  local data = {
    new_session_expire = tonumber(redis.call('HGET', campaign_key, 'new_session_expire')),
  }

  if not (data.new_session_expire and data.new_session_expire > 0) then
    return redis.error_reply('ERR Malform data.new_session_expire')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', session_key, unpack(store))

  redis.call('PEXPIRE', session_key, data.new_session_expire)

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

  if not redis.call('EXISTS', campaign_key) == 1 then
    return nil
  end

  if not redis.call('EXISTS', session_key) == 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'id',
    'proxy_id',
    'secret',
    'is_landing',
    'message_count',
    'created_at',
    'last_auth_at'
  )

  if not #values == 8 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    id = values[2],
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

  local params = {
    last_auth_at = tonumber(args[1]),
  }

  if not (params.last_auth_at and params.last_auth_at > 0) then
    return redis.error_reply('ERR Wrong params.last_auth_at')
  end

  if not redis.call('EXISTS', campaign_key) == 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not redis.call('EXISTS', session_key) == 1 then
    return redis.status_reply('NOT_FOUND Session not found')
  end

  if not redis.call('SCARD', enabled_proxy_index_key) > 0 then
    return redis.status_reply('FORBIDDEN No enabled proxies found')
  end

  local data = {
    proxy_id = redis.call('HGET', session_key, 'proxy_id'),
    session_expire = tonumber(redis.call('HGET', campaign_key, 'session_expire')),
  }

  if not (data.proxy_id and #data.proxy_id > 0) then
    return redis.error_reply('ERR Malform data.proxy_id')
  end

  if not (data.session_expire and data.session_expire > 0) then
    return redis.error_reply('ERR Malform data.session_expire')
  end

  if redis.call('SISMEMBER', enabled_proxy_index_key, data.proxy_id) == 0 then
    data.proxy_id = redis.call('SRANDMEMBER', enabled_proxy_index_key)

    if not (data.proxy_id and #data.proxy_id > 0) then
      return redis.error_reply('ERR Malform data.proxy_id')
    end
  end

  -- stylua: ignore
  redis.call(
    'HSET', session_key,
    'proxy_id', data.proxy_id,
    'last_auth_at', params.last_auth_at
  )

  redis.call('PEXPIRE', session_key, data.session_expire)

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

  local params = {
    secret = args[1],
  }

  if not #params.secret > 0 then
    return redis.error_reply('ERR Wrong params.secret')
  end

  if not redis.call('EXISTS', campaign_key) == 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not redis.call('EXISTS', lure_key) == 1 then
    return redis.status_reply('NOT_FOUND Lure not found')
  end

  if not redis.call('EXISTS', session_key) == 1 then
    return redis.status_reply('NOT_FOUND Session not found')
  end

  local data = {
    secret = redis.call('HGET', session_key, 'secret'),
    is_landing = tonumber(redis.call('HGET', session_key, 'is_landing')),
  }

  if not (data.secret and #data.secret > 0) then
    return redis.error_reply('ERR Malform data.secret')
  end

  if not data.is_landing then
    return redis.error_reply('ERR Malform data.is_landing')
  end

  if params.secret ~= data.secret then
    return redis.status_reply('FORBIDDEN Session secret not match')
  end

  if data.is_landing ~= 0 then
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

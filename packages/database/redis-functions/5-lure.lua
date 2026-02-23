#!lua name=lure

--[[
  Create lure
--]]
local function create_lure(keys, args)
  if #keys ~= 6 or #args ~= 6 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local lure_key = keys[3]
  local lure_paths_key = keys[4]
  local lure_index_key = keys[5]
  local redirector_key = keys[6]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', lure_key) ~= 0 then
    return redis.status_reply('CONFLICT Lure allready exists')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Redirector not found')
  end

  local stash = {
    lock_secret = args[6],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if (field == 'lock_secret' or field == 'orig_lock_secret') and value == '' then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  local model = {
    campaign_id = args[1],
    lure_id = args[2],
    path = args[3],
    redirector_id = args[4],
    is_enabled = 0,
    session_count = 0,
    created_at = tonumber(args[5]),
    updated_at = tonumber(args[5]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end

    if
      (field == 'campaign_id' or field == 'lure_id' or field == 'path' or field == 'redirector_id')
      and value == ''
    then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', lure_key, unpack(store))

  redis.call('HSET', lure_paths_key, model.path, model.lure_id)

  redis.call('ZADD', lure_index_key, model.created_at, model.lure_id)

  redis.call('HINCRBY', redirector_key, 'lure_count', 1)

  return redis.status_reply('OK Lure created')
end

redis.register_function({
  function_name = 'create_lure',
  callback = create_lure,
  description = 'Create lure',
})

--[[
  Read lure
--]]
local function read_lure(keys, args)
  if #keys == 2 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values =  redis.call(
    'HMGET', lure_key,
    'campaign_id',
    'lure_id',
    'path',
    'redirector_id',
    'is_enabled',
    'session_count',
    'created_at',
    'updated_at'
  )

  if #values ~= 8 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    lure_id = values[2],
    path = values[3],
    redirector_id = values[4],
    is_enabled = tonumber(values[5]),
    session_count = tonumber(values[6]),
    created_at = tonumber(values[7]),
    updated_at = tonumber(values[8]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_lure',
  callback = read_lure,
  flags = { 'no-writes' },
  description = 'Read lure',
})

--[[
  Find lure id
--]]
local function find_lure_id(keys, args)
  if #keys ~= 2 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_paths_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  local path = args[1]

  if not (path and path ~= '') then
    return redis.error_reply('ERR Wrong path')
  end

  if redis.call('HEXISTS', lure_paths_key, path) ~= 1 then
    return nil
  end

  local lure_id = redis.call('HGET', lure_paths_key, path)

  if not (lure_id and lure_id ~= '') then
    return redis.error_reply('ERR Malform lure_id')
  end

  return lure_id
end

redis.register_function({
  function_name = 'find_lure_id',
  callback = find_lure_id,
  flags = { 'no-writes' },
  description = 'Find lure id',
})

--[[
  Read lure index
--]]
local function read_lure_index(keys, args)
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_index_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
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

--[[
  Enable lure
--]]
local function enable_lure(keys, args)
  if #keys ~= 3 or #args ~= 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local lure_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Lure not exists')
  end

  local stash = {
    updated_at = tonumber(args[1]),
    lock_secret = args[2],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if (field == 'lock_secret' or field == 'orig_lock_secret') and value == '' then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('OK Lure allready enabled')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('HSET', lure_key, 'is_enabled', 1, 'updated_at', stash.updated_at)

  return redis.status_reply('OK Lure enabled')
end

redis.register_function({
  function_name = 'enable_lure',
  callback = enable_lure,
  description = 'Enable lure',
})

--[[
  Disable lure
--]]
local function disable_lure(keys, args)
  if #keys ~= 3 or #args ~= 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local lure_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Lure not exists')
  end

  local stash = {
    updated_at = tonumber(args[1]),
    lock_secret = args[2],
    orig_lock_secret = redis.call('GET', campaign_key),
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if (field == 'lock_secret' or field == 'orig_lock_secret') and value == '' then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if stash.is_enabled == 0 then
    return redis.status_reply('OK Lure allready disabled')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('HSET', lure_key, 'is_enabled', 0, 'updated_at', stash.updated_at)

  return redis.status_reply('OK Lure disabled')
end

redis.register_function({
  function_name = 'disable_lure',
  callback = disable_lure,
  description = 'Disable lure',
})

--[[
  Delete lure
--]]
local function delete_lure(keys, args)
  if #keys ~= 6 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local lure_key = keys[3]
  local lure_paths_key = keys[4]
  local lure_index_key = keys[5]
  local redirector_key = keys[6]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Lure not exists')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Redirector not exists')
  end

  local stash = {
    lock_secret = args[1],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    lure_id = redis.call('HGET', lure_key, 'lure_id'),
    path = redis.call('GET', lure_key, 'path'),
    redirector_id = redis.call('HGET', lure_key, 'redirector_id'),
    orig_redirector_id = redis.call('HGET', redirector_key, 'redirector_id'),
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if
      (
        field == 'lock_secret'
        or field == 'orig_lock_secret'
        or field == 'lure_id'
        or field == 'path'
        or field == 'redirector_id'
        or field == 'orig_redirector_id'
      ) and value == ''
    then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if stash.orig_redirector_id ~= stash.redirector_id then
    return redis.status_reply('FORBIDDEN Lure redirector not match')
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('FORBIDDEN Lure not disabled')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('DEL', lure_key)

  redis.call('HDEL', lure_paths_key, stash.path)

  redis.call('ZREM', lure_index_key, stash.lure_id)

  redis.call('HINCRBY', redirector_key, 'lure_count', -1)

  return redis.status_reply('OK Lure deleted')
end

redis.register_function({
  function_name = 'delete_lure',
  callback = delete_lure,
  description = 'Delete lure',
})

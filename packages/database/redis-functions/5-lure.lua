#!lua name=lure

--[[
  Create lure
--]]
local function create_lure(keys, args)
  if not (#keys == 5 and #args == 5) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]
  local lure_path_key = keys[3]
  local lure_index_key = keys[4]
  local redirector_key = keys[5]

  local model = {
    campaign_id = args[1],
    id = args[2],
    path = args[3],
    redirector_id = args[4],
    is_enabled = 0,
    session_count = 0,
    created_at = tonumber(args[5]),
    updated_at = nil,
  }

  if not (#model.campaign_id > 0) then
    return redis.error_reply('ERR Wrong model.campaign_id')
  end

  if not (#model.id > 0) then
    return redis.error_reply('ERR Wrong model.id')
  end

  if not (#model.path > 0) then
    return redis.error_reply('ERR Wrong model.path')
  end

  if not (#model.redirector_id > 0) then
    return redis.error_reply('ERR Wrong model.redirector_id')
  end

  if not (model.created_at and model.created_at > 0) then
    return redis.error_reply('ERR Wrong model.created_at')
  end

  model.updated_at = model.created_at

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', lure_key) == 0) then
    return redis.status_reply('CONFLICT Lure allready exists')
  end

  if not (redis.call('EXISTS', lure_path_key) == 0) then
    return redis.status_reply('CONFLICT Lure path allready taken')
  end

  if not (redis.call('EXISTS', redirector_key) == 1) then
    return redis.status_reply('NOT_FOUND Redirector not found')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', lure_key, unpack(store))

  redis.call('SET', lure_path_key, model.id)

  redis.call('ZADD', lure_index_key, model.created_at, model.id)

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
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  if not (redis.call('EXISTS', lure_key) == 1) then
    return nil
  end

  -- stylua: ignore
  local values =  redis.call(
    'HMGET', lure_key,
    'campaign_id',
    'id',
    'path',
    'redirector_id',
    'is_enabled',
    'session_count',
    'created_at',
    'updated_at'
  )

  if not (#values == 8) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    id = values[2],
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
  Read lure path
--]]
local function read_lure_path(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_path_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  if not (redis.call('EXISTS', lure_path_key) == 1) then
    return nil
  end

  return redis.call('GET', lure_path_key)
end

redis.register_function({
  function_name = 'read_lure_path',
  callback = read_lure_path,
  flags = { 'no-writes' },
  description = 'Read lure path',
})

--[[
  Read lure index
--]]
local function read_lure_index(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_index_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
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
  if not (#keys == 2 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]

  local params = {
    updated_at = tonumber(args[1]),
  }

  if not (params.updated_at and params.updated_at > 0) then
    return redis.error_reply('ERR Wrong params.updated_at')
  end

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', lure_key) == 1) then
    return redis.status_reply('NOT_FOUND Lure not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled')),
  }

  if not data.is_enabled then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled ~= 0 then
    return redis.status_reply('OK Lure allready enabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', lure_key,
    'is_enabled', 1,
    'updated_at', params.updated_at
  )

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
  if not (#keys == 2 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]

  local params = {
    updated_at = tonumber(args[1]),
  }

  if not (params.updated_at and params.updated_at > 0) then
    return redis.error_reply('ERR Wrong params.updated_at')
  end

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', lure_key) == 1) then
    return redis.status_reply('NOT_FOUND Lure not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled')),
  }

  if not data.is_enabled then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled == 0 then
    return redis.status_reply('OK Lure allready disabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', lure_key,
    'is_enabled', 0,
    'updated_at', params.updated_at
  )

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
  if not (#keys == 5 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]
  local lure_path_key = keys[3]
  local lure_index_key = keys[4]
  local redirector_key = keys[5]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', lure_key) == 1) then
    return redis.status_reply('NOT_FOUND Lure not found')
  end

  if not (redis.call('EXISTS', redirector_key) == 1) then
    return redis.status_reply('NOT_FOUND Redirector not found')
  end

  local data = {
    id = redis.call('HGET', lure_key, 'id'),
    redirector_id = redis.call('HGET', lure_key, 'redirector_id'),
    orig_path_id = redis.call('GET', lure_path_key),
    orig_redirector_id = redis.call('HGET', redirector_key, 'id'),
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled')),
  }

  if not (data.id and #data.id > 0) then
    return redis.error_reply('ERR Malform data.id')
  end

  if not (data.redirector_id and #data.redirector_id > 0) then
    return redis.error_reply('ERR Malform data.daredirector_id')
  end

  if not (data.orig_path_id and #data.orig_path_id > 0) then
    return redis.error_reply('ERR Malform data.orig_path_id')
  end

  if not (data.id == data.orig_path_id) then
    return redis.status_reply('FORBIDDEN Lure path not match')
  end

  if not (data.orig_redirector_id and data.orig_redirector_id ~= '') then
    return redis.error_reply('ERR Malform data.orig_redirector_id')
  end

  if not (data.redirector_id == data.orig_redirector_id) then
    return redis.status_reply('FORBIDDEN Lure redirector not match')
  end

  if not data.is_enabled then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled ~= 0 then
    return redis.status_reply('FORBIDDEN Lure not disabled')
  end

  -- Point of no return

  redis.call('DEL', lure_key)

  redis.call('DEL', lure_path_key)

  redis.call('ZREM', lure_index_key, data.id)

  redis.call('HINCRBY', redirector_key, 'lure_count', -1)

  return redis.status_reply('OK Lure deleted')
end

redis.register_function({
  function_name = 'delete_lure',
  callback = delete_lure,
  description = 'Delete lure',
})

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

  local params = {
    id = args[1],
    path = args[2],
    redirector_id = args[3],
    is_enabled = 0,
    auth_count = 0,
    created_at = tonumber(args[4])
  }

  if not (params.id and params.id ~= '') then
    return redis.error_reply('ERR Wrong params.id')
  end

  if not (params.path and params.path ~= '') then
    return redis.error_reply('ERR Wrong params.path')
  end

  if not (params.redirector_id and params.redirector_id ~= '') then
    return redis.error_reply('ERR Wrong params.redirector_id')
  end

  if not (params.created_at and params.created_at > 0) then
    return redis.error_reply('ERR Wrong params.created_at')
  end

  params.updated_at = params.created_at

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', lure_key) ~= 0 then
    return redis.status_reply('EXISTS Lure allready exists')
  end

  if redis.call('EXISTS', lure_path_key) ~= 0 then
    return redis.status_reply('NOT_UNIQUE Lure path allready taken')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Redirector not found')
  end

  -- Point of no return

  local save = {}

  for field, value in pairs(params) do
    table.insert(save, field)
    table.insert(save, value)
  end

  redis.call('HSET', lure_key, unpack(save))

  redis.call('SET', lure_path_key, params.id)

  redis.call('ZADD', lure_index_key, params.created_at, params.id)

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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values =  redis.call(
    'HMGET', lure_key,
    'id',
    'path',
    'redirector_id',
    'is_enabled',
    'auth_count',
    'created_at',
    'updated_at'
  )

  if not (values and #values == 7) then
    return redis.error_reply('ERR Malform values')
  end

  local data = {
    id = values[1],
    path = values[2],
    redirector_id = values[3],
    is_enabled = tonumber(values[4]),
    auth_count = tonumber(values[5]),
    created_at = tonumber(values[6]),
    updated_at = tonumber(values[7]),
  }

  if not (data.id and data.id ~= '') then
    return redis.error_reply('ERR Malform data.id')
  end

  if not (data.path and data.path ~= '') then
    return redis.error_reply('ERR Malform data.path')
  end

  if not (data.redirector_id and data.redirector_id ~= '') then
    return redis.error_reply('ERR Malform data.redirector_id')
  end
  
  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if not (data.auth_count and data.auth_count >= 0) then
    return redis.error_reply('ERR Malform data.auth_count')
  end

  if not (data.created_at and data.created_at > 0) then
    return redis.error_reply('ERR Malform data.created_at')
  end

  if not (data.updated_at and data.updated_at > 0) then
    return redis.error_reply('ERR Malform data.updated_at')
  end

  return { map = data }
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', lure_path_key) ~= 1 then
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Lure not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled')),
  }

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled == 1 then
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Lure not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled')),
  }

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Lure not found')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Redirector not found')
  end

  local data = {
    id = redis.call('HGET', lure_key, 'id'),
    redirector_id = redis.call('HGET', lure_key, 'redirector_id'),
    orig_path_id = redis.call('GET', lure_path_key),
    orig_redirector_id = redis.call('HGET', redirector_key, 'id'),
    is_enabled = tonumber(redis.call('HGET', lure_key, 'is_enabled'))
  }

  if not (data.id and data.id ~= '') then
    return redis.error_reply('ERR Malform data.id')
  end

  if not (data.redirector_id and data.redirector_id ~= '') then
    return redis.error_reply('ERR Malform data.daredirector_id')
  end

  if not (data.orig_path_id and data.orig_path_id ~= '') then
    return redis.error_reply('ERR Malform data.orig_path_id')
  end

  if data.id ~= data.orig_path_id then
    return redis.status_reply('BAD_PARAMS Lure path not match')
  end

  if not (data.orig_redirector_id and data.orig_redirector_id ~= '') then
    return redis.error_reply('ERR Malform data.orig_redirector_id')
  end

  if redirector_id ~= orig_redirector_id then
    return redis.status_reply('BAD_PARAMS Lure redirector not match')
  end

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled ~= 0 then
    return redis.status_reply('FROZEN Lure not disabled')
  end

  -- Point of no return

  redis.call('DEL', lure_key)

  redis.call('DEL', lure_path_key)

  redis.call('ZREM', lure_index_key, id)

  redis.call('HINCRBY', redirector_key, 'lure_count', -1)

  return redis.status_reply('OK Lure deleted')
end

redis.register_function({
  function_name = 'delete_lure',
  callback = delete_lure,
  description = 'Delete lure',
})

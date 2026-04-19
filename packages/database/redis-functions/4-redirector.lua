#!lua name=redirector

--[[
  Create redirector
--]]
local function create_redirector(keys, args)
  if #keys ~= 4 or #args ~= 5 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_index_key = keys[4]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', redirector_key) ~= 0 then
    return redis.status_reply('CONFLICT Redirector allready exists')
  end

  local stash = {
    lock_secret = args[5],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  local model = {
    campaign_id = args[1],
    redirector_id = args[2],
    page = args[3],
    lure_count = 0,
    created_at = tonumber(args[4]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Wrong model.' .. k)
    end

    if (k == 'campaign_id' or k == 'redirector_id') and v == '' then
      return redis.error_reply('ERR Wrong model.' .. k)
    end
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  local store = {}

  for k, v in pairs(model) do
    table.insert(store, k)
    table.insert(store, v)
  end

  redis.call('HSET', redirector_key, unpack(store))

  redis.call('ZADD', redirector_index_key, model.created_at, model.redirector_id)

  return redis.status_reply('OK Redirector created')
end

redis.register_function({
  function_name = 'create_redirector',
  callback = create_redirector,
  description = 'Create redirector',
})

--[[
  Read redirector
--]]
local function read_redirector(keys, args)
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', redirector_key,
    'campaign_id',
    'redirector_id',
    'lure_count',
    'created_at'
  )

  if #values ~= 4 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    redirector_id = values[2],
    lure_count = tonumber(values[3]),
    created_at = tonumber(values[4]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Malform model.' .. k)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_redirector',
  callback = read_redirector,
  flags = { 'no-writes' },
  description = 'Read redirector',
})

--[[
  Read full redirector
--]]
local function read_full_redirector(keys, args)
  if #keys ~= 3 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]
  local redirector_fields_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', redirector_key,
    'campaign_id',
    'redirector_id',
    'page',
    'lure_count',
    'created_at'
  )

  if #values ~= 5 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    redirector_id = values[2],
    page = values[3],
    fields = redis.call('SMEMBERS', redirector_fields_key),
    lure_count = tonumber(values[4]),
    created_at = tonumber(values[5]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Malform model.' .. k)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_full_redirector',
  callback = read_full_redirector,
  flags = { 'no-writes' },
  description = 'Read full redirector',
})

--[[
  Read redirector index
--]]
local function read_redirector_index(keys, args)
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_index_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  return redis.call('ZRANGE', redirector_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_redirector_index',
  callback = read_redirector_index,
  flags = { 'no-writes' },
  description = 'Read redirector index',
})

--[[
  Update redirector
--]]
local function update_redirector(keys, args)
  if #keys ~= 3 or #args < 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Redirector not exists')
  end

  local stash = {
    lock_secret = table.remove(args),
    orig_lock_secret = redis.call('GET', campaign_lock_key),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if #args % 2 ~= 0 then
    return redis.error_reply('ERR Odd number of args')
  end

  local model = {}

  for i = 1, #args, 2 do
    local k, v = args[i], args[i + 1]

    if model[k] then
      return redis.error_reply('ERR Duplicate model.' .. k)
    end

    if k == 'page' then
      model.page = v
    else
      return redis.error_reply('ERR Unknown model.' .. k)
    end
  end

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Wrong model.' .. k)
    end
  end

  if next(model) == nil then
    return redis.status_reply('OK Nothing to update')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  local store = {}

  for k, v in pairs(model) do
    table.insert(store, k)
    table.insert(store, v)
  end

  redis.call('HSET', redirector_key, unpack(store))

  return redis.status_reply('OK Redirector updated')
end

redis.register_function({
  function_name = 'update_redirector',
  callback = update_redirector,
  description = 'Update redirector',
})

--[[
  Append redirector field
--]]
local function append_redirector_field(keys, args)
  if #keys ~= 4 or #args ~= 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_fields_key = keys[4]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Redirector not exists')
  end

  local stash = {
    field = args[1],
    lock_secret = args[2],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'field' or k == 'lock_secret' or k == 'orig_lock_secret') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if redis.call('SISMEMBER', redirector_fields_key, stash.field) ~= 0 then
    return redis.status_reply('OK Redirector field allready exists')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('SADD', redirector_fields_key, stash.field)

  return redis.status_reply('OK Redirector field appended')
end

redis.register_function({
  function_name = 'append_redirector_field',
  callback = append_redirector_field,
  description = 'Append redirector field',
})

--[[
  Remove redirector field
--]]
local function remove_redirector_field(keys, args)
  if #keys ~= 4 or #args ~= 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_fields_key = keys[4]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Redirector not exists')
  end

  local stash = {
    field = args[1],
    lock_secret = args[2],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'field' or k == 'lock_secret' or k == 'orig_lock_secret') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if redis.call('SISMEMBER', redirector_fields_key, stash.field) ~= 1 then
    return redis.status_reply('OK Redirector field not exists')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('SREM', redirector_fields_key, stash.field)

  return redis.status_reply('OK Redirector field removed')
end

redis.register_function({
  function_name = 'remove_redirector_field',
  callback = remove_redirector_field,
  description = 'Remove redirector field',
})

--[[
  Delete redirector
--]]
local function delete_redirector(keys, args)
  if #keys ~= 5 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_fields_key = keys[4]
  local redirector_index_key = keys[5]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND redirector not exists')
  end

  local stash = {
    lock_secret = args[1],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    redirector_id = redis.call('HGET', redirector_key, 'redirector_id'),
    lure_count = tonumber(redis.call('HGET', redirector_key, 'lure_count')),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret' or k == 'redirector_id') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if k == 'lure_count' and v < 0 then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if stash.lure_count > 0 then
    return redis.status_reply('FORBIDDEN Lures exists')
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  redis.call('DEL', redirector_key)
  redis.call('DEL', redirector_fields_key)

  redis.call('ZREM', redirector_index_key, stash.redirector_id)

  return redis.status_reply('OK Redirector deleted')
end

redis.register_function({
  function_name = 'delete_redirector',
  callback = delete_redirector,
  description = 'Delete redirector',
})

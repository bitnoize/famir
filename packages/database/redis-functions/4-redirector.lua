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
    redirector_id = args[2],
    page = args[3],
    lure_count = 0,
    created_at = tonumber(args[4]),
    updated_at = tonumber(args[4]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end

    if (field == 'campaign_id' or field == 'redirector_id') and value == '' then
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
    'created_at',
    'updated_at'
  )

  if #values ~= 5 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    redirector_id = values[2],
    lure_count = tonumber(values[3]),
    created_at = tonumber(values[4]),
    updated_at = tonumber(values[5]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
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
    'page',
    'lure_count',
    'created_at',
    'updated_at'
  )

  if #values ~= 6 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    redirector_id = values[2],
    page = values[3],
    lure_count = tonumber(values[4]),
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
  if #keys ~= 3 or #args < 2 then
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
    updated_at = tonumber(table.remove(args)),
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

  if #args % 2 ~= 0 then
    return redis.error_reply('ERR Odd number of args')
  end

  local model = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if model[field] then
      return redis.error_reply('ERR Duplicate model.' .. field)
    end

    if field == 'page' then
      model.page = value
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

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
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
  Delete redirector
--]]
local function delete_redirector(keys, args)
  if #keys ~= 4 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local redirector_key = keys[3]
  local redirector_index_key = keys[4]

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

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if
      (field == 'lock_secret' or field == 'orig_lock_secret' or field == 'redirector_id')
      and value == ''
    then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lure_count' and value < 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
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

  redis.call('ZREM', redirector_index_key, stash.redirector_id)

  return redis.status_reply('OK Redirector deleted')
end

redis.register_function({
  function_name = 'delete_redirector',
  callback = delete_redirector,
  description = 'Delete target',
})

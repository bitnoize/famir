#!lua name=redirector

--[[
  Create redirector
--]]
local function create_redirector(keys, args)
  if not (#keys == 3 and #args == 4) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]
  local redirector_index_key = keys[3]

  local model = {
    campaign_id = args[1],
    redirector_id = args[2],
    page = args[3],
    lure_count = 0,
    created_at = tonumber(args[4]),
    updated_at = nil,
  }

  if not (#model.campaign_id > 0) then
    return redis.error_reply('ERR Wrong model.campaign_id')
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

  if not (redis.call('EXISTS', redirector_key) == 0) then
    return redis.status_reply('CONFLICT Redirector allready exists')
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
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  if not (redis.call('EXISTS', redirector_key) == 1) then
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

  if not (#values == 6) then
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
  function_name = 'read_redirector',
  callback = read_redirector,
  flags = { 'no-writes' },
  description = 'Read redirector',
})

--[[
  Read redirector index
--]]
local function read_redirector_index(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_index_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
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
  if not (#keys == 2 and #args >= 0 and #args % 2 == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]

  local model = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if model[field] then
      return redis.error_reply('ERR Duplicate model.' .. field)
    end

    if field == 'page' then
      model.main_page = value
    elseif field == 'updated_at' then
      model.updated_at = tonumber(value)

      if not (model.updated_at and model.updated_at > 0) then
        return redis.error_reply('ERR Wrong model.updated_at')
      end
    else
      return redis.error_reply('ERR Unknown model.' .. field)
    end
  end

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', redirector_key) == 1) then
    return redis.status_reply('NOT_FOUND Redirector not found')
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
  if not (#keys == 3 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]
  local redirector_index_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND campaign not found')
  end

  if not (redis.call('EXISTS', redirector_key) == 1) then
    return redis.status_reply('NOT_FOUND redirector not found')
  end

  local data = {
    redirector_id = redis.call('HGET', redirector_key, 'redirector_id'),
    lure_count = tonumber(redis.call('HGET', redirector_key, 'lure_count')),
  }

  if not (data.redirector_id and #data.redirector_id > 0) then
    return redis.error_reply('ERR Malform data.redirector_id')
  end

  if not (data.lure_count and data.lure_count >= 0) then
    return redis.error_reply('ERR Malform data.lure_count')
  end

  if data.lure_count > 0 then
    return redis.status_reply('FORBIDDEN Lures exists')
  end

  -- Point of no return

  redis.call('DEL', redirector_key)

  redis.call('ZREM', redirector_index_key, data.redirector_id)

  return redis.status_reply('OK Redirector deleted')
end

redis.register_function({
  function_name = 'delete_redirector',
  callback = delete_redirector,
  description = 'Delete target',
})

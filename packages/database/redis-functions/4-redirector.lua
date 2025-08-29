#!lua name=redirector

--[[
  Create redirector
--]]
local function create_redirector(keys, args)
  if not (#keys == 3 and #args == 3) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]
  local redirector_index_key = keys[3]

  local params = {
    id = args[1],
    page = args[2],
    lure_count = 0,
    created_at = tonumber(args[3]),
  }

  if not (params.id and params.id ~= '') then
    return redis.error_reply('ERR Wrong params.id')
  end

  if not params.page then
    return redis.error_reply('ERR Wrong params.page')
  end

  if not (params.created_at and params.created_at > 0) then
    return redis.error_reply('ERR Wrong params.created_at')
  end

  params.updated_at = params.created_at

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', redirector_key) ~= 0 then
    return redis.status_reply('EXISTS Redirector allready exists')
  end

  -- Point of no return

  local save = {}

  for field, value in pairs(params) do
    table.insert(save, field)
    table.insert(save, value)
  end

  redis.call('HSET', redirector_key, unpack(save))

  redis.call('ZADD', redirector_index_key, params.created_at, params.id)

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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', redirector_key,
    'id',
    'page',
    'lure_count',
    'created_at',
    'updated_at'
  )

  if not (values and #values == 5) then
    return redis.error_reply('ERR Malform values')
  end

  local data = {
    id = values[1],
    page = values[2],
    lure_count = tonumber(values[3]),
    created_at = tonumber(values[4]),
    updated_at = tonumber(values[5]),
  }

  if not (data.id and data.id ~= '') then
    return redis.error_reply('ERR Malform data.id')
  end

  if not data.page then
    return redis.error_reply('ERR Malform data.page')
  end

  if not (data.lure_count and data.lure_count >= 0) then
    return redis.error_reply('ERR Malform data.lure_count')
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
local function update_redirector_page(keys, args)
  if not (#keys == 2 and #args >= 2 and #args % 2 == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local redirector_key = keys[2]

  local params = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if params[field] then
      return redis.error_reply('ERR Params duplicate field')
    end

    if field == 'page' then
      params.main_page = value

      if not params.page then
        return redis.error_reply('ERR Wrong params.page')
      end
    elseif field == 'updated_at' then
      params.updated_at = tonumber(value)

      if not (params.updated_at and params.updated_at > 0) then
        return redis.error_reply('ERR Wrong params.updated_at')
      end
    else
      return redis.error_reply('ERR Wrong params field')
    end
  end

  if not params.updated_at then
    return redis.error_reply('ERR Missing params.updated_at')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
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

  redis.call('HSET', redirector_key, unpack(save))

  return redis.status_reply('OK Redirector updated')
end

redis.register_function({
  function_name = 'update_redirector_page',
  callback = update_redirector_page,
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', redirector_key) ~= 1 then
    return redis.status_reply('NOT_FOUND redirector not found')
  end

  local data = {
    id = redis.call('HGET', redirector_key, 'id'),
    lure_count = tonumber(redis.call('HGET', redirector_key, 'lure_count')),
  }

  if not (data.id and data.id ~= '') then
    return redis.error_reply('ERR Malform data.id')
  end

  if not (data.lure_count and data.lure_count >= 0) then
    return redis.error_reply('ERR Malform data.lure_count')
  end

  if data.lure_count > 0 then
    return redis.status_reply('FROZEN Lures exists')
  end

  -- Point of no return

  redis.call('DEL', redirector_key)

  redis.call('ZREM', redirector_index_key, data.id)

  return redis.status_reply('OK Redirector deleted')
end

redis.register_function({
  function_name = 'delete_redirector',
  callback = delete_redirector,
  description = 'Delete target',
})

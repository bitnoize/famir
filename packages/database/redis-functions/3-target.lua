#!lua name=target

--[[
  Create target
--]]
local function create_target(keys, args)
  if not (#keys == 5 and #args == 20) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_unique_donor_key = keys[3]
  local target_unique_mirror_key = keys[4]
  local target_index_key = keys[5]

  local model = {
    campaign_id = args[1],
    target_id = args[2],
    is_landing = tonumber(args[3]),
    donor_secure = tonumber(args[4]),
    donor_sub = args[5],
    donor_domain = args[6],
    donor_port = tonumber(args[7]),
    mirror_secure = tonumber(args[8]),
    mirror_sub = args[9],
    mirror_port = tonumber(args[10]),
    connect_timeout = tonumber(args[11]),
    timeout = tonumber(args[12]),
    main_page = args[13],
    not_found_page = args[14],
    favicon_ico = args[15],
    robots_txt = args[16],
    sitemap_xml = args[17],
    success_redirect_url = args[18],
    failure_redirect_url = args[19],
    is_enabled = 0,
    message_count = 0,
    created_at = tonumber(args[20]),
    updated_at = nil,
  }

  if not (#model.campaign_id > 0) then
    return redis.error_reply('ERR Wrong model.campaign_id')
  end

  if not (#model.target_id > 0) then
    return redis.error_reply('ERR Wrong model.target_id')
  end

  if not model.is_landing then
    return redis.error_reply('ERR Wrong model.is_landing')
  end

  if not model.donor_secure then
    return redis.error_reply('ERR Wrong model.donor_secure')
  end

  if not (#model.donor_sub > 0) then
    return redis.error_reply('Wrong model.donor_sub')
  end

  if not (#model.donor_domain > 0) then
    return redis.error_reply('ERR Wrong model.donor_domain')
  end

  if not (model.donor_port >= 0) then
    return redis.error_reply('ERR Wrong model.donor_port')
  end

  if not model.mirror_secure then
    return redis.error_reply('ERR Wrong model.mirror_secure')
  end

  if not (#model.mirror_sub > 0) then
    return redis.error_reply('ERR Wrong model.mirror_sub')
  end

  if not (model.mirror_port >= 0) then
    return redis.error_reply('ERR Wrong model.mirror_port')
  end

  if not (model.connect_timeout and model.connect_timeout > 0) then
    return redis.error_reply('ERR Wrong model.connect_timeout')
  end

  if not (model.timeout and model.timeout > 0) then
    return redis.error_reply('ERR Wrong model.timeout')
  end

  if not (model.created_at and model.created_at > 0) then
    return redis.error_reply('ERR Wrong model.created_at')
  end

  model.updated_at = model.created_at

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 0) then
    return redis.status_reply('CONFLICT Target allready exists')
  end

  -- stylua: ignore
  local donor = model.donor_sub
    .. '\t' .. model.donor_domain
    .. '\t' .. tostring(model.donor_port)

  -- stylua: ignore
  local mirror = model.mirror_sub
    .. '\t' .. tostring(model.mirror_port)

  if not (redis.call('SISMEMBER', target_unique_donor_key, donor) == 0) then
    return redis.status_reply('CONFLICT Target donor allready taken')
  end

  if not (redis.call('SISMEMBER', target_unique_mirror_key, mirror) == 0) then
    return redis.status_reply('CONFLICT Target mirror allready taken')
  end

  -- Point of no return

  local store = {}

  for field, value in pairs(model) do
    table.insert(store, field)
    table.insert(store, value)
  end

  redis.call('HSET', target_key, unpack(store))

  redis.call('SADD', target_unique_donor_key, donor)
  redis.call('SADD', target_unique_mirror_key, mirror)

  redis.call('ZADD', target_index_key, model.created_at, model.target_id)

  return redis.status_reply('OK Target created')
end

redis.register_function({
  function_name = 'create_target',
  callback = create_target,
  description = 'Create target',
})

--[[
  Read target
--]]
local function read_target(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', target_key,
    'campaign_id',
    'target_id',
    'is_landing',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_port',
    'connect_timeout',
    'timeout',
    'main_page',
    'not_found_page',
    'favicon_ico',
    'robots_txt',
    'sitemap_xml',
    'success_redirect_url',
    'failure_redirect_url',
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  )

  if not (#values == 23) then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    target_id = values[2],
    is_landing = tonumber(values[3]),
    donor_secure = tonumber(values[4]),
    donor_sub = values[5],
    donor_domain = values[6],
    donor_port = tonumber(values[7]),
    mirror_secure = tonumber(values[8]),
    mirror_sub = values[9],
    mirror_port = tonumber(values[10]),
    connect_timeout = tonumber(values[11]),
    timeout = tonumber(values[12]),
    main_page = values[13],
    not_found_page = values[14],
    favicon_ico = values[15],
    robots_txt = values[16],
    sitemap_xml = values[17],
    success_redirect_url = values[18],
    failure_redirect_url = values[19],
    is_enabled = tonumber(values[20]),
    message_count = tonumber(values[21]),
    created_at = tonumber(values[22]),
    updated_at = tonumber(values[23]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_target',
  callback = read_target,
  flags = { 'no-writes' },
  description = 'Read target',
})

--[[
  Read target index
--]]
local function read_target_index(keys, args)
  if not (#keys == 2 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_index_key = keys[2]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return nil
  end

  return redis.call('ZRANGE', target_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_target_index',
  callback = read_target_index,
  flags = { 'no-writes' },
  description = 'Read target index',
})

--[[
  Update target
--]]
local function update_target(keys, args)
  if not (#keys == 2 and #args >= 0 and #args % 2 == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  local model = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if model[field] then
      return redis.error_reply('ERR Duplicate model.' .. field)
    end

    if field == 'connect_timeout' then
      model.connect_timeout = tonumber(value)

      if not (model.connect_timeout and model.connect_timeout > 0) then
        return redis.error_reply('ERR Wrong model.connect_timeout')
      end
    elseif field == 'timeout' then
      model.timeout = tonumber(value)

      if not (model.timeout and model.timeout > 0) then
        return redis.error_reply('ERR Wrong model.timeout')
      end
    elseif field == 'main_page' then
      model.main_page = value
    elseif field == 'not_found_page' then
      model.not_found_page = value
    elseif field == 'favicon_ico' then
      model.favicon_ico = value
    elseif field == 'robots_txt' then
      model.robots_txt = value
    elseif field == 'sitemap_xml' then
      model.sitemap_xml = value
    elseif field == 'success_redirect_url' then
      model.success_redirect_url = value
    elseif field == 'failure_redirect_url' then
      model.failure_redirect_url = value
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

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND Target not found')
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

  redis.call('HSET', target_key, unpack(store))

  return redis.status_reply('OK Target updated')
end

redis.register_function({
  function_name = 'update_target',
  callback = update_target,
  description = 'Update target',
})

--[[
  Enable target
--]]
local function enable_target(keys, args)
  if not (#keys == 2 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  local params = {
    updated_at = tonumber(args[1]),
  }

  if not (params.updated_at and params.updated_at > 0) then
    return redis.error_reply('ERR Wrong params.updated_at')
  end

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND target not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not data.is_enabled then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled ~= 0 then
    return redis.status_reply('OK Target allready enabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'is_enabled', 1,
    'updated_at', params.updated_at
  )

  return redis.status_reply('OK Target enabled')
end

redis.register_function({
  function_name = 'enable_target',
  callback = enable_target,
  description = 'Enable target',
})

--[[
  Disable target
--]]
local function disable_target(keys, args)
  if not (#keys == 2 and #args == 1) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  local params = {
    updated_at = tonumber(args[1]),
  }

  if not (params.updated_at and params.updated_at > 0) then
    return redis.error_reply('ERR Wrong params.updated_at')
  end

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND target not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not data.is_enabled then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled == 0 then
    return redis.status_reply('OK Target allready disabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'is_enabled', 0,
    'updated_at', params.updated_at
  )

  return redis.status_reply('OK Target diabled')
end

redis.register_function({
  function_name = 'disable_target',
  callback = disable_target,
  description = 'Disable target',
})

--[[
  Delete target
--]]
local function delete_target(keys, args)
  if not (#keys == 5 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_unique_donor_key = keys[3]
  local target_unique_mirror_key = keys[4]
  local target_index_key = keys[5]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND Target not found')
  end

  local data = {
    target_id = redis.call('HGET', target_key, 'target_id'),
    donor_sub = redis.call('HGET', target_key, 'donor_sub'),
    donor_domain = redis.call('HGET', target_key, 'donor_domain'),
    donor_port = tonumber(redis.call('HGET', target_key, 'donor_port')),
    mirror_sub = redis.call('HGET', target_key, 'mirror_sub'),
    mirror_port = tonumber(redis.call('HGET', target_key, 'mirror_port')),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not (data.target_id and #data.target_id > 0) then
    return redis.error_reply('ERR Malform data.target_id')
  end

  if not (data.donor_sub and #data.donor_sub > 0) then
    return redis.error_reply('ERR Malform data.dadonor_sub')
  end

  if not (data.donor_domain and #data.donor_domain > 0) then
    return redis.error_reply('ERR Malform data.donor_domain')
  end

  if not (data.donor_port and data.donor_port >= 0) then
    return redis.error_reply('ERR Malform data.donor_port')
  end

  if not (data.mirror_sub and #data.mirror_sub > 0) then
    return redis.error_reply('ERR Malform data.mirror_sub')
  end

  if not (data.mirror_port and data.mirror_port >= 0) then
    return redis.error_reply('ERR Malform data.mirror_port')
  end

  if not data.is_enabled then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled ~= 0 then
    return redis.status_reply('FORBIDDEN Target not disabled')
  end

  -- stylua: ignore
  local donor = data.donor_sub
    .. '\t' .. data.donor_domain
    .. '\t' .. tostring(data.donor_port)

  -- stylua: ignore
  local mirror = data.mirror_sub
    .. '\t' .. tostring(data.mirror_port)

  -- Point of no return

  redis.call('DEL', target_key)

  redis.call('SREM', target_unique_donor_key, donor)
  redis.call('SREM', target_unique_mirror_key, mirror)

  redis.call('ZREM', target_index_key, data.target_id)

  return redis.status_reply('OK Target deleted')
end

redis.register_function({
  function_name = 'delete_target',
  callback = delete_target,
  description = 'Delete target',
})

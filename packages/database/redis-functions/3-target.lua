#!lua name=target

--[[
  Create target
--]]
local function create_target(keys, args)
  if not (#keys == 5 and #args == 18) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_unique_donor_key = keys[3]
  local target_unique_mirror_key = keys[4]
  local target_index_key = keys[5]

  local params = {
    id = args[1],
    is_landing = tonumber(args[2]),
    donor_secure = tonumber(args[3]),
    donor_sub = args[4],
    donor_domain = args[5],
    donor_port = args[6],
    mirror_secure = tonumber(args[7]),
    mirror_sub = args[8],
    mirror_domain = args[9],
    mirror_port = args[10],
    main_page = args[11],
    not_found_page = args[12],
    favicon_ico = args[13],
    robots_txt = args[14],
    sitemap_xml = args[15],
    success_redirect_url = args[16],
    failure_redirect_url = args[17],
    is_enabled = 0,
    total_count = 0,
    success_count = 0,
    failure_count = 0,
    created_at = tonumber(args[18]),
  }

  if not (params.id and params.id ~= '') then
    return redis.error_reply('ERR Wrong params.id')
  end

  if not (params.is_landing and (params.is_landing == 0 or params.is_landing == 1)) then
    return redis.error_reply('ERR Wrong params.is_landing')
  end

  if not (params.donor_secure and (params.donor_secure == 0 or params.donor_secure == 1)) then
    return redis.error_reply('ERR Wrong params.donor_secure')
  end

  if not (params.donor_sub and params.donor_sub ~= '') then
    return redis.error_reply('Wrong params.donor_sub')
  end

  if not (params.donor_domain and params.donor_domain ~= '') then
    return redis.error_reply('ERR Wrong params.donor_domain')
  end

  if not (params.donor_port and params.donor_port ~= '') then
    return redis.error_reply('ERR Wrong params.donor_port')
  end

  if not (params.mirror_secure and (params.mirror_secure == 0 or params.mirror_secure == 1)) then
    return redis.error_reply('ERR Wrong params.mirror_secure')
  end

  if not (params.mirror_sub and params.mirror_sub ~= '') then
    return redis.error_reply('ERR Wrong params.mirror_sub')
  end

  if not (params.mirror_domain and params.mirror_domain ~= '') then
    return redis.error_reply('ERR Wrong params.mirror_domain')
  end

  if not (params.mirror_port and params.mirror_port ~= '') then
    return redis.error_reply('ERR Wrong params.mirror_port')
  end

  if not params.main_page then
    return redis.error_reply('ERR Wrong params.main_page')
  end

  if not params.not_found_page then
    return redis.error_reply('ERR Wrong params.not_found_page')
  end

  if not params.favicon_ico then
    return redis.error_reply('ERR Wrong params.favicon_ico')
  end

  if not params.robots_txt then
    return redis.error_reply('ERR Wrong params.robots_txt')
  end

  if not params.sitemap_xml then
    return redis.error_reply('ERR Wrong params.sitemap_xml')
  end

  if not (params.success_redirect_url and params.success_redirect_url ~= '') then
    return redis.error_reply('ERR Wrong params.success_redirect_url')
  end

  if not (params.failure_redirect_url and params.failure_redirect_url ~= '') then
    return redis.error_reply('ERR Wrong params.failure_redirect_url')
  end

  if not (params.created_at and params.created_at > 0) then
    return redis.error_reply('ERR Wrong params.created_at')
  end

  params.updated_at = params.created_at

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', target_key) ~= 0 then
    return redis.status_reply('EXISTS Target allready exists')
  end

  local donor = params.donor_sub .. '\t' .. params.donor_domain .. '\t' .. params.donor_port
  if redis.call('SISMEMBER', target_unique_donor_key, donor) ~= 0 then
    return redis.status_reply('NOT_UNIQUE Target donor allready taken')
  end

  local mirror = params.mirror_sub .. '\t' .. params.mirror_domain .. '\t' .. params.mirror_port
  if redis.call('SISMEMBER', target_unique_mirror_key, mirror) ~= 0 then
    return redis.status_reply('NOT_UNIQUE Target mirror allready taken')
  end

  -- Point of no return

  local save = {}

  for field, value in pairs(params) do
    table.insert(save, field)
    table.insert(save, value)
  end

  redis.call('HSET', target_key, unpack(save))

  redis.call('SADD', target_unique_donor_key, donor)
  redis.call('SADD', target_unique_mirror_key, mirror)

  redis.call('ZADD', target_index_key, params.created_at, params.id)

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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', target_key,
    'id',
    'is_landing',
    'donor_secure', 
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_domain',
    'mirror_port',
    'main_page',
    'not_found_page',
    'favicon_ico', 
    'robots_txt', 
    'sitemap_xml',
    'success_redirect_url',
    'failure_redirect_url',
    'is_enabled',
    'total_count',
    'success_count',
    'failure_count',
    'created_at',
    'updated_at'
  )

  if not (values and #values == 23) then
    return redis.error_reply('ERR Malform values')
  end

  local data = {
    id = values[1],
    is_landing = tonumber(values[2]),
    donor_secure = tonumber(values[3]),
    donor_sub = values[4],
    donor_domain = values[5],
    donor_port = values[6],
    mirror_secure = tonumber(values[7]),
    mirror_sub = values[8],
    mirror_domain = values[9],
    mirror_port = values[10],
    main_page = values[11],
    not_found_page = values[12],
    favicon_ico = values[13],
    robots_txt = values[14],
    sitemap_xml = values[15],
    success_redirect_url = values[16],
    failure_redirect_url = values[17],
    is_enabled = tonumber(values[18]),
    total_count = tonumber(values[19]),
    success_count = tonumber(values[20]),
    failure_count = tonumber(values[21]),
    created_at = tonumber(values[22]),
    updated_at = tonumber(values[23]),
  }

  if not (data.id and data.id ~= '') then
    return redis.error_reply('ERR Malform data.id')
  end

  if not (data.is_landing and (data.is_landing == 0 or data.is_landing == 1)) then
    return redis.error_reply('ERR Malform data.is_landing')
  end

  if not (data.donor_secure and (data.donor_secure == 0 or data.donor_secure == 1)) then
    return redis.error_reply('ERR Malform data.donor_secure')
  end

  if not (data.donor_sub and data.donor_sub ~= '') then
    return redis.error_reply('ERR Malform data.donor_sub')
  end

  if not (data.donor_domain and data.donor_domain ~= '') then
    return redis.error_reply('ERR Malform data.donor_domain')
  end

  if not (data.donor_port and data.donor_port ~= '') then
    return redis.error_reply('ERR Malform data.donor_port')
  end

  if not (data.mirror_secure and (data.mirror_secure == 0 or data.mirror_secure == 1)) then
    return redis.error_reply('ERR Malform data.mirror_secure')
  end

  if not (data.mirror_sub and data.mirror_sub ~= '') then
    return redis.error_reply('ERR Malform data.mirror_sub')
  end

  if not (data.mirror_domain and data.mirror_domain ~= '') then
    return redis.error_reply('ERR Malform data.mirror_domain')
  end

  if not (data.mirror_port and data.mirror_port ~= '') then
    return redis.error_reply('ERR Malform data.mirror_port')
  end

  if not data.main_page then
    return redis.error_reply('ERR Malform data.main_page')
  end

  if not data.not_found_page then
    return redis.error_reply('ERR Malform data.not_found_page')
  end

  if not data.favicon_ico then
    return redis.error_reply('ERR Malform data.favicon_ico')
  end

  if not data.robots_txt then
    return redis.error_reply('ERR Malform data.robots_txt')
  end

  if not data.sitemap_xml then
    return redis.error_reply('ERR Malform data.sitemap_xml')
  end

  if not (data.success_redirect_url and data.success_redirect_url ~= '') then
    return redis.error_reply('ERR Malform data.success_redirect_url')
  end

  if not (data.failure_redirect_url and data.failure_redirect_url ~= '') then
    return redis.error_reply('ERR Malform data.failure_redirect_url')
  end

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if not (data.total_count and data.total_count >= 0) then
    return redis.error_reply('ERR Malform data.total_count')
  end

  if not (data.success_count and data.success_count >= 0) then
    return redis.error_reply('ERR Malform data.success_count')
  end

  if not (data.failure_count and data.failure_count >= 0) then
    return redis.error_reply('ERR Malform data.failure_count')
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
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
  if not (#keys == 2 and #args >= 2 and #args % 2 == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  local params = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if params[field] then
      return redis.error_reply('ERR Params duplicate field')
    end

    if field == 'main_page' then
      params.main_page = value

      if not params.main_page then
        return redis.error_reply('ERR Wrong params.main_page')
      end
    elseif field == 'not_found_page' then
      params.not_found_page = value

      if not params.not_found_page then
        return redis.error_reply('ERR Wrong params.not_found_page')
      end
    elseif field == 'favicon_ico' then
      params.favicon_ico = value

      if not params.favicon_ico then
        return redis.error_reply('ERR Wrong params.favicon_ico')
      end
    elseif field == 'robots_txt' then
      params.robots_txt = value

      if not params.robots_txt then
        return redis.error_reply('ERR Wrong params.robots_txt')
      end
    elseif field == 'sitemap_xml' then
      params.sitemap_xml = value

      if not params.sitemap_xml then
        return redis.error_reply('ERR Wrong params.sitemap_xml')
      end
    elseif field == 'success_redirect_url' then
      params.success_redirect_url = value

      if not (params.success_redirect_url and params.success_redirect_url ~= '') then
        return redis.error_reply('ERR Wrong params.success_redirect_url')
      end
    elseif field == 'failure_redirect_url' then
      params.failure_redirect_url = value

      if not (params.failure_redirect_url and params.failure_redirect_url ~= '') then
        return redis.error_reply('ERR Wrong params.failure_redirect_url')
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

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not found')
  end

  -- Point of no return

  local save = {}

  for field, value in pairs(params) do
    table.insert(save, field)
    table.insert(save, value)
  end

  redis.call('HSET', target_key, unpack(save))

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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND target not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled == 1 then
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND target not found')
  end

  local data = {
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
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

  return redis.status_reply('OK Target disabled')
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

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not found')
  end

  local data = {
    id = redis.call('HGET', target_key, 'id'),
    donor_sub = redis.call('HGET', target_key, 'donor_sub'),
    donor_domain = redis.call('HGET', target_key, 'donor_domain'),
    donor_port = redis.call('HGET', target_key, 'donor_port'),
    mirror_sub = redis.call('HGET', target_key, 'mirror_sub'),
    mirror_domain = redis.call('HGET', target_key, 'mirror_domain'),
    mirror_port = redis.call('HGET', target_key, 'mirror_port'),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not (data.id and data.id ~= '') then
    return redis.error_reply('ERR Malform data.id')
  end

  if not (data.donor_sub and data.donor_sub ~= '') then
    return redis.error_reply('ERR Malform data.dadonor_sub')
  end

  if not (data.donor_domain and data.donor_domain ~= '') then
    return redis.error_reply('ERR Malform data.donor_domain')
  end

  if not (data.donor_port and data.donor_port ~= '') then
    return redis.error_reply('ERR Malform data.donor_port')
  end

  local donor = data.donor_sub .. '\t' .. data.donor_domain .. '\t' .. data.donor_port

  if not (data.mirror_sub and data.mirror_sub ~= '') then
    return redis.error_reply('ERR Malform data.mirror_sub')
  end

  if not (data.mirror_domain and data.mirror_domain ~= '') then
    return redis.error_reply('ERR Malform data.mirror_domain')
  end

  if not (data.mirror_port and data.mirror_port ~= '') then
    return redis.error_reply('ERR Malform data.mirror_port')
  end

  local mirror = data.mirror_sub .. '\t' .. data.mirror_domain .. '\t' .. data.mirror_port

  if not (data.is_enabled and (data.is_enabled == 0 or data.is_enabled == 1)) then
    return redis.error_reply('ERR Malform data.is_enabled')
  end

  if data.is_enabled ~= 0 then
    return redis.status_reply('FROZEN Target not disabled')
  end

  -- Point of no return

  redis.call('DEL', target_key)

  redis.call('SREM', target_unique_donor_key, donor)
  redis.call('SREM', target_unique_mirror_key, mirror)

  redis.call('ZREM', target_index_key, data.id)

  return redis.status_reply('OK Target deleted')
end

redis.register_function({
  function_name = 'delete_target',
  callback = delete_target,
  description = 'Delete target',
})

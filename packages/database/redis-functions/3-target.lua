#!lua name=target

--[[
  Create target
--]]
local function create_target(keys, args)
  if not (#keys == 5 and #args == 23) then
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

  if not (redis.call('EXISTS', target_key) == 0) then
    return redis.status_reply('CONFLICT Target allready exists')
  end

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
    request_timeout = tonumber(args[12]),
    streaming_timeout = tonumber(args[13]),
    request_body_limit = tonumber(args[14]),
    response_body_limit = tonumber(args[15]),
    main_page = args[16],
    not_found_page = args[17],
    favicon_ico = args[18],
    robots_txt = args[19],
    sitemap_xml = args[20],
    success_redirect_url = args[21],
    failure_redirect_url = args[22],
    is_enabled = 0,
    message_count = 0,
    created_at = tonumber(args[23]),
    updated_at = tonumber(args[23]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  if not (#model.campaign_id > 0) then
    return redis.error_reply('ERR Wrong model.campaign_id')
  end

  if not (#model.target_id > 0) then
    return redis.error_reply('ERR Wrong model.target_id')
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

  if not (#model.mirror_sub > 0) then
    return redis.error_reply('ERR Wrong model.mirror_sub')
  end

  if not (model.mirror_port >= 0) then
    return redis.error_reply('ERR Wrong model.mirror_port')
  end

  -- stylua: ignore
  local donor = model.campaign_id
    .. '\t' .. model.donor_sub
    .. '\t' .. model.donor_domain
    .. '\t' .. tostring(model.donor_port)

  -- stylua: ignore
  local mirror = model.campaign_id
    .. '\t' .. model.mirror_sub
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
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  )

  if not (#values == 14) then
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
    mirror_port = values[10],
    is_enabled = tonumber(values[11]),
    message_count = tonumber(values[12]),
    created_at = tonumber(values[13]),
    updated_at = tonumber(values[14]),
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
  Read full target
--]]
local function read_full_target(keys, args)
  if not (#keys == 3 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_labels_key = keys[3]

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
    'request_timeout',
    'streaming_timeout',
    'request_body_limit',
    'response_body_limit',
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

  if not (#values == 26) then
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
    labels = redis.call('SMEMBERS', target_labels_key),
    connect_timeout = tonumber(values[11]),
    request_timeout = tonumber(values[12]),
    streaming_timeout = tonumber(values[13]),
    request_body_limit = tonumber(values[14]),
    response_body_limit = tonumber(values[15]),
    main_page = values[16],
    not_found_page = values[17],
    favicon_ico = values[18],
    robots_txt = values[19],
    sitemap_xml = values[20],
    success_redirect_url = values[21],
    failure_redirect_url = values[22],
    is_enabled = tonumber(values[23]),
    message_count = tonumber(values[24]),
    created_at = tonumber(values[25]),
    updated_at = tonumber(values[26]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Malform model.' .. field)
    end
  end

  return { map = model }
end

redis.register_function({
  function_name = 'read_full_target',
  callback = read_full_target,
  flags = { 'no-writes' },
  description = 'Read full target',
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

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND Target not found')
  end

  local model = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if model[field] then
      return redis.error_reply('ERR Duplicate model.' .. field)
    end

    if field == 'connect_timeout' then
      model.connect_timeout = tonumber(value)

      if not model.connect_timeout then
        return redis.error_reply('ERR Wrong model.connect_timeout')
      end
    elseif field == 'request_timeout' then
      model.request_timeout = tonumber(value)

      if not model.request_timeout then
        return redis.error_reply('ERR Wrong model.request_timeout')
      end
    elseif field == 'streaming_timeout' then
      model.streaming_timeout = tonumber(value)

      if not model.streaming_timeout then
        return redis.error_reply('ERR Wrong model.streaming_timeout')
      end
    elseif field == 'request_body_limit' then
      model.request_body_limit = tonumber(value)

      if not model.request_body_limit then
        return redis.error_reply('ERR Wrong model.request_body_limit')
      end
    elseif field == 'response_body_limit' then
      model.response_body_limit = tonumber(value)

      if not model.response_body_limit then
        return redis.error_reply('ERR Wrong model.response_body_limit')
      end
    elseif field == 'main_page' then
      model.main_page = value

      if not model.main_page then
        return redis.error_reply('ERR Wrong model.main_page')
      end
    elseif field == 'not_found_page' then
      model.not_found_page = value

      if not model.not_found_page then
        return redis.error_reply('ERR Wrong model.not_found_page')
      end
    elseif field == 'favicon_ico' then
      model.favicon_ico = value

      if not model.favicon_ico then
        return redis.error_reply('ERR Wrong model.favicon_ico')
      end
    elseif field == 'robots_txt' then
      model.robots_txt = value

      if not model.robots_txt then
        return redis.error_reply('ERR Wrong model.robots_txt')
      end
    elseif field == 'sitemap_xml' then
      model.sitemap_xml = value

      if not model.sitemap_xml then
        return redis.error_reply('ERR Wrong model.sitemap_xml')
      end
    elseif field == 'success_redirect_url' then
      model.success_redirect_url = value

      if not model.success_redirect_url then
        return redis.error_reply('ERR Wrong model.success_redirect_url')
      end
    elseif field == 'failure_redirect_url' then
      model.failure_redirect_url = value

      if not model.failure_redirect_url then
        return redis.error_reply('ERR Wrong model.failure_redirect_url')
      end
    elseif field == 'updated_at' then
      model.updated_at = tonumber(value)

      if not model.updated_at then
        return redis.error_reply('ERR Wrong model.updated_at')
      end
    else
      return redis.error_reply('ERR Unknown model.' .. field)
    end
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

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND target not found')
  end

  local stash = {
    updated_at = tonumber(args[1]),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not stash.updated_at then
    return redis.error_reply('ERR Wrong stash.updated_at')
  end

  if not stash.is_enabled then
    return redis.error_reply('ERR Malform stash.is_enabled')
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('OK Target allready enabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'is_enabled', 1,
    'updated_at', stash.updated_at
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

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND target not found')
  end

  local stash = {
    updated_at = tonumber(args[1]),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not stash.updated_at then
    return redis.error_reply('ERR Wrong stash.updated_at')
  end

  if not stash.is_enabled then
    return redis.error_reply('ERR Malform stash.is_enabled')
  end

  if stash.is_enabled == 0 then
    return redis.status_reply('OK Target allready disabled')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'is_enabled', 0,
    'updated_at', stash.updated_at
  )

  return redis.status_reply('OK Target diabled')
end

redis.register_function({
  function_name = 'disable_target',
  callback = disable_target,
  description = 'Disable target',
})

--[[
  Append target label
--]]
local function append_target_label(keys, args)
  if not (#keys == 3 and #args == 2) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_labels_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND Target not found')
  end

  local stash = {
    label = args[1],
    updated_at = tonumber(args[2]),
  }

  if not (stash.label and #stash.label > 0) then
    return redis.error_reply('ERR Wrong stash.label')
  end

  if not stash.updated_at then
    return redis.error_reply('ERR Wrong stash.updated_at')
  end

  if redis.call('SISMEMBER', target_labels_key, stash.label) ~= 0 then
    return redis.status_reply('OK Target label allready appended')
  end

  redis.call('HSET', target_key, 'updated_at', stash.updated_at)

  redis.call('SADD', target_labels_key, stash.label)

  return redis.status_reply('OK Target label appended')
end

redis.register_function({
  function_name = 'append_target_label',
  callback = append_target_label,
  description = 'Append target label',
})

--[[
  Remove target label
--]]
local function remove_target_label(keys, args)
  if not (#keys == 3 and #args == 2) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_labels_key = keys[3]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND Target not found')
  end

  local stash = {
    label = args[1],
    updated_at = tonumber(args[2]),
  }

  if not (stash.label and #stash.label > 0) then
    return redis.error_reply('ERR Wrong stash.label')
  end

  if not stash.updated_at then
    return redis.error_reply('ERR Wrong stash.updated_at')
  end

  if redis.call('SISMEMBER', target_labels_key, stash.label) == 0 then
    return redis.status_reply('OK Target label not exists')
  end

  redis.call('HSET', target_key, 'updated_at', stash.updated_at)

  redis.call('SREM', target_labels_key, stash.label)

  return redis.status_reply('OK Target label removed')
end

redis.register_function({
  function_name = 'remove_target_label',
  callback = remove_target_label,
  description = 'Remove target label',
})

--[[
  Delete target
--]]
local function delete_target(keys, args)
  if not (#keys == 6 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_labels_key = keys[3]
  local target_unique_donor_key = keys[4]
  local target_unique_mirror_key = keys[5]
  local target_index_key = keys[6]

  if not (redis.call('EXISTS', campaign_key) == 1) then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  if not (redis.call('EXISTS', target_key) == 1) then
    return redis.status_reply('NOT_FOUND Target not found')
  end

  local stash = {
    campaign_id = redis.call('HGET', campaign_key, 'campaign_id'),
    target_id = redis.call('HGET', target_key, 'target_id'),
    donor_sub = redis.call('HGET', target_key, 'donor_sub'),
    donor_domain = redis.call('HGET', target_key, 'donor_domain'),
    donor_port = tonumber(redis.call('HGET', target_key, 'donor_port')),
    mirror_sub = redis.call('HGET', target_key, 'mirror_sub'),
    mirror_port = tonumber(redis.call('HGET', target_key, 'mirror_port')),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  if not (stash.campaign_id and #stash.campaign_id > 0) then
    return redis.error_reply('ERR Malform stash.campaign_id')
  end

  if not (stash.target_id and #stash.target_id > 0) then
    return redis.error_reply('ERR Malform stash.target_id')
  end

  if not (stash.donor_sub and #stash.donor_sub > 0) then
    return redis.error_reply('ERR Malform stash.dadonor_sub')
  end

  if not (stash.donor_domain and #stash.donor_domain > 0) then
    return redis.error_reply('ERR Malform stash.donor_domain')
  end

  if not (stash.donor_port and stash.donor_port >= 0) then
    return redis.error_reply('ERR Malform stash.donor_port')
  end

  if not (stash.mirror_sub and #stash.mirror_sub > 0) then
    return redis.error_reply('ERR Malform stash.mirror_sub')
  end

  if not (stash.mirror_port and stash.mirror_port >= 0) then
    return redis.error_reply('ERR Malform stash.mirror_port')
  end

  if not stash.is_enabled then
    return redis.error_reply('ERR Malform stash.is_enabled')
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('FORBIDDEN Target not disabled')
  end

  -- stylua: ignore
  local donor = stash.campaign_id
    .. '\t' .. stash.donor_sub
    .. '\t' .. stash.donor_domain
    .. '\t' .. tostring(stash.donor_port)

  -- stylua: ignore
  local mirror = stash.campaign_id
    .. '\t' .. stash.mirror_sub
    .. '\t' .. tostring(stash.mirror_port)

  -- Point of no return

  redis.call('DEL', target_key)
  redis.call('DEL', target_labels_key)

  redis.call('SREM', target_unique_donor_key, donor)
  redis.call('SREM', target_unique_mirror_key, mirror)

  redis.call('ZREM', target_index_key, stash.target_id)

  return redis.status_reply('OK Target deleted')
end

redis.register_function({
  function_name = 'delete_target',
  callback = delete_target,
  description = 'Delete target',
})

#!lua name=target

--[[
  Create target
--]]
local function create_target(keys, args)
  if #keys ~= 5 or #args ~= 22 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_unique_donor_key = keys[3]
  local target_unique_mirror_key = keys[4]
  local target_index_key = keys[5]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', target_key) ~= 0 then
    return redis.status_reply('CONFLICT Target allready exists')
  end

  local stash = {
    lock_code = tonumber(args[22]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  local model = {
    campaign_id = args[1],
    target_id = args[2],
    is_landing = tonumber(args[3]),
    donor_secure = tonumber(args[4]),
    donor_sub = args[5],
    donor_domain = args[6],
    donor_port = args[7],
    mirror_secure = tonumber(args[8]),
    mirror_sub = args[9],
    mirror_port = args[10],
    connect_timeout = tonumber(args[11]),
    ordinary_timeout = tonumber(args[12]),
    streaming_timeout = tonumber(args[13]),
    request_body_limit = tonumber(args[14]),
    response_body_limit = tonumber(args[15]),
    main_page = args[16],
    not_found_page = args[17],
    favicon_ico = args[18],
    robots_txt = args[19],
    sitemap_xml = args[20],
    is_enabled = 0,
    message_count = 0,
    created_at = tonumber(args[21]),
    updated_at = tonumber(args[21]),
  }

  for field, value in pairs(model) do
    if not value then
      return redis.error_reply('ERR Wrong model.' .. field)
    end

    if
      (
        field == 'campaign_id'
        or field == 'target_id'
        or field == 'donor_sub'
        or field == 'donor_domain'
        or field == 'donor_port'
        or field == 'mirror_sub'
        or field == 'mirror_port'
      ) and value == ''
    then
      return redis.error_reply('ERR Wrong model.' .. field)
    end
  end

  -- stylua: ignore
  local donor = model.campaign_id
    .. '\t' .. model.donor_sub
    .. '\t' .. model.donor_domain
    .. '\t' .. model.donor_port

  -- stylua: ignore
  local mirror = model.campaign_id
    .. '\t' .. model.mirror_sub
    .. '\t' .. model.mirror_port

  if redis.call('SISMEMBER', target_unique_donor_key, donor) ~= 0 then
    return redis.status_reply('CONFLICT Target donor allready taken')
  end

  if redis.call('SISMEMBER', target_unique_mirror_key, mirror) ~= 0 then
    return redis.status_reply('CONFLICT Target mirror allready taken')
  end

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
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
  if #keys ~= 2 or #args ~= 0 then
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

  if #values ~= 14 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    target_id = values[2],
    is_landing = tonumber(values[3]),
    donor_secure = tonumber(values[4]),
    donor_sub = values[5],
    donor_domain = values[6],
    donor_port = values[7],
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
  if #keys ~= 3 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_labels_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', target_key) ~= 1 then
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
    'ordinary_timeout',
    'streaming_timeout',
    'request_body_limit',
    'response_body_limit',
    'main_page',
    'not_found_page',
    'favicon_ico',
    'robots_txt',
    'sitemap_xml',
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  )

  if #values ~= 24 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    target_id = values[2],
    is_landing = tonumber(values[3]),
    donor_secure = tonumber(values[4]),
    donor_sub = values[5],
    donor_domain = values[6],
    donor_port = values[7],
    mirror_secure = tonumber(values[8]),
    mirror_sub = values[9],
    mirror_port = values[10],
    labels = redis.call('SMEMBERS', target_labels_key),
    connect_timeout = tonumber(values[11]),
    ordinary_timeout = tonumber(values[12]),
    streaming_timeout = tonumber(values[13]),
    request_body_limit = tonumber(values[14]),
    response_body_limit = tonumber(values[15]),
    main_page = values[16],
    not_found_page = values[17],
    favicon_ico = values[18],
    robots_txt = values[19],
    sitemap_xml = values[20],
    is_enabled = tonumber(values[21]),
    message_count = tonumber(values[22]),
    created_at = tonumber(values[23]),
    updated_at = tonumber(values[24]),
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
  if #keys ~= 2 or #args ~= 0 then
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
  if #keys ~= 2 or #args < 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    lock_code = tonumber(table.remove(args)),
    updated_at = tonumber(table.remove(args)),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
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

    if field == 'connect_timeout' then
      model.connect_timeout = tonumber(value)
    elseif field == 'ordinary_timeout' then
      model.ordinary_timeout = tonumber(value)
    elseif field == 'streaming_timeout' then
      model.streaming_timeout = tonumber(value)
    elseif field == 'request_body_limit' then
      model.request_body_limit = tonumber(value)
    elseif field == 'response_body_limit' then
      model.response_body_limit = tonumber(value)
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

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
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
  if #keys ~= 2 or #args ~= 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    updated_at = tonumber(args[1]),
    lock_code = tonumber(args[2]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('OK Target allready enabled')
  end

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
  end

  -- Point of no return

  redis.call('HSET', target_key, 'is_enabled', 1, 'updated_at', stash.updated_at)

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
  if #keys ~= 2 or #args ~= 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    updated_at = tonumber(args[1]),
    lock_code = tonumber(args[2]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if stash.is_enabled == 0 then
    return redis.status_reply('OK Target allready disabled')
  end

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
  end

  -- Point of no return

  redis.call('HSET', target_key, 'is_enabled', 0, 'updated_at', stash.updated_at)

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
  if #keys ~= 3 or #args ~= 3 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_labels_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    label = args[1],
    updated_at = tonumber(args[2]),
    lock_code = tonumber(args[3]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'label' and value == '' then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if redis.call('SISMEMBER', target_labels_key, stash.label) ~= 0 then
    return redis.status_reply('OK Target label allready exists')
  end

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
  end

  -- Point of no return

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
  if #keys ~= 3 or #args ~= 3 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_labels_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    label = args[1],
    updated_at = tonumber(args[2]),
    lock_code = tonumber(args[3]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'label' and value == '' then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  if redis.call('SISMEMBER', target_labels_key, stash.label) ~= 1 then
    return redis.status_reply('OK Target label not exists')
  end

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
  end

  -- Point of no return

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
  if #keys ~= 6 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]
  local target_labels_key = keys[3]
  local target_unique_donor_key = keys[4]
  local target_unique_mirror_key = keys[5]
  local target_index_key = keys[6]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    lock_code = tonumber(args[1]),
    orig_lock_code = tonumber(redis.call('HGET', campaign_key, 'lock_code')),
    campaign_id = redis.call('HGET', target_key, 'campaign_id'),
    target_id = redis.call('HGET', target_key, 'target_id'),
    donor_sub = redis.call('HGET', target_key, 'donor_sub'),
    donor_domain = redis.call('HGET', target_key, 'donor_domain'),
    donor_port = redis.call('HGET', target_key, 'donor_port'),
    mirror_sub = redis.call('HGET', target_key, 'mirror_sub'),
    mirror_port = redis.call('HGET', target_key, 'mirror_port'),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  for field, value in pairs(stash) do
    if not value then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if field == 'lock_code' and value == 0 then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end

    if
      (
        field == 'campaign_id'
        or field == 'target_id'
        or field == 'donor_sub'
        or field == 'donor_domain'
        or field == 'donor_port'
        or field == 'mirror_sub'
        or field == 'mirror_port'
      ) and value == ''
    then
      return redis.error_reply('ERR Wrong stash.' .. field)
    end
  end

  -- stylua: ignore
  local donor = stash.campaign_id
    .. '\t' .. stash.donor_sub
    .. '\t' .. stash.donor_domain
    .. '\t' .. stash.donor_port

  -- stylua: ignore
  local mirror = stash.campaign_id
    .. '\t' .. stash.mirror_sub
    .. '\t' .. stash.mirror_port

  if stash.is_enabled ~= 0 then
    return redis.status_reply('FORBIDDEN Target not disabled')
  end

  if stash.orig_lock_code == 0 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if stash.orig_lock_code ~= stash.lock_code then
    return redis.status_reply('FORBIDDEN Campaign lock_code not match')
  end

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

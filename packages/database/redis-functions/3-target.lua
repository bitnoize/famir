#!lua name=target

--[[
  Create target
--]]
local function create_target(keys, args)
  if #keys ~= 7 or #args ~= 23 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]
  local target_donors_key = keys[4]
  local target_mirrors_key = keys[5]
  local target_hosts_key = keys[6]
  local target_index_key = keys[7]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', target_key) ~= 0 then
    return redis.status_reply('CONFLICT Target already exists')
  end

  local stash = {
    lock_secret = args[23],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    mirror_domain = redis.call('HGET', campaign_key, 'mirror_domain'),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret' or k == 'mirror_domain') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  local model = {
    campaign_id = args[1],
    target_id = args[2],
    access_level = args[3],
    donor_secure = tonumber(args[4]),
    donor_sub = args[5],
    donor_domain = args[6],
    donor_port = args[7],
    mirror_secure = tonumber(args[8]),
    mirror_sub = args[9],
    mirror_port = args[10],
    connect_timeout = tonumber(args[11]),
    simple_timeout = tonumber(args[12]),
    stream_timeout = tonumber(args[13]),
    headers_size_limit = tonumber(args[14]),
    body_size_limit = tonumber(args[15]),
    main_page = args[16],
    not_found_page = args[17],
    favicon_ico = args[18],
    robots_txt = args[19],
    sitemap_xml = args[20],
    allow_websockets = tonumber(args[21]),
    is_enabled = 0,
    message_count = 0,
    created_at = tonumber(args[22]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Wrong model.' .. k)
    end

    if
      (
        k == 'campaign_id'
        or k == 'target_id'
        or k == 'access_level'
        or k == 'donor_sub'
        or k == 'donor_domain'
        or k == 'donor_port'
        or k == 'mirror_sub'
        or k == 'mirror_port'
      ) and v == ''
    then
      return redis.error_reply('ERR Wrong model.' .. k)
    end
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  -- stylua: ignore
  local donor_str = model.campaign_id
    .. '\t' .. model.donor_sub
    .. '\t' .. model.donor_domain
    .. '\t' .. model.donor_port

  if redis.call('SISMEMBER', target_donors_key, donor_str) ~= 0 then
    return redis.status_reply('CONFLICT Target donor already taken')
  end

  -- stylua: ignore
  local mirror_str = model.campaign_id
    .. '\t' .. model.mirror_sub
    .. '\t' .. model.mirror_port

  if redis.call('SISMEMBER', target_mirrors_key, mirror_str) ~= 0 then
    return redis.status_reply('CONFLICT Target mirror already taken')
  end

  local mirror_hostname = model.mirror_sub ~= '@'
      and (model.mirror_sub .. '.' .. stash.mirror_domain)
    or stash.mirror_domain
  local mirror_host = mirror_hostname .. ':' .. model.mirror_port

  if redis.call('HEXISTS', target_hosts_key, mirror_host) ~= 0 then
    return redis.error_reply('ERR Target mirror host already taken')
  end

  -- Point of no return

  local store = {}

  for k, v in pairs(model) do
    table.insert(store, k)
    table.insert(store, v)
  end

  redis.call('HSET', target_key, unpack(store))

  redis.call('SADD', target_donors_key, donor_str)
  redis.call('SADD', target_mirrors_key, mirror_str)

  local target_link = model.campaign_id .. '\t' .. model.target_id
  redis.call('HSET', target_hosts_key, mirror_host, target_link)

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
    'access_level',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_port',
    'is_enabled',
    'message_count',
    'created_at'
  )

  if #values ~= 13 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    target_id = values[2],
    access_level = values[3],
    donor_secure = tonumber(values[4]),
    donor_sub = values[5],
    donor_domain = values[6],
    donor_port = values[7],
    mirror_secure = tonumber(values[8]),
    mirror_sub = values[9],
    mirror_domain = redis.call('HGET', campaign_key, 'mirror_domain'),
    mirror_port = values[10],
    is_enabled = tonumber(values[11]),
    message_count = tonumber(values[12]),
    created_at = tonumber(values[13]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Malform model.' .. k)
    end
  end

  model['donor_secure'] = (model['donor_secure'] ~= 0)
  model['mirror_secure'] = (model['mirror_secure'] ~= 0)
  model['is_enabled'] = (model['is_enabled'] ~= 0)

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
    'access_level',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_port',
    'connect_timeout',
    'simple_timeout',
    'stream_timeout',
    'headers_size_limit',
    'body_size_limit',
    'main_page',
    'not_found_page',
    'favicon_ico',
    'robots_txt',
    'sitemap_xml',
    'allow_websockets',
    'is_enabled',
    'message_count',
    'created_at'
  )

  if #values ~= 24 then
    return redis.error_reply('ERR Malform values')
  end

  local model = {
    campaign_id = values[1],
    target_id = values[2],
    access_level = values[3],
    donor_secure = tonumber(values[4]),
    donor_sub = values[5],
    donor_domain = values[6],
    donor_port = values[7],
    mirror_secure = tonumber(values[8]),
    mirror_sub = values[9],
    mirror_domain = redis.call('HGET', campaign_key, 'mirror_domain'),
    mirror_port = values[10],
    labels = redis.call('SMEMBERS', target_labels_key),
    connect_timeout = tonumber(values[11]),
    simple_timeout = tonumber(values[12]),
    stream_timeout = tonumber(values[13]),
    headers_size_limit = tonumber(values[14]),
    body_size_limit = tonumber(values[15]),
    main_page = values[16],
    not_found_page = values[17],
    favicon_ico = values[18],
    robots_txt = values[19],
    sitemap_xml = values[20],
    allow_websockets = tonumber(values[21]),
    is_enabled = tonumber(values[22]),
    message_count = tonumber(values[23]),
    created_at = tonumber(values[24]),
  }

  for k, v in pairs(model) do
    if not v then
      return redis.error_reply('ERR Malform model.' .. k)
    end
  end

  model['donor_secure'] = (model['donor_secure'] ~= 0)
  model['mirror_secure'] = (model['mirror_secure'] ~= 0)
  model['allow_websockets'] = (model['allow_websockets'] ~= 0)
  model['is_enabled'] = (model['is_enabled'] ~= 0)

  return { map = model }
end

redis.register_function({
  function_name = 'read_full_target',
  callback = read_full_target,
  flags = { 'no-writes' },
  description = 'Read full target',
})

--[[
  Read target hosts
--]]
local function read_target_hosts(keys, args)
  if #keys ~= 1 or #args ~= 0 then
    return redis.error_reply('ERR Wrong function use')
  end

  local target_hosts_key = keys[1]

  local hosts = {}

  local values = redis.call('HGETALL', target_hosts_key)

  for i = 1, #values, 2 do
    local campaign_id, target_id = string.match(values[i + 1], '([^\t]+)\t([^\t]+)')

    if not (campaign_id and campaign_id ~= '' and target_id and target_id ~= '') then
      return redis.error_reply('ERR Malform target_link')
    end

    hosts[values[i]] = { campaign_id, target_id }
  end

  return { map = hosts }
end

redis.register_function({
  function_name = 'read_target_hosts',
  callback = read_target_hosts,
  flags = { 'no-writes' },
  description = 'Read target hosts',
})

--[[
  Find target link
--]]
local function find_target_link(keys, args)
  if #keys ~= 1 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local target_hosts_key = keys[1]

  local mirror_host = args[1]

  if not (mirror_host and mirror_host ~= '') then
    return redis.error_reply('ERR Wrong mirror_host')
  end

  if redis.call('HEXISTS', target_hosts_key, mirror_host) ~= 1 then
    return nil
  end

  local target_link = redis.call('HGET', target_hosts_key, mirror_host)
  local campaign_id, target_id = string.match(target_link, '([^\t]+)\t([^\t]+)')

  if not (campaign_id and campaign_id ~= '' and target_id and target_id ~= '') then
    return redis.error_reply('ERR Malform target_link')
  end

  return { campaign_id, target_id }
end

redis.register_function({
  function_name = 'find_target_link',
  callback = find_target_link,
  flags = { 'no-writes' },
  description = 'Find target link',
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
  if #keys ~= 3 or #args ~= 12 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    lock_secret = args[12],
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
    connect_timeout = tonumber(args[1]),
    simple_timeout = tonumber(args[2]),
    stream_timeout = tonumber(args[3]),
    headers_size_limit = tonumber(args[4]),
    body_size_limit = tonumber(args[5]),
    main_page = args[6],
    not_found_page = args[7],
    favicon_ico = args[8],
    robots_txt = args[9],
    sitemap_xml = args[10],
    allow_websockets = tonumber(args[11]),
  }

  for k, v in pairs(model) do
    if not v then
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
  if #keys ~= 3 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    lock_secret = args[1],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('OK Target already enabled')
  end

  -- Point of no return

  redis.call('HSET', target_key, 'is_enabled', 1)

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
  if #keys ~= 3 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    lock_secret = args[1],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'lock_secret' or k == 'orig_lock_secret') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  if stash.is_enabled == 0 then
    return redis.status_reply('OK Target already disabled')
  end

  -- Point of no return

  redis.call('HSET', target_key, 'is_enabled', 0)

  return redis.status_reply('OK Target disabled')
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
  if #keys ~= 4 or #args ~= 2 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]
  local target_labels_key = keys[4]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    label = args[1],
    lock_secret = args[2],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if (k == 'label' or k == 'lock_secret' or k == 'orig_lock_secret') and v == '' then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  if redis.call('SISMEMBER', target_labels_key, stash.label) ~= 0 then
    return redis.status_reply('OK Target label already exists')
  end

  -- Point of no return

  redis.call('SADD', target_labels_key, stash.label)

  return redis.status_reply('OK Target label appended')
end

redis.register_function({
  function_name = 'append_target_label',
  callback = append_target_label,
  description = 'Append target label',
})

--[[
  Remove all target labels
--]]
local function remove_target_labels(keys, args)
  if #keys ~= 4 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]
  local target_labels_key = keys[4]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    lock_secret = args[1],
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

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  if redis.call('EXISTS', target_labels_key) ~= 1 then
    return redis.status_reply('OK Target labels is empty')
  end

  -- Point of no return

  redis.call('DEL', target_labels_key)

  return redis.status_reply('OK Target labels removed')
end

redis.register_function({
  function_name = 'remove_target_labels',
  callback = remove_target_labels,
  description = 'Remove target labels',
})

--[[
  Delete target
--]]
local function delete_target(keys, args)
  if #keys ~= 8 or #args ~= 1 then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]
  local target_labels_key = keys[4]
  local target_donors_key = keys[5]
  local target_mirrors_key = keys[6]
  local target_hosts_key = keys[7]
  local target_index_key = keys[8]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) ~= 1 then
    return redis.status_reply('FORBIDDEN Campaign not locked')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Target not exists')
  end

  local stash = {
    lock_secret = args[1],
    orig_lock_secret = redis.call('GET', campaign_lock_key),
    campaign_id = redis.call('HGET', target_key, 'campaign_id'),
    target_id = redis.call('HGET', target_key, 'target_id'),
    donor_sub = redis.call('HGET', target_key, 'donor_sub'),
    donor_domain = redis.call('HGET', target_key, 'donor_domain'),
    donor_port = redis.call('HGET', target_key, 'donor_port'),
    mirror_sub = redis.call('HGET', target_key, 'mirror_sub'),
    mirror_domain = redis.call('HGET', campaign_key, 'mirror_domain'),
    mirror_port = redis.call('HGET', target_key, 'mirror_port'),
    is_enabled = tonumber(redis.call('HGET', target_key, 'is_enabled')),
  }

  for k, v in pairs(stash) do
    if not v then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end

    if
      (
        k == 'lock_secret'
        or k == 'orig_lock_secret'
        or k == 'campaign_id'
        or k == 'target_id'
        or k == 'donor_sub'
        or k == 'donor_domain'
        or k == 'donor_port'
        or k == 'mirror_sub'
        or k == 'mirror_domain'
        or k == 'mirror_port'
      ) and v == ''
    then
      return redis.error_reply('ERR Wrong stash.' .. k)
    end
  end

  if stash.orig_lock_secret ~= stash.lock_secret then
    return redis.status_reply('FORBIDDEN Campaign lock_secret not match')
  end

  if stash.is_enabled ~= 0 then
    return redis.status_reply('FORBIDDEN Target not disabled')
  end

  -- stylua: ignore
  local donor_str = stash.campaign_id
    .. '\t' .. stash.donor_sub
    .. '\t' .. stash.donor_domain
    .. '\t' .. stash.donor_port

  -- stylua: ignore
  local mirror_str = stash.campaign_id
    .. '\t' .. stash.mirror_sub
    .. '\t' .. stash.mirror_port

  local mirror_hostname = stash.mirror_sub ~= '@'
      and (stash.mirror_sub .. '.' .. stash.mirror_domain)
    or stash.mirror_domain
  local mirror_host = mirror_hostname .. ':' .. stash.mirror_port

  -- Point of no return

  redis.call('DEL', target_key)
  redis.call('DEL', target_labels_key)

  redis.call('SREM', target_donors_key, donor_str)
  redis.call('SREM', target_mirrors_key, mirror_str)

  redis.call('HDEL', target_hosts_key, mirror_host)

  redis.call('ZREM', target_index_key, stash.target_id)

  return redis.status_reply('OK Target deleted')
end

redis.register_function({
  function_name = 'delete_target',
  callback = delete_target,
  description = 'Delete target',
})

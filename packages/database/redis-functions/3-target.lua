--
-- Target methods
--

local TARGET_SUB_APEX = '@'

local function create_target(keys, raw_args)
  if #keys ~= 7 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]
  local target_donors_key = keys[4]
  local target_mirrors_key = keys[5]
  local target_hosts_key = keys[6]
  local target_index_key = keys[7]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'access_level', kind = 'str' },
    { name = 'donor_secure', kind = 'int', min = 0, max = 1 },
    { name = 'donor_sub', kind = 'str' },
    { name = 'donor_domain', kind = 'str' },
    { name = 'donor_port', kind = 'str' },
    { name = 'mirror_secure', kind = 'int', min = 0, max = 1 },
    { name = 'mirror_sub', kind = 'str' },
    { name = 'mirror_port', kind = 'str' },
    { name = 'tenant', kind = 'any' },
    { name = 'connect_timeout', kind = 'int', min = 1 },
    { name = 'simple_timeout', kind = 'int', min = 1 },
    { name = 'stream_timeout', kind = 'int', min = 1 },
    { name = 'headers_size_limit', kind = 'int', min = 1 },
    { name = 'body_size_limit', kind = 'int', min = 1 },
    { name = 'main_page', kind = 'any' },
    { name = 'not_found_page', kind = 'any' },
    { name = 'favicon_ico', kind = 'any' },
    { name = 'robots_txt', kind = 'any' },
    { name = 'sitemap_xml', kind = 'any' },
    { name = 'allow_websockets', kind = 'int', min = 0, max = 1 },
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', target_key) == 1 then
    return redis.status_reply('CONFLICT target already exists')
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= args.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  -- stylua: ignore
  local donor_stamp = args.campaign_id
    .. '\0' .. args.donor_sub
    .. '\0' .. args.donor_domain
    .. '\0' .. args.donor_port

  if redis.call('SISMEMBER', target_donors_key, donor_stamp) == 1 then
    return redis.status_reply('CONFLICT target donor already taken')
  end

  -- stylua: ignore
  local mirror_stamp = args.campaign_id
    .. '\0' .. args.mirror_sub
    .. '\0' .. args.mirror_port

  if redis.call('SISMEMBER', target_mirrors_key, mirror_stamp) == 1 then
    return redis.status_reply('CONFLICT target mirror already taken')
  end

  local mirror_hostname = args.mirror_sub ~= TARGET_SUB_APEX
      and (args.mirror_sub .. '.' .. campaign.mirror_domain)
    or campaign.mirror_domain

  local mirror_host = mirror_hostname .. ':' .. args.mirror_port
  local target_link = args.campaign_id .. '\0' .. args.target_id

  if redis.call('HEXISTS', target_hosts_key, mirror_host) == 1 then
    return redis.status_reply('CONFLICT target mirror host already taken')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'campaign_id', args.campaign_id,
    'target_id', args.target_id,
    'access_level', args.access_level,
    'donor_secure', args.donor_secure,
    'donor_sub', args.donor_sub,
    'donor_domain', args.donor_domain,
    'donor_port', args.donor_port,
    'mirror_secure', args.mirror_secure,
    'mirror_sub', args.mirror_sub,
    'mirror_port', args.mirror_port,
    'tenant', args.tenant,
    'connect_timeout', args.connect_timeout,
    'simple_timeout', args.simple_timeout,
    'stream_timeout', args.stream_timeout,
    'headers_size_limit', args.headers_size_limit,
    'body_size_limit', args.body_size_limit,
    'main_page', args.main_page,
    'not_found_page', args.not_found_page,
    'favicon_ico', args.favicon_ico,
    'robots_txt', args.robots_txt,
    'sitemap_xml', args.sitemap_xml,
    'allow_websockets', args.allow_websockets,
    'is_enabled', 0,
    'message_count', 0,
    'created_at', now
  )

  redis.call('SADD', target_donors_key, donor_stamp)
  redis.call('SADD', target_mirrors_key, mirror_stamp)
  redis.call('HSET', target_hosts_key, mirror_host, target_link)
  redis.call('ZADD', target_index_key, now, args.target_id)

  return redis.status_reply('OK target created')
end

redis.register_function({
  function_name = 'create_target',
  callback = create_target,
  description = 'Create target',
})

local function read_target(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', target_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_target = redis.call(
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
    'tenant',
    'is_enabled',
    'message_count',
    'created_at'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'access_level', kind = 'str' },
    { name = 'donor_secure', kind = 'int', min = 0, max = 1 },
    { name = 'donor_sub', kind = 'str' },
    { name = 'donor_domain', kind = 'str' },
    { name = 'donor_port', kind = 'str' },
    { name = 'mirror_secure', kind = 'int', min = 0, max = 1 },
    { name = 'mirror_sub', kind = 'str' },
    { name = 'mirror_port', kind = 'str' },
    { name = 'tenant', kind = 'any' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
    { name = 'message_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.error_reply('ERR target campaign_id mismatch')
  end

  target.donor_secure = target.donor_secure == 1
  target.mirror_secure = target.mirror_secure == 1
  target.is_enabled = target.is_enabled == 1

  target.mirror_domain = campaign.mirror_domain

  return { map = target }
end

redis.register_function({
  function_name = 'read_target',
  callback = read_target,
  flags = { 'no-writes' },
  description = 'Read target',
})

local function read_full_target(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local target_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', target_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_target = redis.call(
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
    'tenant',
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

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'access_level', kind = 'str' },
    { name = 'donor_secure', kind = 'int', min = 0, max = 1 },
    { name = 'donor_sub', kind = 'str' },
    { name = 'donor_domain', kind = 'str' },
    { name = 'donor_port', kind = 'str' },
    { name = 'mirror_secure', kind = 'int', min = 0, max = 1 },
    { name = 'mirror_sub', kind = 'str' },
    { name = 'mirror_port', kind = 'str' },
    { name = 'tenant', kind = 'any' },
    { name = 'connect_timeout', kind = 'int', min = 1 },
    { name = 'simple_timeout', kind = 'int', min = 1 },
    { name = 'stream_timeout', kind = 'int', min = 1 },
    { name = 'headers_size_limit', kind = 'int', min = 1 },
    { name = 'body_size_limit', kind = 'int', min = 1 },
    { name = 'main_page', kind = 'any' },
    { name = 'not_found_page', kind = 'any' },
    { name = 'favicon_ico', kind = 'any' },
    { name = 'robots_txt', kind = 'any' },
    { name = 'sitemap_xml', kind = 'any' },
    { name = 'allow_websockets', kind = 'int', min = 0, max = 1 },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
    { name = 'message_count', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.error_reply('ERR target campaign_id mismatch')
  end

  target.donor_secure = target.donor_secure == 1
  target.mirror_secure = target.mirror_secure == 1
  target.allow_websockets = target.allow_websockets == 1
  target.is_enabled = target.is_enabled == 1

  target.mirror_domain = campaign.mirror_domain

  return { map = target }
end

redis.register_function({
  function_name = 'read_full_target',
  callback = read_full_target,
  flags = { 'no-writes' },
  description = 'Read full target',
})

local function read_target_hosts(keys, args)
  if #keys ~= 1 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local target_hosts_key = keys[1]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  local hosts = {}

  local values = redis.call('HGETALL', target_hosts_key)

  if #values % 2 ~= 0 then
    return redis.error_reply('ERR malform target_hosts')
  end

  for i = 1, #values, 2 do
    local campaign_id, target_id = string.match(values[i + 1], '^([^%z]+)%z([^%z]+)$')

    if not campaign_id or campaign_id == '' or not target_id or target_id == '' then
      return redis.error_reply('ERR malform target_link')
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

local function find_target_link(keys, raw_args)
  if #keys ~= 1 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local target_hosts_key = keys[1]

  local args, args_err = normalize(raw_args, {
    { name = 'mirror_host', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('HEXISTS', target_hosts_key, args.mirror_host) == 0 then
    return nil
  end

  local target_link = redis.call('HGET', target_hosts_key, args.mirror_host)
  local campaign_id, target_id = string.match(target_link, '^([^%z]+)%z([^%z]+)$')

  if not campaign_id or campaign_id == '' or not target_id or target_id == '' then
    return redis.error_reply('ERR malform target_link')
  end

  return { campaign_id, target_id }
end

redis.register_function({
  function_name = 'find_target_link',
  callback = find_target_link,
  flags = { 'no-writes' },
  description = 'Find target link',
})

local function read_target_index(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local target_index_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
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

local function update_target(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

  local args, args_err = normalize(raw_args, {
    { name = 'connect_timeout', kind = 'int', min = 1 },
    { name = 'simple_timeout', kind = 'int', min = 1 },
    { name = 'stream_timeout', kind = 'int', min = 1 },
    { name = 'headers_size_limit', kind = 'int', min = 1 },
    { name = 'body_size_limit', kind = 'int', min = 1 },
    { name = 'main_page', kind = 'any' },
    { name = 'not_found_page', kind = 'any' },
    { name = 'favicon_ico', kind = 'any' },
    { name = 'robots_txt', kind = 'any' },
    { name = 'sitemap_xml', kind = 'any' },
    { name = 'allow_websockets', kind = 'int', min = 0, max = 1 },
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'campaign_id',
    'target_id'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'connect_timeout', args.connect_timeout,
    'simple_timeout', args.simple_timeout,
    'stream_timeout', args.stream_timeout,
    'headers_size_limit', args.headers_size_limit,
    'body_size_limit', args.body_size_limit,
    'main_page', args.main_page,
    'not_found_page', args.not_found_page,
    'favicon_ico', args.favicon_ico,
    'robots_txt', args.robots_txt,
    'sitemap_xml', args.sitemap_xml,
    'allow_websockets', args.allow_websockets
  )

  return redis.status_reply('OK target updated')
end

redis.register_function({
  function_name = 'update_target',
  callback = update_target,
  description = 'Update target',
})

local function enable_target(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'campaign_id',
    'target_id',
    'is_enabled'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  if target.is_enabled == 1 then
    return redis.status_reply('OK target already enabled')
  end

  -- Point of no return

  redis.call('HSET', target_key, 'is_enabled', 1)

  return redis.status_reply('OK target enabled')
end

redis.register_function({
  function_name = 'enable_target',
  callback = enable_target,
  description = 'Enable target',
})

local function disable_target(keys, raw_args)
  if #keys ~= 3 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'campaign_id',
    'target_id',
    'is_enabled'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  if target.is_enabled == 0 then
    return redis.status_reply('OK target already disabled')
  end

  -- Point of no return

  redis.call('HSET', target_key, 'is_enabled', 0)

  return redis.status_reply('OK target disabled')
end

redis.register_function({
  function_name = 'disable_target',
  callback = disable_target,
  description = 'Disable target',
})

local function delete_target(keys, raw_args)
  if #keys ~= 7 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local campaign_lock_key = keys[2]
  local target_key = keys[3]
  local target_donors_key = keys[4]
  local target_mirrors_key = keys[5]
  local target_hosts_key = keys[6]
  local target_index_key = keys[7]

  local args, args_err = normalize(raw_args, {
    { name = 'lock_secret', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', campaign_lock_key) == 0 then
    return redis.status_reply('FORBIDDEN campaign not locked')
  end

  local lock_secret = redis.call('GET', campaign_lock_key)

  if not lock_secret or lock_secret ~= args.lock_secret then
    return redis.status_reply('FORBIDDEN campaign lock_secret mismatch')
  end

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  -- stylua: ignore
  local raw_target = redis.call(
    'HMGET', target_key,
    'campaign_id',
    'target_id',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_sub',
    'mirror_port',
    'is_enabled'
  )

  local target, target_err = normalize(raw_target, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'donor_sub', kind = 'str' },
    { name = 'donor_domain', kind = 'str' },
    { name = 'donor_port', kind = 'str' },
    { name = 'mirror_sub', kind = 'str' },
    { name = 'mirror_port', kind = 'str' },
    { name = 'is_enabled', kind = 'int', min = 0, max = 1 },
  })

  if target_err then
    return redis.error_reply('ERR normalize target: ' .. target_err)
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'mirror_domain'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'mirror_domain', kind = 'str' },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= target.campaign_id then
    return redis.status_reply('FORBIDDEN target campaign_id mismatch')
  end

  if target.is_enabled == 1 then
    return redis.status_reply('FORBIDDEN target not disabled')
  end

  -- stylua: ignore
  local donor_stamp = target.campaign_id
    .. '\0' .. target.donor_sub
    .. '\0' .. target.donor_domain
    .. '\0' .. target.donor_port

  -- stylua: ignore
  local mirror_stamp = target.campaign_id
    .. '\0' .. target.mirror_sub
    .. '\0' .. target.mirror_port

  local mirror_hostname = target.mirror_sub ~= TARGET_SUB_APEX
      and (target.mirror_sub .. '.' .. campaign.mirror_domain)
    or campaign.mirror_domain

  local mirror_host = mirror_hostname .. ':' .. target.mirror_port

  -- Point of no return

  redis.call('DEL', target_key)
  redis.call('SREM', target_donors_key, donor_stamp)
  redis.call('SREM', target_mirrors_key, mirror_stamp)
  redis.call('HDEL', target_hosts_key, mirror_host)
  redis.call('ZREM', target_index_key, target.target_id)

  return redis.status_reply('OK target deleted')
end

redis.register_function({
  function_name = 'delete_target',
  callback = delete_target,
  description = 'Delete target',
})

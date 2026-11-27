--
-- Message methods
--

local function create_message(keys, raw_args)
  if #keys ~= 6 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]
  local message_history_key = keys[6]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'message_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
    { name = 'type', kind = 'str' },
    { name = 'method', kind = 'str' },
    { name = 'url', kind = 'str' },
    { name = 'request_headers', kind = 'any' },
    { name = 'request_body', kind = 'any' },
    { name = 'status', kind = 'int' },
    { name = 'response_headers', kind = 'any' },
    { name = 'response_body', kind = 'any' },
    { name = 'connection', kind = 'any' },
    { name = 'payload', kind = 'any' },
    { name = 'errors', kind = 'any' },
    { name = 'analyze', kind = 'any' },
    { name = 'start_time', kind = 'int', min = 0 },
    { name = 'finish_time', kind = 'int', min = 0 },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  local now = current_time()

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', message_key) == 1 then
    return redis.status_reply('CONFLICT message already exists')
  end

  if redis.call('EXISTS', proxy_key) == 0 then
    return redis.status_reply('NOT_FOUND proxy not exists')
  end

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  if redis.call('EXISTS', session_key) == 0 then
    return redis.status_reply('NOT_FOUND session not exists')
  end

  -- stylua: ignore
  local raw_campaign = redis.call(
    'HMGET', campaign_key,
    'campaign_id',
    'message_expire'
  )

  local campaign, campaign_err = normalize(raw_campaign, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'message_expire', kind = 'int', min = 1000 },
  })

  if campaign_err then
    return redis.error_reply('ERR normalize campaign: ' .. campaign_err)
  end

  if campaign.campaign_id ~= args.campaign_id then
    return redis.status_reply('FORBIDDEN message campaign_id mismatch')
  end

  -- stylua: ignore
  local raw_proxy = redis.call(
    'HMGET', proxy_key,
    'campaign_id',
    'proxy_id'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
  })

  if proxy_err then
    return redis.error_reply('ERR normalize proxy: ' .. proxy_err)
  end

  if proxy.campaign_id ~= args.campaign_id or proxy.proxy_id ~= args.proxy_id then
    return redis.status_reply('FORBIDDEN message proxy_id mismatch')
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

  if target.campaign_id ~= args.campaign_id or target.target_id ~= args.target_id then
    return redis.status_reply('FORBIDDEN message target_id mismatch')
  end

  -- stylua: ignore
  local raw_session = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'session_id'
  )

  local session, session_err = normalize(raw_session, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
  })

  if session_err then
    return redis.error_reply('ERR normalize session: ' .. session_err)
  end

  if session.campaign_id ~= args.campaign_id or session.session_id ~= args.session_id then
    return redis.status_reply('FORBIDDEN message session_id mismatch')
  end

  local history_threshold = math.max(0, now - campaign.message_expire * 2)

  -- Point of no return

    -- stylua: ignore
  redis.call(
    'HSET', message_key,
    'campaign_id', args.campaign_id,
    'message_id', args.message_id,
    'proxy_id', args.proxy_id,
    'target_id', args.target_id,
    'session_id', args.session_id,
    'type', args.type,
    'method', args.method,
    'url', args.url,
    'request_headers', args.request_headers,
    'request_body', args.request_body,
    'status', args.status,
    'response_headers', args.response_headers,
    'response_body', args.response_body,
    'connection', args.connection,
    'payload', args.payload,
    'errors', args.errors,
    'analyze', args.analyze,
    'start_time', args.start_time,
    'finish_time', args.finish_time,
    'created_at', now
  )

  redis.call('HINCRBY', campaign_key, 'message_count', 1)
  redis.call('HINCRBY', proxy_key, 'message_count', 1)
  redis.call('HINCRBY', target_key, 'message_count', 1)
  redis.call('HINCRBY', session_key, 'message_count', 1)

  redis.call('PEXPIRE', message_key, campaign.message_expire)
  redis.call('ZREMRANGEBYSCORE', message_history_key, '-inf', '(' .. history_threshold)
  redis.call('ZADD', message_history_key, now, args.message_id)
  redis.call('PEXPIRE', message_history_key, campaign.message_expire * 2)

  return redis.status_reply('OK message created')
end

redis.register_function({
  function_name = 'create_message',
  callback = create_message,
  description = 'Create message',
})

local function create_dummy_message(keys, raw_args)
  if #keys ~= 5 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]

  local args, args_err = normalize(raw_args, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'message_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
  })

  if args_err then
    return redis.error_reply('ERR normalize args: ' .. args_err)
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', message_key) == 1 then
    return redis.status_reply('CONFLICT message already exists')
  end

  if redis.call('EXISTS', proxy_key) == 0 then
    return redis.status_reply('NOT_FOUND proxy not exists')
  end

  if redis.call('EXISTS', target_key) == 0 then
    return redis.status_reply('NOT_FOUND target not exists')
  end

  if redis.call('EXISTS', session_key) == 0 then
    return redis.status_reply('NOT_FOUND session not exists')
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

  if campaign.campaign_id ~= args.campaign_id then
    return redis.status_reply('FORBIDDEN message campaign_id mismatch')
  end

  -- stylua: ignore
  local raw_proxy = redis.call(
    'HMGET', proxy_key,
    'campaign_id',
    'proxy_id'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
  })

  if proxy_err then
    return redis.error_reply('ERR normalize proxy: ' .. proxy_err)
  end

  if proxy.campaign_id ~= args.campaign_id or proxy.proxy_id ~= args.proxy_id then
    return redis.status_reply('FORBIDDEN message proxy_id mismatch')
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

  if target.campaign_id ~= args.campaign_id or target.target_id ~= args.target_id then
    return redis.status_reply('FORBIDDEN message target_id mismatch')
  end

  -- stylua: ignore
  local raw_session = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'session_id'
  )

  local session, session_err = normalize(raw_session, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
  })

  if session_err then
    return redis.error_reply('ERR normalize session: ' .. session_err)
  end

  if session.campaign_id ~= args.campaign_id or session.session_id ~= args.session_id then
    return redis.status_reply('FORBIDDEN message session_id mismatch')
  end

  -- Point of no return

  redis.call('HINCRBY', campaign_key, 'message_count', 1)
  redis.call('HINCRBY', proxy_key, 'message_count', 1)
  redis.call('HINCRBY', target_key, 'message_count', 1)
  redis.call('HINCRBY', session_key, 'message_count', 1)

  return redis.status_reply('OK dummy message created')
end

redis.register_function({
  function_name = 'create_dummy_message',
  callback = create_dummy_message,
  description = 'Create dummy message',
})

local function read_message(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', message_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_message = redis.call(
    'HMGET', message_key,
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'type',
    'method',
    'url',
    'status',
    'analyze',
    'start_time',
    'finish_time',
    'created_at'
  )

  local message, message_err = normalize(raw_message, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'message_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
    { name = 'type', kind = 'str' },
    { name = 'method', kind = 'str' },
    { name = 'url', kind = 'str' },
    { name = 'status', kind = 'int' },
    { name = 'analyze', kind = 'any' },
    { name = 'start_time', kind = 'int', min = 0 },
    { name = 'finish_time', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if message_err then
    return redis.error_reply('ERR normalize message: ' .. message_err)
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

  if campaign.campaign_id ~= message.campaign_id then
    return redis.error_reply('ERR message campaign_id mismatch')
  end

  return { map = message }
end

redis.register_function({
  function_name = 'read_message',
  callback = read_message,
  flags = { 'no-writes' },
  description = 'Read message',
})

local function read_full_message(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  if redis.call('EXISTS', message_key) == 0 then
    return nil
  end

  -- stylua: ignore
  local raw_message = redis.call(
    'HMGET', message_key,
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'type',
    'method',
    'url',
    'request_headers',
    'request_body',
    'status',
    'response_headers',
    'response_body',
    'connection',
    'payload',
    'errors',
    'analyze',
    'start_time',
    'finish_time',
    'created_at'
  )

  local message, message_err = normalize(raw_message, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'message_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
    { name = 'type', kind = 'str' },
    { name = 'method', kind = 'str' },
    { name = 'url', kind = 'str' },
    { name = 'request_headers', kind = 'any' },
    { name = 'request_body', kind = 'any' },
    { name = 'status', kind = 'int' },
    { name = 'response_headers', kind = 'any' },
    { name = 'response_body', kind = 'any' },
    { name = 'connection', kind = 'any' },
    { name = 'payload', kind = 'any' },
    { name = 'errors', kind = 'any' },
    { name = 'analyze', kind = 'any' },
    { name = 'start_time', kind = 'int', min = 0 },
    { name = 'finish_time', kind = 'int', min = 0 },
    { name = 'created_at', kind = 'int', min = 0 },
  })

  if message_err then
    return redis.error_reply('ERR normalize message: ' .. message_err)
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

  if campaign.campaign_id ~= message.campaign_id then
    return redis.error_reply('ERR message campaign_id mismatch')
  end

  return { map = message }
end

redis.register_function({
  function_name = 'read_full_message',
  callback = read_full_message,
  flags = { 'no-writes' },
  description = 'Read full message',
})

local function read_message_history(keys, args)
  if #keys ~= 2 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local message_history_key = keys[2]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return nil
  end

  return redis.call('ZRANGE', message_history_key, 0, -1, 'REV')
end

redis.register_function({
  function_name = 'read_message_history',
  callback = read_message_history,
  flags = { 'no-writes' },
  description = 'Read message history',
})

local function delete_message(keys, args)
  if #keys ~= 6 then
    return redis.error_reply('ERR wrong number of keys')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]
  local message_history_key = keys[6]

  if #args ~= 0 then
    return redis.error_reply('ERR wrong number of args')
  end

  if redis.call('EXISTS', campaign_key) == 0 then
    return redis.status_reply('NOT_FOUND campaign not exists')
  end

  if redis.call('EXISTS', message_key) == 0 then
    return redis.status_reply('NOT_FOUND message not exists')
  end

  -- stylua: ignore
  local raw_message = redis.call(
    'HMGET', message_key,
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id'
  )

  local message, message_err = normalize(raw_message, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'message_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
    { name = 'target_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
  })

  if message_err then
    return redis.error_reply('ERR normalize message: ' .. message_err)
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

  if campaign.campaign_id ~= message.campaign_id then
    return redis.status_reply('FORBIDDEN message campaign_id mismatch')
  end

  -- stylua: ignore
  local raw_proxy = redis.call(
    'HMGET', proxy_key,
    'campaign_id',
    'proxy_id'
  )

  local proxy, proxy_err = normalize(raw_proxy, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'proxy_id', kind = 'str' },
  })

  if proxy_err then
    return redis.error_reply('ERR normalize proxy: ' .. proxy_err)
  end

  if proxy.campaign_id ~= message.campaign_id or proxy.proxy_id ~= message.proxy_id then
    return redis.status_reply('FORBIDDEN message proxy_id mismatch')
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

  if target.campaign_id ~= message.campaign_id or target.target_id ~= message.target_id then
    return redis.status_reply('FORBIDDEN message target_id mismatch')
  end

  -- stylua: ignore
  local raw_session = redis.call(
    'HMGET', session_key,
    'campaign_id',
    'session_id'
  )

  local session, session_err = normalize(raw_session, {
    { name = 'campaign_id', kind = 'str' },
    { name = 'session_id', kind = 'str' },
  })

  if session_err then
    return redis.error_reply('ERR normalize session: ' .. session_err)
  end

  if session.campaign_id ~= message.campaign_id or session.session_id ~= message.session_id then
    return redis.status_reply('FORBIDDEN message session_id mismatch')
  end

  -- Point of no return

  redis.call('DEL', message_key)
  redis.call('ZREM', message_history_key, message.message_id)

  return redis.status_reply('OK message deleted')
end

redis.register_function({
  function_name = 'delete_message',
  callback = delete_message,
  description = 'Delete message',
})

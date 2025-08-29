#!lua name=session

--[[
  Create session
--]]
local function create_session(keys, args)
  if #keys ~= 4 or #args ~= 5 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]
  local session_index_key = keys[3]
  local session_loop_index_key = keys[4]

  local campaign_id = args[1]
  if not (campaign_id and campaign_id ~= '') then
    return redis.error_reply('BAD_PARAMS campaign_id wrong')
  end

  local id = args[2]
  if not (id and id ~= '') then
    return redis.error_reply('BAD_PARAMS id wrong')
  end

  local proxy_id = args[3]
  if not (proxy_id and proxy_id ~= '') then
    return redis.error_reply('BAD_PARAMS proxy_id wrong')
  end

  local secret = args[4]
  if not (secret and secret ~= '') then
    return redis.error_reply('BAD_PARAMS secret wrong')
  end

  local current_time = tonumber(args[5])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', session_key) ~= 0 then
    return redis.status_reply('ENTITY_EXISTS session allready exists')
  end

  local session_limit = tonumber(redis.call('HGET', campaign_key, 'session_limit'))
  if not (session_limit and session_limit >= 0) then
    return redis.error_reply('MALFORM_DATA campaign session_limit wrong')
  end

  if redis.call('ZCARD', session_index_key) >= session_limit then
    return redis.status_reply('LIMIT_EXCEED campaign session_limit exceeded')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', session_key,
    'campaign_id', campaign_id,
    'id', id,
    'proxy_id', proxy_id,
    'secret', secret,
    'is_landing', 0,
    'total_count', 0,
    'success_count', 0,
    'failure_count', 0,
    'created_at', current_time,
    'updated_at', current_time
  )

  redis.call('ZADD', session_index_key, current_time, id)

  redis.call('ZADD', session_loop_index_key, current_time, id)

  return redis.status_reply('OK session created')
end

redis.register_function({
  function_name = 'create_session',
  callback = create_session,
})

--[[
  Read session
--]]
local function read_session(keys, args)
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  return redis.call(
    'HMGET', session_key,
    'campaign_id',
    'id',
    'proxy_id',
    'secret',
    'is_landing',
    'total_count',
    'success_count',
    'failure_count',
    'created_at',
    'updated_at'
  )
end

redis.register_function({
  function_name = 'read_session',
  callback = read_session,
  flags = { 'no-writes' },
})

--[[
  Read session index
--]]
local function read_session_index(keys, args)
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local session_index_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  return redis.call('ZRANGE', session_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_session_index',
  callback = read_session_index,
  flags = { 'no-writes' },
})

--[[
  Update session landing
--]]
local function update_session_landing(keys, args)
  if #keys ~= 3 or #args ~= 2 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local lure_key = keys[2]
  local session_key = keys[3]

  local secret = args[1]
  if not (secret and secret ~= '') then
    return redis.error_reply('BAD_PARAMS secret wrong')
  end

  local current_time = tonumber(args[2])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', lure_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return nil
  end

  local orig_secret = redis.call('HGET', session_key, 'secret')
  if not (orig_secret and orig_secret ~= '') then
    return redis.error_reply('MALFORM_DATA session secret wrong')
  end

  if secret ~= orig_secret then
    return nil
  end

  local is_landing = tonumber(redis.call('HGET', session_key, 'is_landing'))
  if not (is_landing and (is_landing == 0 or is_landing == 1)) then
    return redis.error_reply('MALFORM_DATA session is_landing wrong')
  end

  -- Point of no return

  if is_landing ~= 1 then
    -- stylua: ignore
    redis.call(
      'HSET', session_key,
      'is_landing', 1,
      'updated_at', current_time
    )

    redis.call('HINCRBY', lure_key, 'auth_count', 1)
    -- stylua: ignore
    redis.call(
      'HSET', lure_key,
      'updated_at', current_time
    )
  end

  -- stylua: ignore
  return redis.call(
    'HMGET', session_key,
    'campaign_id',
    'id',
    'proxy_id',
    'secret',
    'is_landing',
    'total_count',
    'success_count',
    'failure_count',
    'created_at',
    'updated_at'
  )
end

redis.register_function({
  function_name = 'update_session_landing',
  callback = update_session_landing,
})

--[[
  Emerge session loop
--]]
local function emerge_session_loop(keys, args)
  if #keys ~= 4 or #args ~= 1 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local session_index_key = keys[2]
  local session_loop_index_key = keys[3]
  local session_drop_index_key = keys[4]

  local current_time = tonumber(args[1])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  local session_limit = tonumber(redis.call('HGET', campaign_key, 'session_limit'))
  if not (session_limit and session_limit >= 0) then
    return redis.error_reply('MALFORM_DATA campaign session_limit wrong')
  end

  local session_spare = tonumber(redis.call('HGET', campaign_key, 'session_spare'))
  if not (session_spare and session_spare >= 0) then
    return redis.error_reply('MALFORM_DATA campaign session_spare wrong')
  end

  local emerge_idle_time = tonumber(redis.call('HGET', campaign_key, 'session_emerge_idle_time'))
  if not (emerge_idle_time and emerge_idle_time > 0) then
    return redis.error_reply('MALFORM_DATA campaign session_emerge_idle_time wrong')
  end

  local emerge_limit = tonumber(redis.call('HGET', campaign_key, 'session_emerge_limit'))
  if not (emerge_limit and emerge_limit >= 0) then
    return redis.error_reply('MALFORM_DATA campaign session_emerge_limit wrong')
  end

  local excess_count = redis.call('ZCARD', session_index_key) - session_limit - session_spare

  -- Point of no return

  -- stylua: ignore
  local loop_index = redis.call(
    'ZRANGE', session_loop_index_key,
    '-Inf',
    current_time - emerge_idle_time,
    'BYSCORE',
    'LIMIT',
    0,
    emerge_limit
  )

  for _, id in ipairs(loop_index) do
    current_time = current_time + 1

    redis.call('ZADD', session_loop_index_key, current_time, id)
  end

  if excess_count > 0 then
    -- stylua: ignore
    local drop_index = redis.call(
      'ZRANGE', session_index_key,
      0,
      excess_count,
      'LIMIT',
      0,
      emerge_limit
    )

    for _, id in ipairs(drop_index) do
      redis.call('SADD', session_drop_index_key, id)
    end
  end

  return loop_index
end

redis.register_function({
  function_name = 'emerge_session_loop',
  callback = emerge_session_loop,
})

--[[
  Cleanup session
--]]
local function cleanup_session(keys, args)
  if #keys ~= 5 or #args ~= 1 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local session_key = keys[2]
  local session_index_key = keys[3]
  local session_loop_index_key = keys[4]
  local session_drop_index_key = keys[5]

  local current_time = tonumber(args[1])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND session not found')
  end

  local session_expire = tonumber(redis.call('HGET', campaign_key, 'session_expire'))
  if not (session_expire and session_expire > 0) then
    return redis.error_reply('MALFORM_DATA campaign session_expire wrong')
  end

  local new_session_expire = tonumber(redis.call('HGET', campaign_key, 'new_session_expire'))
  if not (new_session_expire and new_session_expire > 0) then
    return redis.error_reply('MALFORM_DATA campaign new_session_expire wrong')
  end

  local id = redis.call('HGET', session_key, 'id')
  if not (id and id ~= '') then
    return redis.error_reply('MALFORM_DATA session id wrong')
  end

  local total_count = tonumber(redis.call('HGET', session_key, 'total_count'))
  if not (total_count and total_count >= 0) then
    return redis.error_reply('MALFORM_DATA session total_count wrong')
  end

  local created_at = tonumber(redis.call('HGET', session_key, 'created_at'))
  if not (created_at and created_at > 0) then
    return redis.error_reply('MALFORM_DATA session created_at wrong')
  end

  local updated_at = tonumber(redis.call('HGET', session_key, 'updated_at'))
  if not (updated_at and updated_at > 0) then
    return redis.error_reply('MALFORM_DATA session updated_at wrong')
  end

  local is_drop = redis.call('SISMEMBER', session_drop_index_key, id) ~= 0

  if not is_drop then
    if total_count == 0 then
      if current_time > created_at + new_session_expire then
        is_drop = true
      end
    else
      if current_time > updated_at + session_expire then
        is_drop = true
      end
    end
  end

  -- Point of no return

  if is_drop then
    redis.call('DEL', session_key)

    redis.call('ZREM', session_index_key, id)

    redis.call('ZREM', session_loop_index_key, id)

    redis.call('SREM', session_drop_index_key, id)

    return redis.status_reply('OK session cleanup')
  end

  return redis.status_reply('OK session alive')
end

redis.register_function({
  function_name = 'cleanup_session',
  callback = cleanup_session,
})

#!lua name=message

--[[
  Create message
--]]
local function create_message(keys, args)
  if #keys ~= 8 or #args ~= 13 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]
  local message_index_key = keys[6]
  local message_loop_index_key = keys[7]
  local message_lock_key = keys[8]

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

  local target_id = args[4]
  if not (target_id and target_id ~= '') then
    return redis.error_reply('BAD_PARAMS target_id wrong')
  end

  local session_id = args[5]
  if not (session_id and session_id ~= '') then
    return redis.error_reply('BAD_PARAMS session_id wrong')
  end

  local client_ip = args[6]
  if not client_ip then
    return redis.error_reply('BAD_PARAMS client_ip wrong')
  end

  local method = args[7]
  if not (method and method ~= '') then
    return redis.error_reply('BAD_PARAMS method wrong')
  end

  local origin_url = args[8]
  if not (origin_url and origin_url ~= '') then
    return redis.error_reply('BAD_PARAMS origin_url wrong')
  end

  local request_headers = args[9]
  if not request_headers then
    return redis.error_reply('BAD_PARAMS request_headers wrong')
  end

  local request_cookies = args[10]
  if not request_cookies then
    return redis.error_reply('BAD_PARAMS request_cookies wrong')
  end

  local request_body = args[11]
  if not request_body then
    return redis.error_reply('BAD_PARAMS request_body wrong')
  end

  local current_time = tonumber(args[12])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  local lock_secret = args[13]
  if not (lock_secret and lock_secret ~= '') then
    return redis.error_reply('BAD_PARAMS lock_secret wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_VIOLATION campaign not found')
  end

  if redis.call('EXISTS', message_key) ~= 0 then
    return redis.status_reply('ENTITY_EXISTS message allready exists')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('ENTITY_VIOLATION proxy not found')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('ENTITY_VIOLATION target not found')
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return redis.status_reply('ENTITY_VIOLATION session not found')
  end

  local message_limit = tonumber(redis.call('HGET', campaign_key, 'message_limit'))
  if not (message_limit and message_limit >= 0) then
    return redis.error_reply('MALFORM_DATA campaign message_limit wrong')
  end

  local lock_expire = tonumber(redis.call('HGET', campaign_key, 'message_lock_expire'))
  if not (lock_expire and lock_expire > 0) then
    return redis.error_reply('MALFORM_DATA campaign message_lock_expire wrong')
  end

  if redis.call('ZCARD', message_index_key) >= message_limit then
    return redis.status_reply('LIMIT_EXCEED campaign message_limit exceeded')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', message_key,
    'campaign_id', campaign_id,
    'id', id,
    'proxy_id', proxy_id,
    'target_id', target_id,
    'session_id', session_id,
    'client_ip', client_ip,
    'method', method,
    'origin_url', origin_url,
    'forward_url', origin_url,
    'request_headers', request_headers,
    'request_cookies', request_cookies,
    'request_body', request_body,
    'status_code', 0,
    'response_headers', '{}',
    'response_cookies', '{}',
    'response_body', '',
    'query_time', 0,
    'score', 0,
    'is_complete', 0,
    'is_log_save', 0,
    'created_at', current_time,
    'updated_at', current_time
  )

  redis.call('HINCRBY', proxy_key, 'total_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', proxy_key,
    'updated_at', current_time
  )

  redis.call('HINCRBY', target_key, 'total_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'updated_at', current_time
  )

  redis.call('HINCRBY', session_key, 'total_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', session_key,
    'updated_at', current_time
  )

  redis.call('ZADD', message_index_key, current_time, id)

  redis.call('ZADD', message_loop_index_key, current_time, id)

  redis.call('SET', message_lock_key, lock_secret, 'PX', lock_expire)

  return redis.status_reply('OK message created')
end

redis.register_function({
  function_name = 'create_message',
  callback = create_message,
})

--[[
  Read message
--]]
local function read_message(keys, args)
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  if redis.call('EXISTS', message_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  return redis.call(
    'HMGET', message_key,
    'campaign_id',
    'id',
    'proxy_id',
    'target_id',
    'session_id',
    'client_ip',
    'method',
    'origin_url',
    'forward_url',
    'request_headers',
    'request_cookies',
    'request_body',
    'status_code',
    'response_headers',
    'response_cookies',
    'response_body',
    'query_time',
    'score',
    'is_complete',
    'is_log_save',
    'created_at',
    'updated_at'
  )
end

redis.register_function({
  function_name = 'read_message',
  callback = read_message,
  flags = { 'no-writes' },
})

--[[
  Read message index
--]]
local function read_message_index(keys, args)
  if #keys ~= 2 or #args ~= 0 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_index_key = keys[2]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  return redis.call('ZRANGE', message_index_key, 0, -1)
end

redis.register_function({
  function_name = 'read_message_index',
  callback = read_message_index,
  flags = { 'no-writes' },
})

--[[
  Update message request
--]]
local function update_message_request(keys, args)
  if #keys ~= 3 or #args ~= 7 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local message_lock_key = keys[3]

  local forward_url = args[1]
  if not (forward_url and forward_url ~= '') then
    return redis.error_reply('BAD_PARAMS forward_url wrong')
  end

  local request_headers = args[2]
  if not request_headers then
    return redis.error_reply('BAD_PARAMS request_headers wrong')
  end

  local request_cookies = args[3]
  if not request_cookies then
    return redis.error_reply('BAD_PARAMS request_cookies wrong')
  end

  local request_body = args[4]
  if not request_body then
    return redis.error_reply('BAD_PARAMS request_body wrong')
  end

  local score = tonumber(args[5])
  if not score then
    return redis.error_reply('BAD_PARAMS score wrong')
  end

  local current_time = tonumber(args[6])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  local lock_secret = args[7]
  if not (lock_secret and lock_secret ~= '') then
    return redis.error_reply('BAD_PARAMS lock_secret wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', message_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND message not found')
  end

  if redis.call('EXISTS', message_lock_key) ~= 1 then
    return redis.status_reply('ENTITY_LOCK_LOST message_lock not exists')
  end

  local orig_lock_secret = redis.call('GET', message_lock_key)
  if not (orig_lock_secret and orig_lock_secret ~= '') then
    return redis.error_reply('MALFORM_DATA message_lock secret wrong')
  end

  if lock_secret ~= orig_lock_secret then
    return redis.status_reply('ENTITY_LOCK_LOST message_lock secret mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', message_key,
    'forward_url', forward_url,
    'request_headers', request_headers,
    'request_cookies', request_cookies,
    'request_body', request_body,
    'score', score,
    'updated_at', current_time
  )

  return redis.status_reply('OK message updated')
end

redis.register_function({
  function_name = 'update_message_request',
  callback = update_message_request,
})

--[[
  Update message response
--]]
local function update_message_response(keys, args)
  if #keys ~= 3 or #args ~= 8 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local message_lock_key = keys[3]

  local status_code = tonumber(args[1])
  if not (status_code and status_code >= 0) then
    return redis.error_reply('BAD_PARAMS status_code wrong')
  end

  local response_headers = args[2]
  if not response_headers then
    return redis.error_reply('BAD_PARAMS response_headers wrong')
  end

  local response_cookies = args[3]
  if not response_cookies then
    return redis.error_reply('BAD_PARAMS response_cookies wrong')
  end

  local response_body = args[4]
  if not response_body then
    return redis.error_reply('BAD_PARAMS response_body wrong')
  end

  local query_time = tonumber(args[5])
  if not (query_time and query_time >= 0) then
    return redis.error_reply('BAD_PARAMS query_time wrong')
  end

  local score = tonumber(args[6])
  if not score then
    return redis.error_reply('BAD_PARAMS score wrong')
  end

  local current_time = tonumber(args[7])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  local lock_secret = args[8]
  if not (lock_secret and lock_secret ~= '') then
    return redis.error_reply('BAD_PARAMS lock_secret wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', message_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND message not found')
  end

  if redis.call('EXISTS', message_lock_key) ~= 1 then
    return redis.status_reply('ENTITY_LOCK_LOST message_lock not exists')
  end

  local orig_lock_secret = redis.call('GET', message_lock_key)
  if not (orig_lock_secret and orig_lock_secret ~= '') then
    return redis.error_reply('MALFORM_DATA message_lock secret wrong')
  end

  if lock_secret ~= orig_lock_secret then
    return redis.status_reply('ENTITY_LOCK_LOST message_lock secret mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', message_key,
    'status_code', status_code,
    'response_headers', response_headers,
    'response_cookies', response_cookies,
    'response_body', response_body,
    'query_time', query_time,
    'score', score,
    'updated_at', current_time
  )

  return redis.status_reply('OK message updated')
end

redis.register_function({
  function_name = 'update_message_response',
  callback = update_message_response,
})

--[[
  Update message success
--]]
local function update_message_success(keys, args)
  if #keys ~= 6 or #args ~= 2 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]
  local message_lock_key = keys[6]

  local current_time = tonumber(args[1])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  local lock_secret = args[2]
  if not (lock_secret and lock_secret ~= '') then
    return redis.error_reply('BAD_PARAMS lock_secret wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', message_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND message not found')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND proxy not found')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND target not found')
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND session not found')
  end

  if redis.call('EXISTS', message_lock_key) ~= 1 then
    return redis.status_reply('ENTITY_LOCK_LOST message_lock not exists')
  end

  local orig_lock_secret = redis.call('GET', message_lock_key)
  if not (orig_lock_secret and orig_lock_secret ~= '') then
    return redis.error_reply('MALFORM_DATA message_lock secret wrong')
  end

  if lock_secret ~= orig_lock_secret then
    return redis.status_reply('ENTITY_LOCK_LOST message_lock secret mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', message_key,
    'is_complete', 1,
    'updated_at', current_time
  )

  redis.call('HINCRBY', proxy_key, 'success_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', proxy_key,
    'updated_at', current_time
  )

  redis.call('HINCRBY', target_key, 'success_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'updated_at', current_time
  )

  redis.call('HINCRBY', session_key, 'success_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', session_key,
    'updated_at', current_time
  )

  redis.call('DEL', message_lock_key)

  return redis.status_reply('OK message updated')
end

redis.register_function({
  function_name = 'update_message_success',
  callback = update_message_success,
})

--[[
  Update message failure
--]]
local function update_message_failure(keys, args)
  if #keys ~= 6 or #args ~= 2 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local proxy_key = keys[3]
  local target_key = keys[4]
  local session_key = keys[5]
  local message_lock_key = keys[6]

  local current_time = tonumber(args[1])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  local lock_secret = args[2]
  if not (lock_secret and lock_secret ~= '') then
    return redis.error_reply('BAD_PARAMS lock_secret wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', message_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND message not found')
  end

  if redis.call('EXISTS', proxy_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND proxy not found')
  end

  if redis.call('EXISTS', target_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND target not found')
  end

  if redis.call('EXISTS', session_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND session not found')
  end

  if redis.call('EXISTS', message_lock_key) ~= 1 then
    return redis.status_reply('ENTITY_LOCK_LOST message_lock not exists')
  end

  local orig_lock_secret = redis.call('GET', message_lock_key)
  if not (orig_lock_secret and orig_lock_secret ~= '') then
    return redis.error_reply('MALFORM_DATA message_lock secret wrong')
  end

  if lock_secret ~= orig_lock_secret then
    return redis.status_reply('ENTITY_LOCK_LOST message_lock secret mismatch')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', message_key,
    'is_complete', 1,
    'updated_at', current_time
  )

  redis.call('HINCRBY', proxy_key, 'failure_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', proxy_key,
    'updated_at', current_time
  )

  redis.call('HINCRBY', target_key, 'failure_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', target_key,
    'updated_at', current_time
  )

  redis.call('HINCRBY', session_key, 'failure_count', 1)
  -- stylua: ignore
  redis.call(
    'HSET', session_key,
    'updated_at', current_time
  )

  redis.call('DEL', message_lock_key)

  return redis.status_reply('OK message updated')
end

redis.register_function({
  function_name = 'update_message_failure',
  callback = update_message_failure,
})

--[[
  Emerge message loop
--]]
local function emerge_message_loop(keys, args)
  if #keys ~= 4 or #args ~= 1 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_index_key = keys[2]
  local message_loop_index_key = keys[3]
  local message_drop_index_key = keys[4]

  local current_time = tonumber(args[1])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  local message_limit = tonumber(redis.call('HGET', campaign_key, 'message_limit'))
  if not (message_limit and message_limit >= 0) then
    return redis.error_reply('MALFORM_DATA campaign message_limit wrong')
  end

  local message_spare = tonumber(redis.call('HGET', campaign_key, 'message_spare'))
  if not (message_spare and message_spare >= 0) then
    return redis.error_reply('MALFORM_DATA campaign message_spare wrong')
  end

  local emerge_idle_time = tonumber(redis.call('HGET', campaign_key, 'message_emerge_idle_time'))
  if not (emerge_idle_time and emerge_idle_time > 0) then
    return redis.error_reply('MALFORM_DATA campaign message_emerge_idle_time wrong')
  end

  local emerge_limit = tonumber(redis.call('HGET', campaign_key, 'message_emerge_limit'))
  if not (emerge_limit and emerge_limit >= 0) then
    return redis.error_reply('MALFORM_DATA campaign message_emerge_limit wrong')
  end

  local excess_count = redis.call('ZCARD', message_index_key) - message_limit - message_spare

  -- Point of no return

  -- stylua: ignore
  local loop_index = redis.call(
    'ZRANGE', message_loop_index_key,
    '-Inf',
    current_time - emerge_idle_time,
    'BYSCORE',
    'LIMIT',
    0,
    emerge_limit
  )

  for _, id in ipairs(loop_index) do
    current_time = current_time + 1

    redis.call('ZADD', message_loop_index_key, current_time, id)
  end

  if excess_count > 0 then
    -- stylua: ignore
    local drop_index = redis.call(
      'ZRANGE', message_index_key,
      0,
      excess_count,
      'LIMIT',
      0,
      emerge_limit
    )

    for _, id in ipairs(drop_index) do
      redis.call('SADD', message_drop_index_key, id)
    end
  end

  return loop_index
end

redis.register_function({
  function_name = 'emerge_message_loop',
  callback = emerge_message_loop,
})

--[[
  Update message log_save
--]]
local function update_message_log_save(keys, args)
  if #keys ~= 3 or #args ~= 0 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local message_lock_key = keys[3]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', message_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND message not found')
  end

  if redis.call('EXISTS', message_lock_key) ~= 0 then
    return redis.status_reply('ENTITY_LOCKED message lock exists')
  end

  local is_complete = tonumber(redis.call('HGET', message_key, 'is_complete'))
  if not (is_complete and (is_complete == 0 or is_complete == 1)) then
    return redis.error_reply('MALFORM_DATA message is_complete wrong')
  end

  if is_complete ~= 1 then
    return redis.status_reply('ENTITY_VIOLATION message not complete')
  end

  local is_log_save = tonumber(redis.call('HGET', message_key, 'is_log_save'))
  if not (is_log_save and (is_log_save == 0 or is_log_save == 1)) then
    return redis.error_reply('MALFORM_DATA message is_log_save wrong')
  end

  if is_log_save ~= 0 then
    return redis.status_reply('OK message allready logged')
  end

  -- Point of no return

  -- stylua: ignore
  redis.call(
    'HSET', message_key,
    'is_log_save', 1
  )

  return redis.status_reply('OK message updated')
end

redis.register_function({
  function_name = 'update_message_log_save',
  callback = update_message_log_save,
})

--[[
  Cleanup message
--]]
local function cleanup_message(keys, args)
  if #keys ~= 5 or #args ~= 1 then
    return redis.error_reply('BAD_PARAMS wrong function use')
  end

  local campaign_key = keys[1]
  local message_key = keys[2]
  local message_index_key = keys[3]
  local message_loop_index_key = keys[4]
  local message_drop_index_key = keys[5]

  local current_time = tonumber(args[1])
  if not (current_time and current_time > 0) then
    return redis.error_reply('BAD_PARAMS current_time wrong')
  end

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND campaign not found')
  end

  if redis.call('EXISTS', message_key) ~= 1 then
    return redis.status_reply('ENTITY_NOT_FOUND message not found')
  end

  local message_expire = tonumber(redis.call('HGET', campaign_key, 'message_expire'))
  if not (message_expire and message_expire > 0) then
    return redis.error_reply('MALFORM_DATA campaign message_expire wrong')
  end

  local id = redis.call('HGET', message_key, 'id')
  if not (id and id ~= '') then
    return redis.error_reply('MALFORM_DATA message id wrong')
  end

  local created_at = tonumber(redis.call('HGET', message_key, 'created_at'))
  if not (created_at and created_at > 0) then
    return redis.error_reply('MALFORM_DATA message created_at wrong')
  end

  local is_drop = redis.call('SISMEMBER', message_drop_index_key, id) ~= 0

  if not is_drop then
    if current_time > created_at + message_expire then
      is_drop = true
    end
  end

  -- Point of no return

  if is_drop then
    redis.call('DEL', message_key)

    redis.call('ZREM', message_index_key, id)

    redis.call('ZREM', message_loop_index_key, id)

    redis.call('SREM', message_drop_index_key, id)

    return redis.status_reply('OK message cleanup')
  end

  return redis.status_reply('OK message alive')
end

redis.register_function({
  function_name = 'cleanup_message',
  callback = cleanup_message,
})

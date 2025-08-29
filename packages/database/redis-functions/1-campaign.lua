#!lua name=campaign

--[[
  Create campaign
--]]
local function create_campaign(keys, args)
  if not (#keys == 1 and #args == 17) then
    return redis.error_reply('ERR Wrong function usage')
  end

  local campaign_key = keys[1]

  local params = {
    description = args[1],
    landing_secret = args[2],
    landing_auth_path = args[3],
    landing_auth_param = args[4],
    landing_lure_param = args[5],
    session_cookie_name = args[6],
    session_expire = tonumber(args[7]),
    new_session_expire = tonumber(args[8]),
    session_limit = tonumber(args[9]),
    session_emerge_idle_time = tonumber(args[10]),
    session_emerge_limit = tonumber(args[11]),
    message_expire = tonumber(args[12]),
    message_limit = tonumber(args[13]),
    message_emerge_idle_time = tonumber(args[14]),
    message_emerge_limit = tonumber(args[15]),
    message_lock_expire = tonumber(args[16]),
    created_at = tonumber(args[17]),
  }

  if not (params.description and params.description ~= '') then
    return redis.error_reply('ERR Wrong params.description')
  end

  if not (params.landing_secret and params.landing_secret ~= '') then
    return redis.error_reply('ERR Wrong params.landing_secret')
  end

  if not (params.landing_auth_path and params.landing_auth_path ~= '') then
    return redis.error_reply('ERR Wrong params.landing_auth_path')
  end

  if not (params.landing_auth_param and params.landing_auth_param ~= '') then
    return redis.error_reply('ERR Wrong params.landing_auth_param')
  end

  if not (params.landing_lure_param and params.landing_lure_param ~= '') then
    return redis.error_reply('ERR Wrong params.landing_lure_param')
  end

  if not (params.session_cookie_name and params.session_cookie_name ~= '') then
    return redis.error_reply('ERR Wrong params.session_cookie_name')
  end

  if not (params.session_expire and params.session_expire > 0) then
    return redis.error_reply('ERR Wrong params.session_expire')
  end

  if not (params.new_session_expire and params.new_session_expire > 0) then
    return redis.error_reply('ERR Wrong params.new_session_expire')
  end

  if not (params.session_limit and params.session_limit > 0) then
    return redis.error_reply('ERR Wrong params.session_limit')
  end

  if not (params.session_emerge_idle_time and params.session_emerge_idle_time > 0) then
    return redis.error_reply('ERR Wrong params.session_emerge_idle_time')
  end

  if not (params.session_emerge_limit and params.session_emerge_limit > 0) then
    return redis.error_reply('ERR Wrong params.session_emerge_limit')
  end

  if not (params.message_expire and params.message_expire > 0) then
    return redis.error_reply('ERR Wrong params.message_expire')
  end

  if not (params.message_limit and params.message_limit > 0) then
    return redis.error_reply('ERR Wrong params.message_limit')
  end

  if not (params.message_emerge_idle_time and params.message_emerge_idle_time > 0) then
    return redis.error_reply('ERR Wrong params.message_emerge_idle_time')
  end

  if not (params.message_emerge_limit and params.message_emerge_limit > 0) then
    return redis.error_reply('ERR Wrong params.message_emerge_limit')
  end

  if not (params.message_lock_expire and params.message_lock_expire > 0) then
    return redis.error_reply('ERR Wrong params.message_lock_expire')
  end

  if not (params.created_at and params.created_at > 0) then
    return redis.error_reply('ERR Wrong params.created_at')
  end

  params.updated_at = params.created_at

  if redis.call('EXISTS', campaign_key) ~= 0 then
    return redis.status_reply('EXISTS Campaign allready exists')
  end

  -- Point of no return

  local save = {}

  for field, value in pairs(params) do
    table.insert(save, field)
    table.insert(save, value)
  end

  redis.call('HSET', campaign_key, unpack(save))

  return redis.status_reply('OK Campaign created')
end

redis.register_function({
  function_name = 'create_campaign',
  callback = create_campaign,
  description = 'Create campaign',
})

--[[
  Read campaign
--]]
local function read_campaign(keys, args)
  if not (#keys == 7 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_index_key = keys[2]
  local target_index_key = keys[3]
  local redirector_index_key = keys[4]
  local lure_index_key = keys[5]
  local session_index_key = keys[6]
  local message_index_key = keys[7]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return nil
  end

  -- stylua: ignore
  local values = redis.call(
    'HMGET', campaign_key,
    'description',
    'landing_secret',
    'landing_auth_path',
    'landing_auth_param',
    'landing_lure_param',
    'session_cookie_name',
    'session_expire',
    'new_session_expire',
    'session_limit',
    'session_emerge_idle_time',
    'session_emerge_limit',
    'message_expire',
    'message_limit',
    'message_emerge_idle_time',
    'message_emerge_limit',
    'message_lock_expire',
    'created_at',
    'updated_at'
  )

  if not (values and #values == 18) then
    return redis.error_reply('ERR Malform values')
  end

  local data = {
    description = values[1],
    landing_secret = values[2],
    landing_auth_path = values[3],
    landing_auth_param = values[4],
    landing_lure_param = values[5],
    session_cookie_name = values[6],
    session_expire = tonumber(values[7]),
    new_session_expire = tonumber(values[8]),
    session_limit = tonumber(values[9]),
    session_emerge_idle_time = tonumber(values[10]),
    session_emerge_limit = tonumber(values[11]),
    message_expire = tonumber(values[12]),
    message_limit = tonumber(values[13]),
    message_emerge_idle_time = tonumber(values[14]),
    message_emerge_limit = tonumber(values[15]),
    message_lock_expire = tonumber(values[16]),
    created_at = tonumber(values[17]),
    updated_at = tonumber(values[18]),
  }

  if not (data.description and data.description ~= '') then
    return redis.error_reply('ERR Malform data.description')
  end

  if not (data.landing_secret and data.landing_secret ~= '') then
    return redis.error_reply('ERR Malform data.landing_secret')
  end

  if not (data.landing_auth_path and data.landing_auth_path ~= '') then
    return redis.error_reply('ERR Malform data.landing_auth_path')
  end

  if not (data.landing_auth_param and data.landing_auth_param ~= '') then
    return redis.error_reply('ERR Malform data.landing_auth_param')
  end

  if not (data.landing_lure_param and data.landing_lure_param ~= '') then
    return redis.error_reply('ERR Malform data.landing_lure_param')
  end

  if not (data.session_cookie_name and data.session_cookie_name ~= '') then
    return redis.error_reply('ERR Malform data.session_cookie_name')
  end

  if not (data.session_expire and data.session_expire > 0) then
    return redis.error_reply('ERR Malform data.session_expire')
  end

  if not (data.new_session_expire and data.new_session_expire > 0) then
    return redis.error_reply('ERR Malform data.new_session_expire')
  end

  if not (data.session_limit and data.session_limit > 0) then
    return redis.error_reply('ERR Malform data.session_limit')
  end

  if not (data.session_emerge_idle_time and data.session_emerge_idle_time > 0) then
    return redis.error_reply('ERR Malform data.session_emerge_idle_time')
  end

  if not (data.session_emerge_limit and data.session_emerge_limit > 0) then
    return redis.error_reply('ERR Malform data.session_emerge_limit')
  end

  if not (data.message_expire and data.message_expire > 0) then
    return redis.error_reply('ERR Malform data.message_expire')
  end

  if not (data.message_limit and data.message_limit > 0) then
    return redis.error_reply('ERR Malform data.message_limit')
  end

  if not (data.message_emerge_idle_time and data.message_emerge_idle_time > 0) then
    return redis.error_reply('ERR Malform data.message_emerge_idle_time')
  end

  if not (data.message_emerge_limit and data.message_emerge_limit > 0) then
    return redis.error_reply('ERR Malform data.message_emerge_limit')
  end

  if not (data.message_lock_expire and data.message_lock_expire > 0) then
    return redis.error_reply('ERR Malform data.message_lock_expire')
  end

  if not (data.created_at and data.created_at > 0) then
    return redis.error_reply('ERR Malform data.created_at')
  end

  if not (data.updated_at and data.updated_at > 0) then
    return redis.error_reply('ERR Malform data.updated_at')
  end

  data.proxy_count = redis.call('ZCARD', proxy_index_key)
  data.target_count = redis.call('ZCARD', target_index_key)
  data.redirector_count = redis.call('ZCARD', redirector_index_key)
  data.lure_count = redis.call('ZCARD', lure_index_key)
  data.session_count = redis.call('ZCARD', session_index_key)
  data.message_count = redis.call('ZCARD', message_index_key)

  return { map = data }
end

redis.register_function({
  function_name = 'read_campaign',
  callback = read_campaign,
  flags = { 'no-writes' },
  description = 'Read campaign',
})

--[[
  Update campaign
--]]
local function update_campaign(keys, args)
  if not (#keys == 1 and #args >= 2 and #args % 2 == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]

  local params = {}

  for i = 1, #args, 2 do
    local field, value = args[i], args[i + 1]

    if params[field] then
      return redis.error_reply('ERR Params duplicate field')
    end

    if field == 'description' then
      params.description = value

      if not (params.description and params.description ~= '') then
        return redis.error_reply('ERR Wrong params.description')
      end
    elseif field == 'session_expire' then
      params.session_expire = tonumber(value)

      if not (params.session_expire and params.session_expire > 0) then
        return redis.error_reply('ERR Wrong params.session_expire')
      end
    elseif field == 'new_session_expire' then
      params.new_session_expire = tonumber(value)

      if not (params.new_session_expire and params.new_session_expire > 0) then
        return redis.error_reply('ERR Wrong params.new_session_expire')
      end
    elseif field == 'session_limit' then
      params.session_limit = tonumber(value)

      if not (params.session_limit and params.session_limit > 0) then
        return redis.error_reply('ERR Wrong params.session_limit')
      end
    elseif field == 'session_emerge_idle_time' then
      params.session_emerge_idle_time = tonumber(value)

      if not (params.session_emerge_idle_time and params.session_emerge_idle_time > 0) then
        return redis.error_reply('ERR Wrong params.session_emerge_idle_time')
      end
    elseif field == 'session_emerge_limit' then
      params.session_emerge_limit = tonumber(value)

      if not (params.session_emerge_limit and params.session_emerge_limit > 0) then
        return redis.error_reply('ERR Wrong params.session_emerge_limit')
      end
    elseif field == 'message_expire' then
      params.message_expire = tonumber(value)

      if not (params.message_expire and params.message_expire > 0) then
        return redis.error_reply('ERR Wrong params.message_expire')
      end
    elseif field == 'message_limit' then
      params.message_limit = tonumber(value)

      if not (params.message_limit and params.message_limit > 0) then
        return redis.error_reply('ERR Wrong params.message_limit')
      end
    elseif field == 'message_emerge_idle_time' then
      params.message_emerge_idle_time = tonumber(value)

      if not (params.message_emerge_idle_time and params.message_emerge_idle_time > 0) then
        return redis.error_reply('ERR Wrong params.message_emerge_idle_time')
      end
    elseif field == 'message_emerge_limit' then
      params.message_emerge_limit = tonumber(value)

      if not (params.message_emerge_limit and params.message_emerge_limit > 0) then
        return redis.error_reply('ERR Wrong params.message_emerge_limit')
      end
    elseif field == 'message_lock_expire' then
      params.message_lock_expire = tonumber(value)

      if not (params.message_lock_expire and params.message_lock_expire > 0) then
        return redis.error_reply('ERR Wrong params.message_lock_expire')
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

  -- Point of no return

  local save = {}

  for field, value in pairs(params) do
    table.insert(save, field)
    table.insert(save, value)
  end

  redis.call('HSET', campaign_key, unpack(save))

  return redis.status_reply('OK Campaign updated')
end

redis.register_function({
  function_name = 'update_campaign',
  callback = update_campaign,
  description = 'Update campaign',
})

--[[
  Delete campaign
--]]
local function delete_campaign(keys, args)
  if not (#keys == 7 and #args == 0) then
    return redis.error_reply('ERR Wrong function use')
  end

  local campaign_key = keys[1]
  local proxy_index_key = keys[2]
  local target_index_key = keys[3]
  local redirector_index_key = keys[4]
  local lure_index_key = keys[5]
  local session_index_key = keys[6]
  local message_index_key = keys[7]

  if redis.call('EXISTS', campaign_key) ~= 1 then
    return redis.status_reply('NOT_FOUND Campaign not found')
  end

  local data = {}

  data.proxy_count = redis.call('ZCARD', proxy_index_key)
  data.target_count = redis.call('ZCARD', target_index_key)
  data.redirector_count = redis.call('ZCARD', redirector_index_key)
  data.lure_count = redis.call('ZCARD', lure_index_key)
  data.session_count = redis.call('ZCARD', session_index_key)
  data.message_count = redis.call('ZCARD', message_index_key)

  if data.proxy_count ~= 0 then
    return redis.status_reply('FROZEN Campaign proxies exists')
  end

  if data.target_count ~= 0 then
    return redis.status_reply('FROZEN Campaign targets exists')
  end

  if data.redirector_count ~= 0 then
    return redis.status_reply('FROZEN Campaign redirectors exists')
  end

  if data.lure_count ~= 0 then
    return redis.status_reply('FROZEN Campaign lures exists')
  end

  if data.session_count ~= 0 then
    return redis.status_reply('FROZEN Campaign sessions exists')
  end

  if data.message_count ~= 0 then
    return redis.status_reply('FROZEN Campaign messages exists')
  end

  -- Point of no return

  redis.call('DEL', campaign_key)

  return redis.status_reply('OK Campaign deleted')
end

redis.register_function({
  function_name = 'delete_campaign',
  callback = delete_campaign,
  description = 'Delete campaign',
})

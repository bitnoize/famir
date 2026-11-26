--
-- Helpers
--

local function current_time()
  local t = redis.call('TIME')

  return tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
end

local function coerce(value, spec)
  if not value then
    return nil, spec.name .. ' missing'
  end

  if type(value) ~= 'string' then
    return nil, spec.name .. ' malform'
  end

  if spec.kind == 'any' then
    return value
  elseif spec.kind == 'str' then
    if value == '' then
      return nil, spec.name .. ' empty string'
    end

    return value
  elseif spec.kind == 'num' then
    local n = tonumber(value)

    if not n or n ~= n or n == math.huge or n == -math.huge then
      return nil, spec.name .. ' not a number'
    end

    if spec.min and n < spec.min then
      return nil, spec.name .. ' below min'
    end

    if spec.max and n > spec.max then
      return nil, spec.name .. ' above max'
    end

    return n
  elseif spec.kind == 'int' then
    local n = tonumber(value)

    if not n or n ~= n or n == math.huge or n == -math.huge or n ~= math.floor(n) then
      return nil, spec.name .. ' not an integer'
    end

    if spec.min and n < spec.min then
      return nil, spec.name .. ' below min'
    end

    if spec.max and n > spec.max then
      return nil, spec.name .. ' above max'
    end

    return n
  end

  return nil, spec.name .. ' unknown kind'
end

local function normalize(values, specs)
  if #values ~= #specs then
    return nil, 'wrong number of values'
  end

  local out = {}

  for i, spec in ipairs(specs) do
    local value, err = coerce(values[i], spec)

    if err then
      return nil, err
    end

    if value == nil then
      return nil, 'coerce internal error'
    end

    out[spec.name] = value
  end

  return out
end



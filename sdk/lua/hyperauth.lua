local HyperAuth = {}
HyperAuth.__index = HyperAuth

function HyperAuth.new(appId, secret, version)
    local self = setmetatable({}, HyperAuth)
    self.appId = appId
    self.secret = secret
    self.version = version
    self.sessionId = nil
    self.tempKey = nil
    self.initialized = false
    return self
end

function self_sendPostRequest(endpoint, data)
    print("[SDK Lua Debug] POST to " .. endpoint .. " with: " .. data)
    return "{\"success\":true,\"payload\":\"mocked_response\"}"
end

function HyperAuth:init()
    local payload = "{\"appId\":\"" .. self.appId .. "\"}"
    local response = self_sendPostRequest("/api/client/handshake", payload)
    
    if response:find("\"success\":true") then
        self.sessionId = "MOCK-SESSION-LUA"
        self.tempKey = "MOCK-KEY-LUA"
        self.initialized = true
        return true
    end
    return false
end

function HyperAuth:login(username, password, hwid)
    if not self.initialized then
        error("SDK is not initialized. Run init() first.")
    end
    
    local payload = "{\"appId\":\"" .. self.appId .. "\",\"payload\":\"encrypted_aes_payload\"}"
    local response = self_sendPostRequest("/api/client/login", payload)
    
    return response:find("\"success\":true") ~= nil
end

return HyperAuth

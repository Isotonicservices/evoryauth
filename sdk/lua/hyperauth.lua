local HyperAuth = {}
HyperAuth.__index = HyperAuth

function HyperAuth.new(appId, secret, baseUrl)
    local self = setmetatable({}, HyperAuth)
    self.appId = appId
    self.secret = secret
    self.baseUrl = baseUrl or "https://www.hyperion.buzz/api/client"
    self.sessionId = nil
    self.tempKey = nil
    self.initialized = false
    self.licenseInfo = {}
    return self
end

function HyperAuth:authenticate(licenseKey, hwid)
    local http = require("socket.http")
    local ltn12 = require("ltn12")
    local json = require("dkjson")
    
    local requestBody = json.encode({
        appId = self.appId,
        appSecret = self.secret,
        licenseKey = licenseKey,
        hwid = hwid
    })
    
    local response_body = {}
    local res, code, response_headers, status = http.request{
        url = self.baseUrl .. "/authenticate",
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = #requestBody
        },
        source = ltn12.source.string(requestBody),
        sink = ltn12.sink.table(response_body)
    }
    
    if code == 200 then
        local response_text = table.concat(response_body)
        local data, pos, err = json.decode(response_text, 1, nil)
        
        if data and data.success then
            self.licenseInfo = data.user or {}
            return true, "License verified successfully!"
        else
            return false, data and data.error or "Invalid license key"
        end
    else
        return false, "Connection error: " .. (code or "unknown")
    end
end

function HyperAuth:registerUser(username, password, licenseKey, hwid)
    local http = require("socket.http")
    local ltn12 = require("ltn12")
    local json = require("dkjson")
    
    local requestBody = json.encode({
        appId = self.appId,
        payload = "encrypted_payload_placeholder"
    })
    
    local response_body = {}
    local res, code, response_headers, status = http.request{
        url = self.baseUrl .. "/register",
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = #requestBody
        },
        source = ltn12.source.string(requestBody),
        sink = ltn12.sink.table(response_body)
    }
    
    if code == 200 then
        local response_text = table.concat(response_body)
        local data, pos, err = json.decode(response_text, 1, nil)
        
        if data and data.success then
            return true, "User registered successfully!"
        else
            return false, data and data.error or "Registration failed"
        end
    else
        return false, "Connection error: " .. (code or "unknown")
    end
end

function HyperAuth:loginUser(username, password, hwid)
    local http = require("socket.http")
    local ltn12 = require("ltn12")
    local json = require("dkjson")
    
    local requestBody = json.encode({
        appId = self.appId,
        payload = "encrypted_payload_placeholder"
    })
    
    local response_body = {}
    local res, code, response_headers, status = http.request{
        url = self.baseUrl .. "/login",
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = #requestBody
        },
        source = ltn12.source.string(requestBody),
        sink = ltn12.sink.table(response_body)
    }
    
    if code == 200 then
        local response_text = table.concat(response_body)
        local data, pos, err = json.decode(response_text, 1, nil)
        
        if data and data.success then
            return true, "Login successful!"
        else
            return false, data and data.error or "Login failed"
        end
    else
        return false, "Connection error: " .. (code or "unknown")
    end
end

function HyperAuth:activate(licenseKey, hwid)
    local http = require("socket.http")
    local ltn12 = require("ltn12")
    local json = require("dkjson")
    
    local requestBody = json.encode({
        appId = self.appId,
        payload = "encrypted_payload_placeholder"
    })
    
    local response_body = {}
    local res, code, response_headers, status = http.request{
        url = self.baseUrl .. "/activate",
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = #requestBody
        },
        source = ltn12.source.string(requestBody),
        sink = ltn12.sink.table(response_body)
    }
    
    if code == 200 then
        local response_text = table.concat(response_body)
        local data, pos, err = json.decode(response_text, 1, nil)
        
        if data and data.success then
            return true, "License activated successfully!"
        else
            return false, data and data.error or "Activation failed"
        end
    else
        return false, "Connection error: " .. (code or "unknown")
    end
end

return HyperAuth

#pragma once

#include <string>
#include <iostream>
#include <sstream>

class EvoryAuth {
private:
    std::string appId;
    std::string secret;
    std::string version;
    std::string sessionId;
    std::string tempKey;
    bool initialized;

    // Simulated HTTP request helper (normally relies on libcurl / WinInet)
    std::string sendPostRequest(const std::string& endpoint, const std::string& jsonPayload) {
        // Output for debugging simulation
        std::cout << "[SDK Debug] POST to " << endpoint << " with: " << jsonPayload << std::endl;
        
        // Mock successful handshakes/logins for testing
        if (endpoint.find("handshake") != std::string::npos) {
            return "{\"success\":true,\"payload\":\"mocked_encrypted_session_payload\"}";
        }
        return "{\"success\":true,\"payload\":\"mocked_action_response\"}";
    }

public:
    EvoryAuth(const std::string& appNameId, const std::string& appSecret, const std::string& appVersion)
        : appId(appNameId), secret(appSecret), version(appVersion), initialized(false) {}

    bool init() {
        std::string payload = "{\"appId\":\"" + appId + "\"}";
        std::string response = sendPostRequest("/api/client/handshake", payload);
        
        if (response.find("\"success\":true") != std::string::npos) {
            this->sessionId = "MOCK-SESSION-123";
            this->tempKey = "MOCK-KEY-ABC";
            this->initialized = true;
            return true;
        }
        return false;
    }

    bool login(const std::string& username, const std::string& password, const std::string& hwid = "MOCK_HWID_FINGERPRINT") {
        if (!initialized) {
            std::cerr << "[-] SDK not initialized. Call init() first." << std::endl;
            return false;
        }

        std::string rawPayload = "{\"username\":\"" + username + "\",\"password\":\"" + password + "\",\"hwid\":\"" + hwid + "\"}";
        // AES-256 encryption happens here using tempKey prior to request.
        std::string encryptedPayload = "encrypted_aes_payload";

        std::string request = "{\"appId\":\"" + appId + "\",\"payload\":\"" + encryptedPayload + "\"}";
        std::string response = sendPostRequest("/api/client/login", request);

        return response.find("\"success\":true") != std::string::npos;
    }

    bool registerUser(const std::string& username, const std::string& password, const std::string& licenseKey, const std::string& hwid = "MOCK_HWID_FINGERPRINT") {
        if (!initialized) return false;

        std::string rawPayload = "{\"username\":\"" + username + "\",\"password\":\"" + password + "\",\"licenseKey\":\"" + licenseKey + "\",\"hwid\":\"" + hwid + "\"}";
        std::string request = "{\"appId\":\"" + appId + "\",\"payload\":\"encrypted_aes_payload\"}";
        std::string response = sendPostRequest("/api/client/register", request);

        return response.find("\"success\":true") != std::string::npos;
    }

    bool activateLicense(const std::string& licenseKey, const std::string& hwid = "MOCK_HWID_FINGERPRINT") {
        if (!initialized) return false;

        std::string rawPayload = "{\"key\":\"" + licenseKey + "\",\"hwid\":\"" + hwid + "\"}";
        std::string request = "{\"appId\":\"" + appId + "\",\"payload\":\"encrypted_aes_payload\"}";
        std::string response = sendPostRequest("/api/client/activate", request);

        return response.find("\"success\":true") != std::string::npos;
    }
};

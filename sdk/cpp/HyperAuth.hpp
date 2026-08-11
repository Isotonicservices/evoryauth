#pragma once

#include <string>
#include <iostream>
#include <sstream>
#include <curl/curl.h>

class HyperAuth {
private:
    std::string appId;
    std::string secret;
    std::string baseUrl;
    std::string sessionId;
    std::string tempKey;
    bool initialized;

    static size_t WriteCallback(void* contents, size_t size, size_t nmemb, void* userp) {
        ((std::string*)userp)->append((char*)contents, size * nmemb);
        return size * nmemb;
    }

    std::string sendPostRequest(const std::string& endpoint, const std::string& jsonPayload) {
        CURL* curl;
        CURLcode res;
        std::string readBuffer;
        std::string url = baseUrl + endpoint;

        curl = curl_easy_init();
        if(curl) {
            struct curl_slist* headers = NULL;
            headers = curl_slist_append(headers, "Content-Type: application/json");
            
            curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonPayload.c_str());
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
            
            res = curl_easy_perform(curl);
            
            curl_slist_free_all(headers);
            curl_easy_cleanup(curl);
        }
        return readBuffer;
    }

public:
    HyperAuth(const std::string& appNameId, const std::string& appSecret, const std::string& baseUrl = "https://www.hyperion.buzz/api/client")
        : appId(appNameId), secret(appSecret), baseUrl(baseUrl), initialized(false) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
    }

    ~HyperAuth() {
        curl_global_cleanup();
    }

    std::pair<bool, std::string> authenticate(const std::string& licenseKey, const std::string& hwid = "") {
        std::string jsonPayload = "{\"appId\":\"" + appId + "\",\"appSecret\":\"" + secret + "\",\"licenseKey\":\"" + licenseKey + "\",\"hwid\":\"" + hwid + "\"}";
        std::string response = sendPostRequest("/authenticate", jsonPayload);
        
        if (response.find("\"success\":true") != std::string::npos) {
            return {true, "License verified successfully!"};
        } else {
            return {false, "Invalid license key"};
        }
    }

    std::pair<bool, std::string> registerUser(const std::string& username, const std::string& password, const std::string& licenseKey, const std::string& hwid = "") {
        std::string jsonPayload = "{\"appId\":\"" + appId + "\",\"payload\":\"encrypted_payload_placeholder\"}";
        std::string response = sendPostRequest("/register", jsonPayload);

        if (response.find("\"success\":true") != std::string::npos) {
            return {true, "User registered successfully!"};
        } else {
            return {false, "Registration failed"};
        }
    }

    std::pair<bool, std::string> loginUser(const std::string& username, const std::string& password, const std::string& hwid = "") {
        std::string jsonPayload = "{\"appId\":\"" + appId + "\",\"payload\":\"encrypted_payload_placeholder\"}";
        std::string response = sendPostRequest("/login", jsonPayload);

        if (response.find("\"success\":true") != std::string::npos) {
            return {true, "Login successful!"};
        } else {
            return {false, "Login failed"};
        }
    }

    std::pair<bool, std::string> activateLicense(const std::string& licenseKey, const std::string& hwid = "") {
        std::string jsonPayload = "{\"appId\":\"" + appId + "\",\"payload\":\"encrypted_payload_placeholder\"}";
        std::string response = sendPostRequest("/activate", jsonPayload);

        if (response.find("\"success\":true") != std::string::npos) {
            return {true, "License activated successfully!"};
        } else {
            return {false, "Activation failed"};
        }
    }
};

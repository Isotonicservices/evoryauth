using System;
using System.Text;
using System.Security.Cryptography;

namespace HyperAuthSDK
{
    public class HyperAuth
    {
        private readonly string appId;
        private readonly string secret;
        private readonly string version;
        private string sessionId;
        private string tempKey;
        private bool initialized;

        public HyperAuth(string appNameId, string appSecret, string appVersion)
        {
            appId = appNameId;
            secret = appSecret;
            version = appVersion;
            initialized = false;
        }

        private string SendPostRequest(string endpoint, string jsonPayload)
        {
            // Simulate Web API calls
            Console.WriteLine($"[SDK C# Debug] POST to {endpoint} with: {jsonPayload}");
            return "{\"success\":true,\"payload\":\"mocked_action_response\"}";
        }

        public bool Init()
        {
            string payload = $"{{\"appId\":\"{appId}\"}}";
            string response = SendPostRequest("/api/client/handshake", payload);
            
            if (response.Contains("\"success\":true"))
            {
                sessionId = "MOCK-SESSION-C#";
                tempKey = "MOCK-KEY-C#";
                initialized = true;
                return true;
            }
            return false;
        }

        public bool Login(string username, string password, string hwid = "MOCK_CSHARP_HWID")
        {
            if (!initialized) throw new InvalidOperationException("SDK is not initialized. Run Init() first.");

            string rawPayload = $"{{\"username\":\"{username}\",\"password\":\"{password}\",\"hwid\":\"{hwid}\"}}";
            string request = $"{{\"appId\":\"{appId}\",\"payload\":\"encrypted_aes_payload\"}}";
            string response = SendPostRequest("/api/client/login", request);

            return response.Contains("\"success\":true");
        }

        public bool Register(string username, string password, string licenseKey, string hwid = "MOCK_CSHARP_HWID")
        {
            if (!initialized) return false;

            string request = $"{{\"appId\":\"{appId}\",\"payload\":\"encrypted_aes_payload\"}}";
            string response = SendPostRequest("/api/client/register", request);

            return response.Contains("\"success\":true");
        }

        public bool Activate(string licenseKey, string hwid = "MOCK_CSHARP_HWID")
        {
            if (!initialized) return false;

            string request = $"{{\"appId\":\"{appId}\",\"payload\":\"encrypted_aes_payload\"}}";
            string response = SendPostRequest("/api/client/activate", request);

            return response.Contains("\"success\":true");
        }
    }
}

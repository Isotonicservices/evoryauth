using System;
using System.Text;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace HyperAuthSDK
{
    public class HyperAuth
    {
        private readonly string appId;
        private readonly string secret;
        private readonly string baseUrl;
        private string sessionId;
        private string tempKey;
        private bool initialized;
        private static readonly HttpClient httpClient = new HttpClient();

        public HyperAuth(string appNameId, string appSecret, string baseUrl = "https://www.hyperion.buzz/api/client")
        {
            appId = appNameId;
            secret = appSecret;
            this.baseUrl = baseUrl;
            initialized = false;
        }

        private async Task<string> SendPostRequestAsync(string endpoint, string jsonPayload)
        {
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync(baseUrl + endpoint, content);
            return await response.Content.ReadAsStringAsync();
        }

        public async Task<(bool success, string message)> AuthenticateAsync(string licenseKey, string hwid = null)
        {
            try
            {
                var payload = new
                {
                    appId = appId,
                    appSecret = secret,
                    licenseKey = licenseKey,
                    hwid = hwid
                };
                string jsonPayload = JsonConvert.SerializeObject(payload);
                string response = await SendPostRequestAsync("/authenticate", jsonPayload);

                dynamic result = JsonConvert.DeserializeObject(response);
                if (result.success == true)
                {
                    return (true, "License verified successfully!");
                }
                else
                {
                    return (false, result.error?.ToString() ?? "Invalid license key");
                }
            }
            catch (Exception ex)
            {
                return (false, $"Connection error: {ex.Message}");
            }
        }

        public async Task<(bool success, string message)> RegisterUserAsync(string username, string password, string licenseKey, string hwid = null)
        {
            try
            {
                var payload = new
                {
                    appId = appId,
                    payload = "encrypted_payload_placeholder"
                };
                string jsonPayload = JsonConvert.SerializeObject(payload);
                string response = await SendPostRequestAsync("/register", jsonPayload);

                dynamic result = JsonConvert.DeserializeObject(response);
                if (result.success == true)
                {
                    return (true, "User registered successfully!");
                }
                else
                {
                    return (false, result.error?.ToString() ?? "Registration failed");
                }
            }
            catch (Exception ex)
            {
                return (false, $"Connection error: {ex.Message}");
            }
        }

        public async Task<(bool success, string message)> LoginUserAsync(string username, string password, string hwid = null)
        {
            try
            {
                var payload = new
                {
                    appId = appId,
                    payload = "encrypted_payload_placeholder"
                };
                string jsonPayload = JsonConvert.SerializeObject(payload);
                string response = await SendPostRequestAsync("/login", jsonPayload);

                dynamic result = JsonConvert.DeserializeObject(response);
                if (result.success == true)
                {
                    return (true, "Login successful!");
                }
                else
                {
                    return (false, result.error?.ToString() ?? "Login failed");
                }
            }
            catch (Exception ex)
            {
                return (false, $"Connection error: {ex.Message}");
            }
        }

        public async Task<(bool success, string message)> ActivateLicenseAsync(string licenseKey, string hwid = null)
        {
            try
            {
                var payload = new
                {
                    appId = appId,
                    payload = "encrypted_payload_placeholder"
                };
                string jsonPayload = JsonConvert.SerializeObject(payload);
                string response = await SendPostRequestAsync("/activate", jsonPayload);

                dynamic result = JsonConvert.DeserializeObject(response);
                if (result.success == true)
                {
                    return (true, "License activated successfully!");
                }
                else
                {
                    return (false, result.error?.ToString() ?? "Activation failed");
                }
            }
            catch (Exception ex)
            {
                return (false, $"Connection error: {ex.Message}");
            }
        }
    }
}

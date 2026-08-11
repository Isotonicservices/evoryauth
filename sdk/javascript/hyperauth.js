class HyperAuth {
  constructor(appId, secret, baseUrl = "https://www.hyperion.buzz/api/client") {
    this.appId = appId;
    this.secret = secret;
    this.baseUrl = baseUrl;
    this.sessionId = null;
    this.tempKey = null;
    this.initialized = false;
  }

  async _sendPostRequest(endpoint, data) {
    try {
      const response = await fetch(this.baseUrl + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: `Connection error: ${error.message}` };
    }
  }

  async authenticate(licenseKey, hwid = null) {
    const data = {
      appId: this.appId,
      appSecret: this.secret,
      licenseKey: licenseKey,
      hwid: hwid
    };
    const response = await this._sendPostRequest("/authenticate", data);
    
    if (response.success) {
      return [true, "License verified successfully!"];
    } else {
      return [false, response.error || "Invalid license key"];
    }
  }

  async registerUser(username, password, licenseKey, hwid = null) {
    const data = {
      appId: this.appId,
      payload: "encrypted_payload_placeholder"
    };
    const response = await this._sendPostRequest("/register", data);
    
    if (response.success) {
      return [true, "User registered successfully!"];
    } else {
      return [false, response.error || "Registration failed"];
    }
  }

  async loginUser(username, password, hwid = null) {
    const data = {
      appId: this.appId,
      payload: "encrypted_payload_placeholder"
    };
    const response = await this._sendPostRequest("/login", data);
    
    if (response.success) {
      return [true, "Login successful!"];
    } else {
      return [false, response.error || "Login failed"];
    }
  }

  async activateLicense(licenseKey, hwid = null) {
    const data = {
      appId: this.appId,
      payload: "encrypted_payload_placeholder"
    };
    const response = await this._sendPostRequest("/activate", data);
    
    if (response.success) {
      return [true, "License activated successfully!"];
    } else {
      return [false, response.error || "Activation failed"];
    }
  }
}

module.exports = { HyperAuth };

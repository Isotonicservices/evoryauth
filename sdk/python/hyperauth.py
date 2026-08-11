import json
import hashlib
import requests

class HyperAuth:
    def __init__(self, app_id: str, secret: str, base_url: str = "https://www.hyperion.buzz/api/client"):
        self.app_id = app_id
        self.secret = secret
        self.base_url = base_url
        self.session_id = None
        self.temp_key = None
        self.initialized = False
        self.license_info = {}

    def authenticate(self, license_key: str, hwid: str = None) -> tuple[bool, str]:
        try:
            response = requests.post(
                f"{self.base_url}/authenticate",
                json={
                    "appId": self.app_id,
                    "appSecret": self.secret,
                    "licenseKey": license_key,
                    "hwid": hwid
                },
                timeout=10
            )
            data = response.json()
            
            if data.get("success"):
                self.license_info = data.get("user", {})
                return True, "License verified successfully!"
            else:
                return False, data.get("error", "Invalid license key")
                
        except requests.exceptions.RequestException as e:
            return False, f"Connection error: {str(e)}"
        except Exception as e:
            return False, f"Authentication error: {str(e)}"

    def register_user(self, username: str, password: str, license_key: str, hwid: str = None) -> tuple[bool, str]:
        try:
            response = requests.post(
                f"{self.base_url}/register",
                json={
                    "appId": self.app_id,
                    "payload": "encrypted_payload_placeholder"
                },
                timeout=10
            )
            data = response.json()
            if data.get("success"):
                return True, "User registered successfully!"
            else:
                return False, data.get("error", "Registration failed")
                
        except Exception as e:
            return False, f"Registration error: {str(e)}"

    def login_user(self, username: str, password: str, hwid: str = None) -> tuple[bool, str]:
        try:
            response = requests.post(
                f"{self.base_url}/login",
                json={
                    "appId": self.app_id,
                    "payload": "encrypted_payload_placeholder"
                },
                timeout=10
            )
            data = response.json()
            if data.get("success"):
                return True, "Login successful!"
            else:
                return False, data.get("error", "Login failed")
                
        except Exception as e:
            return False, f"Login error: {str(e)}"

    def activate(self, license_key: str, hwid: str = None) -> tuple[bool, str]:
        try:
            response = requests.post(
                f"{self.base_url}/activate",
                json={
                    "appId": self.app_id,
                    "payload": "encrypted_payload_placeholder"
                },
                timeout=10
            )
            data = response.json()
            if data.get("success"):
                return True, "License activated successfully!"
            else:
                return False, data.get("error", "Activation failed")
                
        except Exception as e:
            return False, f"Activation error: {str(e)}"
"


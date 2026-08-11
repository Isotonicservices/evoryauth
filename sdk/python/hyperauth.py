import json
import hashlib

class HyperAuth:
    def __init__(self, app_id: str, secret: str, version: str):
        self.app_id = app_id
        self.secret = secret
        self.version = version
        self.session_id = None
        self.temp_key = None
        self.initialized = False
        self.license_info = {}

    def _send_post_request(self, endpoint: str, data: dict) -> dict:
        # Simulate network request
        print(f"[SDK Python Debug] POST to {endpoint} with: {json.dumps(data)}")
        return {"success": True, "payload": "mocked_payload_response"}

    def init(self) -> bool:
        response = self._send_post_request("/api/client/handshake", {"appId": self.app_id})
        if response.get("success"):
            self.session_id = "MOCK-SESSION-PY"
            self.temp_key = "MOCK-KEY-PY"
            self.initialized = True
            return True
        return False

    def login(self, username: str, password: str, hwid: str = "MOCK_PYTHON_HWID") -> bool:
        if not self.initialized:
            raise Exception("SDK not initialized. Run init() first.")
            
        payload = {"username": username, "password": password, "hwid": hwid}
        request = {
            "appId": self.app_id,
            "payload": "encrypted_aes_payload"
        }
        response = self._send_post_request("/api/client/login", request)
        if response.get("success"):
            self.license_info = {"expiresAt": "Lifetime"}
            return True
        return False

    def register(self, username: str, password: str, license_key: str, hwid: str = "MOCK_PYTHON_HWID") -> bool:
        if not self.initialized:
            return False
            
        request = {
            "appId": self.app_id,
            "payload": "encrypted_aes_payload"
        }
        response = self._send_post_request("/api/client/register", request)
        return response.get("success")

    def activate(self, license_key: str, hwid: str = "MOCK_PYTHON_HWID") -> bool:
        if not self.initialized:
            return False
            
        request = {
            "appId": self.app_id,
            "payload": "encrypted_aes_payload"
        }
        response = self._send_post_request("/api/client/activate", request)
        return response.get("success")

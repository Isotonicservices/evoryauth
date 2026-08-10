#pragma once
#include <Windows.h>
#include <iostream>
#include <vector>
#include <fstream>
#include <string>
#define CURL_STATICLIB
#include <curl/curl.h>

#pragma comment(lib, "libcurl.lib")
#pragma comment(lib, "Ws2_32.lib")
#pragma comment(lib, "Wldap32.lib")
#pragma comment(lib, "Crypt32.lib")
#pragma comment(lib, "Normaliz.lib")
#pragma comment(lib, "Advapi32.lib")
#pragma comment(lib, "User32.lib")

struct channel_struct
{
	std::string author;
	std::string message;
	std::string timestamp;
};

namespace KeyAuth {
	
	inline size_t write_cb(void* contents, size_t size, size_t nmemb, void* userp) {
		((std::string*)userp)->append((char*)contents, size * nmemb);
		return size * nmemb;
	}

	inline std::string get_hwid() {
		HW_PROFILE_INFOA hwProfileInfo;
		if (GetCurrentHwProfileA(&hwProfileInfo)) {
			return hwProfileInfo.szHwProfileGuid;
		}
		return "unknown-hwid";
	}

	class api {
	public:

		std::string name, ownerid, secret, version, url, path;
		static bool debug;

		api(std::string name, std::string ownerid, std::string secret, std::string version, std::string url, std::string path, bool debugParameter = false)
			: name(name), ownerid(ownerid), secret(secret), version(version), url(url), path(path)
		{
			debug = debugParameter;
		}

		class subscriptions_class {
		public:
			std::string name;
			std::string expiry;
		};

		class userdata {
		public:
			std::string username;
			std::string ip;
			std::string hwid;
			std::string createdate;
			std::string lastlogin;
			std::vector<subscriptions_class> subscriptions;
		};

		class appdata {
		public:
			std::string numUsers;
			std::string numOnlineUsers;
			std::string numKeys;
			std::string version;
			std::string customerPanelLink;
			std::string downloadLink;
		};

		class responsedata {
		public:
			std::vector<channel_struct> channeldata;
			bool success{};
			std::string message;
			bool isPaid{};
		};

		class Tfa {
		public:
			std::string secret;
			std::string link;
		};

		userdata user_data;
		appdata app_data;
		responsedata response;
		Tfa tfa;

		inline void ban(std::string reason = "") {}
		
		inline void init() {
			response.success = true;
			response.message = "Initialized";
		}
		
		inline void check(bool check_paid = false) {}
		
		inline void log(std::string msg) {}
		
		inline void license(std::string key, std::string code = "") {
			std::string hwid_str = get_hwid();
			
			std::string json_body = "{"
				"\"key\":\"" + key + "\","
				"\"hwid\":\"" + hwid_str + "\","
				"\"ip\":\"127.0.0.1\","
				"\"name\":\"" + this->name + "\","
				"\"ownerid\":\"" + this->ownerid + "\","
				"\"secret\":\"" + this->secret + "\","
				"\"version\":\"" + this->version + "\""
				"}";
			
			std::string readBuffer;
			CURL* curl = curl_easy_init();
			if (curl) {
				std::string full_url = this->url;
				if (full_url.back() == '/') full_url.pop_back();
				
				std::string endpoint;
				if (full_url.find("/api") != std::string::npos) {
					size_t api_pos = full_url.find("/api");
					endpoint = full_url.substr(0, api_pos) + "/api/license/validate";
				} else {
					endpoint = full_url + "/api/license/validate";
				}
				
				struct curl_slist* headers = NULL;
				headers = curl_slist_append(headers, "Content-Type: application/json");
				
				curl_easy_setopt(curl, CURLOPT_URL, endpoint.c_str());
				curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
				curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_body.c_str());
				curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_cb);
				curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
				curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);
				curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
				curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
				
				CURLcode res = curl_easy_perform(curl);
				curl_easy_cleanup(curl);
				curl_slist_free_all(headers);
			}
			
			if (readBuffer.find("\"success\":true") != std::string::npos) {
				response.success = true;
				response.message = "Logged in!";
				
				user_data.username = key;
				user_data.hwid = hwid_str;
				
				std::string sub_name = "unlock";
				size_t sub_pos = readBuffer.find("\"name\":\"");
				if (sub_pos != std::string::npos) {
					size_t start = sub_pos + 8;
					size_t end = readBuffer.find("\"", start);
					sub_name = readBuffer.substr(start, end - start);
				}
				
				std::string sub_expiry = "lifetime";
				size_t exp_pos = readBuffer.find("\"expiry\":\"");
				if (exp_pos != std::string::npos) {
					size_t start = exp_pos + 10;
					size_t end = readBuffer.find("\"", start);
					sub_expiry = readBuffer.substr(start, end - start);
				}
				
				subscriptions_class sub;
				sub.name = sub_name;
				sub.expiry = sub_expiry;
				
				user_data.subscriptions.clear();
				user_data.subscriptions.push_back(sub);
			} else {
				response.success = false;
				size_t err_pos = readBuffer.find("\"error\":\"");
				if (err_pos != std::string::npos) {
					size_t start = err_pos + 9;
					size_t end = readBuffer.find("\"", start);
					response.message = readBuffer.substr(start, end - start);
				} else {
					response.message = "Key Invalid Or HWID Mismatched";
				}
			}
		}
		
		inline std::string var(std::string varid) { return ""; }
		inline std::string webhook(std::string id, std::string params, std::string body = "", std::string contenttype = "") { return ""; }
		inline void setvar(std::string var, std::string vardata) {}
		inline std::string getvar(std::string var) { return ""; }
		inline bool checkblack() { return false; }
		inline void web_login() {}
		inline void button(std::string value) {}
		inline void upgrade(std::string username, std::string key) {}
		inline void login(std::string username, std::string password, std::string code = "") {}
		
		inline std::vector<unsigned char> download(std::string fileid, std::string license_key) {
			std::string hwid_str = get_hwid();
			
			std::string json_body = "{"
				"\"key\":\"" + license_key + "\","
				"\"hwid\":\"" + hwid_str + "\","
				"\"ip\":\"127.0.0.1\","
				"\"fileId\":\"" + fileid + "\","
				"\"name\":\"" + this->name + "\","
				"\"ownerid\":\"" + this->ownerid + "\","
				"\"secret\":\"" + this->secret + "\","
				"\"version\":\"" + this->version + "\""
				"}";
			
			std::string readBuffer;
			CURL* curl = curl_easy_init();
			if (curl) {
				std::string full_url = this->url;
				if (full_url.back() == '/') full_url.pop_back();
				
				std::string endpoint;
				if (full_url.find("/api") != std::string::npos) {
					size_t api_pos = full_url.find("/api");
					endpoint = full_url.substr(0, api_pos) + "/api/license/download";
				} else {
					endpoint = full_url + "/api/license/download";
				}
				
				struct curl_slist* headers = NULL;
				headers = curl_slist_append(headers, "Content-Type: application/json");
				
				curl_easy_setopt(curl, CURLOPT_URL, endpoint.c_str());
				curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
				curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_body.c_str());
				curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_cb);
				curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
				curl_easy_setopt(curl, CURLOPT_TIMEOUT, 60L);
				curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0L);
				curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, 0L);
				
				CURLcode res = curl_easy_perform(curl);
				curl_easy_cleanup(curl);
				curl_slist_free_all(headers);
			}
			
			std::vector<unsigned char> file_data(readBuffer.begin(), readBuffer.end());
			return file_data;
		}
		
		inline void regstr(std::string username, std::string password, std::string key, std::string email = "") {}
		inline void chatget(std::string channel) {}
		inline bool chatsend(std::string message, std::string channel) { return true; }
		inline void changeUsername(std::string newusername) {}
		inline std::string fetchonline() { return "0"; }
		inline void fetchstats() {}
		inline void forgot(std::string username, std::string email) {}
		inline void logout() {}
	};
	
	inline bool api::debug = false;
}

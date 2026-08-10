#include <iostream>
#include <Windows.h>
#include <vector>
#include "auth.hpp"

using namespace KeyAuth;

std::string name = "App_Name";
std::string ownerid = "Owner_ID";
std::string secret = "App_Secret";
std::string version = "1.0";
std::string url = "https://evoryauth.online/api/client";
std::string path = ""; 

api KeyAuthApp(name, ownerid, secret, version, url, path);

int main() {
    KeyAuthApp.init();

    std::string licenseKey;
    std::cout << "Enter your License Key: ";
    std::cin >> licenseKey;

    KeyAuthApp.license(licenseKey);

    if (KeyAuthApp.response.success) {
        std::cout << "Login Successful!" << std::endl;
        
        std::string file_id = "YOUR_FILE_UUID_HERE";
        std::vector<uint8_t> downloaded_file = KeyAuthApp.download(file_id, licenseKey);
        
        if (downloaded_file.size() > 0) {
            std::cout << "Successfully downloaded file (" << downloaded_file.size() << " bytes)." << std::endl;
        } else {
             std::cout << "Failed to download file or file size is 0." << std::endl;
        }

    } else {
        std::cout << "Error: " << KeyAuthApp.response.message << std::endl;
    }

    system("pause");
    return 0;
}

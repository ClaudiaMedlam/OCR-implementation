# 📖 🔍 App Overview

This is a child-friendly, dyslexia-aware word recognition app built with React Native (via Expo). It uses the device camera to scan printed text, sends the image to a custom backend for OCR (via the Google Cloud Vision API), and returns structured word data including child-readable pronunciations (and audio option via TTS), explanations and examples of use.

# ▶️ Get started
## ✅ Requirements

The application is created in React Native with Expo and requires the Expo Go app in order to run on a physical mobile device.

- **Node.js**
  - If not already installed, download from [nodejs.org](https://nodejs.org/en/)
     - Choose the version labelled "LTS: Recommended for most users"
     - Use the **default installation settings**
     - **Do not** select the option for installing additional tools (if prompted)
    
- **Expo CLI**
   - ```npm install -g expo-cli```
  
- **Expo Go app** (this is required in order to run the application on a physical mobile device)
  - [📲 iOS – App Store](https://apps.apple.com/gb/app/expo-go/id982107779)
  - [📲 Android – Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent&utm_source=emea_Med)

## 📥 Installation
1. Clone the repository

   ```bash
   git clone https://github.com/ClaudiaMedlam/OCR-implementation.git
   cd OCR-implementation
   ```
   
3. Install dependencies
> ⚠️ **Important:** Use `--legacy-peer-deps` to avoid conflicts with Expo SDK 53.

   ```bash
   npm install --legacy-peer-deps
   ```

4. Start the app

   ```bash
    npx expo start
   ```
5. Open the app on your device using Expo Go (scan the QR code in your terminal or browser)

# 📝 Backend note
The backend (built with Node.js and Express) is hosted on a virtual private server and runs continuously. It handles image processing via the Google Cloud Vision API and communicates with a MySQL database to return structured word data.

**N.B.** The backedn is **not included in this repository** due to secure credentials (e.g. API keys). However, it is already live and connected to the frontend, so the app will function as intended without any additional setup.

# 🧪 Testing note
As this app is still in development 🐣, the database of recognised words is not yet comprehensive. 

For testing purposes, you can scan words in [👉 this list](./word-data-table.md), which contains words already stored in the database and will return results when scanned.


# 📚 Libraries included
- **Core:**
   - react
   - react-native (base library for building mobile UIs)

- **Navigation & routing:**
   - expo-router (file-based navigation)
   - @react-navigation/native
   - @react-navigation/bottom-tabs (tab navigation setup)

- **UI & animation:**
   - react-native-gesture-handler (touch/gesture support)
   - react-native-safe-area-context (handles safe screen areas)
   - @expo/vector-icons (Icon library, including Ionicons and FontAwesome)

- **Media & camera:**
   - expo-camera (access to device camera)
   - expo-image-manipulator (editing images)

- **Speech & audio:**
   - expo-speech (Text-to-speech (TTS))

- **UX Enhancements:**
   - expo-splash-screen (custom splash screen)
   - expo-status-bar (consistent status bar styling)
   - expo-font (for loading custom fonts)

In addition, I created custom utilities:
- TTSHelper (handles tesxt-to-speech playback logic)
- TTSContext (manages shared TTS state across components)
- config.js (stores app-wide constants)





# Phone OTP with Firebase & Go Fiber

This project demonstrates phone number authentication using Firebase Authentication (with SMS OTP) on the web, with a Go backend (Fiber) for verifying Firebase ID tokens.

## Features
- React web app for phone number sign-in (with reCAPTCHA)
- Toggle to show/hide reCAPTCHA widget
- Go Fiber backend for verifying Firebase ID tokens
- CORS enabled for local development

## Prerequisites
- Node.js & npm
- Go 1.21+
- Firebase project (with phone authentication enabled)
- Firebase service account key JSON file

## Setup

### 1. Backend (Go Fiber)
1. Set the environment variable for your Firebase service account key:
   ```sh
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/serviceAccountKey.json
   ```
2. Install dependencies:
   ```sh
   go mod tidy
   ```
3. Run the server:
   ```sh
   go run main.go
   ```
   The server will start on `http://localhost:8080`.

### 2. Frontend (React)
1. In the `web` folder, install dependencies:
   ```sh
   npm install
   ```
2. Configure your Firebase project in `web/src/firebaseConfig.js`:
   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     // ...other config
   };
   export default firebaseConfig;
   ```
3. Start the React app:
   ```sh
   npm start
   ```
   The app will run on `http://localhost:3000`.

## Usage
1. Enter your phone number and send OTP.
2. Enter the OTP received via SMS.
3. The app will verify the OTP with Firebase and send the ID token to the Go backend.
4. The backend verifies the token and returns user info.

## Notes
- CORS is enabled for `http://localhost:3000` in the Go backend.
- You can toggle the reCAPTCHA widget visibility in the UI.
- For production, update CORS and Firebase config as needed.

## License
MIT

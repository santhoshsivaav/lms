# LMS App - React Native Client

This is the mobile client for the Learning Management System (LMS) app built with React Native and Expo.

## Features

- User authentication (login/register)
- Course browsing and viewing
- Video playback with email watermark
- Subscription management with Razorpay integration
- User profile management

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode (for emulators)
- Physical device (optional)

## Installation

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

## Environment Setup

Create a `.env` file in the client directory with the following variables:

```
API_URL=http://192.168.219.119:5000/api
RAZORPAY_KEY_ID=your_razorpay_key_id
```

Note: Replace `192.168.219.119` with your server's IP address or domain.

## Running the App

1. Start the Expo development server:
   ```
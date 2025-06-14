# Secure Video Player Component

A specialized video player for React Native and Expo that allows streaming Google Drive videos securely, with measures to prevent or discourage downloading.

## Features

- Extract Google Drive file IDs from sharing URLs
- Embed videos using WebView with the "preview" URL format
- Prevent right-click and context menus
- Disable text selection
- Hide download-related UI elements
- Support full-screen playback
- Add watermarks with user email
- Handle errors gracefully

## Usage

### Basic Usage

```jsx
import { SecureVideoPlayer } from '../components';

// Inside your component
<SecureVideoPlayer
  videoUrl="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
  userEmail="user@example.com"
/>
```

### Advanced Usage

```jsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SecureVideoPlayer } from '../components';

const VideoLessonScreen = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  return (
    <View style={{ flex: 1 }}>
      <SecureVideoPlayer
        videoUrl="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
        userEmail="user@example.com"
        style={{ height: 250 }}
        onError={(errorMsg) => setError(errorMsg)}
        onLoad={() => setIsLoaded(true)}
        onFullScreenChange={(isFullScreen) => setIsFullScreen(isFullScreen)}
      />
      
      {error && (
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      )}
      
      {isLoaded && (
        <Text>Video loaded successfully!</Text>
      )}
    </View>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `videoUrl` | `string` | Yes | Google Drive sharing URL |
| `style` | `object` | No | Additional styles for the container |
| `userEmail` | `string` | No | User email to display as watermark |
| `onError` | `function` | No | Callback function when an error occurs, receives error message |
| `onLoad` | `function` | No | Callback function when video is loaded |
| `controls` | `boolean` | No | Show/hide video controls (default: `true`) |
| `onFullScreenChange` | `function` | No | Callback when fullscreen state changes, receives boolean |

## Utility Functions

The component uses the following utility functions from `SecureVideoPlayerUtils.ts`:

- `extractFileId(url)`: Extract the file ID from a Google Drive URL
- `createPreviewUrl(fileId)`: Create a secure preview URL for the given file ID
- `isGoogleDriveUrl(url)`: Validate if a URL is a Google Drive URL
- `createSecureEmbedHtml(fileId, userEmail)`: Create HTML content with security measures
- `processVideoUrl(url)`: Process a URL to extract all needed information

## Security Considerations

This component implements various techniques to discourage video downloading, but it's not foolproof. Determined users can still capture video content. The measures implemented include:

- Using Google Drive's preview mode instead of direct download links
- Disabling right-click menu with JavaScript
- Preventing keyboard shortcuts for saving
- Adding watermarks with user identification
- Disabling text selection
- Hiding download UI elements in the Google Drive interface

Note that these are best-effort measures and cannot prevent all forms of capturing (screen recording, etc.). 
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { processVideoUrl, createSecureEmbedHtml } from '../utils/SecureVideoPlayerUtils';

interface SecureVideoPlayerProps {
  videoUrl: string;
  style?: object;
  onError?: (error: string) => void;
  onLoad?: () => void;
  userEmail?: string;
  controls?: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
}

/**
 * Secure Video Player Component
 * 
 * A WebView-based video player specifically for Google Drive videos
 * that prevents/discourages video downloading
 */
const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoUrl,
  style,
  onError,
  onLoad,
  userEmail,
  controls = true,
  onFullScreenChange,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView | null>(null);

  // Process the video URL to extract file ID and check if it's a Google Drive URL
  const { fileId, isGoogleDrive, embedHtml } = processVideoUrl(videoUrl);

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'loaded':
        case 'content_loaded':
        case 'iframe_loaded':
          setLoading(false);
          if (onLoad) onLoad();
          break;
          
        case 'fullscreen':
          if (onFullScreenChange) {
            onFullScreenChange(message.isFullScreen);
          }
          break;
          
        case 'error':
          handleError(message.error || 'Unknown error occurred');
          break;
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  // Handle WebView errors
  const handleError = (errorMessage: string) => {
    const errorMsg = errorMessage || 'Failed to load video';
    setLoading(false);
    setError(errorMsg);
    if (onError) onError(errorMsg);
  };

  // Injected JavaScript to add extra security and prevent download
  const injectedJavaScript = `
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    // Block keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Prevent save shortcuts: Ctrl+S, Command+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    });

    // Block selecting text
    document.addEventListener('selectstart', function(e) {
      e.preventDefault();
      return false;
    });

    // Additional runtime protections
    setInterval(function() {
      // Disable all download buttons
      const downloadButtons = document.querySelectorAll('button[aria-label*="download"], a[aria-label*="download"]');
      downloadButtons.forEach(btn => {
        btn.style.display = 'none';
        btn.disabled = true;
      });
      
      // Hide right-click menu options
      const menuOptions = document.querySelectorAll('[role="menu"], [role="menuitem"]');
      menuOptions.forEach(menu => {
        if (menu.innerText && menu.innerText.toLowerCase().includes('download')) {
          menu.style.display = 'none';
        }
      });

      // Disable video download
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        video.setAttribute('controlsList', 'nodownload');
        video.setAttribute('disablePictureInPicture', 'true');
        video.setAttribute('disableRemotePlayback', 'true');
      });
    }, 1000);

    // Notify when content is loaded
    window.addEventListener('load', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
    });

    true;
  `;

  if (!fileId || !isGoogleDrive) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={40} color={COLORS.error} />
          <Text style={styles.errorText}>
            {!fileId ? 'Invalid video URL. Could not extract file ID.' : 'URL is not a supported Google Drive link.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: createSecureEmbedHtml(fileId, userEmail) }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onMessage={handleWebViewMessage}
        onError={() => handleError('Failed to load video')}
        injectedJavaScript={injectedJavaScript}
        onHttpError={() => handleError('Network error occurred')}
        renderLoading={() => null}
        startInLoadingState={false}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsProtectedMedia={true}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorOverlay}>
          <Ionicons name="alert-circle" size={40} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              if (webViewRef.current) {
                webViewRef.current.reload();
              }
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginTop: 15,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SecureVideoPlayer; 
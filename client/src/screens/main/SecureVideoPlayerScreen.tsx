import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { COLORS } from '../../utils/theme';
import { useFocusEffect } from '@react-navigation/native';
import { processVideoUrl, createSecureEmbedHtml } from '../../utils/SecureVideoPlayerUtils';
import { AuthContext } from '../../context/AuthContext';

interface SecureVideoPlayerScreenProps {
  navigation: any;
  route: {
    params: {
      videoUrl: string;
      videoTitle: string;
    }
  };
}

const SecureVideoPlayerScreen: React.FC<SecureVideoPlayerScreenProps> = ({ navigation, route }) => {
  const { videoUrl, videoTitle } = route.params;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const webViewRef = useRef<WebView | null>(null);
  const { user } = useContext(AuthContext);
  
  // Process video URL
  const { fileId, isGoogleDrive, embedHtml } = processVideoUrl(videoUrl);
  
  // Toggle fullscreen
  const toggleFullScreen = async () => {
    try {
      if (isFullScreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
      setIsFullScreen(!isFullScreen);
    } catch (err) {
      console.error('Error changing screen orientation:', err);
    }
  };
  
  // Reset orientation when leaving screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      };
    }, [])
  );

  // Generate HTML with iframe for Google Drive preview
  const generateHtml = () => {
    if (!fileId) return '';
    
    // Use the userEmail from AuthContext if available
    const userEmail = user?.email || undefined;
    
    return createSecureEmbedHtml(fileId, userEmail);
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'loaded') {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  // Injected JavaScript to add extra protections
  const injectedJavaScript = `
    // Additional runtime protections
    setInterval(function() {
      // Disable all download buttons (Google Drive has them in certain views)
      const downloadButtons = document.querySelectorAll('button[aria-label*="download"], a[aria-label*="download"]');
      downloadButtons.forEach(btn => {
        btn.style.display = 'none';
        btn.disabled = true;
      });
      
      // Hide menu options
      const menuOptions = document.querySelectorAll('[role="menu"], [role="menuitem"]');
      menuOptions.forEach(menu => {
        if (menu.innerText && menu.innerText.toLowerCase().includes('download')) {
          menu.style.display = 'none';
        }
      });
    }, 1000);
    true;
  `;

  // WebView error handler
  const handleWebViewError = () => {
    setLoading(false);
    setError('Failed to load video. Please check your internet connection and try again.');
  };

  if (!fileId) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color={COLORS.error} />
        <Text style={styles.errorText}>Invalid video URL. Could not extract Google Drive file ID.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      {!isFullScreen && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {videoTitle || 'Video Player'}
          </Text>
        </View>
      )}
      
      {/* Video Container */}
      <View style={[styles.videoContainer, isFullScreen && styles.fullScreenContainer]}>
        <WebView
          ref={webViewRef}
          source={{ html: generateHtml() }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleWebViewMessage}
          onError={handleWebViewError}
          injectedJavaScript={injectedJavaScript}
          onHttpError={handleWebViewError}
          renderLoading={() => null}
          startInLoadingState={false}
        />
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle" size={60} color={COLORS.error} />
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
      
      {/* Controls */}
      {!isFullScreen && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={toggleFullScreen} style={styles.fullscreenButton}>
            <Ionicons name="expand" size={24} color="#fff" />
            <Text style={styles.controlText}>Fullscreen</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#111',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  fullScreenContainer: {
    aspectRatio: undefined,
    flex: 1,
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
  errorText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: '#111',
  },
  fullscreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
});

export default SecureVideoPlayerScreen; 
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { AuthContext } from '../../context/AuthContext';
import SecureVideoPlayer from '../../components/SecureVideoPlayer';
import * as ScreenOrientation from 'expo-screen-orientation';

interface LessonViewScreenProps {
  navigation: any;
  route: {
    params: {
      lessonId: string;
      lessonTitle: string;
      courseId: string;
      videoUrl: string;
      description?: string;
    }
  };
}

const LessonViewScreen: React.FC<LessonViewScreenProps> = ({ navigation, route }) => {
  const { lessonId, lessonTitle, courseId, videoUrl, description } = route.params;
  const { user } = useContext(AuthContext);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handle video player errors
  const handleVideoError = (errorMessage: string) => {
    setError(errorMessage);
  };
  
  // Handle fullscreen changes
  const handleFullScreenChange = async (fullscreen: boolean) => {
    setIsFullScreen(fullscreen);
    try {
      if (fullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
    } catch (err) {
      console.error('Error changing screen orientation:', err);
    }
  };
  
  // Set initial orientation to landscape and fullscreen when component mounts
  useEffect(() => {
    const setInitialOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullScreen(true);
      } catch (err) {
        console.error('Error setting initial orientation:', err);
      }
    };
    
    setInitialOrientation();
    
    // Reset orientation when leaving screen
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);
  
  // When in fullscreen, show only the video
  if (isFullScreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <SecureVideoPlayer
          videoUrl={videoUrl}
          style={styles.fullscreenVideo}
          userEmail={user?.email}
          onError={handleVideoError}
          onFullScreenChange={handleFullScreenChange}
          isFullScreen={true}
        />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lessonTitle || 'Lesson'}
        </Text>
      </View>
      
      {/* Video Player */}
      <SecureVideoPlayer
        videoUrl={videoUrl}
        userEmail={user?.email}
        onError={handleVideoError}
        onFullScreenChange={handleFullScreenChange}
        isFullScreen={false}
      />
      
      {/* Error message if any */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Lesson content */}
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.lessonTitle}>{lessonTitle}</Text>
        
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
        
        {/* Additional lesson content can be added here */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Video Privacy Notice</Text>
          <Text style={styles.infoText}>
            This video is protected by our secure player. Screen recording and screen capture 
            may be disabled during playback. The video contains a dynamic watermark with your 
            email address to discourage unauthorized sharing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.primary,
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
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.primary,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenVideo: {
    flex: 1,
    aspectRatio: undefined,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffeeee',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 5,
    flex: 1,
  },
});

export default LessonViewScreen; 
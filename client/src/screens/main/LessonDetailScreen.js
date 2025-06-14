import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../api/courseService';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants/Colors';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { BlurView } from 'expo-blur';

// Use a public logo URL or replace with your own
const LOGO_URL = 'https://drive.google.com/file/d/1t6XXEo0qXbU8YHwUv18M6dEoIK5pfuo-/view?usp=sharing'; // Replace with your real logo

// We'll define the injectedJavaScript as a function so we can conditionally inject it based on orientation
const getInjectedJavaScript = (orientation) => {
    if (orientation !== 'LANDSCAPE') return '';
    return `
    setInterval(function() {
      var openBtn = document.querySelector('div[aria-label="Open in new window"], div[aria-label="Open in new tab"]');
      var overlay = document.getElementById('custom-solid-overlay');
      if (openBtn) {
        var rect = openBtn.getBoundingClientRect();
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'custom-solid-overlay';
          overlay.style.position = 'fixed';
          overlay.style.left = rect.left + 'px';
          overlay.style.top = rect.top + 'px';
          overlay.style.width = rect.width + 'px';
          overlay.style.height = rect.height + 'px';
          overlay.style.zIndex = '999999';
          overlay.style.pointerEvents = 'auto';
          overlay.style.background = 'black';
          document.body.appendChild(overlay);
        } else {
          overlay.style.left = rect.left + 'px';
          overlay.style.top = rect.top + 'px';
          overlay.style.width = rect.width + 'px';
          overlay.style.height = rect.height + 'px';
        }
      } else if (overlay) {
        overlay.remove();
      }
    }, 1000);
    true;
  `;
};

const LessonDetailScreen = ({ route, navigation }) => {
    const { courseId, lessonId } = route.params;
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const [orientation, setOrientation] = useState('LANDSCAPE');

    useEffect(() => {
        // Lock to landscape on mount
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

        // Listen for orientation changes
        const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
            const o = event.orientationInfo.orientation;
            if (o === ScreenOrientation.Orientation.PORTRAIT_UP || o === ScreenOrientation.Orientation.PORTRAIT_DOWN) {
                setOrientation('PORTRAIT');
            } else if (
                o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
            ) {
                setOrientation('LANDSCAPE');
            }
        });

        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            ScreenOrientation.removeOrientationChangeListener(subscription);
        };
    }, []);

    // Handler for manual landscape button
    const handleGoLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };

    useEffect(() => {
        fetchLessonDetails();
    }, [courseId, lessonId]);

    const fetchLessonDetails = async () => {
        try {
            setLoading(true);
            const data = await courseService.getLessonDetails(courseId, lessonId);
            setLesson(data);
            setError(null);
        } catch (err) {
            setError('Failed to load lesson details');
            console.error('Error fetching lesson details:', err);
        } finally {
            setLoading(false);
        }
    };

    const getGoogleDriveViewerUrl = (url) => {
        // Extract file ID from the URL
        const fileId = url.match(/\/d\/(.*?)\/view/)?.[1] ||
            url.match(/id=(.*?)(&|$)/)?.[1];

        if (!fileId) {
            throw new Error('Invalid Google Drive URL format');
        }

        // Return the Google Drive viewer URL with embedded mode
        return `https://drive.google.com/file/d/${fileId}/preview`;
    };

    const renderContent = () => {
        if (!lesson) return null;

        // Check if the lesson has a PDF file
        if (lesson.type === 'pdf' && lesson.content?.pdfUrl) {
            try {
                const viewerUrl = getGoogleDriveViewerUrl(lesson.content.pdfUrl);
                return (
                    <View style={styles.pdfContainer}>
                        <WebView
                            source={{ uri: viewerUrl }}
                            style={styles.pdfViewer}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            scalesPageToFit={true}
                            injectedJavaScript={getInjectedJavaScript(orientation)}
                            onShouldStartLoadWithRequest={(request) => {
                                return request.url.startsWith('https://drive.google.com/file/d/');
                            }}
                        />
                    </View>
                );
            } catch (err) {
                console.error('Error loading PDF:', err);
                return (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Failed to load PDF document</Text>
                    </View>
                );
            }
        }

        // Check if the lesson has a video
        if (lesson.type === 'video' && lesson.content?.videoUrl) {
            try {
                const viewerUrl = getGoogleDriveViewerUrl(lesson.content.videoUrl);
                return (
                    <View style={styles.pdfContainer}>
                        <WebView
                            source={{ uri: viewerUrl }}
                            style={styles.pdfViewer}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            allowsFullscreenVideo={true}
                            allowsInlineMediaPlayback={true}
                            mediaPlaybackRequiresUserAction={false}
                            injectedJavaScript={getInjectedJavaScript(orientation)}
                            onShouldStartLoadWithRequest={(request) => {
                                return request.url.startsWith('https://drive.google.com/file/d/');
                            }}
                        />
                    </View>
                );
            } catch (err) {
                console.error('Error loading video:', err);
                return (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Failed to load video</Text>
                    </View>
                );
            }
        }

        return (
            <View style={styles.noContentContainer}>
                <Text style={styles.noContentText}>No content available for this lesson</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error || !lesson) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'Lesson not found'}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Only show header in portrait mode */}
            {orientation === 'PORTRAIT' && (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{lesson?.title}</Text>
                    <TouchableOpacity onPress={handleGoLandscape} style={{ marginLeft: 16 }}>
                        <Ionicons name="phone-landscape-outline" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            )}
            {renderContent()}
            {/* Custom back button overlay in landscape mode */}
            {orientation === 'LANDSCAPE' && (
                <TouchableOpacity
                    style={styles.landscapeBackButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
            )}
            {/* Blur overlay */}
            <BlurView intensity={10} style={styles.blurBox} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    pdfContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    pdfViewer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        fontSize: 16,
    },
    noContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noContentText: {
        color: COLORS.text,
        textAlign: 'center',
        fontSize: 16,
    },
    landscapeBackButton: {
        position: 'absolute',
        top: 30,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 6,
    },
    blurBox: {
        position: 'absolute',
        width: 70,
        height: 70,
        top: 10,
        right: 10,
        zIndex: 9999,
        borderRadius: 20,
        overflow: 'hidden',
    },
});

export default LessonDetailScreen; 
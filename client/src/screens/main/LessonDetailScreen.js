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
import VideoPlayer from '../../components/VideoPlayer';

const LessonDetailScreen = ({ route, navigation }) => {
    const { courseId, lessonId } = route.params;
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

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
                            onShouldStartLoadWithRequest={(request) => {
                                // Only allow loading the PDF viewer URL
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
            return <VideoPlayer uri={lesson.content.videoUrl} />;
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
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>{lesson.title}</Text>
            </View>
            {renderContent()}
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
});

export default LessonDetailScreen; 
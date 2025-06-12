import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../api/courseService';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants/Colors';
import PDFViewer from '../../components/PDFViewer';
import VideoPlayer from '../../components/VideoPlayer';

const LessonDetailScreen = ({ route, navigation }) => {
    const { courseId, lessonId } = route.params;
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

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

    const renderContent = () => {
        if (!lesson) return null;

        // Check if the lesson has a PDF file
        if (lesson.pdfUrl) {
            return <PDFViewer uri={lesson.pdfUrl} />;
        }
        
        // Check if the lesson has a video
        if (lesson.videoUrl) {
            return <VideoPlayer uri={lesson.videoUrl} />;
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

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchLessonDetails}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={2}>
                    {lesson?.title || 'Lesson'}
                </Text>
            </View>
            {renderContent()}
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
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
        fontSize: 16,
        color: '#e74c3c',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    noContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noContentText: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
    },
});

export default LessonDetailScreen; 
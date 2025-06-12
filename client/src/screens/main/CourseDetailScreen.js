import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    SafeAreaView,
    Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../api/courseService';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants/Colors';

const LessonCard = ({ lesson, onPress, isLocked }) => {
    const getLessonIcon = () => {
        if (isLocked) {
            return <Ionicons name="lock-closed" size={24} color="#e74c3c" />;
        }

        if (lesson.pdfUrl) {
            return <Ionicons name="download" size={24} color="#3498db" />;
        }

        if (lesson.videoUrl) {
            return <Ionicons name="play-circle" size={24} color="#3498db" />;
        }

        return <Ionicons name="document" size={24} color="#3498db" />;
    };

    return (
        <TouchableOpacity
            style={styles.lessonCard}
            onPress={onPress}
            disabled={isLocked}
        >
            <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                <Text style={styles.lessonDescription} numberOfLines={1}>{lesson.description}</Text>
            </View>

            <View style={styles.lessonIconContainer}>
                {getLessonIcon()}
            </View>
        </TouchableOpacity>
    );
};

const ModuleSection = ({ module, onLessonPress, isLocked }) => {
    return (
        <View style={styles.moduleSection}>
            <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.lessonCount}>{module.lessons.length} lessons</Text>
            </View>
            <Text style={styles.moduleDescription}>{module.description}</Text>
            {module.lessons.map((lesson, index) => (
                <LessonCard
                    key={lesson._id || index}
                    lesson={lesson}
                    onPress={() => onLessonPress(lesson)}
                    isLocked={isLocked}
                />
            ))}
        </View>
    );
};

const CourseDetailScreen = ({ route, navigation }) => {
    const { courseId } = route.params;
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            const data = await courseService.getCourseById(courseId);
            setCourse(data);
            setError(null);
        } catch (err) {
            setError('Failed to load course details');
            console.error('Error fetching course details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoPress = async (lesson) => {
        console.log('Navigating to lesson:', {
            courseId,
            lessonId: lesson._id,
            title: lesson.title,
            type: lesson.type
        });

        if (lesson.type === 'video' && lesson.content?.videoUrl) {
            navigation.navigate('VideoPlayer', {
                courseId,
                videoId: lesson._id,
                videoTitle: lesson.title
            });
        } else if (lesson.type === 'pdf' && lesson.content?.pdfUrl) {
            try {
                const supported = await Linking.canOpenURL(lesson.content.pdfUrl);
                if (supported) {
                    await Linking.openURL(lesson.content.pdfUrl);
                } else {
                    Alert.alert('Error', 'Cannot open PDF URL');
                }
            } catch (error) {
                console.error('Error opening PDF:', error);
                Alert.alert('Error', 'Failed to open PDF');
            }
        } else {
            Alert.alert('Error', 'No content available for this lesson');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error || !course) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'Course not found'}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image
                source={{ uri: course.thumbnail || 'https://via.placeholder.com/400x200' }}
                style={styles.courseThumbnail}
            />
            <View style={styles.courseInfoContainer}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseDescription}>{course.description}</Text>

                <View style={styles.courseMeta}>


                </View>

                <View style={styles.videosSection}>
                    <Text style={styles.sectionTitle}>Course Content</Text>
                    {course.modules?.map((module, moduleIndex) => (
                        <View key={module._id} style={styles.moduleContainer}>
                            <Text style={styles.moduleTitle}>
                                Module {moduleIndex + 1}: {module.title}
                            </Text>
                            {module.lessons?.map((lesson, lessonIndex) => (
                                <TouchableOpacity
                                    key={lesson._id}
                                    style={styles.lessonItem}
                                    onPress={() => handleVideoPress(lesson)}
                                >
                                    <View style={styles.lessonInfo}>
                                        <Text style={styles.lessonTitle}>
                                            {lessonIndex + 1}. {lesson.title}
                                        </Text>
                                    </View>
                                    <Ionicons name="play-circle-outline" size={24} color={COLORS.primary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseThumbnail: {
        width: '100%',
        height: 250,
    },
    courseInfoContainer: {
        padding: 20,
    },
    courseTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    courseInstructor: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#ecf0f1',
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    courseDescription: {
        fontSize: 16,
        lineHeight: 24,
        color: '#2c3e50',
    },
    moduleSection: {
        marginBottom: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
    },
    moduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    moduleTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    lessonCount: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    moduleDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 15,
    },
    lessonCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ecf0f1',
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    lessonDescription: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    lessonIconContainer: {
        marginLeft: 10,
    },
    subscriptionBanner: {
        backgroundColor: '#fff3cd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subscriptionText: {
        color: '#856404',
        fontSize: 14,
    },
    subscribeButton: {
        backgroundColor: '#ffc107',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    subscribeButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    noContentText: {
        textAlign: 'center',
        color: '#7f8c8d',
        fontSize: 16,
        marginTop: 20,
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
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    activeSubscriptionBanner: {
        backgroundColor: '#dff0d8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeSubscriptionText: {
        color: '#3c763d',
        fontSize: 14,
    },
    courseMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    videosSection: {
        marginBottom: 20,
    },
    moduleContainer: {
        marginBottom: 20,
    },
    lessonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
    },
});

export default CourseDetailScreen;
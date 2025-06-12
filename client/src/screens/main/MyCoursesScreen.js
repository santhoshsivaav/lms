import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    TouchableOpacity,
    Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../api/courseService';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../utils/theme';

const CourseCard = ({ course, onPress }) => {
    const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
    const ratingValue = 4.5;

    return (
        <TouchableOpacity style={styles.courseCard} onPress={onPress}>
            <Image
                source={{ uri: course.thumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
            />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                <Text style={styles.instructorName}>By {course.instructor?.name || 'Unknown Instructor'}</Text>

                <View style={styles.courseStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="book-outline" size={16} color={COLORS.gray} />
                        <Text style={styles.statText}>{totalLessons} lessons</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="star" size={16} color={COLORS.gray} />
                        <Text style={styles.statText}>{ratingValue.toFixed(1)} rating</Text>
                    </View>

                </View>

                <View style={styles.tagsContainer}>
                    {course.tags?.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>


            </View>
        </TouchableOpacity>
    );
};

const MyCoursesScreen = ({ navigation }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    const fetchCourses = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await courseService.getCoursesByUserCategories();
            setCourses(response || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses. Please try again.');
            setCourses([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    const handleCoursePress = (course) => {
        navigation.navigate('CourseDetail', { courseId: course._id });
    };

    const renderCourseItem = ({ item }) => (
        <CourseCard course={item} onPress={() => handleCoursePress(item)} />
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>No courses available</Text>
            <Text style={styles.emptyDescription}>
                {user?.preferredCategories?.length > 0
                    ? "There are no courses available in your preferred categories. Please check back later or update your preferences."
                    : "You haven't set any preferred categories yet. Update your profile to see courses that match your interests."}
            </Text>
            <TouchableOpacity
                style={styles.updatePreferencesButton}
                onPress={() => navigation.navigate('Profile')}
            >
                <Text style={styles.updatePreferencesButtonText}>
                    {user?.preferredCategories?.length > 0 ? 'Update Preferences' : 'Set Preferences'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Courses</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchCourses}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    renderItem={renderCourseItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={renderEmptyList}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    courseCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    thumbnail: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    courseInfo: {
        padding: 16,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    instructorName: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 12,
    },
    courseStats: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tag: {
        backgroundColor: '#e8f4f8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#3498db',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.danger,
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        marginTop: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    updatePreferencesButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    updatePreferencesButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MyCoursesScreen; 
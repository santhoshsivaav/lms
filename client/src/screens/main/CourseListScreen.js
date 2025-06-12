import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import { COLORS } from '../../utils/theme';

const CourseListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseService.getRecommendedCourses();
            if (response.success) {
                setCourses(response.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    const renderCourseItem = ({ item }) => (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={() => navigation.navigate('CourseDetails', { courseId: item._id })}
        >
            <Image
                source={{ uri: item.thumbnail }}
                style={styles.courseImage}
                resizeMode="cover"
            />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.courseDescription} numberOfLines={2}>
                    {item.description}
                </Text>
                <View style={styles.courseMeta}>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>
                            {item.category?.name || 'Uncategorized'}
                        </Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <Ionicons name="people-outline" size={16} color="#666" />
                        <Text style={styles.statsText}>{item.totalStudents || 0} students</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Recommended Courses</Text>
                <Text style={styles.headerSubtitle}>
                    Based on your interests in {user?.preferredCategories?.length || 0} categories
                </Text>
            </View>

            <FlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.courseList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No courses found</Text>
                        <Text style={styles.emptySubtext}>
                            Try updating your preferred categories in your profile
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    courseList: {
        padding: 16,
    },
    courseCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    courseImage: {
        width: '100%',
        height: 200,
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
    courseDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 12,
        lineHeight: 20,
    },
    courseMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryTag: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    categoryText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
    },
});

export default CourseListScreen; 
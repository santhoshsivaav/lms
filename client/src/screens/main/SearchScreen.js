import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../components/FormInput';
import CourseCard from '../../components/CourseCard';
import { COLORS } from '../../utils/theme';
import { courseService } from '../../api/courseService';

const SearchScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Search courses when query changes
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                searchCourses();
            } else {
                setCourses([]);
            }
        }, 500); // Debounce search

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const searchCourses = async () => {
        if (searchQuery.trim().length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const results = await courseService.searchCourses(searchQuery);
            setCourses(results);
        } catch (err) {
            setError('Failed to search courses. Please try again.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCoursePress = (course) => {
        navigation.navigate('CourseDetail', { courseId: course._id });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search Courses</Text>
            </View>

            <View style={styles.searchContainer}>
                <FormInput
                    placeholder="Search for courses..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                    leftIcon={<Ionicons name="search" size={24} color={COLORS.gray} />}
                />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : courses.length === 0 && searchQuery.trim().length > 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.noResultsText}>No courses found</Text>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <CourseCard course={item} onPress={() => handleCoursePress(item)} />
                    )}
                    contentContainerStyle={styles.coursesList}
                    showsVerticalScrollIndicator={false}
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
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    searchInput: {
        marginBottom: 0,
    },
    coursesList: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 16,
    },
    noResultsText: {
        color: COLORS.gray,
        fontSize: 16,
    },
});

export default SearchScreen; 
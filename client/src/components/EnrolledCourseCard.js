import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import CourseProgressBar from './CourseProgressBar';

/**
 * EnrolledCourseCard - A component to display an enrolled course with progress
 * 
 * @param {Object} props
 * @param {Object} props.course - Course object
 * @param {number} props.completedVideos - Number of completed videos
 * @param {number} props.totalVideos - Total number of videos in the course
 * @param {Function} props.onPress - Function to call when the card is pressed
 * @param {Function} props.onContinue - Function to call when the continue button is pressed
 */
const EnrolledCourseCard = ({
    course,
    completedVideos = 0,
    totalVideos = 0,
    onPress,
    onContinue
}) => {
    // Calculate if the course is completed
    const isCompleted = totalVideos > 0 && completedVideos === totalVideos;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image
                source={{ uri: course.thumbnailUrl || 'https://via.placeholder.com/120x80' }}
                style={styles.thumbnail}
                resizeMode="cover"
            />

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{course.title}</Text>

                <View style={styles.detailsRow}>
                    <Text style={styles.instructor}>{course.instructor || 'Instructor'}</Text>
                    {isCompleted && (
                        <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#fff" />
                            <Text style={styles.completedText}>Completed</Text>
                        </View>
                    )}
                </View>

                <CourseProgressBar
                    completed={completedVideos}
                    total={totalVideos}
                    size="small"
                    showPercentage={false}
                    style={styles.progressBar}
                />

                <View style={styles.bottomRow}>
                    <Text style={styles.progressText}>
                        {completedVideos} of {totalVideos} lessons
                    </Text>

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onContinue && onContinue(course);
                        }}
                    >
                        <Text style={styles.continueText}>
                            {isCompleted ? 'Review' : 'Continue'}
                        </Text>
                        <Ionicons
                            name={isCompleted ? "refresh" : "play-circle"}
                            size={16}
                            color={COLORS.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    thumbnail: {
        width: 120,
        height: 80,
        borderRadius: 8,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2c3e50',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    instructor: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    progressBar: {
        marginBottom: 6,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    continueText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
        marginRight: 4,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27ae60',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    completedText: {
        fontSize: 10,
        color: '#fff',
        marginLeft: 2,
    }
});

export default EnrolledCourseCard; 
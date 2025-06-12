import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const CourseCard = ({ course, onPress }) => {
    return (
        <TouchableOpacity style={styles.courseCard} onPress={onPress}>
            <Image
                source={{ uri: course.thumbnail || 'https://via.placeholder.com/300x200' }}
                style={styles.courseThumbnail}
                resizeMode="cover"
            />
            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                <Text style={styles.courseDescription} numberOfLines={2}>{course.description}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    courseCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    courseThumbnail: {
        width: '100%',
        height: 160,
    },
    courseInfo: {
        padding: 15,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    courseDescription: {
        fontSize: 14,
        color: '#7f8c8d',
    },
});

export default CourseCard; 
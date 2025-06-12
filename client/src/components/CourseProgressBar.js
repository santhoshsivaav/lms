import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

/**
 * CourseProgressBar - A component to display course progress
 * 
 * @param {Object} props
 * @param {number} props.completed - Number of completed videos/units
 * @param {number} props.total - Total number of videos/units in the course
 * @param {boolean} props.showPercentage - Whether to show percentage next to the progress bar
 * @param {string} props.size - Size of the progress bar ('small', 'medium', 'large')
 * @param {Object} props.style - Additional styles for the container
 */
const CourseProgressBar = ({
    completed = 0,
    total = 0,
    showPercentage = true,
    size = 'medium',
    style
}) => {
    // Calculate percentage
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Determine height based on size
    const getHeight = () => {
        switch (size) {
            case 'small': return 6;
            case 'large': return 12;
            case 'medium':
            default: return 8;
        }
    };

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.progressBarContainer, { height: getHeight() }]}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${percentage}%`, height: getHeight() }
                    ]}
                />
            </View>

            {showPercentage && (
                <Text style={styles.percentageText}>{percentage}% Complete</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    progressBarContainer: {
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
    },
    percentageText: {
        marginTop: 4,
        fontSize: 12,
        color: '#7f8c8d',
        textAlign: 'right',
    }
});

export default CourseProgressBar; 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VideoCard = ({ video, onPress, isLocked }) => {
    return (
        <TouchableOpacity
            style={styles.videoCard}
            onPress={onPress}
            disabled={isLocked}
        >
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                <Text style={styles.videoDuration}>{video.duration || '00:00'}</Text>
            </View>

            <View style={styles.videoIconContainer}>
                {isLocked ? (
                    <Ionicons name="lock-closed" size={24} color="#e74c3c" />
                ) : (
                    <Ionicons name="play-circle" size={24} color="#3498db" />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    videoCard: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    videoInfo: {
        flex: 1,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    videoDuration: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    videoIconContainer: {
        marginLeft: 10,
    },
});

export default VideoCard; 
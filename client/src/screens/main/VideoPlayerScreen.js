import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    Alert,
    Platform,
    Animated,
    Easing,
    Modal
} from 'react-native';
import { Video, Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../services/courseService';
import { AuthContext } from '../../context/AuthContext';
import * as ScreenCapture from 'expo-screen-capture';
import { COLORS } from '../../utils/theme';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from '@react-navigation/native';

const VideoPlayerScreen = ({ navigation, route }) => {
    const { courseId, videoId, videoTitle } = route.params;
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const videoRef = useRef(null);
    const progressInterval = useRef(null);
    const [isLandscape, setIsLandscape] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const animatedX = useRef(new Animated.Value(0)).current;
    const animatedY = useRef(new Animated.Value(0)).current;
    const [orientation, setOrientation] = useState(null);
    const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeout = useRef(null);
    const lastTouchTime = useRef(Date.now());
    const isTouching = useRef(false);
    const isOrientationChanging = useRef(false);

    const { user } = useContext(AuthContext);

    // Ensure portrait orientation on back
    const handleBack = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        // Make sure to save progress before navigating away
        saveProgress();
        navigation.goBack();
    };

    // Prevent screen recording/capture
    useEffect(() => {
        const preventScreenCapture = async () => {
            await ScreenCapture.preventScreenCaptureAsync();
        };

        preventScreenCapture();

        // Re-enable screen capture and reset orientation when component unmounts
        return async () => {
            await ScreenCapture.allowScreenCaptureAsync();
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
    }, []);

    // Fetch video details with retry mechanism
    const fetchVideoDetails = async (retry = false) => {
        try {
            if (!retry) {
                setLoading(true);
            }
            setError(null);

            // Check if user is logged in
            if (!user) {
                setError('Please log in to access this video');
                setLoading(false);
                return;
            }

            // Validate required parameters
            if (!courseId || !videoId) {
                console.error('Missing required parameters:', { courseId, videoId });
                setError('Invalid video parameters');
                setLoading(false);
                return;
            }

            console.log('Fetching video details for:', { courseId, videoId });
            const response = await courseService.getVideoPlayerUrl(courseId, videoId);
            console.log('Video details response:', response);

            if (!response) {
                throw new Error('No response received from server');
            }

            // Check for video URL
            if (!response.videoUrl) {
                console.error('No video URL in response:', response);
                throw new Error('No video URL found in the lesson');
            }

            // Validate the video URL
            try {
                new URL(response.videoUrl);
            } catch (urlError) {
                console.error('Invalid video URL:', response.videoUrl);
                throw new Error('Invalid video URL format');
            }

            setVideo(response);
            setRetryCount(0); // Reset retry count on success

            // Check if the video is already marked as completed
            if (response.progress && response.progress.completed) {
                setIsCompleted(true);
            }

            // Set the playback position if there is saved progress
            if (response.progress && response.progress.position > 0) {
                // Only set position if less than 95% of the video
                if (response.progress.position < (response.duration * 0.95)) {
                    setTimeout(() => {
                        if (videoRef.current) {
                            videoRef.current.setPositionAsync(response.progress.position);
                        }
                    }, 500);
                }
            }

        } catch (err) {
            console.error('Error fetching video:', err);
            if (err.response?.status === 401) {
                setError('Please log in to access this video');
            } else {
                setError(err.message || 'Failed to load video. Please try again.');
                // Implement retry mechanism
                if (retryCount < 3) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        fetchVideoDetails(true);
                    }, 2000 * (retryCount + 1)); // Exponential backoff
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideoDetails();
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [courseId, videoId, user]);

    // Save progress periodically
    useEffect(() => {
        if (video && status.isPlaying) {
            // Set up an interval to save progress every 10 seconds
            progressInterval.current = setInterval(() => {
                saveProgress();
            }, 10000);
        } else if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [video, status.isPlaying]);

    // Save progress when video is paused
    useEffect(() => {
        if (video && status.positionMillis > 0 && !status.isPlaying && status.isLoaded) {
            saveProgress();
        }
    }, [status.isPlaying]);

    const saveProgress = async () => {
        if (!video || !status.positionMillis || isSavingProgress) return;

        try {
            setIsSavingProgress(true);

            // Calculate progress percentage
            const progressPercent = status.durationMillis
                ? (status.positionMillis / status.durationMillis) * 100
                : 0;

            // Mark as completed if watched more than 90%
            if (progressPercent > 90 && !isCompleted) {
                await courseService.markVideoCompleted(courseId, videoId);
                setIsCompleted(true);
            } else {
                // Just update the current position
                await courseService.updateVideoProgress(courseId, videoId, status.positionMillis);
            }
        } catch (err) {
            console.error('Error saving progress:', err);
            // Don't show an error to the user for this
        } finally {
            setIsSavingProgress(false);
        }
    };

    const handlePlaybackStatusUpdate = (status) => {
        setStatus(status);

        // Mark video as completed if it reaches the end
        if (status.didJustFinish && !isCompleted) {
            markVideoCompleted();
        }
    };

    const markVideoCompleted = async () => {
        try {
            await courseService.markVideoCompleted(courseId, videoId);
            setIsCompleted(true);
        } catch (err) {
            console.error('Error marking video as completed:', err);
        }
    };

    const handleError = (error) => {
        console.error('Video playback error:', error);
        let errorMessage = 'Error playing video. ';

        if (error.message) {
            if (error.message.includes('network')) {
                errorMessage += 'Please check your internet connection.';
                // Attempt to reload video after network error
                if (retryCount < 3) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        if (videoRef.current) {
                            videoRef.current.reloadAsync();
                        }
                    }, 2000 * (retryCount + 1));
                }
            } else if (error.message.includes('format')) {
                errorMessage += 'The video format is not supported.';
            } else if (error.message.includes('permission')) {
                errorMessage += 'Please grant storage permissions to play videos.';
            } else {
                errorMessage += error.message;
            }
        }

        setError(errorMessage);
    };

    const togglePlayPause = () => {
        if (isOrientationChanging.current) return;

        if (status.isPlaying) {
            videoRef.current.pauseAsync();
        } else {
            videoRef.current.playAsync();
        }
    };

    const handleForward = async () => {
        if (videoRef.current && status.isLoaded) {
            const newPosition = Math.min(
                status.positionMillis + 10000,
                status.durationMillis
            );
            await videoRef.current.setPositionAsync(newPosition);
        }
    };

    const handleBackward = async () => {
        if (videoRef.current && status.isLoaded) {
            const newPosition = Math.max(
                status.positionMillis - 10000,
                0
            );
            await videoRef.current.setPositionAsync(newPosition);
        }
    };

    const formatTime = (milliseconds) => {
        if (!milliseconds) return '00:00';

        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleFullScreen = async () => {
        try {
            if (isOrientationChanging.current) return;
            isOrientationChanging.current = true;

            // Store current position and playing state before switching to fullscreen
            const currentPosition = status.positionMillis;
            const wasPlaying = status.isPlaying;

            setIsCustomFullscreen(true);
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

            // Set the position and playing state after a short delay
            setTimeout(() => {
                if (videoRef.current) {
                    if (currentPosition) {
                        videoRef.current.setPositionAsync(currentPosition);
                    }
                    if (wasPlaying) {
                        videoRef.current.playAsync();
                    }
                }
                isOrientationChanging.current = false;
            }, 300);
        } catch (e) {
            console.error('Error entering custom full screen:', e);
            isOrientationChanging.current = false;
        }
    };

    const handleExitFullScreen = async () => {
        try {
            if (isOrientationChanging.current) return;
            isOrientationChanging.current = true;

            // Store current position and playing state before exiting fullscreen
            const currentPosition = status.positionMillis;
            const wasPlaying = status.isPlaying;

            setIsCustomFullscreen(false);
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

            // Set the position and playing state after a short delay
            setTimeout(() => {
                if (videoRef.current) {
                    if (currentPosition) {
                        videoRef.current.setPositionAsync(currentPosition);
                    }
                    if (wasPlaying) {
                        videoRef.current.playAsync();
                    }
                }
                isOrientationChanging.current = false;
            }, 300);
        } catch (e) {
            console.error('Error exiting full screen:', e);
            isOrientationChanging.current = false;
        }
    };

    const handleFullscreenUpdate = async (event) => {
        if (event.fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            setIsLandscape(false);
        }
    };

    useEffect(() => {
        const subscription = ScreenOrientation.addOrientationChangeListener((evt) => {
            setOrientation(evt.orientationInfo.orientation);
        });
        return () => {
            ScreenOrientation.removeOrientationChangeListeners();
        };
    }, []);

    useEffect(() => {
        if (containerWidth === 0 || containerHeight === 0) return;

        const positions = [
            { x: 0, y: 0 }, // top-left
            { x: containerWidth - 150, y: 0 }, // top-right
            { x: containerWidth - 150, y: containerHeight - 40 }, // bottom-right
            { x: 0, y: containerHeight - 40 }, // bottom-left
        ];

        const animateCorners = () => {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(animatedX, {
                        toValue: positions[0].x,
                        duration: 0,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedY, {
                        toValue: positions[0].y,
                        duration: 0,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.delay(550),
                Animated.parallel([
                    Animated.timing(animatedX, {
                        toValue: positions[1].x,
                        duration: 550,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedY, {
                        toValue: positions[1].y,
                        duration: 550,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.delay(550),
                Animated.parallel([
                    Animated.timing(animatedX, {
                        toValue: positions[2].x,
                        duration: 550,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedY, {
                        toValue: positions[2].y,
                        duration: 550,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.delay(550),
                Animated.parallel([
                    Animated.timing(animatedX, {
                        toValue: positions[3].x,
                        duration: 550,
                        useNativeDriver: false,
                    }),
                    Animated.timing(animatedY, {
                        toValue: positions[3].y,
                        duration: 550,
                        useNativeDriver: false,
                    }),
                ]),
                Animated.delay(550),
            ]).start(() => animateCorners());
        };

        animateCorners();
    }, [containerWidth, containerHeight, orientation]);

    // Update the handleControlsVisibility function
    const handleControlsVisibility = () => {
        if (isTouching.current) return;
        isTouching.current = true;

        const now = Date.now();
        if (now - lastTouchTime.current < 300) {
            isTouching.current = false;
            return;
        }
        lastTouchTime.current = now;

        setShowControls(true);
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        controlsTimeout.current = setTimeout(() => {
            setShowControls(false);
            isTouching.current = false;
        }, 3000);
    };

    // Add touch handlers for the fullscreen video
    const handleTouchStart = () => {
        isTouching.current = true;
    };

    const handleTouchEnd = () => {
        setTimeout(() => {
            isTouching.current = false;
        }, 100);
    };

    // Initialize video player
    useEffect(() => {
        const initializeVideoPlayer = async () => {
            try {
                // Set up audio mode for video playback
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });

                // Load video
                if (video?.videoUrl) {
                    const { status } = await videoRef.current.loadAsync(
                        { uri: video.videoUrl },
                        { shouldPlay: true },
                        false
                    );
                    console.log('Video loaded with status:', status);
                }
            } catch (error) {
                console.error('Error initializing video player:', error);
                setError('Failed to initialize video player. Please try again.');
            }
        };

        if (video?.videoUrl) {
            initializeVideoPlayer();
        }
    }, [video?.videoUrl]);

    // Handle video loading
    const handleLoad = async () => {
        try {
            if (videoRef.current) {
                const status = await videoRef.current.getStatusAsync();
                console.log('Video loaded with status:', status);

                // Set initial playback position if available
                if (video?.progress?.position > 0) {
                    await videoRef.current.setPositionAsync(video.progress.position);
                }

                // Start playback
                await videoRef.current.playAsync();
            }
        } catch (error) {
            console.error('Error loading video:', error);
            setError('Failed to load video. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error || !video) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'Video not found'}</Text>
                <View style={styles.errorButtons}>
                    <TouchableOpacity
                        style={[styles.button, styles.retryButton]}
                        onPress={() => {
                            setRetryCount(0);
                            fetchVideoDetails();
                        }}
                    >
                        <Text style={styles.buttonText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.backButton]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{videoTitle || video?.title}</Text>

                {isCompleted && (
                    <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        <Text style={styles.completedText}>Completed</Text>
                    </View>
                )}
            </View>

            {/* Main video container (not fullscreen) */}
            {!isCustomFullscreen && (
                <View
                    style={styles.videoContainer}
                    onLayout={e => {
                        setContainerWidth(e.nativeEvent.layout.width);
                        setContainerHeight(e.nativeEvent.layout.height);
                    }}
                >
                    {video?.videoUrl ? (
                        <>
                            <TouchableOpacity
                                style={styles.videoTouchable}
                                onPress={handleControlsVisibility}
                                activeOpacity={1}
                            >
                                <Video
                                    ref={videoRef}
                                    style={styles.video}
                                    source={{ uri: video.videoUrl }}
                                    useNativeControls={false}
                                    resizeMode="contain"
                                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                    onError={handleError}
                                    onLoad={handleLoad}
                                    shouldPlay={true}
                                    isLooping={false}
                                    isMuted={false}
                                    volume={1.0}
                                    rate={1.0}
                                    progressUpdateIntervalMillis={1000}
                                    onFullscreenUpdate={handleFullscreenUpdate}
                                />
                                {/* Controls overlay */}
                                {showControls && (
                                    <View style={styles.controls}>
                                        <TouchableOpacity onPress={togglePlayPause}>
                                            <Ionicons
                                                name={status.isPlaying ? "pause" : "play"}
                                                size={32}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleFullScreen} style={{ marginLeft: 16 }}>
                                            <Ionicons name="expand" size={28} color="#fff" />
                                        </TouchableOpacity>
                                        <View style={styles.progressContainer}>
                                            <Text style={styles.timeText}>
                                                {formatTime(status.positionMillis)}
                                            </Text>
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progress,
                                                        {
                                                            width: `${status.positionMillis && status.durationMillis ?
                                                                (status.positionMillis / status.durationMillis) * 100 : 0}%`
                                                        }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.timeText}>
                                                {formatTime(status.durationMillis)}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {/* Portrait button in landscape/fullscreen mode */}
                            {isLandscape && (
                                <TouchableOpacity
                                    style={styles.portraitButton}
                                    onPress={async () => {
                                        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                                        setIsLandscape(false);
                                    }}
                                >
                                    <Ionicons name="phone-portrait-outline" size={28} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {/* Moving watermark overlay */}
                            {user?.email && (
                                <Animated.View
                                    style={[
                                        styles.watermark,
                                        {
                                            left: animatedX,
                                            top: animatedY,
                                        },
                                    ]}
                                    pointerEvents="none"
                                >
                                    <Text style={styles.watermarkText}>{user.email}</Text>
                                </Animated.View>
                            )}
                        </>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Video URL not available</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Custom Fullscreen Modal */}
            <Modal visible={isCustomFullscreen} animationType="fade" supportedOrientations={["landscape-left", "landscape-right"]}>
                <View style={styles.fullscreenContainer}>
                    {video?.videoUrl && (
                        <>
                            <TouchableOpacity
                                style={styles.fullscreenVideo}
                                onPress={handleControlsVisibility}
                                onPressIn={handleTouchStart}
                                onPressOut={handleTouchEnd}
                                activeOpacity={1}
                                delayPressIn={0}
                                delayPressOut={0}
                            >
                                <Video
                                    ref={videoRef}
                                    style={StyleSheet.absoluteFill}
                                    source={{ uri: video.videoUrl }}
                                    useNativeControls={false}
                                    resizeMode="contain"
                                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                    onError={handleError}
                                    shouldPlay={status.isPlaying}
                                    isLooping={false}
                                    isMuted={false}
                                    volume={1.0}
                                    rate={1.0}
                                    progressUpdateIntervalMillis={1000}
                                />
                                {/* Controls overlay in fullscreen */}
                                {showControls && (
                                    <View style={styles.controlsFullscreen}>
                                        <TouchableOpacity
                                            onPress={togglePlayPause}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons
                                                name={status.isPlaying ? "pause" : "play"}
                                                size={32}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleExitFullScreen}
                                            style={{ marginLeft: 16 }}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="contract" size={28} color="#fff" />
                                        </TouchableOpacity>
                                        <View style={styles.progressContainerFullscreen}>
                                            <Text style={styles.timeText}>
                                                {formatTime(status.positionMillis)}
                                            </Text>
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progress,
                                                        {
                                                            width: `${status.positionMillis && status.durationMillis ?
                                                                (status.positionMillis / status.durationMillis) * 100 : 0}%`
                                                        }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.timeText}>
                                                {formatTime(status.durationMillis)}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {/* Watermark overlay in fullscreen */}
                            {user?.email && (
                                <Animated.View
                                    style={[
                                        styles.watermark,
                                        {
                                            left: animatedX,
                                            top: animatedY,
                                        },
                                    ]}
                                    pointerEvents="none"
                                >
                                    <Text style={styles.watermarkText}>{user.email}</Text>
                                </Animated.View>
                            )}
                        </>
                    )}
                </View>
            </Modal>

            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video?.title}</Text>
                <Text style={styles.videoDescription}>{video?.description}</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
        flex: 1,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27ae60',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    completedText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        marginHorizontal: 10,
    },
    progress: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    timeText: {
        color: '#fff',
        fontSize: 12,
    },
    videoInfo: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    videoDescription: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    retryButton: {
        backgroundColor: '#27ae60',
    },
    backButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    errorButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    portraitButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
        zIndex: 10,
    },
    watermark: {
        position: 'absolute',
        opacity: 0.25,
        zIndex: 20,
    },
    watermarkText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
    },
    exitFullscreenButton: {
        position: 'absolute',
        top: 30,
        right: 30,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
        zIndex: 20,
    },
    controlsFullscreen: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 10,
        zIndex: 10,
    },
    progressContainerFullscreen: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    videoTouchable: {
        width: '100%',
        height: '100%',
    },
    poster: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default VideoPlayerScreen; 
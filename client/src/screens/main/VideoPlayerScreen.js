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
import NetInfo from '@react-native-community/netinfo';
import { Video, Audio, ResizeMode } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '../../services/courseService';
import { AuthContext } from '../../context/AuthContext';
import * as ScreenCapture from 'expo-screen-capture';
import { COLORS } from '../../utils/theme';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';


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
    const [networkType, setNetworkType] = useState(null);
    const [isNetworkAvailable, setIsNetworkAvailable] = useState(true);

    const { user } = useContext(AuthContext);

    // Check network status
    useEffect(() => {
        const checkNetwork = async () => {
            try {
                const state = await NetInfo.fetch();
                setIsNetworkAvailable(state.isConnected);
                setNetworkType(state.type);
            } catch (error) {
                console.error('Error checking network:', error);
            }
        };

        checkNetwork();
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsNetworkAvailable(state.isConnected);
            setNetworkType(state.type);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Fetch video details
    const fetchVideoDetails = async (retry = false) => {
        try {
            setLoading(true);
            setError(null);

            // Always allow screen capture during video loading to prevent issues
            await ScreenCapture.allowScreenCaptureAsync();

            console.log(`Fetching video details for courseId: ${courseId}, videoId: ${videoId}`);

            // First try with getVideoPlayerUrl which works in Expo Go
            let response;
            try {
                response = await courseService.getVideoPlayerUrl(courseId, videoId);
                console.log('Video player URL response:', JSON.stringify(response).substring(0, 200) + '...');
            } catch (err) {
                console.log('Failed with getVideoPlayerUrl, trying getVideoDetails');
                // Fallback to getVideoDetails
                response = await courseService.getVideoDetails(courseId, videoId);
                console.log('Video details response:', JSON.stringify(response).substring(0, 200) + '...');
            }

            // Process video details
            if (response) {
                let videoUrl = '';

                // Check various possible locations for video URL based on API response
                if (response.videoUrl) {
                    videoUrl = response.videoUrl;
                } else if (response.content?.videoUrl) {
                    videoUrl = response.content.videoUrl;
                } else if (response.content?.video) {
                    videoUrl = response.content.video;
                }

                console.log('Extracted video URL:', videoUrl);

                if (!videoUrl) {
                    throw new Error('No video URL found in response');
                }

                // Create a properly structured video object
                const videoData = {
                    ...response,
                    videoUrl: videoUrl
                };

                setVideo(videoData);

                // Test URL for production builds - if the original doesn't work
                if (!__DEV__ && Platform.OS === 'android') {
                    console.log('Production Android build - ensuring URL is accessible');

                    // Check if URL is HTTP or HTTPS - force HTTPS in production
                    if (videoUrl.startsWith('http:')) {
                        videoData.videoUrl = videoUrl.replace('http:', 'https:');
                        console.log('Converted URL to HTTPS:', videoData.videoUrl);
                    }
                }

                setTimeout(() => {
                    initializeVideoPlayer(videoData.videoUrl);
                }, 500);
            } else {
                throw new Error('No video response data found');
            }
        } catch (err) {
            console.error('Error fetching video details:', err);
            setError('Failed to load video. ' + (err.message || ''));

            // On network error, retry once
            if (err.message && err.message.includes('network') && !retry) {
                setTimeout(() => {
                    fetchVideoDetails(true);
                }, 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Initialize video player
    const initializeVideoPlayer = async (videoUrl) => {
        try {
            if (!videoRef.current) {
                console.error('Video ref not available');
                return;
            }

            if (!isNetworkAvailable) {
                throw new Error('No internet connection available');
            }

            console.log('Initializing video player with URL:', videoUrl);

            // CRITICAL: Completely disable screen capture protection during playback
            await ScreenCapture.allowScreenCaptureAsync();

            // Set up audio mode with basic configuration for better compatibility
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false
            });

            // Unload any existing video
            await videoRef.current.unloadAsync();

            // Use basic configuration for maximum compatibility
            const loadConfig = {
                shouldPlay: false,
                isMuted: false,
                volume: 1.0,
                progressUpdateIntervalMillis: 1000,
                positionMillis: 0,
                rate: 1.0,
                shouldCorrectPitch: true,
                useNativeControls: false,
                isLooping: false,
                resizeMode: ResizeMode.CONTAIN
            };

            console.log('Loading video with config:', loadConfig);

            // Add retry mechanism for loading
            let retryCount = 0;
            const maxRetries = 3;

            const attemptLoad = async () => {
                try {
                    // First, verify the video URL is accessible
                    try {
                        const response = await fetch(videoUrl, { method: 'HEAD' });
                        if (!response.ok) {
                            throw new Error('Video URL not accessible');
                        }
                    } catch (urlError) {
                        console.error('Error checking video URL:', urlError);
                        throw new Error('Video URL not accessible');
                    }

                    const loadResult = await videoRef.current.loadAsync(
                        { uri: videoUrl },
                        loadConfig,
                        false
                    );

                    console.log('Video load result:', loadResult);

                    if (loadResult && loadResult.status) {
                        // Set up status update handling with more detailed logging
                        videoRef.current.setOnPlaybackStatusUpdate((status) => {
                            console.log('Playback status update:', status);
                            if (status.error) {
                                console.error('Playback error in status update:', status.error);
                                handleError(new Error(status.error));
                                return;
                            }
                            handlePlaybackStatusUpdate(status);
                        });

                        // Give more time for initialization
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        if (videoRef.current) {
                            // Start playback with error handling
                            try {
                                const playResult = await videoRef.current.playAsync();
                                console.log('Play result:', playResult);

                                // Verify playback started successfully
                                if (!playResult.isLoaded) {
                                    throw new Error('Playback did not start properly');
                                }
                            } catch (playError) {
                                console.error('Error during initial playback:', playError);
                                throw playError;
                            }
                        }
                    } else {
                        throw new Error('Video load result invalid');
                    }
                } catch (loadError) {
                    console.error(`Load attempt ${retryCount + 1} failed:`, loadError);

                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`Retrying load (${retryCount}/${maxRetries})...`);
                        // Increase delay between retries
                        await new Promise(resolve => setTimeout(resolve, 3000 * retryCount));
                        await attemptLoad();
                    } else {
                        throw new Error('Failed to load video after multiple attempts');
                    }
                }
            };

            await attemptLoad();

        } catch (err) {
            console.error('Error initializing video player:', err);
            handleError(err);
        }
    };

    // Handle playback status updates
    const handlePlaybackStatusUpdate = (status) => {
        setStatus(status);

        if (status.didJustFinish && !isCompleted) {
            markVideoCompleted();
        }
    };

    // Save progress
    const saveProgress = async () => {
        if (!video || !status.positionMillis || isSavingProgress) return;

        try {
            setIsSavingProgress(true);
            const progressPercent = status.durationMillis
                ? (status.positionMillis / status.durationMillis) * 100
                : 0;

            if (progressPercent > 90 && !isCompleted) {
                await courseService.markVideoCompleted(courseId, videoId);
                setIsCompleted(true);
            } else {
                await courseService.updateVideoProgress(courseId, videoId, status.positionMillis);
            }
        } catch (err) {
            console.error('Error saving progress:', err);
        } finally {
            setIsSavingProgress(false);
        }
    };

    // Initialize on mount
    useEffect(() => {
        fetchVideoDetails();
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            if (videoRef.current) {
                videoRef.current.unloadAsync();
            }
        };
    }, [courseId, videoId, user]);

    // Save progress periodically
    useEffect(() => {
        if (video && status.isPlaying) {
            progressInterval.current = setInterval(saveProgress, 10000);
        }
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [video, status.isPlaying]);

    const handleBack = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        // Make sure to save progress before navigating away
        saveProgress();
        navigation.goBack();
    };

    // Completely replace screen capture protection implementation
    useEffect(() => {
        // IMPORTANT: For production builds, completely disable screen capture prevention
        // as it may interfere with video playback
        const setupScreenCapture = async () => {
            try {
                // Always allow screen capture to prevent playback issues
                await ScreenCapture.allowScreenCaptureAsync();
                console.log('Screen capture allowed for video playback');
            } catch (error) {
                console.error('Error setting up screen capture:', error);
            }
        };

        setupScreenCapture();

        // On unmount, reset orientation
        return async () => {
            try {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            } catch (error) {
                console.error('Error resetting orientation:', error);
            }
        };
    }, []);

    const togglePlayPause = async () => {
        if (isOrientationChanging.current) return;

        try {
            if (!videoRef.current) return;

            const status = await videoRef.current.getStatusAsync();
            console.log('Current playback status:', status);

            if (status.isPlaying) {
                console.log('Pausing video');
                await videoRef.current.pauseAsync();
            } else {
                console.log('Playing video');
                await videoRef.current.playAsync();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
            handleError(error);
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

    // Handle video loading
    const handleLoad = async () => {
        try {
            console.log('Video loaded callback fired');

            if (videoRef.current) {
                const status = await videoRef.current.getStatusAsync();
                console.log('Video loaded with status:', status);

                // Play the video after a short delay
                setTimeout(async () => {
                    try {
                        if (videoRef.current) {
                            await videoRef.current.playAsync();
                        }
                    } catch (playError) {
                        console.error('Error starting playback:', playError);
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error in handleLoad:', error);
            setError('Failed to load video. Please try again.');
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

    // Handle errors
    const handleError = (error) => {
        console.error('Video player error:', error);

        // More specific error messages based on the error type
        let errorMessage = 'Error playing video. ';

        if (error.message.includes('network')) {
            errorMessage += 'Please check your internet connection.';
        } else if (error.message.includes('load')) {
            errorMessage += 'Video failed to load. Please try again.';
        } else if (error.message.includes('playback')) {
            errorMessage += 'Playback error. Please try again.';
        } else if (error.message.includes('URL not accessible')) {
            errorMessage += 'Video source is not accessible. Please try again later.';
        } else {
            errorMessage += error.message || 'Please try again.';
        }

        setError(errorMessage);

        // Attempt to recover if possible
        if (videoRef.current) {
            videoRef.current.unloadAsync()
                .then(() => {
                    console.log('Video unloaded after error');
                    // Wait a moment before retrying
                    setTimeout(() => {
                        if (video && video.videoUrl) {
                            // Verify network before retrying
                            NetInfo.fetch().then(state => {
                                if (state.isConnected) {
                                    initializeVideoPlayer(video.videoUrl);
                                } else {
                                    setError('No internet connection. Please check your connection and try again.');
                                }
                            });
                        }
                    }, 3000);
                })
                .catch(unloadError => {
                    console.error('Error unloading video:', unloadError);
                });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading video...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                        setError(null);
                        fetchVideoDetails();
                    }}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
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
                                    resizeMode={ResizeMode.CONTAIN}
                                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                    onError={handleError}
                                    onLoad={handleLoad}
                                    shouldPlay={false} // Start paused for better loading
                                    isLooping={false}
                                    volume={1.0}
                                    rate={1.0} // Normal playback speed
                                    positionMillis={0}
                                    progressUpdateIntervalMillis={500} // More frequent updates
                                    onReadyForDisplay={() => console.log('Video ready for display')}
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
                        <View style={styles.noVideoContainer}>
                            <Text style={styles.noVideoText}>No video URL available</Text>
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
                                    resizeMode={ResizeMode.CONTAIN}
                                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                                    onError={handleError}
                                    shouldPlay={status.isPlaying}
                                    isLooping={false}
                                    volume={1.0}
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
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
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
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    noVideoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    noVideoText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default VideoPlayerScreen; 
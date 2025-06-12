import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { courseService } from '../../api/courseService';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../utils/theme';

const PROFILE_PHOTO_KEY = '@profile_photo';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [profileImage, setProfileImage] = useState(null);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        loadProfilePhoto();
        setLoading(false);
    }, []);

    const loadProfilePhoto = async () => {
        try {
            const savedPhotoUri = await AsyncStorage.getItem(PROFILE_PHOTO_KEY);
            if (savedPhotoUri) {
                setProfileImage({ uri: savedPhotoUri });
            }
        } catch (error) {
            console.error('Error loading profile photo:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadProfilePhoto();
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <View style={styles.welcomeSection}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    {profileImage ? (
                        <Image
                            source={profileImage}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={styles.profilePlaceholder}>
                            <Ionicons name="person" size={24} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
            >
                <View style={styles.aboutSection}>
                    <Text style={styles.aboutTitle}>YUNUS IAS ACADEMY</Text>
                    <Text style={styles.aboutSubtitle}>TNPSC - AE / JDO / SURVEYOR</Text>
                    <Text style={styles.aboutSubtitle}>TNPSC- GROUP 1 / GROUP 2 & 2A / GROUP 4</Text>

                    <View style={styles.infoRow}><Text style={styles.infoLabel}>CLASSES COMMENCE ON: </Text><Text style={styles.infoValue}>30.05.2025</Text></View>
                    <View style={styles.infoRow}><Text style={styles.infoLabel}>DAYS: </Text><Text style={styles.infoValue}>Monday to Friday</Text></View>
                    <View style={styles.infoRow}><Text style={styles.infoLabel}>TIME: </Text><Text style={styles.infoValue}>9.00 p.m - 10.30 p.m</Text></View>
                    <View style={styles.infoRow}><Text style={styles.infoLabel}>DURATION: </Text><Text style={styles.infoValue}>35 days</Text></View>


                    <View style={styles.feesSection}>
                        <Text style={styles.sectionTitle}>Fees Structure</Text>
                        <View style={styles.feeRow}><Text style={styles.feeAmount}>₹2000/-</Text><Text style={styles.feeDesc}>Unit VI: History, Culture, Heritage, and Socio Political Movements in Tamil Nadu</Text></View>
                        <View style={styles.feeRow}><Text style={styles.feeAmount}>₹2250/-</Text><Text style={styles.feeDesc}>Unit V: Indian Economy and Development Administration in Tamil Nadu</Text></View>
                        <View style={styles.feeRow}><Text style={styles.feeAmount}>₹1500/-</Text><Text style={styles.feeDesc}>Unit IV: Indian Polity</Text></View>
                        <View style={styles.feeRow}><Text style={styles.feeAmount}>₹3500/-</Text><Text style={styles.feeDesc}>Unit IV + Unit VI + Unit V</Text></View>
                        <View style={styles.feeRow}><Text style={styles.feeAmount}>₹5000/-</Text><Text style={styles.feeDesc}>Unit IV + Unit VI + Unit V (All Units)</Text></View>
                    </View>

                    <View style={styles.instructorSection}>
                        <Image source={require('../../../assets/yunus_photo.png')} style={styles.instructorImage} />
                        <Text style={styles.instructorName}>S. Yunus Mohamed</Text>
                        <Text style={styles.instructorTitle}>B.Tech., M.E., DLLAL</Text>
                        <Text style={styles.instructorDesc}>(Construction Engineering Management)</Text>
                        <Text style={styles.instructorDesc}>College of Engineering - Guindy Anna University</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    welcomeSection: {
        flex: 1,
    },
    greeting: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    profilePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
    },
    aboutSection: {
        padding: 24,
        backgroundColor: '#fff',
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    aboutTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    aboutSubtitle: {
        fontSize: 18,
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
    },
    infoLabel: {
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: 15,
    },
    infoValue: {
        color: '#34495e',
        marginLeft: 8,
        fontSize: 15,
        flex: 1,
    },
    unitTitle: {
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 16,
        fontSize: 18,
        marginBottom: 4,
    },
    unitDesc: {
        color: '#2c3e50',
        marginBottom: 8,
        fontSize: 15,
        lineHeight: 22,
    },
    feesSection: {
        marginTop: 24,
        marginBottom: 24,
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
    },
    feeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    feeAmount: {
        fontWeight: 'bold',
        color: COLORS.primary,
        width: 90,
        fontSize: 16,
    },
    feeDesc: {
        flex: 1,
        color: '#2c3e50',
        fontSize: 15,
        lineHeight: 22,
    },
    instructorSection: {
        alignItems: 'center',
        marginTop: 24,
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 12,
    },
    instructorImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    instructorName: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#2c3e50',
        marginBottom: 4,
    },
    instructorTitle: {
        fontSize: 16,
        color: '#34495e',
        marginBottom: 4,
    },
    instructorDesc: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    aboutContent: {
        alignItems: 'center',
    },
    aboutImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 20,
    },
    aboutDescription: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 4,
    },
    coursesSection: {
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 20,
    },
    coursesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    courseCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    courseImage: {
        width: '100%',
        height: 200,
    },
    courseInfo: {
        padding: 15,
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
    },
    courseMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 10,
        textAlign: 'center',
    },
    emptyStateSubText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 5,
        textAlign: 'center',
    },
    categoriesSection: {
        padding: 20,
        marginTop: 20,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    categoryTitle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
    },
});

export default HomeScreen;

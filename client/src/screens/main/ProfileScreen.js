import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    Switch,
    Modal,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../utils/theme';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import userService from '../../services/userService';

const PROFILE_PHOTO_KEY = '@profile_photo';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, isLoading: authLoading } = useContext(AuthContext);

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [showPhotoMenu, setShowPhotoMenu] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        loadProfilePhoto();
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

    const saveProfilePhoto = async (uri) => {
        try {
            await AsyncStorage.setItem(PROFILE_PHOTO_KEY, uri);
        } catch (error) {
            console.error('Error saving profile photo:', error);
        }
    };

    const requestPermission = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Sorry, we need camera roll permissions to make this work!',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        try {
            setLoading(true);
            const response = await userService.updateProfile({ name });
            if (response.data) {
                Alert.alert('Success', 'Profile updated successfully');
                setIsEditing(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoPress = () => {
        setShowPhotoMenu(true);
    };

    const handleChangePhoto = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                const newImageUri = result.assets[0].uri;
                setProfileImage({ uri: newImageUri });
                await saveProfilePhoto(newImageUri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        } finally {
            setShowPhotoMenu(false);
        }
    };

    const handleRemovePhoto = () => {
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove your profile photo?',
            [
                { text: 'Cancel', style: 'cancel', onPress: () => setShowPhotoMenu(false) },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        setProfileImage(null);
                        await AsyncStorage.removeItem(PROFILE_PHOTO_KEY);
                        setShowPhotoMenu(false);
                    }
                }
            ]
        );
    };

    const renderProfileHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={() => setShowPhotoMenu(true)}
            >
                {profileImage ? (
                    <Image source={profileImage} style={styles.profileImage} />
                ) : (
                    <View style={styles.profileImagePlaceholder}>
                        <Ionicons name="person" size={40} color="#fff" />
                    </View>
                )}
                <View style={styles.editIconContainer}>
                    <Ionicons name="camera" size={20} color="#fff" />
                </View>
            </TouchableOpacity>

            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <Text style={styles.email}>{user?.email || ''}</Text>

            <Modal
                visible={showPhotoMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPhotoMenu(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPhotoMenu(false)}
                >
                    <View style={styles.photoMenu}>
                        <TouchableOpacity
                            style={styles.photoMenuItem}
                            onPress={handleChangePhoto}
                        >
                            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                            <Text style={styles.photoMenuText}>Change Photo</Text>
                        </TouchableOpacity>
                        {profileImage && (
                            <TouchableOpacity
                                style={[styles.photoMenuItem, styles.photoMenuDelete]}
                                onPress={handleRemovePhoto}
                            >
                                <Ionicons name="trash-outline" size={24} color="#e74c3c" />
                                <Text style={[styles.photoMenuText, styles.photoMenuDeleteText]}>Remove Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );

    const renderProfileForm = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

            </View>

            {isEditing ? (
                <View style={styles.formContainer}>
                    <FormInput
                        label="Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                    />

                    <FormInput
                        label="Email"
                        value={email}
                        editable={false}
                        style={styles.disabledInput}
                    />

                    <View style={styles.buttonRow}>
                        <Button
                            title="Cancel"
                            onPress={() => {
                                setName(user?.name || '');
                                setIsEditing(false);
                            }}
                            type="secondary"
                            style={styles.buttonMargin}
                        />
                        <Button
                            title="Save"
                            onPress={handleSaveProfile}
                            loading={loading}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
                    </View>
                </View>
            )}
        </View>
    );

    const renderSettings = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                    <Text style={styles.settingDescription}>
                        Receive notifications about new courses and updates
                    </Text>
                </View>
                <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#d0d0d0', true: COLORS.primary }}
                    thumbColor="#fff"
                />
            </View>
        </View>
    );

    const renderActions = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('HelpSupport')}
            >
                <View style={styles.actionInfo}>
                    <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.actionText}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#7f8c8d" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('TermsPrivacy')}
            >
                <View style={styles.actionInfo}>
                    <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.actionText}>Terms & Privacy</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#7f8c8d" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleLogout}
            >
                <View style={styles.actionInfo}>
                    <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
                    <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView style={styles.scrollView}>
                {renderProfileHeader()}
                {renderProfileForm()}
                {renderSettings()}
                {renderActions()}
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
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
    },
    profileImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#bdc3c7',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 12,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 16,
        padding: 20,
        borderRadius: 12,
        marginHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    formContainer: {
        gap: 16,
    },
    infoContainer: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoLabel: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    infoValue: {
        fontSize: 16,
        color: '#2c3e50',
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    buttonMargin: {
        marginRight: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        color: '#2c3e50',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    actionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    actionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 16,
        color: '#2c3e50',
        marginLeft: 12,
    },
    logoutButton: {
        borderBottomWidth: 0,
        marginTop: 8,
    },
    logoutText: {
        color: '#e74c3c',
    },
    disabledInput: {
        backgroundColor: '#f8f9fa',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoMenu: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        width: '80%',
        maxWidth: 300,
    },
    photoMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    photoMenuText: {
        fontSize: 16,
        color: '#2c3e50',
        marginLeft: 12,
    },
    photoMenuDelete: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 8,
    },
    photoMenuDeleteText: {
        color: '#e74c3c',
    },
});

export default ProfileScreen; 
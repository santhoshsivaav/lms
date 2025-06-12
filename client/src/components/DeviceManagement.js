import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const DeviceManagement = () => {
    const { token } = useAuth();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDevices = async () => {
        try {
            const response = await fetch(`${API_URL}/api/devices`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.data) {
                setDevices(data.data);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
            Alert.alert('Error', 'Failed to fetch devices');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleRemoveDevice = async (deviceId) => {
        Alert.alert(
            'Remove Device',
            'Are you sure you want to remove this device?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/api/devices/${deviceId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (response.ok) {
                                setDevices(devices.filter(device => device._id !== deviceId));
                                Alert.alert('Success', 'Device removed successfully');
                            } else {
                                throw new Error('Failed to remove device');
                            }
                        } catch (error) {
                            console.error('Error removing device:', error);
                            Alert.alert('Error', 'Failed to remove device');
                        }
                    }
                }
            ]
        );
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType) {
            case 'mobile':
                return 'smartphone';
            case 'tablet':
                return 'tablet';
            case 'desktop':
                return 'desktop-mac';
            default:
                return 'devices';
        }
    };

    const renderDevice = ({ item }) => (
        <View style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
                <Icon name={getDeviceIcon(item.deviceType)} size={24} color="#666" />
                <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{item.deviceName}</Text>
                    <Text style={styles.deviceType}>{item.deviceType}</Text>
                </View>
                {item.isActive && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>Active</Text>
                    </View>
                )}
            </View>

            <View style={styles.deviceDetails}>
                <Text style={styles.detailText}>
                    <Icon name="computer" size={16} color="#666" /> {item.browser}
                </Text>
                <Text style={styles.detailText}>
                    <Icon name="public" size={16} color="#666" /> {item.location}
                </Text>
                <Text style={styles.detailText}>
                    <Icon name="access-time" size={16} color="#666" /> Last active: {format(new Date(item.lastActive), 'MMM d, yyyy h:mm a')}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveDevice(item._id)}
            >
                <Icon name="delete" size={20} color="#ff4444" />
                <Text style={styles.removeButtonText}>Remove Device</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Device Management</Text>
                <Text style={styles.subtitle}>
                    Manage your devices ({devices.length}/2)
                </Text>
            </View>

            <FlatList
                data={devices}
                renderItem={renderDevice}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchDevices();
                        }}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="devices" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No devices found</Text>
                    </View>
                }
            />
        </View>
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
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    listContainer: {
        padding: 16,
    },
    deviceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    deviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    deviceInfo: {
        flex: 1,
        marginLeft: 12,
    },
    deviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    deviceType: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    activeBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    deviceDetails: {
        marginTop: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    removeButtonText: {
        color: '#ff4444',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
});

export default DeviceManagement; 
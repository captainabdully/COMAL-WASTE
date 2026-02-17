import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5001';

export default function Profile() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        email: '',
        name: '',
        phone: '',
        userId: '',
        joinedDate: '',
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const email = await SecureStore.getItemAsync('userEmail');
            const userId = await SecureStore.getItemAsync('userId');
            const token = await SecureStore.getItemAsync('authToken');

            if (!userId || !token) {
                setLoading(false);
                return;
            }

            // 1. Fetch User Details
            const userRes = await fetch(`${API_URL}/api/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userJson = await userRes.json();
            const user = userJson || {}; // Adjusted to match backend response

            // 2. Fetch User Orders for Stats
            // Note: Assuming getVendorOrders returns all orders for a vendor.
            // If user is admin/manager, we might want different stats, but for now stick to vendor logic or empty.
            let stats = {
                totalPickups: 0,
                completedPickups: 0,
                pendingPickups: 0,
                totalSpent: 'Tsh 0',
            };

            try {
                const orderEndpoint = `/api/pickup-order/${userId}`;
                const orderRes = await fetch(`${API_URL}${orderEndpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (orderRes.ok) {
                    const orderJson = await orderRes.json();
                    const orders = orderJson.data || [];

                    stats.totalPickups = orders.length;
                    stats.completedPickups = orders.filter(o => o.status === 'completed').length;
                    stats.pendingPickups = orders.filter(o => o.status === 'pending' || o.status === 'assigned').length;

                    // Calculate total earned/spent (based on price)
                    const total = orders.reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);
                    stats.totalSpent = `Tsh ${total.toLocaleString()}`;
                }
            } catch (e) {
                console.log("Error fetching orders for stats:", e);
            }

            setUserData({
                email: user.email || email,
                name: user.name || (email ? email.split('@')[0] : 'User'),
                phone: user.phone_number || '',
                userId: userId,
                joinedDate: user.created_at ? new Date(user.created_at).toDateString() : '',
                ...stats
            });

        } catch (error) {
            console.error('Error loading user data:', error);
            Alert.alert("Error", "Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await SecureStore.deleteItemAsync('authToken');
                        await SecureStore.deleteItemAsync('userId');
                        await SecureStore.deleteItemAsync('userEmail');
                        await SecureStore.deleteItemAsync('userPhone');
                        router.replace('/sign-in');
                    }
                },
            ]
        );
    };

    const handleChangePassword = () => {
        router.push('/change-password');
    };

    const handleEditProfile = () => {
        router.push('/edit-profile');
    };

    const handleViewPickups = () => {
        router.push('/');
    };

    const styles = {
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
        },
        header: {
            backgroundColor: '#4CAF50',
            paddingTop: 60,
            paddingBottom: 20,
            paddingHorizontal: 20,
        },
        headerContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        userInfo: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        avatar: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#FFF',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
        },
        avatarText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#4CAF50',
        },
        welcomeText: {
            color: '#FFF',
            fontSize: 16,
        },
        userName: {
            color: '#FFF',
            fontSize: 22,
            fontWeight: 'bold',
        },
        logoutButton: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: 10,
            borderRadius: 8,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        profileCard: {
            backgroundColor: '#FFF',
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        statsCard: {
            backgroundColor: '#FFF',
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 15,
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        statItem: {
            width: '48%',
            backgroundColor: '#f9f9f9',
            borderRadius: 10,
            padding: 15,
            marginBottom: 10,
            alignItems: 'center',
        },
        statValue: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#4CAF50',
            marginBottom: 5,
        },
        statLabel: {
            fontSize: 12,
            color: '#666',
            textAlign: 'center',
        },
        infoItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
        },
        infoIcon: {
            width: 40,
            alignItems: 'center',
        },
        infoContent: {
            flex: 1,
        },
        infoLabel: {
            fontSize: 12,
            color: '#999',
            marginBottom: 2,
        },
        infoValue: {
            fontSize: 16,
            color: '#333',
            fontWeight: '500',
        },
        menuCard: {
            backgroundColor: '#FFF',
            borderRadius: 15,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
        },
        lastMenuItem: {
            borderBottomWidth: 0,
        },
        menuIcon: {
            width: 40,
            alignItems: 'center',
        },
        menuText: {
            flex: 1,
            fontSize: 16,
            color: '#333',
        },
        menuArrow: {
            paddingLeft: 10,
        },
        backButton: {
            padding: 5,
        },
        backButtonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.welcomeText}>Hello,</Text>
                        <Text style={styles.userName}>{userData.name}</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Information */}
                <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>Account Information</Text>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="mail-outline" size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email Address</Text>
                            <Text style={styles.infoValue}>{userData.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="call-outline" size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>{userData.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="person-outline" size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>User ID</Text>
                            <Text style={styles.infoValue}>{userData.userId}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Member Since</Text>
                            <Text style={styles.infoValue}>{userData.joinedDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Statistics */}
                <View style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Pickup Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userData.totalPickups}</Text>
                            <Text style={styles.statLabel}>Total Pickups</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userData.completedPickups}</Text>
                            <Text style={styles.statLabel}>Completed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userData.pendingPickups}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userData.totalSpent}</Text>
                            <Text style={styles.statLabel}>Total Spent</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Options */}
                <View style={styles.menuCard}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleEditProfile}
                    >
                        <View style={styles.menuIcon}>
                            <Ionicons name="create-outline" size={22} color="#4CAF50" />
                        </View>
                        <Text style={styles.menuText}>Edit Profile</Text>
                        <View style={styles.menuArrow}>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleChangePassword}
                    >
                        <View style={styles.menuIcon}>
                            <Ionicons name="lock-closed-outline" size={22} color="#FF9800" />
                        </View>
                        <Text style={styles.menuText}>Change Password</Text>
                        <View style={styles.menuArrow}>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, styles.lastMenuItem]}
                        onPress={handleViewPickups}
                    >
                        <View style={styles.menuIcon}>
                            <Ionicons name="cube-outline" size={22} color="#2196F3" />
                        </View>
                        <Text style={styles.menuText}>My Pickups</Text>
                        <View style={styles.menuArrow}>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
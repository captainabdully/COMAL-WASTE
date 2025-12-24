import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:5001';

// Dropping points data
const DROPPING_POINTS = [
  {
    id: 1,
    name: 'City Center Collection',
    address: '123 Main Street, Downtown',
   
    categories: [
      { id: 'heavy', name: 'Heavy', price: 'Tsh50/kg', color: '#FF6B6B' },
      { id: 'mixer', name: 'Mixer', price: 'Tsh40/kg', color: '#4ECDC4' },
      { id: 'light', name: 'Light', price: 'Tsh30/kg', color: '#FFD166' },
      { id: 'cast', name: 'Cast', price: 'Tsh60/kg', color: '#06D6A0' },
    ]
  },
  {
    id: 2,
    name: 'Green Valley Station',
    address: '456 Green Valley Road',
    
    categories: [
      { id: 'heavy', name: 'Heavy', price: 'Tsh55/kg', color: '#FF6B6B' },
      { id: 'mixer', name: 'Mixer', price: 'Tsh45/kg', color: '#4ECDC4' },
      { id: 'light', name: 'Light', price: 'Tsh35/kg', color: '#FFD166' },
      { id: 'cast', name: 'Cast', price: 'Tsh65/kg', color: '#06D6A0' },
    ]
  },
  {
    id: 3,
    name: 'Eco Park Depot',
    address: 'Eco Park, Sector 15',
  
    categories: [
      { id: 'heavy', name: 'Heavy', price: 'Tsh48/kg', color: '#FF6B6B' },
      { id: 'mixer', name: 'Mixer', price: 'Tsh38/kg', color: '#4ECDC4' },
      { id: 'light', name: 'Light', price: 'Tsh28/kg', color: '#FFD166' },
      { id: 'cast', name: 'Cast', price: 'Tsh58/kg', color: '#06D6A0' },
    ]
  },
  {
    id: 4,
    name: 'Industrial Zone Center',
    address: 'Industrial Area, Phase 2',
    
    categories: [
      { id: 'heavy', name: 'Heavy', price: 'Tsh45/kg', color: '#FF6B6B' },
      { id: 'mixer', name: 'Mixer', price: 'Tsh35/kg', color: '#4ECDC4' },
      { id: 'light', name: 'Light', price: 'Tsh25/kg', color: '#FFD166' },
      { id: 'cast', name: 'Cast', price: 'Tsh55/kg', color: '#06D6A0' },
    ]
  },
  {
    id: 5,
    name: 'Residential Hub',
    address: '789 Residential Complex',
    
    categories: [
      { id: 'heavy', name: 'Heavy', price: 'Tsh52/kg', color: '#FF6B6B' },
      { id: 'mixer', name: 'Mixer', price: 'Tsh42/kg', color: '#4ECDC4' },
      { id: 'light', name: 'Light', price: 'Tsh32/kg', color: '#FFD166' },
      { id: 'cast', name: 'Cast', price: 'Tsh62/kg', color: '#06D6A0' },
    ]
  },
  {
    id: 6,
    name: 'Market Area Station',
    address: 'Central Market, 1st Floor',
    
    categories: [
      { id: 'heavy', name: 'Heavy', price: 'Tsh53/kg', color: '#FF6B6B' },
      { id: 'mixer', name: 'Mixer', price: 'Tsh43/kg', color: '#4ECDC4' },
      { id: 'light', name: 'Light', price: 'Tsh33/kg', color: '#FFD166' },
      { id: 'cast', name: 'Cast', price: 'Tsh63/kg', color: '#06D6A0' },
    ]
  },
];

export default function DroppingPoints() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const email = await SecureStore.getItemAsync('userEmail');
    if (email) setUserEmail(email.split('@')[0]);
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
            router.replace('/sign-in');
          }
        },
      ]
    );
  };



  const renderDroppingPoint = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.pointCard,
        selectedPoint?.id === item.id && styles.selectedPointCard
      ]}
      onPress={() => setSelectedPoint(item)}
    >
      <View style={styles.pointHeader}>
        <View style={styles.pointInfo}>
          <Text style={styles.pointName}>{item.name}</Text>
          
        </View>
      
      </View>

      <Text style={styles.pointAddress}>{item.address}</Text>

      {/* Categories Grid */}
      <View style={styles.categoriesGrid}>
        {item.categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory?.id === category.id && styles.selectedCategoryCard,
              { borderLeftColor: category.color }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryPrice}>{category.price}</Text>
            
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );

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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    welcomeText: {
      color: '#FFF',
      fontSize: 16,
    },
    userName: {
      color: '#FFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    logoutButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: 10,
      borderRadius: 8,
    },
    mainContent: {
      flex: 1,
      padding: 20,
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
    },
    pointsList: {
      flex: 1,
    },
    pointCard: {
      backgroundColor: '#FFF',
      borderRadius: 15,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedPointCard: {
      borderColor: '#4CAF50',
      backgroundColor: '#F0F9F0',
    },
    pointHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    pointInfo: {
      flex: 1,
    },
    pointName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 5,
    },
    pointMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: '#666',
    },
    pointAddress: {
      fontSize: 14,
      color: '#666',
      marginBottom: 15,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    categoryCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: '#FFF',
      borderRadius: 10,
      padding: 12,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: '#eee',
      position: 'relative',
    },
    selectedCategoryCard: {
      backgroundColor: '#F8F9FF',
      borderColor: '#4CAF50',
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 5,
    },
    categoryPrice: {
      fontSize: 12,
      color: '#666',
    },
    selectedIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
    },

    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#4CAF50',
      padding: 16,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>


        <View style={styles.headerContent}>

          <View style={styles.userInfo}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userEmail}</Text>
            </View>

          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.pageTitle}>Daily prices</Text>

        <FlatList
          data={DROPPING_POINTS}
          renderItem={renderDroppingPoint}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          style={styles.pointsList}
        />
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-pickup')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

    </View>
  );
}
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5001';

const CATEGORY_COLORS = {
  heavy: '#FF6B6B',
  mixer: '#4ECDC4',
  light: '#FFD166',
  cast: '#06D6A0',
  default: '#CCCCCC',
};

export default function DroppingPoints() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [droppingPoints, setDroppingPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    fetchData();
  }, []);

  const loadUser = async () => {
    const email = await SecureStore.getItemAsync('userEmail');
    if (email) setUserEmail(email.split('@')[0]);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("authToken");

      // 1. Fetch Dropping Points
      const pointsRes = await fetch(`${API_URL}/api/dropping-point`, {
        // headers: { 'Authorization': `Bearer ${token}` } // Assuming public or token optional for view
      });
      const pointsData = await pointsRes.json();
      const points = pointsData.data || [];

      // 2. Fetch Today's Prices
      const pricesRes = await fetch(`${API_URL}/api/daily-price/today`, {
        // headers: { 'Authorization': `Bearer ${token}` }
      });
      const pricesJson = await pricesRes.json();
      const prices = pricesJson.data || [];

      // 3. Merge Data
      // Create a map of droppingPointId -> categories array
      const pricesMap = {};
      prices.forEach(p => {
        if (!pricesMap[p.dropping_point_id]) {
          pricesMap[p.dropping_point_id] = [];
        }
        pricesMap[p.dropping_point_id].push({
          id: p.category, // using category name as id for UI logic
          name: p.category.charAt(0).toUpperCase() + p.category.slice(1),
          price: `Tsh${p.price}/kg`,
          color: CATEGORY_COLORS[p.category] || CATEGORY_COLORS.default
        });
      });

      // Attach categories to points
      const mergedPoints = points.map(point => ({
        id: point.id,
        name: point.location_name,
        address: point.address,
        categories: pricesMap[point.id] || []
      }));

      setDroppingPoints(mergedPoints);

    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load dropping points");
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

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={droppingPoints}
            renderItem={renderDroppingPoint}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.pointsList}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                No dropping points available
              </Text>
            }
          />
        )}
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
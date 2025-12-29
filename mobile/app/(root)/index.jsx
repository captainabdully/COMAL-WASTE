// app/(root)/index.jsx
import { useRouter } from "expo-router";
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import { BalanceCard } from "../../components/BalanceCard";
import NoTransactionsFound from "../../components/NoTransactionsFound";

import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5001';
// New styles for pickup layout
const pickupStyles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  pickupCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickupId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  pickupStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  pickupDetails: {
    marginBottom: 15,
  },
  pickupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pickupLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  pickupValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  pickupComment: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  noPickupsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  noPickupsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
};

// Status colors mapping
const statusColors = {
  pending: { bg: '#FFE082', text: '#E65100' },
  assigned: { bg: '#C8E6C9', text: '#2E7D32' },
  completed: { bg: '#BBDEFB', text: '#1565C0' },
  cancelled: { bg: '#FFCDD2', text: '#C62828' },
};

export default function PickupRequests() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState("User");
  const [pickups, setPickups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const email = await SecureStore.getItemAsync("userEmail");
      const id = await SecureStore.getItemAsync("userId");
      const name = await SecureStore.getItemAsync("userName");
      const rolesStr = await SecureStore.getItemAsync("userRoles");

      if (name) setUserEmail(name); // Use name if available, otherwise email logic
      else if (email) setUserEmail(email.split("@")[0]);

      if (rolesStr) {
        try {
          const roles = JSON.parse(rolesStr);
          setIsAdmin(roles.includes("admin") || roles.includes("manager"));
        } catch (e) {
          console.error("Error parsing roles", e);
        }
      }

      if (id) loadPickups();
    }
    loadUser();
  }, []);

  const loadPickups = async () => {
    try {
      setIsLoading(true);
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("authToken");
      const rolesStr = await SecureStore.getItemAsync("userRoles");

      let endpoint = `/api/pickup-order/${userId}`; // Default: vendor view (my orders)

      // If admin, fetch ALL orders
      if (rolesStr && (rolesStr.includes("admin") || rolesStr.includes("manager"))) {
        endpoint = '/api/pickup-order';
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setPickups(result.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (error) {
      console.error('Error loading pickups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPickups();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync("authToken");
            await SecureStore.deleteItemAsync("userId");
            await SecureStore.deleteItemAsync("userEmail");
            await SecureStore.deleteItemAsync("userName");
            await SecureStore.deleteItemAsync("userRoles");
            router.replace("/sign-in");
          }
        },
      ]
    );
  };

  const handlePickupAction = async (id, action) => {
    Alert.alert(
      `${action === 'accept' ? 'Accept' : 'Reject'} Pickup`,
      `Are you sure you want to ${action} this pickup request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === 'accept' ? 'Accept' : 'Reject',
          style: action === 'accept' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("authToken");
              // Map UI actions to DB statuses: accept -> assigned, reject -> cancelled
              const status = action === 'accept' ? 'assigned' : 'cancelled';

              const response = await fetch(`${API_URL}/api/pickup-order/${id}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
              });

              if (response.ok) {
                // Update local state
                setPickups(pickups.map(pickup =>
                  pickup.id === id ? { ...pickup, status } : pickup
                ));
                Alert.alert("Success", `Pickup request ${status} successfully`);
              } else {
                throw new Error("Failed to update status");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", `Failed to ${action} pickup request`);
            }
          }
        },
      ]
    );
  };

  const handleCreatePickup = () => {
    router.push("/create-pickup"); // You'll need to create this screen
  };

  if (isLoading && !refreshing) return <PageLoader />;

  const getInitials = (email) => {
    return email.charAt(0).toUpperCase();
  };

  const renderPickupItem = ({ item }) => {
    const statusStyle = statusColors[item.status] || statusColors.pending;

    return (
      <View style={pickupStyles.pickupCard}>
        <View style={pickupStyles.pickupHeader}>
          <Text style={pickupStyles.pickupId}>Order: {item.order_id}</Text>
          <View style={[pickupStyles.pickupStatus, { backgroundColor: statusStyle.bg }]}>
            <Text style={{ color: statusStyle.text, textTransform: 'capitalize' }}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={pickupStyles.pickupDetails}>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>Category:</Text>
            <Text style={pickupStyles.pickupValue}>{item.category}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>Quantity:</Text>
            <Text style={pickupStyles.pickupValue}>{item.quantity} items</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>Price:</Text>
            <Text style={pickupStyles.pickupValue}>{item.price}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>Phone:</Text>
            <Text style={pickupStyles.pickupValue}>{item.phone_number}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>Drop Point:</Text>
            <Text style={pickupStyles.pickupValue}>{item.location_name}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>Created:</Text>
            <Text style={pickupStyles.pickupValue}>{item.created_at}</Text>
          </View>
        </View>

        {item.comment ? (
          <Text style={pickupStyles.pickupComment}>Note: {item.comment}</Text>
        ) : null}

        {item.status === 'pending' && isAdmin && (
          <View style={pickupStyles.actionButtons}>
            <TouchableOpacity
              style={[pickupStyles.actionButton, pickupStyles.rejectButton]}
              onPress={() => handlePickupAction(item.id, 'reject')}
            >
              <Text style={pickupStyles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[pickupStyles.actionButton, pickupStyles.acceptButton]}
              onPress={() => handlePickupAction(item.id, 'accept')}
            >
              <Text style={pickupStyles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={{
            marginTop: 10,
            padding: 10,
            backgroundColor: '#eee',
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={() => router.push(`/pickup-details/${item.id}`)}
        >
          <Text style={{ color: '#333', fontWeight: '600' }}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={pickupStyles.container}>
      <View style={pickupStyles.header}>
        <View style={pickupStyles.headerContent}>

          <View style={pickupStyles.userInfo}>
            <View style={pickupStyles.avatar}>
              {/* <Text style={pickupStyles.avatarText}>{getInitials(userEmail)}</Text>
               */}
              <TouchableOpacity
                onPress={() => router.push('/profile')}
                style={{ padding: 4 }}
              >
                <Ionicons name="person-circle-outline" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={pickupStyles.welcomeText}>Welcome back,</Text>
              <Text style={pickupStyles.userName}>{userEmail}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogout} style={pickupStyles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>

        </View>
        <TouchableOpacity
          onPress={() => router.push('/dropping-point')}
          style={{
            backgroundColor: '#4CAF50',
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="location" size={20} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Our dropping points</Text>
        </TouchableOpacity>
      </View>

      <View style={pickupStyles.mainContent}>
        <Text style={pickupStyles.sectionTitle}>Pickup Requests</Text>

        <FlatList
          data={pickups}
          renderItem={renderPickupItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={pickupStyles.noPickupsContainer}>
              <Ionicons name="cube-outline" size={64} color="#CCC" />
              <Text style={pickupStyles.noPickupsText}>No pickup requests found</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>


      {/* <TouchableOpacity
        style={pickupStyles.fab}
        onPress={() => router.push('/create-pickup')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity> */}
    </View>
  );
}
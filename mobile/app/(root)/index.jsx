// app/(root)/index.jsx
import { useRouter } from "expo-router";
import { Alert, FlatList, Image, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";


import { API_URL } from "../../constants/api";
import { formatQuantity } from "../../constants/formatters";
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../contexts/LanguageContext";
// New styles for pickup layout
// Status colors mapping
const statusColors = {
  pending: { bg: '#FFE082', text: '#E65100' },
  assigned: { bg: '#C8E6C9', text: '#2E7D32' },
  completed: { bg: '#BBDEFB', text: '#1565C0' },
  cancelled: { bg: '#FFCDD2', text: '#C62828' },
};

export default function PickupRequests() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const pickupStyles = {
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      backgroundColor: '#4CAF50',
      paddingTop: insets.top + 10,
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
      flex: 1,
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
    gradientBtn: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 18,
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2E7D32', // Solid color to avoid complexity
    },
    gradientText: {
      color: '#FFF',
      fontWeight: '800',
      fontSize: 18,
      marginLeft: 8,
    },
  };
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState("User");
  const [pickups, setPickups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [rejectionOrderId, setRejectionOrderId] = useState(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

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
      const data = Array.isArray(result) ? result : (result.data || []);

      if (response.ok) {
        setPickups(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
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
      t("logout"),
      t("logoutQuestion"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("logout"),
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
    if (action === "reject") {
      setRejectionOrderId(id);
      setRejectionComment("");
      return;
    }

    Alert.alert(
      t("acceptPickup"),
      t("acceptPickupQuestion"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("accept"),
          style: "default",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("authToken");
              // Map UI actions to DB statuses: accept -> assigned, reject -> cancelled
              const status = "assigned";

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
                Alert.alert(t("success"), t("pickupUpdated"));
              } else {
                throw new Error(t("pickupUpdateFailed"));
              }
            } catch (error) {
              console.error(error);
              Alert.alert(t("error"), t("pickupUpdateFailed"));
            }
          }
        },
      ]
    );
  };

  const submitRejection = async () => {
    if (!rejectionComment.trim()) {
      Alert.alert(t("error"), t("rejectionReasonRequired"));
      return;
    }

    try {
      setIsRejecting(true);
      const token = await SecureStore.getItemAsync("authToken");
      const response = await fetch(`${API_URL}/api/pickup-order/${rejectionOrderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled", rejection_comment: rejectionComment.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || t("pickupUpdateFailed"));

      setPickups((currentPickups) => currentPickups.map((pickup) => (
        pickup.id === rejectionOrderId
          ? { ...pickup, status: "cancelled", rejection_comment: rejectionComment.trim() }
          : pickup
      )));
      setRejectionOrderId(null);
      setRejectionComment("");
      Alert.alert(t("success"), t("rejectionSubmitted"));
    } catch (error) {
      console.error(error);
      Alert.alert(t("error"), error.message || t("pickupUpdateFailed"));
    } finally {
      setIsRejecting(false);
    }
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
          <View style={{ flex: 1 }}>
            <Text style={pickupStyles.pickupId}>{t("order")}: {item.order_id}</Text>
            <View style={[pickupStyles.pickupStatus, { backgroundColor: statusStyle.bg, alignSelf: 'flex-start', marginTop: 5 }]}>
              <Text style={{ color: statusStyle.text, textTransform: 'capitalize', fontSize: 12 }}>
                {t(item.status)}
              </Text>
            </View>
          </View>
          {item.image && (
            <Image
              source={{ 
                uri: item.image.startsWith('http') 
                  ? item.image 
                  : item.image.startsWith('/') 
                    ? `${API_URL}${item.image}`
                    : `${API_URL}/uploads/${item.image}`
              }}
              style={{ width: 60, height: 60, borderRadius: 10, marginLeft: 10 }}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={pickupStyles.pickupDetails}>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>{t("category")}:</Text>
            <Text style={pickupStyles.pickupValue}>{item.category}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>{t("quantity")}:</Text>
            <Text style={pickupStyles.pickupValue}>{formatQuantity(item.quantity)} {item.quantity_unit === 'tonne' ? 'tonne' : 'kg'}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>{t("price")}:</Text>
            <Text style={pickupStyles.pickupValue}>{item.price}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>{t("phone")}:</Text>
            <Text style={pickupStyles.pickupValue}>{item.phone_number}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>{t("dropPoint")}:</Text>
            <Text style={pickupStyles.pickupValue}>{item.location_name}</Text>
          </View>
          <View style={pickupStyles.pickupItem}>
            <Text style={pickupStyles.pickupLabel}>{t("created")}:</Text>
            <Text style={pickupStyles.pickupValue}>{item.created_at}</Text>
          </View>
        </View>

        {item.comment ? (
          <Text style={pickupStyles.pickupComment}>{t("note")}: {item.comment}</Text>
        ) : null}

        {item.status === "cancelled" && item.rejection_comment ? (
          <View style={{ marginTop: 12, backgroundColor: "#FFF1F2", borderLeftColor: "#DC2626", borderLeftWidth: 4, borderRadius: 8, padding: 12 }}>
            <Text style={{ color: "#991B1B", fontWeight: "700", marginBottom: 4 }}>{t("rejectionReason")}</Text>
            <Text style={{ color: "#7F1D1D" }}>{item.rejection_comment}</Text>
          </View>
        ) : null}

        {item.status === 'pending' && isAdmin && (
          <View style={pickupStyles.actionButtons}>
            <TouchableOpacity
              style={[pickupStyles.actionButton, pickupStyles.rejectButton]}
              onPress={() => handlePickupAction(item.id, 'reject')}
            >
              <Text style={pickupStyles.actionButtonText}>{t("reject")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[pickupStyles.actionButton, pickupStyles.acceptButton]}
              onPress={() => handlePickupAction(item.id, 'accept')}
            >
              <Text style={pickupStyles.actionButtonText}>{t("accept")}</Text>
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
          <Text style={{ color: '#333', fontWeight: '600' }}>{t("viewDetails")}</Text>
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
              <Text style={pickupStyles.welcomeText}>{t("welcomeBack")}</Text>
              <Text style={pickupStyles.userName}>{userEmail}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <LanguageToggle light />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("logout")}
              onPress={handleLogout}
              style={pickupStyles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

        </View>
            <TouchableOpacity onPress={() => router.push('/dropping-point')} activeOpacity={0.8} style={pickupStyles.gradientBtn}>
      
          <Ionicons name="trending-up" size={22} color="#FFF" />
          <Text style={pickupStyles.gradientText}>{t("dailyPrices")}</Text>
        
      </TouchableOpacity>
      </View>

      <View style={pickupStyles.mainContent}>
        <Text style={pickupStyles.sectionTitle}>{t("pickupRequests")}</Text>

        <FlatList
          data={pickups}
          renderItem={renderPickupItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={pickupStyles.noPickupsContainer}>
              <Ionicons name="cube-outline" size={64} color="#CCC" />
              <Text style={pickupStyles.noPickupsText}>{t("noPickupRequests")}</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>


      {/* <TouchableOpacity
        style={pickupStyles.fab}
        onPress={() => router.push('/create-pickup')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity> */}

      {rejectionOrderId !== null && (
        <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#FFF", borderRadius: 16, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 8 }}>{t("rejectPickup")}</Text>
            <Text style={{ color: "#4B5563", marginBottom: 14 }}>{t("rejectionReason")}</Text>
            <TextInput
              value={rejectionComment}
              onChangeText={setRejectionComment}
              placeholder={t("rejectionReasonPlaceholder")}
              multiline
              autoFocus
              textAlignVertical="top"
              style={{ borderColor: "#D1D5DB", borderWidth: 1, borderRadius: 10, minHeight: 110, padding: 12, marginBottom: 16 }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity disabled={isRejecting} onPress={() => setRejectionOrderId(null)} style={{ padding: 12 }}>
                <Text style={{ color: "#4B5563", fontWeight: "600" }}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={isRejecting} onPress={submitRejection} style={{ backgroundColor: "#DC2626", borderRadius: 8, minWidth: 96, padding: 12, alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontWeight: "700" }}>{isRejecting ? "..." : t("reject")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

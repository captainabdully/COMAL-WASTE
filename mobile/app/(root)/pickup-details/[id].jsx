import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5001';

export default function PickupDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRoles, setUserRoles] = useState([]);
    const [userId, setUserId] = useState(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completionNotes, setCompletionNotes] = useState("");
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
        loadUserInfo();
    }, [id]);

    const loadUserInfo = async () => {
        const roles = await SecureStore.getItemAsync("userRoles");
        const uId = await SecureStore.getItemAsync("userId");
        if (roles) setUserRoles(JSON.parse(roles));
        if (uId) setUserId(uId);
    };

    const fetchOrderDetails = async () => {
        try {
            const token = await SecureStore.getItemAsync("authToken");
            const response = await fetch(`${API_URL}/api/pickup-order/order/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                setOrder(result.data);
            } else {
                Alert.alert("Error", "Failed to load order details");
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            Alert.alert("Error", "Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!completionNotes.trim()) {
            Alert.alert("Required", "Please enter completion notes");
            return;
        }

        try {
            setIsCompleting(true);
            const token = await SecureStore.getItemAsync("authToken");

            // 1. Record completion
            const compRes = await fetch(`${API_URL}/api/pickup-order/completion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    order_id: order.id,
                    completed_by: userId,
                    completion_notes: completionNotes
                })
            });

            if (!compRes.ok) throw new Error("Failed to record completion");

            // 2. Update status
            const statusRes = await fetch(`${API_URL}/api/pickup-order/${order.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'completed',
                    assigned_to: userId
                })
            });

            if (!statusRes.ok) throw new Error("Failed to update status");

            Alert.alert("Success", "Order marked as completed");
            setShowCompleteModal(false);
            setCompletionNotes("");
            fetchOrderDetails(); // Refresh details
        } catch (error) {
            console.error("Error completing order:", error);
            Alert.alert("Error", error.message || "Failed to complete order");
        } finally {
            setIsCompleting(false);
        }
    };

    const canComplete = (userRoles.includes('manager') || userRoles.includes('admin')) &&
        (order?.status === 'assigned' || order?.status === 'in-progress');

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Order not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#4CAF50' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <View style={{
                backgroundColor: '#4CAF50',
                paddingTop: 60,
                paddingBottom: 20,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>Order Details</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ backgroundColor: '#FFF', borderRadius: 15, padding: 20, shadowOpacity: 0.1, elevation: 3 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Order #{order.order_id}</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <View style={{
                            backgroundColor: order.status === 'pending' ? '#FFE082' :
                                order.status === 'assigned' ? '#C8E6C9' :
                                    order.status === 'cancelled' ? '#FFCDD2' : '#BBDEFB',
                            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10
                        }}>
                            <Text style={{ fontWeight: 'bold', color: '#333', textTransform: 'capitalize' }}>{order.status}</Text>
                        </View>
                    </View>

                    <DetailRow label="Category" value={order.category} />
                    <DetailRow label="Quantity" value={`${order.quantity} items`} />
                    <DetailRow label="Price" value={`${order.price} Tsh`} />
                    <DetailRow label="Dropping Point" value={order.location_name} />
                    <DetailRow label="Vendor Phone" value={order.phone_number} />
                    <DetailRow label="Date" value={new Date(order.created_at).toLocaleString()} />

                    {order.comment && (
                        <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' }}>
                            <Text style={{ color: '#666', marginBottom: 5 }}>Comments:</Text>
                            <Text style={{ fontStyle: 'italic' }}>{order.comment}</Text>
                        </View>
                    )}
                </View>

                {order.image && (
                    <View style={{ marginTop: 20, backgroundColor: '#FFF', borderRadius: 15, padding: 10, shadowOpacity: 0.1, elevation: 3 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 10 }}>Waste Photo</Text>
                        {/* If image is a filename, prepend API_URL/uploads/, else assume full URL if needed */}
                        <Image
                            source={{ uri: order.image.startsWith('http') ? order.image : `${API_URL}/uploads/${order.image}` }}
                            style={{ width: '100%', height: 300, borderRadius: 10 }}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {canComplete && (
                    <TouchableOpacity
                        onPress={() => setShowCompleteModal(true)}
                        style={{
                            backgroundColor: '#2196F3',
                            padding: 15,
                            borderRadius: 10,
                            alignItems: 'center',
                            marginTop: 20,
                            marginBottom: 40
                        }}
                    >
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Complete Order</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>

            {showCompleteModal && (
                <View style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <View style={{ backgroundColor: '#FFF', borderRadius: 15, padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Completion Notes</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#ddd',
                                borderRadius: 8,
                                padding: 10,
                                height: 100,
                                textAlignVertical: 'top',
                                marginBottom: 20
                            }}
                            multiline
                            placeholder="Enter notes about this collection..."
                            value={completionNotes}
                            onChangeText={setCompletionNotes}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity
                                onPress={() => setShowCompleteModal(false)}
                                style={{ padding: 10, marginRight: 15 }}
                            >
                                <Text style={{ color: '#666' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCompleteOrder}
                                disabled={isCompleting}
                                style={{
                                    backgroundColor: '#4CAF50',
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 8
                                }}
                            >
                                {isCompleting ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirm</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

// Add local import for TextInput if not already there
import { TextInput } from "react-native";

const DetailRow = ({ label, value }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <Text style={{ color: '#666' }}>{label}</Text>
        <Text style={{ fontWeight: '600', color: '#333' }}>{value}</Text>
    </View>
);

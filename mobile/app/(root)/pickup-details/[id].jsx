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

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

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

            </ScrollView>
        </View>
    );
}

const DetailRow = ({ label, value }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <Text style={{ color: '#666' }}>{label}</Text>
        <Text style={{ fontWeight: '600', color: '#333' }}>{value}</Text>
    </View>
);

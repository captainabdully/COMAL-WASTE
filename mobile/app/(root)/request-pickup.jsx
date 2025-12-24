import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:5001';

export default function RequestPickup() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [comment, setComment] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Parse params from navigation
  const droppingPoint = params.point ? JSON.parse(params.point) : null;
  const category = params.category ? JSON.parse(params.category) : null;

  useEffect(() => {
    if (!droppingPoint || !category) {
      Alert.alert('Error', 'Invalid selection');
      router.back();
    }
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [quantity]);

  const calculateTotalPrice = () => {
    if (!category || !quantity) {
      setTotalPrice(0);
      return;
    }

    const pricePerKg = parseInt(category.price.replace(/[^0-9]/g, ''));
    const qty = parseInt(quantity) || 1;
    setTotalPrice(pricePerKg * qty);
  };

  const handleRequestPickup = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setLoading(true);

    try {
      const vendor_id = await SecureStore.getItemAsync('userId');
      const phone_number = await SecureStore.getItemAsync('userPhone') || '+91 0000000000';

      const pickupData = {
        vendor_id,
        dropping_point_id: droppingPoint.id,
        category: category.id,
        price: totalPrice,
        phone_number,
        quantity: parseInt(quantity),
        comment: comment || `Pickup from ${droppingPoint.name} - ${category.name}`,
        image: 'default-waste-image.jpg',
      };

      const response = await fetch(`${API_URL}/api/pickup-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickupData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Pickup request submitted successfully!',
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
      } else {
        throw new Error(result.message || 'Failed to submit pickup request');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!droppingPoint || !category) {
    return null;
  }

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
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 5,
      marginRight: 10,
    },
    headerTitle: {
      color: '#FFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    summaryCard: {
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
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    infoLabel: {
      fontSize: 14,
      color: '#666',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
    },
    categoryBadge: {
      backgroundColor: category.color + '20',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      alignSelf: 'flex-start',
    },
    categoryText: {
      color: category.color,
      fontWeight: '600',
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#f9f9f9',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    priceSection: {
      backgroundColor: '#FFF',
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
    },
    priceLabel: {
      fontSize: 16,
      color: '#666',
      marginBottom: 10,
    },
    priceValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    submitButton: {
      backgroundColor: '#4CAF50',
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    submitButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Pickup</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dropping Point:</Text>
            <Text style={styles.infoValue}>{droppingPoint.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{droppingPoint.address}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category.name}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price per kg:</Text>
            <Text style={styles.infoValue}>{category.price}</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity (kg)</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="Enter quantity in kg"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Additional Comments (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={comment}
            onChangeText={setComment}
            placeholder="Any special instructions or notes"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.priceValue}>₹{totalPrice}</Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleRequestPickup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Confirm Pickup Request</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
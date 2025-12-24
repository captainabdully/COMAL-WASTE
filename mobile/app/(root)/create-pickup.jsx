import { useRouter } from "expo-router";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5001';

export default function CreatePickup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [droppingPoints, setDroppingPoints] = useState([]);
    const [categories, setCategories] = useState([
        'heavy',
        'light',
        'mixer',
        'cast'
    ]);

    // Form state
    const [formData, setFormData] = useState({
        dropping_point_id: '',
        category: '',
        price: '',
        phone_number: '',
        quantity: '',
        comment: '',
    });

    useEffect(() => {
        loadDroppingPoints();
    }, []);

    const loadDroppingPoints = async () => {
        try {
            const response = await fetch(`${API_URL}/api/dropping-point`);
            const result = await response.json();

            if (response.ok && result.data) {
                // Map API response to component state structure (location_name -> name)
                const points = result.data.map(point => ({
                    id: point.id,
                    name: point.location_name,
                    address: point.address || ''
                }));
                setDroppingPoints(points);
            }
        } catch (error) {
            console.error('Error loading dropping points:', error);
            Alert.alert('Error', 'Failed to load dropping points');
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please allow access to your photo library');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please allow camera access');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const uploadImage = async (uri) => {
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                name: `waste-photo-${Date.now()}.${match ? match[1] : 'jpg'}`,
                type,
            });

            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();
            return data.filename || data.imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        // Validate form
        if (!formData.dropping_point_id) {
            Alert.alert('Error', 'Please select a dropping point');
            return;
        }
        if (!formData.category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }
        if (!formData.phone_number || formData.phone_number.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            Alert.alert('Error', 'Please enter a valid quantity');
            return;
        }
        if (!image) {
            Alert.alert('Error', 'Please add a photo of the waste');
            return;
        }

        setLoading(true);

        try {
            // 1. Upload image
            const imageFilename = await uploadImage(image);
            if (!imageFilename) {
                throw new Error('Failed to upload image');
            }

            // 2. Get vendor_id from secure store
            const vendor_id = await SecureStore.getItemAsync('userId');
            const token = await SecureStore.getItemAsync('authToken');

            if (!vendor_id || !token) {
                throw new Error('User not authenticated');
            }

            // 3. Prepare pickup order data
            const pickupData = {
                vendor_id,
                dropping_point_id: parseInt(formData.dropping_point_id),
                category: formData.category,
                price: parseFloat(formData.price),
                phone_number: formData.phone_number,
                quantity: parseInt(formData.quantity),
                comment: formData.comment || '',
                image: imageFilename,
            };

            console.log('Submitting pickup order:', pickupData);

            // 4. Submit to API
            const response = await fetch(`${API_URL}/api/pickup-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(pickupData),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Success',
                    'Pickup order created successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                router.replace('/');
                            },
                        },
                    ]
                );
            } else {
                throw new Error(result.message || 'Failed to create pickup order');
            }
        } catch (error) {
            console.error('Error creating pickup order:', error);
            Alert.alert('Error', error.message || 'Failed to create pickup order. Please try again.');
        } finally {
            setLoading(false);
        }
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            color: '#FFF',
            fontSize: 20,
            fontWeight: 'bold',
        },
        backButton: {
            padding: 5,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        formContainer: {
            backgroundColor: '#FFF',
            borderRadius: 15,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        formGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: '#333',
            marginBottom: 8,
        },
        required: {
            color: '#f44336',
        },
        input: {
            backgroundColor: '#f9f9f9',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
        },
        picker: {
            backgroundColor: '#f9f9f9',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
        },
        pickerText: {
            fontSize: 16,
            color: '#333',
        },
        pickerPlaceholder: {
            color: '#999',
        },
        photoSection: {
            marginBottom: 20,
        },
        photoButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        photoButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            padding: 15,
            borderRadius: 8,
            marginHorizontal: 5,
        },
        photoButtonText: {
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '500',
            color: '#333',
        },
        imagePreview: {
            width: '100%',
            height: 200,
            borderRadius: 10,
            marginTop: 10,
            backgroundColor: '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center',
        },
        image: {
            width: '100%',
            height: '100%',
            borderRadius: 10,
        },
        removeImageButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 15,
            padding: 5,
        },
        submitButton: {
            backgroundColor: '#4CAF50',
            padding: 16,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 10,
        },
        submitButtonDisabled: {
            backgroundColor: '#cccccc',
        },
        submitButtonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
        },
        loadingButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        dropdownContainer: {
            position: 'relative',
        },
        dropdown: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#FFF',
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            marginTop: 5,
            maxHeight: 200,
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
        },
        dropdownItem: {
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
        },
        dropdownItemText: {
            fontSize: 16,
            color: '#333',
        },
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Pickup Request</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formContainer}>
                    {/* Dropping Point Selection */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Dropping Point <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.dropdownContainer}>
                            <TouchableOpacity
                                style={styles.picker}
                                onPress={() => {
                                    Alert.alert(
                                        'Select Dropping Point',
                                        'Choose a location:',
                                        droppingPoints.map(point => ({
                                            text: `${point.name} - ${point.address}`,
                                            onPress: () => handleInputChange('dropping_point_id', point.id.toString()),
                                        })).concat([{ text: 'Cancel', style: 'cancel' }])
                                    );
                                }}
                            >
                                <Text style={
                                    formData.dropping_point_id
                                        ? styles.pickerText
                                        : styles.pickerPlaceholder
                                }>
                                    {formData.dropping_point_id
                                        ? droppingPoints.find(p => p.id.toString() === formData.dropping_point_id)?.name || 'Selected'
                                        : 'Select dropping point'
                                    }
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Category Selection */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Category <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.dropdownContainer}>
                            <TouchableOpacity
                                style={styles.picker}
                                onPress={() => {
                                    Alert.alert(
                                        'Select Category',
                                        'Choose waste category:',
                                        categories.map(category => ({
                                            text: category,
                                            onPress: () => handleInputChange('category', category),
                                        })).concat([{ text: 'Cancel', style: 'cancel' }])
                                    );
                                }}
                            >
                                <Text style={
                                    formData.category
                                        ? styles.pickerText
                                        : styles.pickerPlaceholder
                                }>
                                    {formData.category || 'Select category'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Price */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Estimated Price (Tsh) <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter estimated price"
                            keyboardType="numeric"
                            value={formData.price}
                            onChangeText={(value) => handleInputChange('price', value)}
                        />
                    </View>

                    {/* Phone Number */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Phone Number <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                            value={formData.phone_number}
                            onChangeText={(value) => handleInputChange('phone_number', value)}
                        />
                    </View>

                    {/* Quantity */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Quantity <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter quantity"
                            keyboardType="numeric"
                            value={formData.quantity}
                            onChangeText={(value) => handleInputChange('quantity', value)}
                        />
                    </View>

                    {/* Comment */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Additional Comments</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Any special instructions or comments"
                            multiline
                            numberOfLines={4}
                            value={formData.comment}
                            onChangeText={(value) => handleInputChange('comment', value)}
                        />
                    </View>

                    {/* Photo Section */}
                    <View style={styles.photoSection}>
                        <Text style={styles.label}>
                            Waste Photo <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.photoButtons}>
                            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                                <Ionicons name="image-outline" size={20} color="#333" />
                                <Text style={styles.photoButtonText}>Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                                <Ionicons name="camera-outline" size={20} color="#333" />
                                <Text style={styles.photoButtonText}>Camera</Text>
                            </TouchableOpacity>
                        </View>

                        {image && (
                            <View style={styles.imagePreview}>
                                <Image source={{ uri: image }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setImage(null)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            loading && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={styles.loadingButton}>
                                <ActivityIndicator color="#FFF" size="small" />
                                <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>
                                    Creating...
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.submitButtonText}>Create Pickup Request</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
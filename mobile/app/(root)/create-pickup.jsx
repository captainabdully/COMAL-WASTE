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
    Modal,
    FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://54.209.99.13:5001';

export default function CreatePickup() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [droppingPoints, setDroppingPoints] = useState([]);
    const [categories] = useState([
        'heavy',
        'light',
        'cast',
        'mixer'
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(''); // 'point' or 'category'

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
            const token = await SecureStore.getItemAsync("authToken");
            const response = await fetch(`${API_URL}/api/dropping-point`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();

            // Handle direct array or nested data structure
            const data = Array.isArray(result) ? result : (result.data || []);
            
            if (response.ok) {
                const points = data.map(point => ({
                    id: point.id,
                    name: point.location_name || point.name,
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
                    // Do not set Content-Type: multipart/form-data manually in React Native
                    // It needs the boundary which is automatically added when you don't set it.
                    'Accept': 'application/json',
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
        if (!formData.dropping_point_id) { Alert.alert('Error', 'Please select a dropping point'); return; }
        if (!formData.category) { Alert.alert('Error', 'Please select a category'); return; }
        if (!formData.price) { Alert.alert('Error', 'Please enter a valid price'); return; }
        if (!formData.phone_number) { Alert.alert('Error', 'Please enter a valid phone number'); return; }
        if (!formData.quantity) { Alert.alert('Error', 'Please enter a valid quantity'); return; }
        if (!image) { Alert.alert('Error', 'Please add a photo'); return; }

        setLoading(true);
        try {
            const imageFilename = await uploadImage(image);
            if (!imageFilename) throw new Error('Failed to upload image');

            const vendor_id = await SecureStore.getItemAsync('userId');
            const token = await SecureStore.getItemAsync('authToken');

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

            const response = await fetch(`${API_URL}/api/pickup-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(pickupData),
            });

            if (response.ok) {
                Alert.alert('Success', 'Pickup order created successfully!', [{ text: 'OK', onPress: () => router.replace('/') }]);
            } else {
                const res = await response.json();
                throw new Error(res.message || 'Failed to create order');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
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
            paddingTop: insets.top + 10,
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
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
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
        dropdownItemText: {
            fontSize: 16,
            color: '#333',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: '#FFF',
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            padding: 20,
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#333',
        },
        modalItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#f9f9f9',
        },
        modalItemLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: '#333',
        },
        modalItemSubLabel: {
            fontSize: 13,
            color: '#888',
            marginTop: 2,
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

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {modalType === 'point' ? 'Location' : 'Category'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={modalType === 'point' ? droppingPoints : categories}
                            keyExtractor={(item) => typeof item === 'string' ? item : item.id.toString()}
                            renderItem={({ item }) => {
                                const isString = typeof item === 'string';
                                const label = isString ? item.charAt(0).toUpperCase() + item.slice(1) : item.name;
                                const subLabel = isString ? '' : item.address;
                                
                                return (
                                    <TouchableOpacity 
                                        style={styles.modalItem}
                                        onPress={() => {
                                            if (modalType === 'point') {
                                                handleInputChange('dropping_point_id', item.id.toString());
                                            } else {
                                                handleInputChange('category', item);
                                            }
                                            setModalVisible(false);
                                        }}
                                    >
                                        <View>
                                            <Text style={styles.modalItemLabel}>{label}</Text>
                                            {subLabel ? <Text style={styles.modalItemSubLabel}>{subLabel}</Text> : null}
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#999" />
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            <ScrollView 
                style={styles.content}
                contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            >
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
                                    setModalType('point');
                                    setModalVisible(true);
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
                                <Ionicons name="chevron-down" size={20} color="#999" />
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
                                    setModalType('category');
                                    setModalVisible(true);
                                }}
                            >
                                <Text style={
                                    formData.category
                                        ? styles.pickerText
                                        : styles.pickerPlaceholder
                                }>
                                    {formData.category 
                                        ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1) 
                                        : 'Select category'
                                    }
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#999" />
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
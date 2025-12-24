import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:5001';

export default function ChangePassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      valid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      valid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      valid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get user token and ID
      const token = await SecureStore.getItemAsync('authToken');
      const userId = await SecureStore.getItemAsync('userId');

      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      // Prepare request data
      const requestData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      // Call API to change password
      const response = await fetch(`${API_URL}/api/users/${userId}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Password changed successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form and navigate back
                setFormData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                router.back();
              },
            },
          ]
        );
      } else {
        throw new Error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      
      let errorMessage = error.message || 'Failed to change password. Please try again.';
      
      // Handle specific error cases
      if (error.message.includes('current password')) {
        setErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect',
        }));
        errorMessage = 'Current password is incorrect';
      } else if (error.message.includes('same as old')) {
        setErrors(prev => ({
          ...prev,
          newPassword: 'New password must be different from current password',
        }));
        errorMessage = 'New password must be different from current password';
      }
      
      Alert.alert('Error', errorMessage);
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
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      backgroundColor: '#f9f9f9',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      paddingRight: 50,
      fontSize: 16,
    },
    inputError: {
      borderColor: '#f44336',
      backgroundColor: '#FFF5F5',
    },
    toggleButton: {
      position: 'absolute',
      right: 10,
      top: 12,
      padding: 5,
    },
    errorText: {
      color: '#f44336',
      fontSize: 12,
      marginTop: 5,
    },
    requirements: {
      marginTop: 10,
      padding: 10,
      backgroundColor: '#F0F9FF',
      borderRadius: 8,
    },
    requirementTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2196F3',
      marginBottom: 5,
    },
    requirementText: {
      fontSize: 12,
      color: '#666',
      marginLeft: 5,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
    },
    requirementValid: {
      color: '#4CAF50',
    },
    requirementInvalid: {
      color: '#999',
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
    passwordStrength: {
      marginTop: 10,
    },
    strengthBar: {
      height: 4,
      backgroundColor: '#eee',
      borderRadius: 2,
      overflow: 'hidden',
    },
    strengthFill: {
      height: '100%',
      borderRadius: 2,
    },
    strengthText: {
      fontSize: 12,
      color: '#666',
      marginTop: 5,
      textAlign: 'right',
    },
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '#eee' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const strengthMap = [
      { text: 'Very Weak', color: '#f44336', width: '20%' },
      { text: 'Weak', color: '#FF9800', width: '40%' },
      { text: 'Fair', color: '#FFC107', width: '60%' },
      { text: 'Good', color: '#4CAF50', width: '80%' },
      { text: 'Strong', color: '#2E7D32', width: '100%' },
    ];

    return strengthMap[score - 1] || strengthMap[0];
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

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
        <Text style={styles.headerTitle}>Change Password</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Current Password */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.currentPassword && styles.inputError
                ]}
                placeholder="Enter your current password"
                secureTextEntry={!showCurrentPassword}
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}
          </View>

          {/* New Password */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.newPassword && styles.inputError
                ]}
                placeholder="Enter new password"
                secureTextEntry={!showNewPassword}
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Password Strength */}
            {formData.newPassword ? (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBar}>
                  <View style={[
                    styles.strengthFill,
                    { 
                      backgroundColor: passwordStrength.color,
                      width: passwordStrength.width 
                    }
                  ]} />
                </View>
                <Text style={[
                  styles.strengthText,
                  { color: passwordStrength.color }
                ]}>
                  {passwordStrength.text}
                </Text>
              </View>
            ) : null}
            
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <Text style={styles.requirementTitle}>Password Requirements:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={formData.newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                  size={12} 
                  color={formData.newPassword.length >= 8 ? "#4CAF50" : "#999"} 
                />
                <Text style={[
                  styles.requirementText,
                  formData.newPassword.length >= 8 ? styles.requirementValid : styles.requirementInvalid
                ]}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[A-Z]/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                  size={12} 
                  color={/[A-Z]/.test(formData.newPassword) ? "#4CAF50" : "#999"} 
                />
                <Text style={[
                  styles.requirementText,
                  /[A-Z]/.test(formData.newPassword) ? styles.requirementValid : styles.requirementInvalid
                ]}>
                  At least one uppercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[0-9]/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                  size={12} 
                  color={/[0-9]/.test(formData.newPassword) ? "#4CAF50" : "#999"} 
                />
                <Text style={[
                  styles.requirementText,
                  /[0-9]/.test(formData.newPassword) ? styles.requirementValid : styles.requirementInvalid
                ]}>
                  At least one number
                </Text>
              </View>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError
                ]}
                placeholder="Confirm your new password"
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
              />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && !errors.confirmPassword ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Ionicons 
                  name={formData.newPassword === formData.confirmPassword ? "checkmark-circle" : "close-circle"} 
                  size={14} 
                  color={formData.newPassword === formData.confirmPassword ? "#4CAF50" : "#f44336"} 
                />
                <Text style={{
                  fontSize: 12,
                  color: formData.newPassword === formData.confirmPassword ? "#4CAF50" : "#f44336",
                  marginLeft: 5,
                }}>
                  {formData.newPassword === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled
            ]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>
                  Changing Password...
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
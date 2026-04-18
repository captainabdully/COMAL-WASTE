// app/(auth)/create-new-password.jsx
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resetPasswordAPI } from "../../constants/authAPI";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import Toast from 'react-native-toast-message';

export default function CreateNewPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onResetPassword = async () => {
    setError("");

    if (!password || !confirmPassword) {
      setError("Both fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPasswordAPI(email, password);
      setLoading(false);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: res.message || "Password reset successfully",
      });
      
      // Delay navigation slightly so user sees the toast
      setTimeout(() => {
        router.replace("/sign-in");
      }, 1500);
    } catch (err) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || "Failed to reset password",
      });
      setError(err.message || "Failed to reset password");
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Image source={require("../../assets/images/logo 1.png")} style={styles.illustration} />
        <Text style={styles.title}>Create New Password</Text>
        <Text style={{ marginBottom: 20, textAlign: 'center', color: COLORS.text }}>
          Enter your new password for {email}
        </Text>

        {error !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            placeholder="New password"
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showConfirmPassword}
            placeholder="Re-type password"
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={onResetPassword} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Resetting..." : "Reset Password"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

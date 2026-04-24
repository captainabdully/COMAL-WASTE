// app/(auth)/forgot-password.jsx
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { forgotPasswordAPI } from "../../constants/authAPI";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import Toast from 'react-native-toast-message';

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSendLink = async () => {
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPasswordAPI(email);
      
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Email Verified!',
        text2: 'Proceeding to reset password...',
      });

      // Navigate directly to the create-new-password page
      setTimeout(() => {
        router.push({ pathname: "/create-new-password", params: { email } });
      }, 1500);
      
    } catch (err) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || "Failed to verify email",
      });
      setError(err.message || "Failed to verify email");
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
        <TouchableOpacity 
          style={{ alignSelf: 'flex-start', marginBottom: 20 }} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Image source={require("../../assets/images/logo 1.png")} style={styles.illustration} />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={{ marginBottom: 20, textAlign: 'center', color: COLORS.text }}>
          Enter your email to verify your account
        </Text>

        {error !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput 
          style={styles.input} 
          placeholder="Enter email" 
          onChangeText={setEmail} 
          autoCapitalize="none" 
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.button} onPress={onSendLink} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify Email"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

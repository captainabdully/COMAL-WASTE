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
  const [emailSent, setEmailSent] = useState(false);

  const onSendLink = async () => {
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordAPI(email);
      
      setLoading(false);
      setEmailSent(true);
      Toast.show({
        type: 'success',
        text1: 'Reset Link Sent!',
        text2: 'Check your email for password reset instructions',
      });
      
    } catch (err) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || "Failed to send reset email",
      });
      setError(err.message || "Failed to send reset email");
    }
  };

  if (emailSent) {
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
          <Text style={styles.title}>Check Your Email</Text>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="mail-open" size={64} color={COLORS.primary} />
          </View>
          <Text style={{ marginBottom: 20, textAlign: 'center', color: COLORS.text }}>
            We{"'"}ve sent a password reset link to <Text style={{ fontWeight: 'bold' }}>{email}</Text>
          </Text>
          <Text style={{ marginBottom: 20, textAlign: 'center', color: COLORS.gray, fontSize: 14 }}>
            Click the link in your email to create a new password. The link will expire in 1 hour.
          </Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              setEmailSent(false);
              setEmail("");
            }}
          >
            <Text style={styles.buttonText}>Try Another Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: COLORS.gray, marginTop: 10 }]} 
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    );
  }

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
          Enter your email to receive a password reset link
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
          value={email}
          onChangeText={setEmail} 
          autoCapitalize="none" 
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.button} onPress={onSendLink} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Sending..." : "Send Reset Link"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
//           </View>
//         )}

//         <TextInput 
//           style={styles.input} 
//           placeholder="Enter email" 
//           onChangeText={setEmail} 
//           autoCapitalize="none" 
//           keyboardType="email-address"
//         />

//         <TouchableOpacity style={styles.button} onPress={onSendLink} disabled={loading}>
//           <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify Email"}</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAwareScrollView>
//   );
// }

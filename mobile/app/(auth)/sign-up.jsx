// app/(auth)/sign-up.jsx
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { registerUser } from "../../constants/authAPI";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    setError("");

    if (!name || !email || !phone || !address || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ name, email, phone_number: phone, address, password });

      // Check if registration was successful
      if (res && (res.message === "User registered" || res.success)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Account created successfully',
        });
        
        setTimeout(() => {
          router.replace("/sign-in");
        }, 1500);
      } else {
        setError(res.message || "Registration failed");
        Toast.show({ type: 'error', text1: 'Error', text2: res.message || "Registration failed" });
      }
    } catch (err) {
      setError(err.message || "Server error");
      Toast.show({ type: 'error', text1: 'Error', text2: err.message || "Server error" });
    } finally {
      setLoading(false);
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
        <Text style={styles.title}>Create Account</Text>



        {error !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput style={styles.input} placeholder="Name" onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone Number" onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder="Address" onChangeText={setAddress} />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            placeholder="Password"
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

        <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/sign-in")}>
          <Text style={{ marginTop: 20, color: COLORS.primary }}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
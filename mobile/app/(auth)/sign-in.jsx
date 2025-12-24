// app/(auth)/sign-in.jsx
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { loginUser } from "../../constants/authAPI";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");
    try {
      console.log("Attempting login...");
      const res = await loginUser(email, password);
      console.log("Login res:", res ? "Received" : "Null");

      if (res.token) {
        console.log("Saving token...");
        await SecureStore.setItemAsync("authToken", res.token);
        await SecureStore.setItemAsync("userId", String(res.user?.user_id));
        await SecureStore.setItemAsync("userId", String(res.user?.user_id));
        await SecureStore.setItemAsync("userEmail", res.user?.email || email);
        await SecureStore.setItemAsync("userName", res.user?.name || "User");

        // Store user roles safely
        const roles = res.user?.roles || [];
        await SecureStore.setItemAsync("userRoles", JSON.stringify(roles));

        // Verify token is stored before navigating
        const storedToken = await SecureStore.getItemAsync("authToken");
        console.log("Stored Verify:", !!storedToken);

        if (storedToken) {
          console.log("Navigating to / ...");
          router.replace("/");
        } else {
          console.error("Token verification failed");
          setError("Failed to save session");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Image source={require("../../assets/images/logo 1.png")} style={styles.illustration} />
        <Text style={styles.title}>Welcome Back</Text>

        {error !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput style={styles.input} placeholder="Enter email" onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} secureTextEntry placeholder="Enter password" onChangeText={setPassword} />

        <TouchableOpacity style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/sign-up")}>
          <Text style={{ marginTop: 20, color: COLORS.primary }}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
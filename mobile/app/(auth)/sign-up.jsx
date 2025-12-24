// app/(auth)/sign-up.jsx
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { registerUser } from "../../constants/authAPI";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onRegister = async () => {
    setError("");
    try {
      const res = await registerUser({ name, email, phone_number: phone, address, password });
      if (res.message === "User registered") {
        router.replace("/sign-in");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Server error");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Image source={require("../../assets/images/logo 1.png")} style={styles.illustration} />
        <Text style={styles.title}>Create Account</Text>

        {error !== "" && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}

        <TextInput style={styles.input} placeholder="Name" onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone Number" onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder="Address" onChangeText={setAddress} />
        <TextInput style={styles.input} secureTextEntry placeholder="Password" onChangeText={setPassword} />

        <TouchableOpacity style={styles.button} onPress={onRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/sign-in")}>
          <Text style={{ marginTop: 20, color: COLORS.primary }}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
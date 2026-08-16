// app/(auth)/sign-in.jsx
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { loginUser } from "../../constants/authAPI";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import Toast from 'react-native-toast-message';
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../contexts/LanguageContext";

export default function SignIn() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    setError("");

    if (!email || !password) {
      setError(t("emailPasswordRequired"));
      return;
    }

    try {
      console.log("Attempting login...");
      const res = await loginUser(email, password);
      console.log("Login res:", res ? "Received" : "Null");

      if (res.token) {
        console.log("Saving token...");
        await SecureStore.setItemAsync("authToken", res.token);
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
          
          Toast.show({
            type: 'success',
            text1: t("success"),
            text2: t("loginSuccess"),
          });
          
          router.replace("/");
        } else {
          console.error("Token verification failed");
          setError(t("failedSaveSession"));
          Toast.show({ type: 'error', text1: t("error"), text2: t("failedSaveSession") });
        }
      } else {
        setError(t("invalidCredentials"));
        Toast.show({ type: 'error', text1: t("error"), text2: t("invalidCredentials") });
      }
    } catch (err) {
      console.log("Login error:", err);
      setError(err.message || t("loginFailed"));
      Toast.show({ type: 'error', text1: t("error"), text2: err.message || t("loginFailed") });
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
      <View style={[styles.container, { position: "relative" }]}>
        <View style={{ position: "absolute", top: insets.top + 16, right: 20, zIndex: 1 }}>
          <LanguageToggle />
        </View>
        <Image source={require("../../assets/images/logo 1.png")} style={styles.illustration} />
        <Text style={styles.title}>Skrepa Chap</Text>

        {error !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput style={styles.input} placeholder={t("enterEmail")} onChangeText={setEmail} autoCapitalize="none" />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            placeholder={t("enterPassword")}
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

        <TouchableOpacity style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>{t("signIn")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
          <Text style={{ marginTop: 15, color: COLORS.primary, textAlign: 'center' }}>{t("forgotPassword")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/sign-up")}>
          <Text style={{ marginTop: 20, color: COLORS.primary, textAlign: 'center' }}>{t("noAccount")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/terms-and-conditions")}>
          <Text style={{ marginTop: 20, color: COLORS.primary, textAlign: 'center', fontSize: 12 }}>
            {t("loginConsent")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

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
import { useLanguage } from "../../contexts/LanguageContext";

export default function SignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
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
      setError(t("allFieldsRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ name, email, phone_number: phone, address, password });

      Toast.show({
        type: 'success',
        text1: t("success"),
        text2: t("accountCreated"),
      });
      
      setTimeout(() => {
        router.replace("/sign-in");
      }, 1500);
    } catch (err) {
      setError(err.message || t("error"));
      Toast.show({ type: 'error', text1: t("error"), text2: err.message || t("error") });
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
        <Text style={styles.title}>{t("createAccount")}</Text>



        {error !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput style={styles.input} placeholder={t("name")} onChangeText={setName} />
        <TextInput style={styles.input} placeholder={t("email")} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder={t("phoneNumber")} onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder={t("address")} onChangeText={setAddress} />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            placeholder={t("password")}
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
            <Text style={styles.buttonText}>{t("signUp")}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/sign-in")}>
          <Text style={{ marginTop: 20, color: COLORS.primary }}>{t("alreadyHaveAccount")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

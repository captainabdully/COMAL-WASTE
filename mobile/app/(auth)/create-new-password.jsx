// app/(auth)/create-new-password.jsx
import { useState, useEffect } from "react";
import { Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resetPasswordAPI } from "../../constants/authAPI";
import { styles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";
import Toast from 'react-native-toast-message';
import { useLanguage } from "../../contexts/LanguageContext";

export default function CreateNewPassword() {
  const router = useRouter();
  const { phone_number } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!phone_number) {
      setError(t("phoneRequired"));
    }
  }, [phone_number, t]);

  const onResetPassword = async () => {
    setError("");

    if (!phone_number) {
      setError(t("phoneRequired"));
      return;
    }

    if (!password || !confirmPassword) {
      setError("Both fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPasswordAPI(phone_number, password);
      setLoading(false);
      
      Toast.show({
        type: 'success',
        text1: t("success"),
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
        text1: t("error"),
        text2: err.message || "Failed to reset password",
      });
      setError(err.message || "Failed to reset password");
    }
  };

  if (!phone_number) {
    return (
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={64} color={COLORS.expense} />
          <Text style={styles.title}>{t("invalidLink")}</Text>
          <Text style={{ marginBottom: 20, textAlign: 'center', color: COLORS.text }}>
            {t("invalidLinkDescription")}
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.buttonText}>{t("requestNewLink")}</Text>
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
        <Image source={require("../../assets/images/logo 1.png")} style={styles.illustration} />
        <Text style={styles.title}>{t("createNewPassword")}</Text>
        <Text style={{ marginBottom: 20, textAlign: 'center', color: COLORS.text }}>
          {t("newPasswordForPhone")} {phone_number}
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
            placeholder={t("newPassword")}
            onChangeText={setPassword}
            value={password}
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
            placeholder={t("retypePassword")}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
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
          <Text style={styles.buttonText}>{loading ? t("resetting") : t("resetPassword")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

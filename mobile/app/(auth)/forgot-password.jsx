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
import { useLanguage } from "../../contexts/LanguageContext";

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onVerifyPhone = async () => {
    setError("");

    if (!phoneNumber.trim()) {
      setError(t("phoneRequired"));
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordAPI(phoneNumber);
      Toast.show({
        type: 'success',
        text1: t("phoneVerified"),
        text2: t("phoneVerifiedDescription"),
      });
      router.push({ pathname: "/create-new-password", params: { phone_number: phoneNumber } });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: t("error"),
        text2: err.message || t("phoneNotRegistered"),
      });
      setError(err.message || t("phoneNotRegistered"));
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
        <TouchableOpacity 
          style={{ alignSelf: 'flex-start', marginBottom: 20 }} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Image source={require("../../assets/images/logo 1.png")} style={styles.illustration} />
        <Text style={styles.title}>{t("verifyPhoneNumber")}</Text>
        <Text style={{ marginBottom: 20, textAlign: 'center', color: COLORS.text }}>
          {t("verifyPhoneDescription")}
        </Text>

        {error !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput 
          style={styles.input} 
          placeholder={t("phoneNumber")}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.button} onPress={onVerifyPhone} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? t("verifying") : t("verifyPhone")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

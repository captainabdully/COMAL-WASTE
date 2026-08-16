import 'react-native-gesture-handler';
// app/_layout.jsx
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { LanguageProvider } from "../contexts/LanguageContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <Slot />
        <Toast />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

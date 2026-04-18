import 'react-native-gesture-handler';
// app/_layout.jsx
import { Redirect, Slot, router } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { Alert } from "react-native";
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  useEffect(() => {
    if (!global.originalFetch) {
      global.originalFetch = global.fetch;
    }

    global.fetch = async (...args) => {
      const response = await global.originalFetch(...args);
      if (response.status === 401) {
        try {
          await SecureStore.deleteItemAsync("authToken");
          await SecureStore.deleteItemAsync("userId");
          await SecureStore.deleteItemAsync("userEmail");
          await SecureStore.deleteItemAsync("userName");
          await SecureStore.deleteItemAsync("userRoles");
          
          Toast.show({
            type: 'error',
            text1: 'Session Expired',
            text2: 'Your session has timed out. Please log in again.'
          });
          
          router.replace("/sign-in");
        } catch (e) {
          console.error("Error clearing session on 401", e);
        }
      }
      return response;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Slot />
      <Toast />
    </SafeAreaProvider>
  );
}
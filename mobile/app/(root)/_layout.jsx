import { Redirect, Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

export default function ProtectedLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState("loading");

  useEffect(() => {
    async function checkToken() {
      try {
        console.log("ProtectedLayout: Checking token...");
        const token = await SecureStore.getItemAsync("authToken");
        console.log("ProtectedLayout: Token found?", !!token);
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error("ProtectedLayout: SecureStore error:", error);
        setIsLoggedIn(false);
      }
    }
    checkToken();
  }, []);

  // Debug UI — remove later
  if (isLoggedIn === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    console.log("Not logged in → redirecting to /sign-in");
    return <Redirect href="/sign-in" />;
  }

  console.log("Logged in → showing app");
  return <Slot />;
}
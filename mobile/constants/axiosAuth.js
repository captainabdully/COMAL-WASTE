import axios from "axios";
import * as SecureStore from "expo-secure-store";

// export const API = axios.create({
//   baseURL: "http://localhost:5001/api",
// });

export const API = axios.create({
  baseURL: "http://54.209.99.13:5001/api",
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import { router } from "expo-router";
import Toast from 'react-native-toast-message';

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
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
    return Promise.reject(error);
  }
);

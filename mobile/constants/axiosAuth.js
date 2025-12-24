import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

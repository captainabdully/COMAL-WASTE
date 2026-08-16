import axios from "axios";
import { API_BASE_URL } from "./api";

//  export const API_URL = "http://localhost:5001/api/auth";
//  export const API_URL2 = "http://localhost:5001/api";

 export const API_URL = `${API_BASE_URL}/auth`;
 // to remember to EDIT API_URL2 for user management
//  export const API_URL2 = API_BASE_URL;


// REGISTER USER
export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/users`, data);
    // const res = await axios.post(`${API_URL2}/users`, data);

    return res.data; // return backend response
  } catch (error) {
    throw error.response?.data || { message: "Network error" };
  }
};

// LOGIN USER
export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    return res.data; // should include accessToken
  } catch (error) {
    throw error.response?.data || { message: "Network error" };
  }
};

// FORGOT PASSWORD
export const forgotPasswordAPI = async (phone_number) => {
  try {
    const res = await axios.post(`${API_URL}/forgot-password`, { phone_number });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Network error" };
  }
};

// RESET PASSWORD
export const resetPasswordAPI = async (phone_number, newPassword) => {
  try {
    const res = await axios.post(`${API_URL}/reset-password`, { phone_number, newPassword });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Network error" };
  }
};

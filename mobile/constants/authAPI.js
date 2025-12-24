import axios from "axios";

export const API_URL = "http://localhost:5001/api/auth";
export const API_URL2 = "http://localhost:5001/api";

// REGISTER USER
export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${API_URL2}/users`, data);
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

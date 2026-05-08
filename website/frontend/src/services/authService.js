import axios from "axios";

const API =
  "http://localhost:5000/api/auth";

export const sendRegisterOTP =
  async (data) => {
    return axios.post(
      `${API}/register/send-otp`,
      data
    );
  };

export const verifyRegisterOTP =
  async (data) => {
    return axios.post(
      `${API}/register/verify-otp`,
      data
    );
  };

export const sendLoginOTP =
  async (data) => {
    return axios.post(
      `${API}/login/send-otp`,
      data
    );
  };

export const verifyLoginOTP =
  async (data) => {
    return axios.post(
      `${API}/login/verify-otp`,
      data
    );
  };
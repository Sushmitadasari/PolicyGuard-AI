import api from "./api";

// Login user with email and password
export const loginUser = (data) =>
  api.post("/auth/login", data);

// Register new user
export const registerUser = (data) =>
  api.post("/auth/register", data);
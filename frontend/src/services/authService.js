const API_URL = "http://localhost:5000/api/auth";

let accessToken = null;

export const getAccessToken = () => accessToken;

export async function registerUser(formData) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  accessToken = data.accessToken;
  return data;
}

export async function loginUser(formData) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }
console.log("Login response:", data);
  accessToken = data.accessToken;
  localStorage.setItem("token", accessToken);
  return data;
}

export async function refreshSession() {
  const response = await fetch(`${API_URL}/refresh`, {
    method: "POST",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    accessToken = null;
    throw new Error(data.message || "Session expired");
  }

  accessToken = data.accessToken;
  return data;
}

export async function logoutUser() {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Logout request failed");
    }
    localStorage.removeItem("token");
  } finally {
    accessToken = null;
    
  }
}
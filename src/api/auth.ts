// api/auth.ts
export const registerUser = async (
  name: string,
  username: string,
  email: string,
  password: string,
  password_confirmation: string
) => {
  const res = await fetch(`http://127.0.0.1:8000/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      username,
      email,
      password,
      password_confirmation,
    }),
  });

  const data = await res.json();
  console.log(data);
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`http://127.0.0.1:8000/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log(data);
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
};

export const verify2FA = async (email: string, code: string) => {
  const res = await fetch(`http://127.0.0.1:8000/api/verify-2fa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();
  console.log(data);
  if (!res.ok) throw new Error(data.message || "2FA verification failed");
  return data;
};

// New function to make authenticated requests
export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("authToken");

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // If token is invalid, clear auth data
  if (response.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.href = "/login";
  }

  return response;
};

// Function to refresh user data
export const getUserProfile = async () => {
  const response = await makeAuthenticatedRequest(
    "http://127.0.0.1:8000/api/user"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
};

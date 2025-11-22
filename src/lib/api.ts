const API_BASE_URL = "https://phatdat.store/api/v1";

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem("authToken", token);
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem("authToken");
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    apiCall<{ data: { token: string; user: any } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, name: string, phone_number?: string, gender?: string) =>
    apiCall<{ data: { message: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, phone_number, gender }),
    }),
  verify: (email: string, otp: string) =>
    apiCall<{ data: { token: string; user: any } }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),
  forgotPassword: (email: string) =>
    apiCall<{ data: { message: string } }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verifyResetOtp: (email: string, otp: string) =>
    apiCall<{ data: { reset_token: string } }>("/auth/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),
  resetPassword: (reset_token: string, new_password: string) =>
    apiCall<{ data: { message: string } }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ reset_token, new_password }),
    }),
};

// User/Admin APIs
export const adminApi = {
  getAll: () => apiCall<any>("/admin-user/get-admin"),
  update: (id: string, data: any) =>
    apiCall<any>(`/admin-user/update-admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<any>(`/admin-user/delete-admin/${id}`, {
      method: "DELETE",
    }),
  toggleStatus: (id: string) =>
    apiCall<any>(`/admin-user/toggle-admin/${id}`, {
      method: "PATCH",
    }),
};

// Category APIs
export const categoryApi = {
  getAll: () => apiCall<any>("/category/get-all"),
  create: (data: any) =>
    apiCall<any>("/category/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/category/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<any>(`/category/delete/${id}`, {
      method: "DELETE",
    }),
};

// Service APIs
export const serviceApi = {
  getAll: () => apiCall<any>("/service/get-all"),
  delete: (id: string) =>
    apiCall<any>(`/service/delete/${id}`, {
      method: "DELETE",
    }),
};

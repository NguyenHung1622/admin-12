const API_BASE_URL = "https://phatdat.store/api/v1";

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
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

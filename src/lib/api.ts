// --- CẤU HÌNH ĐƯỜNG DẪN API (QUAN TRỌNG) ---

// 1. Lấy link server từ biến môi trường VITE_API_URL (Cái bạn vừa điền bên Vercel)
// 2. Nếu không có (đang chạy ở máy local), nó sẽ tự lấy "http://localhost:5000"
const DOMAIN = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 3. Ghép thêm đuôi "/api/v1" vào. Kiểm tra xem DOMAIN đã có /api/v1 chưa để tránh bị lặp.
const API_BASE_URL = DOMAIN.endsWith("/api/v1") ? DOMAIN : `${DOMAIN}/api/v1`;

// --- HẾT PHẦN CẤU HÌNH ---

const getAuthToken = () => localStorage.getItem("authToken");
export const setAuthToken = (token: string) => localStorage.setItem("authToken", token);
export const clearAuthToken = () => localStorage.removeItem("authToken");
export const isAuthenticated = () => !!getAuthToken();

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    // --- GIỮ NGUYÊN LOGIC XỬ LÝ TOKEN CỦA BẠN ---
    if (token.startsWith("Bearer ")) {
        headers["Authorization"] = token;
    } else {
        headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // console.log(`[Gửi đi] ${endpoint}`, options.body);

  // Gọi fetch với đường dẫn đầy đủ
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  
  const rawText = await response.text();
  // console.log(`[Phản hồi ${response.status}]`, rawText);

  if (!response.ok) {
    let errorMessage = rawText;
    try {
      const json = JSON.parse(rawText);
      if (json.mes) errorMessage = json.mes;
      else if (json.message) errorMessage = json.message;
      else if (json.err) errorMessage = JSON.stringify(json);
    } catch (e) {
      if (!rawText) errorMessage = `Lỗi Server ${response.status}`;
    }
    
    if (response.status === 401 || response.status === 403) {
        clearAuthToken();
        // Dùng window.location để điều hướng chắc chắn hơn khi lỗi auth
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
    throw new Error(errorMessage);
  }

  return rawText ? JSON.parse(rawText) : {};
}

export const authApi = {
  login: (email: string, password: string) =>
    apiCall<{ data: { token: string; user: any } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ numberPhone: email, password }),
    }),

  register: (email: string, password: string, name: string, phone: string, gender: string) =>
    apiCall<{ data: { message: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ 
        email, 
        password, 
        full_name: name, 
        numberPhone: phone 
      }),
    }),

  verify: (email: string, otp: string, phone: string) =>
    apiCall<{ data: { token: string; user: any } }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ 
        otp: otp, 
        numberPhone: phone 
      }),
    }),
    
  forgotPassword: (email: string) => apiCall<{ data: { message: string } }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  verifyResetOtp: (email: string, otp: string) => apiCall<{ data: { reset_token: string } }>("/auth/verify-reset-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),
  resetPassword: (token: string, pass: string) => apiCall<{ data: { message: string } }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ reset_token: token, new_password: pass }) }),
};

export const adminApi = {
    getAll: () => apiCall<any>("/admin-user/get-admin"),
    update: (id: string, data: any) => apiCall<any>(`/admin-user/update-admin/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => apiCall<any>(`/admin-user/delete-admin/${id}`, { method: "DELETE" }),
    
    // --- ĐÃ SỬA ĐOẠN NÀY ---
    // Thêm tham số 'status' vào hàm và gửi nó trong body dưới tên 'is_active'
    toggleStatus: (id: string, status: boolean) => apiCall<any>(`/admin-user/toggle-admin/${id}`, { 
        method: "PATCH",
        body: JSON.stringify({ is_active: status }) 
    }),
};

export const categoryApi = {
    getAll: () => apiCall<any>("/category/get-all"),
    create: (data: any) => apiCall<any>("/category/create", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiCall<any>(`/category/update/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => apiCall<any>(`/category/delete/${id}`, { method: "DELETE" }),
};

export const serviceApi = {
    getAll: () => apiCall<any>("/service/get-all"),
    delete: (id: string) => apiCall<any>(`/service/delete/${id}`, { method: "DELETE" }),
    // Thêm các hàm create, update nếu cần thiết cho service management
    create: (data: any) => apiCall<any>("/service/create", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiCall<any>(`/service/update/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

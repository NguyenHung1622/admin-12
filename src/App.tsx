import { Toaster as ShadcnToaster } from "@/components/ui/toaster"; // Shadcn default Toaster
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // Sonner for toast messages
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Thêm Navigate

// Sử dụng alias (@/) là cách chuẩn nhất trong hệ thống Vite/TS của bạn
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Cả hai Toaster được thêm vào */}
      <ShadcnToaster />
      <SonnerToaster /> 
      <BrowserRouter>
        <Routes>
          {/* THAY ĐỔI: Chuyển hướng thẳng từ / sang /login */}
          <Route path="/" element={<Navigate to="/login" replace />} /> 
          
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
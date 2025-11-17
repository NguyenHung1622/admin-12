import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderTree, Briefcase, LogOut } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import ServiceManagement from "@/components/admin/ServiceManagement";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { clearAuthToken } from "@/lib/api";
import { toast } from "sonner";

type TabType = "users" | "categories" | "services";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthToken();
    toast.success("Đăng xuất thành công");
    navigate("/login");
  };

  const menuItems = [
    { id: "users" as TabType, label: "Quản lý người dùng", icon: Users },
    { id: "categories" as TabType, label: "Quản lý danh mục", icon: FolderTree },
    { id: "services" as TabType, label: "Quản lý dịch vụ", icon: Briefcase },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar 
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
          
          {activeTab === "users" && <UserManagement />}
          {activeTab === "categories" && <CategoryManagement />}
          {activeTab === "services" && <ServiceManagement />}
        </div>
      </main>
    </div>
  );
};

export default Admin;

import { useState } from "react";
import { Users, FolderTree, Briefcase } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import ServiceManagement from "@/components/admin/ServiceManagement";
import AdminSidebar from "@/components/admin/AdminSidebar";

type TabType = "users" | "categories" | "services";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<TabType>("users");

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
          {activeTab === "users" && <UserManagement />}
          {activeTab === "categories" && <CategoryManagement />}
          {activeTab === "services" && <ServiceManagement />}
        </div>
      </main>
    </div>
  );
};

export default Admin;

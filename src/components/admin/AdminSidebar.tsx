import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface AdminSidebarProps {
  menuItems: MenuItem[];
  activeTab: string;
  onTabChange: (tab: any) => void;
}

const AdminSidebar = ({ menuItems, activeTab, onTabChange }: AdminSidebarProps) => {
  return (
    <aside className="w-64 border-r bg-card p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Quản trị hệ thống</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;

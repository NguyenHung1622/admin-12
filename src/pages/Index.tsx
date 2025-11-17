import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-6 p-8">
        <Shield className="h-20 w-20 mx-auto text-primary" />
        <h1 className="text-4xl font-bold text-foreground">
          Chào mừng đến với Admin Panel
        </h1>
        <p className="text-lg text-muted-foreground">
          Quản lý hệ thống một cách dễ dàng
        </p>
        <Button
          size="lg"
          onClick={() => navigate("/login")}
          className="mt-4"
        >
          Đăng nhập
        </Button>
      </div>
    </div>
  );
};

export default Index;

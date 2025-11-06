import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Chào mừng đến với Admin Panel</h1>
        <p className="mb-6 text-xl text-muted-foreground">Quản lý hệ thống một cách dễ dàng</p>
        <Button onClick={() => navigate("/admin")} size="lg">
          Vào trang quản trị
        </Button>
      </div>
    </div>
  );
};

export default Index;

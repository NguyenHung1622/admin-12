import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  role_id: number | string;
  role?: any;
  is_active: boolean;
  gender?: string;
  avatar?: string;
}

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

const EditUserDialog = ({ user, open, onClose, onSave }: EditUserDialogProps) => {
  // Khởi tạo state với giá trị mặc định
  const [formData, setFormData] = useState<User>({
    id: 0,
    full_name: "",
    email: "",
    phone_number: "",
    role_id: "3", // Mặc định là string "3" để khớp với Select value
    is_active: true,
    gender: "Male",
    avatar: "",
  });

  // Reset form mỗi khi mở dialog hoặc đổi user
  useEffect(() => {
    if (user) {
      // Ưu tiên lấy role_id trực tiếp, chuyển sang String để Select hiển thị đúng
      const roleStr = user.role_id ? String(user.role_id) : "3";
      
      setFormData({
        ...user,
        role_id: roleStr,
        phone_number: user.phone_number || "",
        gender: user.gender || "Male",
        avatar: user.avatar || "",
      });
    }
  }, [user, open]);

  // Hàm xử lý chung cho Input
  const handleChange = (field: keyof User, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Hàm xử lý riêng cho Select Role để debug dễ hơn
  const handleRoleChange = (value: string) => {
    console.log("Đã chọn Role mới:", value); // Kiểm tra xem có log ra số 2 không
    setFormData((prev) => ({ ...prev, role_id: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Chuyển đổi role_id về số trước khi gửi
    const dataToSave = {
        ...formData,
        role_id: Number(formData.role_id) 
    };
    
    console.log("Dữ liệu gửi đi:", dataToSave); // Kiểm tra lần cuối
    onSave(dataToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Email Readonly */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Email</Label>
            <Input value={formData.email} disabled className="col-span-3 bg-gray-100" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full_name" className="text-right">Tên</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">SĐT</Label>
            <Input
              id="phone"
              value={formData.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* SELECT VAI TRÒ */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Vai trò</Label>
            <Select 
                value={String(formData.role_id)} 
                onValueChange={handleRoleChange} 
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {/* Value phải là chuỗi "1", "2", "3" */}
                <SelectItem value="1">Admin (Quản trị viên)</SelectItem>
                <SelectItem value="2">Staff (Nhân viên)</SelectItem>
                <SelectItem value="3">User (Khách hàng)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trạng thái */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Trạng thái</Label>
            <Select 
                value={formData.is_active ? "true" : "false"} 
                onValueChange={(val) => handleChange("is_active", val === "true")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Hoạt động</SelectItem>
                <SelectItem value="false">Bị khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Giới tính */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Giới tính</Label>
            <Select 
                value={formData.gender} 
                onValueChange={(val) => handleChange("gender", val)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Nam</SelectItem>
                <SelectItem value="Female">Nữ</SelectItem>
                <SelectItem value="Other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
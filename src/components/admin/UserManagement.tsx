import { useState, useEffect } from "react";
import { Lock, LockOpen, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// --- MOCK COMPONENTS & API (Để code chạy được trên Preview) ---
// Khi đưa vào dự án thật, bạn hãy bỏ comment các dòng import thật và xóa phần Mock này đi

/* // UNCOMMENT KHI DÙNG TRONG DỰ ÁN THẬT
import EditUserDialog from "./EditUserDialog";
import { adminApi } from "@/lib/api";
*/

// Mock EditUserDialog
const EditUserDialog = ({ user, open, onClose, onSave }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px]">
        <h3 className="text-lg font-bold mb-4">Sửa người dùng (Demo)</h3>
        <p className="mb-4">Đang chỉnh sửa: {user?.full_name}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => {
             onSave({...user, full_name: user.full_name + " (Updated)"});
             onClose();
          }}>Lưu</Button>
        </div>
      </div>
    </div>
  );
};

// Mock API response dựa trên hình ảnh bạn cung cấp
const MOCK_DATA = {
  data: [
    {
      id: 29,
      full_name: "Tô Minh Hiếu",
      email: "toh9082@gmail.com",
      phone_number: "0947636637",
      role: { id: 2, value: "staff", name: "Nhân viên" },
      is_active: true,
      created_at: "2025-11-19",
    },
    {
      id: 15,
      full_name: "Nguyễn Phát Đạt",
      email: "nguyenphat782004@gmail.com",
      phone_number: "0769394532",
      role: { id: 3, value: "customer", name: "Khách hàng" },
      is_active: true,
      created_at: "2025-11-19",
    },
    {
      id: 1,
      full_name: "Admin System",
      email: "admin@example.com",
      phone_number: "0769394522",
      role: "admin", // Test trường hợp role là string
      is_active: true,
      created_at: "2025-11-16",
    }
  ]
};

const adminApi = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Giả lập delay
    return MOCK_DATA; 
  },
  toggleStatus: async (id: string) => { await new Promise(resolve => setTimeout(resolve, 500)); return { success: true }; },
  delete: async (id: string) => { await new Promise(resolve => setTimeout(resolve, 500)); return { success: true }; },
  update: async (id: string, data: any) => { await new Promise(resolve => setTimeout(resolve, 500)); return { success: true }; }
};

// --- END MOCK ---

interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  // Sửa lỗi: Role có thể là object hoặc id/string tùy API
  role?: { id: number; value: string; name?: string } | string | number; 
  role_id?: string | number;
  is_active: boolean;
  avatar?: string;
  gender?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Trong thực tế, bỏ 'any' nếu bạn đã có type response chuẩn
      const response: any = await adminApi.getAll();
      
      console.log("Dữ liệu User API trả về:", response);

      // --- LOGIC SỬA LỖI "KHÔNG CÓ DỮ LIỆU" ---
      // Kiểm tra kỹ cấu trúc trả về để lấy đúng mảng users
      let userData: User[] = [];
      if (Array.isArray(response)) {
        userData = response;
      } else if (response.data && Array.isArray(response.data)) {
        userData = response.data;
      } else if (response.users && Array.isArray(response.users)) {
        userData = response.users;
      }

      setUsers(userData);
      
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      await adminApi.toggleStatus(userId);
      // Cập nhật UI optimistic update (để giao diện mượt hơn)
      setUsers(users.map(u => u.id.toString() === userId ? {...u, is_active: !u.is_active} : u));
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
      console.error(error);
    }
  };

  const deleteUser = async (userId: string) => {
    // Dùng window.confirm thay vì component custom để đơn giản hóa demo
    if(!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    
    try {
      await adminApi.delete(userId);
      setUsers(users.filter(u => u.id.toString() !== userId));
      toast.success("Xóa người dùng thành công");
    } catch (error) {
      toast.error("Không thể xóa người dùng");
      console.error(error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await adminApi.update(String(updatedUser.id), updatedUser);
      // Cập nhật lại user trong list sau khi sửa xong
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      toast.error("Không thể cập nhật thông tin");
      console.error(error);
    }
  };

  // --- LOGIC SỬA LỖI CRASH APP KHI RENDER ROLE ---
  const renderRole = (user: User) => {
    // Kiểm tra null/undefined trước
    if (!user.role && !user.role_id) return <span className="text-gray-400 italic">Chưa có</span>;

    // Nếu role là object (như trong ảnh console của bạn: {id: 2, value: "staff"})
    if (typeof user.role === 'object') {
      const roleObj = user.role as any;
      return (
        <Badge variant="outline" className="capitalize">
          {roleObj.value || roleObj.name || "N/A"}
        </Badge>
      );
    }
    
    // Nếu role là string/number
    return (
      <Badge variant="outline" className="capitalize">
        {user.role || user.role_id}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground mt-1">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" disabled={isLoading}>
           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
           Làm mới
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Không có dữ liệu người dùng
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{user.full_name}</span>
                      <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                  <TableCell>{user.phone_number || "-"}</TableCell>
                  
                  {/* SỬA LỖI: Dùng hàm renderRole an toàn */}
                  <TableCell>
                    {renderRole(user)}
                  </TableCell>

                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                        className="hover:bg-muted"
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleUserStatus(String(user.id))}
                        className="hover:bg-muted"
                      >
                        {user.is_active ? (
                          <LockOpen className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-amber-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUser(String(user.id))}
                        className="hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sử dụng Mock Dialog hoặc Component thật tùy môi trường */}
      <EditUserDialog
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={updateUser}
      />
    </div>
  );
};

export default UserManagement;
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Lock, LockOpen, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import EditUserDialog from "./EditUserDialog";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  role_id: string | number;
  is_active: boolean;
  avatar?: string;
  gender?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      // Không set loading true ở đây để tránh nháy màn hình khi refresh ngầm
      const res: any = await adminApi.getAll();
      
      if (Array.isArray(res)) setUsers(res);
      else if (res?.users && Array.isArray(res.users)) setUsers(res.users);
      else if (res?.data && Array.isArray(res.data)) setUsers(res.data);
      else if (users.length === 0) setUsers([]); // Chỉ set rỗng nếu chưa có data
    } catch { 
      if (users.length === 0) setUsers([]); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleUserStatus = async (id: string) => {
    try { 
        await adminApi.toggleStatus(id); 
        // Cập nhật UI ngay lập tức
        setUsers(prev => prev.map(u => String(u.id) === id ? { ...u, is_active: !u.is_active } : u));
        toast.success("Đã cập nhật trạng thái"); 
        fetchUsers(); // Đồng bộ lại sau
    } catch { toast.error("Lỗi cập nhật"); }
  };

  const deleteUser = async (id: string) => {
    if(!confirm("Xóa người dùng này?")) return;
    try { 
        await adminApi.delete(id); 
        // Xóa khỏi UI ngay lập tức
        setUsers(prev => prev.filter(u => String(u.id) !== id));
        toast.success("Đã xóa"); 
        fetchUsers();
    } catch { toast.error("Lỗi xóa"); }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const safeRoleId = Number(updatedUser.role_id) || 3;
      
      // Chuẩn bị dữ liệu sạch
      const { ...cleanUser } = updatedUser as any;
      
      // Xóa các trường không được phép gửi lên
      delete cleanUser.id; 
      delete cleanUser.password_hash;
      delete cleanUser.createdAt; 
      delete cleanUser.updatedAt; 
      delete cleanUser.created_at;
      delete cleanUser.updated_at;
      delete cleanUser.otp_code;
      delete cleanUser.otp_expires;
      delete cleanUser.avatar; 
      delete cleanUser.gender; 
      delete cleanUser.role;

      const payload = {
        ...cleanUser,
        role_id: safeRoleId, 
        phone_number: updatedUser.phone_number || "",
      };

      console.log("Updating user with payload:", payload); 

      // 1. Gọi API Cập nhật
      await adminApi.update(String(updatedUser.id), payload);
      
      // 2. QUAN TRỌNG: Cập nhật UI NGAY LẬP TỨC (Không chờ fetch lại)
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === updatedUser.id ? { ...user, ...payload, role_id: safeRoleId } : user
      ));

      toast.success("Cập nhật thành công");
      setEditingUser(null);

      // 3. Gọi fetch ngầm để đảm bảo đồng bộ dữ liệu sau 1 chút
      setTimeout(() => fetchUsers(), 500);

    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật: Vui lòng kiểm tra lại dữ liệu"); 
    }
  };

  const renderRole = (roleId: any) => {
    const role = String(roleId);
    if (role === "1") return <Badge className="bg-red-500 hover:bg-red-600">Admin</Badge>;
    if (role === "2") return <Badge className="bg-blue-500 hover:bg-blue-600">Staff</Badge>;
    return <Badge variant="secondary">User</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
        <Button onClick={() => {setIsLoading(true); fetchUsers();}} variant="outline" size="sm">
            <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Email</TableHead><TableHead>SĐT</TableHead><TableHead>Vai trò</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow> :
             users.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">Không có dữ liệu</TableCell></TableRow> :
             users.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.full_name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.phone_number || "-"}</TableCell>
                <TableCell>{renderRole(item.role_id)}</TableCell>
                <TableCell>
                    <Badge variant={item.is_active ? "outline" : "destructive"} className={item.is_active ? "text-green-600 border-green-600 bg-green-50" : ""}>
                      {item.is_active ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingUser(item)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleUserStatus(String(item.id))}>{item.is_active ? <LockOpen className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-amber-500" />}</Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteUser(String(item.id))}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {editingUser && (
        <EditUserDialog user={editingUser} open={true} onClose={() => setEditingUser(null)} onSave={updateUser} />
      )}
    </div>
  );
};
export default UserManagement;
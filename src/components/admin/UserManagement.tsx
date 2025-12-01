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
      const res: any = await adminApi.getAll();
      
      if (Array.isArray(res)) setUsers(res);
      else if (res?.users && Array.isArray(res.users)) setUsers(res.users);
      else if (res?.data && Array.isArray(res.data)) setUsers(res.data);
      else if (users.length === 0) setUsers([]); 
    } catch { 
      if (users.length === 0) setUsers([]); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- ĐÃ SỬA ĐOẠN NÀY ---
  // Nhận vào object User để biết trạng thái hiện tại
  const toggleUserStatus = async (user: User) => {
    try { 
        const newStatus = !user.is_active; // Đảo ngược trạng thái (Bật -> Tắt, Tắt -> Bật)

        // Gọi API với trạng thái mới (Lưu ý: api.tsx phải được sửa trước thì dòng này mới chạy đúng)
        await adminApi.toggleStatus(String(user.id), newStatus); 
        
        // Cập nhật UI ngay lập tức
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
        
        toast.success("Đã cập nhật trạng thái"); 
        
        // fetchUsers(); // Không cần gọi lại fetchUsers để đỡ lag, vì mình đã update UI ở trên rồi
    } catch (error) { 
        console.error(error);
        toast.error("Lỗi cập nhật trạng thái"); 
    }
  };

  const deleteUser = async (id: string) => {
    if(!confirm("Xóa người dùng này?")) return;
    try { 
        await adminApi.delete(id); 
        setUsers(prev => prev.filter(u => String(u.id) !== id));
        toast.success("Đã xóa"); 
        fetchUsers();
    } catch { toast.error("Lỗi xóa"); }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      const safeRoleId = Number(updatedUser.role_id) || 3;
      
      const { ...cleanUser } = updatedUser as any;
      
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

      await adminApi.update(String(updatedUser.id), payload);
      
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === updatedUser.id ? { ...user, ...payload, role_id: safeRoleId } : user
      ));

      toast.success("Cập nhật thành công");
      setEditingUser(null);
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
                    
                    {/* --- ĐÃ SỬA ĐOẠN NÀY --- */}
                    {/* Truyền nguyên object item vào hàm thay vì chỉ id */}
                    <Button variant="ghost" size="icon" onClick={() => toggleUserStatus(item)}>
                        {item.is_active ? <LockOpen className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-amber-500" />}
                    </Button>

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
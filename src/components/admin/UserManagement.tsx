import { useState, useEffect } from "react";
import { Lock, LockOpen, Trash2, Edit } from "lucide-react";
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
import EditUserDialog from "./EditUserDialog";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "locked";
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
      const response = await adminApi.getAll();
      setUsers(response.data || []);
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
      await fetchUsers();
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
      console.error(error);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await adminApi.delete(userId);
      await fetchUsers();
      toast.success("Xóa người dùng thành công");
    } catch (error) {
      toast.error("Không thể xóa người dùng");
      console.error(error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await adminApi.update(updatedUser.id, updatedUser);
      await fetchUsers();
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      toast.error("Không thể cập nhật thông tin");
      console.error(error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Quản lý người dùng</h2>
        <p className="text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.status === "active" ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <LockOpen className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

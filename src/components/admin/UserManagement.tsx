import { useState } from "react";
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "locked";
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@example.com", role: "Admin", status: "active" },
    { id: "2", name: "Trần Thị B", email: "tranthib@example.com", role: "Người dùng", status: "active" },
    { id: "3", name: "Lê Văn C", email: "levanc@example.com", role: "Người dùng", status: "locked" },
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "locked" : "active" }
        : user
    ));
    toast.success("Cập nhật trạng thái thành công");
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success("Xóa người dùng thành công");
  };

  const updateUser = (updatedUser: User) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    toast.success("Cập nhật thông tin thành công");
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
            {users.map((user) => (
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
            ))}
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

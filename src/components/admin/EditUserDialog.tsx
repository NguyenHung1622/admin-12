import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "locked";
}

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

const EditUserDialog = ({ user, open, onClose, onSave }: EditUserDialogProps) => {
  const form = useForm<User>({
    values: user || { id: "", name: "", email: "", role: "", status: "active" },
  });

  const handleSubmit = (data: User) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Người dùng">Người dùng</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;

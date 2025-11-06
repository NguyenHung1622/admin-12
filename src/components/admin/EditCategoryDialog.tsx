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
import { Textarea } from "@/components/ui/textarea";

interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

interface EditCategoryDialogProps {
  category: Category | null;
  open: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  isNew?: boolean;
}

const EditCategoryDialog = ({ category, open, onClose, onSave, isNew }: EditCategoryDialogProps) => {
  const form = useForm<Category>({
    values: category || { id: "", name: "", description: "", itemCount: 0 },
  });

  const handleSubmit = (data: Category) => {
    onSave(data);
    onClose();
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tên danh mục" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Nhập mô tả" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit">{isNew ? "Thêm" : "Lưu"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;

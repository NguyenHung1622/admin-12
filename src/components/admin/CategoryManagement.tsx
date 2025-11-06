import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditCategoryDialog from "./EditCategoryDialog";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Điện tử", description: "Các sản phẩm điện tử", itemCount: 45 },
    { id: "2", name: "Thời trang", description: "Quần áo và phụ kiện", itemCount: 123 },
    { id: "3", name: "Gia dụng", description: "Đồ dùng gia đình", itemCount: 67 },
  ]);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    toast.success("Xóa danh mục thành công");
  };

  const saveCategory = (category: Category) => {
    if (isAddingNew) {
      setCategories([...categories, { ...category, id: Date.now().toString() }]);
      toast.success("Thêm danh mục thành công");
    } else {
      setCategories(categories.map(cat => cat.id === category.id ? category : cat));
      toast.success("Cập nhật danh mục thành công");
    }
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingCategory({ id: "", name: "", description: "", itemCount: 0 });
    setIsAddingNew(true);
  };

  const handleClose = () => {
    setEditingCategory(null);
    setIsAddingNew(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Quản lý danh mục</h2>
          <p className="text-muted-foreground">Quản lý các danh mục sản phẩm</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.itemCount} sản phẩm</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingCategory(category);
                        setIsAddingNew(false);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteCategory(category.id)}
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

      <EditCategoryDialog
        category={editingCategory}
        open={!!editingCategory}
        onClose={handleClose}
        onSave={saveCategory}
        isNew={isAddingNew}
      />
    </div>
  );
};

export default CategoryManagement;

import { useState, useEffect } from "react";
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
import { categoryApi } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await categoryApi.delete(categoryId);
      await fetchCategories();
      toast.success("Xóa danh mục thành công");
    } catch (error) {
      toast.error("Không thể xóa danh mục");
      console.error(error);
    }
  };

  const saveCategory = async (category: Category) => {
    try {
      if (isAddingNew) {
        await categoryApi.create(category);
        toast.success("Thêm danh mục thành công");
      } else {
        await categoryApi.update(category.id, category);
        toast.success("Cập nhật danh mục thành công");
      }
      await fetchCategories();
      setIsAddingNew(false);
    } catch (error) {
      toast.error(isAddingNew ? "Không thể thêm danh mục" : "Không thể cập nhật danh mục");
      console.error(error);
    }
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
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
              ))
            )}
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

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Pencil } from "lucide-react";
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
  itemCount?: number; // Thêm dấu ? vì có thể không có
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
      const response: any = await categoryApi.getAll();
      console.log("Categories Data:", response);

      // --- SỬA LOGIC XỬ LÝ DỮ LIỆU ---
      if (Array.isArray(response)) {
        // Trường hợp 1: Server trả về mảng trực tiếp [{}, {}]
        setCategories(response);
      } else if (response.categories && Array.isArray(response.categories)) {
        // Trường hợp 2: Server trả về { categories: [...] }
        setCategories(response.categories);
      } else if (response.data && Array.isArray(response.data)) {
        // Trường hợp 3: Server trả về { data: [...] }
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      toast.error("Không thể tải danh sách danh mục");
      setCategories([]); // Đảm bảo không crash
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await categoryApi.delete(categoryId);
      await fetchCategories();
      toast.success("Xóa danh mục thành công");
    } catch (error) {
      toast.error("Không thể xóa danh mục");
    }
  };

  const saveCategory = async (category: Category) => {
    try {
      if (isAddingNew) {
        await categoryApi.create({ name: category.name, description: category.description });
        toast.success("Thêm danh mục thành công");
      } else {
        await categoryApi.update(category.id, { name: category.name, description: category.description });
        toast.success("Cập nhật danh mục thành công");
      }
      await fetchCategories();
      handleClose();
    } catch (error) {
      toast.error(isAddingNew ? "Lỗi thêm danh mục" : "Lỗi cập nhật danh mục");
      console.error(error);
    }
  };

  const handleAddNew = () => {
    setEditingCategory({ id: "", name: "", description: "" });
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
          <h2 className="text-2xl font-bold text-foreground">Quản lý danh mục</h2>
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
              <TableHead>ID</TableHead>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Không có dữ liệu</TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id || Math.random()}> {/* Fallback key */}
                  <TableCell>{category.id}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(category); setIsAddingNew(false); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteCategory(category.id)}>
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

      {(editingCategory || isAddingNew) && (
         <EditCategoryDialog
           category={editingCategory}
           open={!!editingCategory || isAddingNew}
           onClose={handleClose}
           onSave={saveCategory}
           isNew={isAddingNew}
         />
      )}
    </div>
  );
};

export default CategoryManagement;
import { useState, useEffect } from "react";
import { Trash2, Eye, Loader2, Clock } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// =================================================================================
// 👇 BƯỚC 1: BỎ COMMENT DÒNG DƯỚI ĐỂ CHẠY API THẬT TRÊN MÁY BẠN
import { serviceApi } from "@/lib/api"
// =================================================================================



// Interface chuẩn theo Database DBeaver
interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category_id: number;
  is_active: boolean; 
}

const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      
      console.log("🚀 Bắt đầu gọi API..."); 
      
      const response: any = await serviceApi.getAll();
      console.log("Dữ liệu server trả về:", response);

      let serviceData: Service[] = [];
      if (Array.isArray(response)) {
        serviceData = response;
      } else if (response.data && Array.isArray(response.data)) {
        serviceData = response.data;
      } else if (response.services && Array.isArray(response.services)) {
        serviceData = response.services;
      }

      setServices(serviceData);
    } catch (error) {
      toast.error("Không thể tải danh sách dịch vụ");
      console.error("Lỗi API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;
    try {
      await serviceApi.delete(id);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success("Đã xóa dịch vụ");
    } catch (error) {
      toast.error("Lỗi khi xóa dịch vụ");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Quản lý dịch vụ</h2>
          <p className="text-muted-foreground mt-1">Danh sách dịch vụ từ Database</p>
        </div>
        <Button onClick={fetchServices} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Làm mới
        </Button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Tên dịch vụ</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                   <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Đang tải dữ liệu...
                   </div>
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <span>Không có dữ liệu</span>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      Lưu ý: Hãy bỏ comment dòng "import serviceApi" để lấy dữ liệu thật.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-mono text-xs">{service.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{service.name}</span>
                      <span className="text-xs text-muted-foreground">Category ID: {service.category_id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground" title={service.description}>
                    {service.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {service.duration_minutes}p
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {Number(service.price).toLocaleString('vi-VN')} ₫
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Hoạt động" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingService(service)}
                        className="hover:bg-blue-50 text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteService(service.id)}
                        className="hover:bg-red-50 text-red-600"
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

      <Dialog open={!!viewingService} onOpenChange={(open) => !open && setViewingService(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết dịch vụ #{viewingService?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Tên:</span>
              <span className="col-span-3">{viewingService?.name}</span>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="font-bold text-right mt-1">Mô tả:</span>
              <span className="col-span-3 text-sm text-muted-foreground">{viewingService?.description}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Giá:</span>
              <span className="col-span-3 font-semibold text-green-600">
                {viewingService?.price?.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Thời lượng:</span>
              <span className="col-span-3">{viewingService?.duration_minutes} phút</span>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Danh mục ID:</span>
              <span className="col-span-3">{viewingService?.category_id}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Trạng thái:</span>
              <span className="col-span-3">
                <Badge variant={viewingService?.is_active ? "default" : "secondary"}>
                  {viewingService?.is_active ? "Hoạt động" : "Ẩn"}
                </Badge>
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceManagement;
import { useState, useEffect } from "react";
import { Trash2, Eye } from "lucide-react";
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
import ViewServiceDialog from "./ViewServiceDialog";
import { toast } from "sonner";
import { serviceApi } from "@/lib/api";

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "available" | "unavailable";
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
      const response = await serviceApi.getAll();
      setServices(response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách dịch vụ");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      await serviceApi.delete(serviceId);
      await fetchServices();
      toast.success("Xóa dịch vụ thành công");
    } catch (error) {
      toast.error("Không thể xóa dịch vụ");
      console.error(error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Quản lý dịch vụ</h2>
        <p className="text-muted-foreground">Xem và quản lý các dịch vụ</p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên dịch vụ</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
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
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.price.toLocaleString('vi-VN')} ₫</TableCell>
                <TableCell>
                  <Badge variant={service.status === "available" ? "default" : "secondary"}>
                    {service.status === "available" ? "Có sẵn" : "Không có sẵn"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setViewingService(service)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteService(service.id)}
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

      <ViewServiceDialog
        service={viewingService}
        open={!!viewingService}
        onClose={() => setViewingService(null)}
      />
    </div>
  );
};

export default ServiceManagement;

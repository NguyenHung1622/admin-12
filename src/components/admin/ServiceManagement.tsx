import { useState } from "react";
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

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "available" | "unavailable";
}

const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([
    { id: "1", name: "Lắp đặt điện", category: "Điện tử", price: 500000, status: "available" },
    { id: "2", name: "Sửa chữa máy tính", category: "Điện tử", price: 300000, status: "available" },
    { id: "3", name: "Vệ sinh nhà cửa", category: "Gia dụng", price: 200000, status: "unavailable" },
  ]);

  const [viewingService, setViewingService] = useState<Service | null>(null);

  const deleteService = (serviceId: string) => {
    setServices(services.filter(service => service.id !== serviceId));
    toast.success("Xóa dịch vụ thành công");
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
            {services.map((service) => (
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
            ))}
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

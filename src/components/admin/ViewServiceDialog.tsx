import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "available" | "unavailable";
}

interface ViewServiceDialogProps {
  service: Service | null;
  open: boolean;
  onClose: () => void;
}

const ViewServiceDialog = ({ service, open, onClose }: ViewServiceDialogProps) => {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết dịch vụ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tên dịch vụ</p>
            <p className="text-lg font-semibold">{service.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Danh mục</p>
            <p className="text-lg">{service.category}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Giá</p>
            <p className="text-lg font-semibold">{service.price.toLocaleString('vi-VN')} ₫</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Trạng thái</p>
            <Badge variant={service.status === "available" ? "default" : "secondary"}>
              {service.status === "available" ? "Có sẵn" : "Không có sẵn"}
            </Badge>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewServiceDialog;

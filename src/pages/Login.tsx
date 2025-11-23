import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { authApi, setAuthToken } from "@/lib/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Mail, User, Phone } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập số điện thoại"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
  phone_number: z.string().min(10, "Số điện thoại không hợp lệ"),
  gender: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredPhone, setRegisteredPhone] = useState(""); 
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", phone_number: "", gender: "Male" },
  });

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reg_email");
    const savedPhone = sessionStorage.getItem("reg_phone");
    const isVerifying = sessionStorage.getItem("is_verifying");

    if (isVerifying === "true" && savedEmail && savedPhone) {
      setRegisteredEmail(savedEmail);
      setRegisteredPhone(savedPhone);
      setShowOtpInput(true);
    }
  }, []);

  // --- HÀM ĐĂNG NHẬP ĐÃ SỬA ĐỂ LẤY ĐÚNG TOKEN ---
  const onLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response: any = await authApi.login(data.email, data.password);
      
      console.log("Login Response:", response);

      // Kiểm tra response.access_token (cách trả về thực tế của server bạn)
      if (response.err === 0 || response.access_token) {
        const token = response.access_token || response.data?.token;
        
        if (token) {
            setAuthToken(token);
            toast.success("Đăng nhập thành công!");
            navigate("/admin", { replace: true });
        } else {
            toast.error("Lỗi hệ thống: Không nhận được Token đăng nhập");
        }
      } else {
        toast.error(response.mes || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await authApi.register(data.email, data.password, data.name, data.phone_number || "", data.gender || "");
      
      setRegisteredEmail(data.email);
      setRegisteredPhone(data.phone_number || "");
      
      sessionStorage.setItem("reg_email", data.email);
      sessionStorage.setItem("reg_phone", data.phone_number || "");
      sessionStorage.setItem("is_verifying", "true");

      setShowOtpInput(true);
      toast.success("Đăng ký thành công! Đã gửi OTP.");
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    if (!registeredEmail || !registeredPhone) {
      toast.error("Mất thông tin xác thực. Vui lòng nhập lại bên dưới.");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.verify(registeredEmail, otp, registeredPhone);
      
      if (response.err === 0 || response.data?.token || (Object.keys(response).length === 0 && response.constructor === Object)) {
        sessionStorage.removeItem("reg_email");
        sessionStorage.removeItem("reg_phone");
        sessionStorage.removeItem("is_verifying");

        toast.success("Xác minh thành công! Vui lòng Đăng nhập.");
        setShowOtpInput(false);
        setActiveTab("login");
        loginForm.setValue("email", registeredPhone);
      } else {
        toast.error(response.mes || "Xác minh thất bại");
      }
    } catch (error: any) {
      toast.error(error.message || "Mã OTP không đúng");
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtpInput) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Xác minh tài khoản</CardTitle>
            <CardDescription>
              {registeredEmail ? `Mã OTP gửi đến: ${registeredEmail}` : "Nhập thông tin để xác minh"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {(!registeredEmail || !registeredPhone) && (
              <div className="space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 mb-2">⚠️ Đã mất thông tin phiên làm việc. Vui lòng nhập lại:</p>
                <Input placeholder="Email đăng ký" value={registeredEmail} onChange={(e) => setRegisteredEmail(e.target.value)} />
                <Input placeholder="Số điện thoại đăng ký" value={registeredPhone} onChange={(e) => setRegisteredPhone(e.target.value)} />
              </div>
            )}

            <div className="space-y-2 flex flex-col items-center">
              <Label>Nhập mã OTP (6 số)</Label>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button onClick={onVerifyOtp} disabled={isLoading || otp.length !== 6} className="w-full">
              {isLoading ? "Đang xác minh..." : "Xác minh"}
            </Button>
            
            <Button variant="outline" onClick={() => {
              setShowOtpInput(false);
              sessionStorage.removeItem("is_verifying");
            }} className="w-full">Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Portal</CardTitle>
          <CardDescription>Đăng nhập hoặc đăng ký</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="login">Đăng nhập</TabsTrigger><TabsTrigger value="register">Đăng ký</TabsTrigger></TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField control={loginForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Số điện thoại</FormLabel><FormControl><div className="relative"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" {...field} placeholder="0912345678" /></div></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={loginForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Mật khẩu</FormLabel><FormControl><div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" type="password" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Đang vào..." : "Đăng nhập"}</Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField control={registerForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Tên</FormLabel><FormControl><div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={registerForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" type="email" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={registerForm.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>Số điện thoại</FormLabel><FormControl><div className="relative"><Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={registerForm.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Giới tính</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Nam</SelectItem><SelectItem value="Female">Nữ</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={registerForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Mật khẩu</FormLabel><FormControl><div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" type="password" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Nhập lại mật khẩu</FormLabel><FormControl><div className="relative"><Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" type="password" {...field} /></div></FormControl><FormMessage /></FormItem>)} />
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Đang đăng ký..." : "Đăng ký"}</Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
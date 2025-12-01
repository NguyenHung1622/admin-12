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
import { Lock, Mail, User, Phone, ArrowRight, Loader2, Store } from "lucide-react";

// --- SCHEMA ---
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

  // --- HANDLERS ---
  const onLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response: any = await authApi.login(data.email, data.password);
      
      if (response.data?.token || response.access_token || response.token || response.err === 0) {
        const token = response.data?.token || response.access_token || response.token;
        setAuthToken(token);
        toast.success("Đăng nhập thành công!");
        navigate("/admin", { replace: true });
      } else {
        toast.error(response.mes || "Đăng nhập thất bại");
      }
    } catch (error: any) {
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
      toast.success("Mã OTP đã được gửi!");
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
      
      if (response.err === 0 || response.data?.token) {
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

  // --- RENDER ---
  
  // Background Style
  const bgStyle = {
    backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2070&auto=format&fit=crop')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0" style={bgStyle}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-blue-900/40 backdrop-blur-[2px] z-0"></div>

        <Card className="w-full max-w-md z-10 border-none shadow-2xl bg-white/95 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
            <CardHeader className="space-y-2 text-center pb-2">
                <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Store className="w-8 h-8" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Admin Portal
                </CardTitle>
                <CardDescription className="text-gray-500 text-base">
                    Hệ thống quản lý cửa hàng Phát Đạt
                </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
                {showOtpInput ? (
                     <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800">Xác minh tài khoản</h3>
                            <p className="text-sm text-muted-foreground">
                                Mã OTP đã được gửi đến: <span className="font-medium text-blue-600">{registeredEmail}</span>
                            </p>
                        </div>

                        {/* Form nhập lại nếu mất session */}
                        {(!registeredEmail || !registeredPhone) && (
                            <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                                <div className="flex items-center gap-2 text-amber-700 font-medium">
                                    ⚠️ Phiên làm việc đã hết hạn
                                </div>
                                <Input placeholder="Nhập lại Email đã đăng ký" value={registeredEmail} onChange={(e) => setRegisteredEmail(e.target.value)} className="bg-white" />
                                <Input placeholder="Nhập lại SĐT đã đăng ký" value={registeredPhone} onChange={(e) => setRegisteredPhone(e.target.value)} className="bg-white" />
                            </div>
                        )}

                        <div className="flex justify-center py-4">
                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup className="gap-2">
                                    {[...Array(6)].map((_, i) => (
                                        <InputOTPSlot key={i} index={i} className="w-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-md text-lg" />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <div className="space-y-3">
                            <Button onClick={onVerifyOtp} disabled={isLoading || otp.length !== 6} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all hover:shadow-lg">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="flex items-center">Xác minh ngay <ArrowRight className="ml-2 h-4 w-4"/></span>}
                            </Button>
                            <Button variant="ghost" onClick={() => { setShowOtpInput(false); sessionStorage.removeItem("is_verifying"); }} className="w-full text-gray-500 hover:text-gray-800">
                                Quay lại
                            </Button>
                        </div>
                     </div>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100/80 rounded-xl">
                            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium transition-all">Đăng nhập</TabsTrigger>
                            <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium transition-all">Đăng ký</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login" className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">Số điện thoại</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    <Input className="pl-10 h-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all" {...field} placeholder="0912345678" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel className="text-gray-700">Mật khẩu</FormLabel>
                                                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Quên mật khẩu?</span>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    <Input className="pl-10 h-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all" type="password" {...field} placeholder="••••••••" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all mt-2" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Đăng nhập"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="register" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Form {...registerForm}>
                                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField control={registerForm.control} name="name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Họ tên</FormLabel>
                                                <FormControl><div className="relative"><User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-9" {...field} placeholder="Tên bạn" /></div></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={registerForm.control} name="phone_number" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số điện thoại</FormLabel>
                                                <FormControl><div className="relative"><Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-9" {...field} placeholder="09..." /></div></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    
                                    <FormField control={registerForm.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><div className="relative"><Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-9" type="email" {...field} placeholder="example@gmail.com" /></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    
                                    <FormField control={registerForm.control} name="gender" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giới tính</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Male">Nam</SelectItem>
                                                    <SelectItem value="Female">Nữ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField control={registerForm.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mật khẩu</FormLabel>
                                                <FormControl><div className="relative"><Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-9" type="password" {...field} /></div></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nhập lại</FormLabel>
                                                <FormControl><div className="relative"><Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-9" type="password" {...field} /></div></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <Button type="submit" className="w-full h-10 bg-green-600 hover:bg-green-700 mt-2" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Đăng ký tài khoản"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default Login;
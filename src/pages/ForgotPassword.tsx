import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const resetPasswordSchema = z.object({
  new_password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.new_password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type Step = "email" | "otp" | "reset";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirmPassword: "",
    },
  });

  const onSendOtp = async (data: EmailFormData) => {
    try {
      setIsLoading(true);
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setStep("otp");
      toast.success("Mã OTP đã được gửi đến email của bạn!");
    } catch (error: any) {
      toast.error(error.message || "Gửi mã OTP thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.verifyResetOtp(email, otp);
      setResetToken(response.data.reset_token);
      setStep("reset");
      toast.success("Xác minh OTP thành công!");
    } catch (error: any) {
      toast.error(error.message || "Mã OTP không đúng");
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      await authApi.resetPassword(resetToken, data.new_password);
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Xác minh OTP</CardTitle>
            <CardDescription>
              Mã OTP đã được gửi đến email: {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nhập mã OTP (6 số)</label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                onClick={onVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full"
              >
                {isLoading ? "Đang xác minh..." : "Xác minh"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setEmail("");
                }}
                className="w-full"
              >
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>Nhập mật khẩu mới của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onSendOtp)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full"
                  type="button"
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;

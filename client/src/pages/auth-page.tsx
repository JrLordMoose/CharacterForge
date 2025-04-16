import { useState, useEffect } from "react";
import { useLocation, useRoute, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  email: z.string().email("Valid email is required"),
  displayName: z.string().optional(),
  bio: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ token: string }>("/auth/reset-password/:token");
  const { 
    user, 
    loginMutation, 
    registerMutation, 
    forgotPasswordMutation, 
    resetPasswordMutation 
  } = useAuth();

  // Create form handlers
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      displayName: "",
      bio: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect if user is already logged in (except for reset password route)
  useEffect(() => {
    if (user && !match) {
      setLocation("/");
    }
  }, [user, setLocation, match]);

  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };
  
  const onForgotPasswordSubmit = (data: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        // Switch back to login view after successful submission
        setShowForgotPassword(false);
      }
    });
  };
  
  const onResetPasswordSubmit = (data: ResetPasswordFormValues) => {
    if (match && params?.token) {
      resetPasswordMutation.mutate({
        token: params.token,
        password: data.password
      }, {
        onSuccess: () => {
          // Redirect to login page after successfully resetting password
          setLocation("/auth");
        }
      });
    }
  };

  // Render password reset form if on reset password route
  if (match && params?.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-cinzel text-primary">Reset Your Password</CardTitle>
            <CardDescription>
              Please enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              onClick={() => setLocation("/auth")}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
        {/* Smoky background effect */}
        <div className="absolute inset-0 bg-gradient-radial from-black/60 via-black/80 to-black"></div>
        <div className="absolute inset-0 opacity-40" style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80')", 
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay"
        }}></div>
        
        <div className="relative max-w-xl text-center p-8 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-cinzel text-primary mb-4 animate-fade-in-down tracking-wider animate-glow-pulse">
            5D Character Creator
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 animate-fade-in-up">
            Craft intricate, multi-dimensional characters for your stories with powerful AI assistance.
          </p>
          <div className="space-y-6 text-left bg-black/40 p-6 rounded-lg backdrop-blur-sm border border-gray-800">
            <div className="flex items-start">
              <div className="bg-primary/20 p-2 rounded-full mr-4">
                <span className="text-primary text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-primary font-bold">Dynamic Character Development</h3>
                <p className="text-gray-400">Create characters with rich psychology, detailed backstories, and evolving arcs</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/20 p-2 rounded-full mr-4">
                <span className="text-primary text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-primary font-bold">AI-Powered Generation</h3>
                <p className="text-gray-400">Leverage artificial intelligence to enhance character traits, motivations, and voices</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/20 p-2 rounded-full mr-4">
                <span className="text-primary text-xl">✓</span>
              </div>
              <div>
                <h3 className="text-primary font-bold">Seamless Integration</h3>
                <p className="text-gray-400">Export to Notion, interact with your characters through chat, and track development</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth forms section */}
      <div className="flex-1 bg-background flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-cinzel text-primary">Welcome Back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your characters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showForgotPassword ? (
                    /* Regular Login Form */
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end mb-2">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowForgotPassword(true);
                            }}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    /* Forgot Password Form */
                    <Form {...forgotPasswordForm}>
                      <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium">Reset Your Password</h3>
                          <p className="text-sm text-muted-foreground">
                            Enter your email address and we'll send you a link to reset your password.
                          </p>
                        </div>
                        <FormField
                          control={forgotPasswordForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={forgotPasswordMutation.isPending}
                        >
                          {forgotPasswordMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                              Sending...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                        <Button
                          variant="link"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowForgotPassword(false);
                          }}
                        >
                          Back to Login
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setActiveTab("register");
                    }}
                  >
                    Don't have an account? Register
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-cinzel text-primary">Create Account</CardTitle>
                  <CardDescription>
                    Register to start creating amazing characters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="How you want to be addressed" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us a bit about yourself" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Creating account...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("login")}
                  >
                    Already have an account? Login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
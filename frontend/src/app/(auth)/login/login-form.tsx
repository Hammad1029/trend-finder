/**
 * Login Form Component
 * 
 * Client component with useSearchParams for redirect handling
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TrendingUp, Eye, EyeOff } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
    loginSchema,
    signupSchema,
    type LoginInput,
    type SignupInput,
} from "@/lib/validations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

    const supabase = createClient();

    // Login form
    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Signup form
    const signupForm = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onLogin(data: LoginInput) {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            router.push(redirect);
            router.refresh();
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function onSignup(data: SignupInput) {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
                return;
            }

            // Show success message
            setError(null);
            setActiveTab("login");
            loginForm.setValue("email", data.email);
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25">
                    <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold text-white">
                        TrendToy
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Discover trending products in global markets
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                        <TabsTrigger value="login" className="data-[state=active]:bg-zinc-700">
                            Sign In
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="data-[state=active]:bg-zinc-700">
                            Sign Up
                        </TabsTrigger>
                    </TabsList>

                    {/* Error Alert */}
                    {error && (
                        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Tab */}
                    <TabsContent value="login" className="mt-4">
                        <Form {...loginForm}>
                            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                <FormField
                                    control={loginForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-300">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="you@example.com"
                                                    type="email"
                                                    autoComplete="email"
                                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                    {...field}
                                                />
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
                                            <FormLabel className="text-zinc-300">Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="••••••••"
                                                        type={showPassword ? "text" : "password"}
                                                        autoComplete="current-password"
                                                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>

                    {/* Signup Tab */}
                    <TabsContent value="signup" className="mt-4">
                        <Form {...signupForm}>
                            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                                <FormField
                                    control={signupForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-300">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="you@example.com"
                                                    type="email"
                                                    autoComplete="email"
                                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={signupForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-300">Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="••••••••"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={signupForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-300">Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="••••••••"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-zinc-800 pt-4">
                <p className="text-xs text-zinc-500">
                    By continuing, you agree to our Terms of Service
                </p>
            </CardFooter>
        </Card>
    );
}

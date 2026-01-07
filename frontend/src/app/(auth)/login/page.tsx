/**
 * Login Page
 * 
 * Sign In / Sign Up page using shadcn/ui components
 */

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function LoginFormSkeleton() {
    return (
        <Card className="border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
                <div className="space-y-4">
                    <Skeleton className="h-14 w-14 mx-auto rounded-xl bg-zinc-800" />
                    <Skeleton className="h-8 w-32 mx-auto bg-zinc-800" />
                    <Skeleton className="h-4 w-48 mx-auto bg-zinc-800" />
                    <Skeleton className="h-10 w-full bg-zinc-800 mt-6" />
                    <Skeleton className="h-10 w-full bg-zinc-800" />
                    <Skeleton className="h-10 w-full bg-zinc-800" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
        </Suspense>
    );
}

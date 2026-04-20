"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types/auth";

interface AuthCardProps {
  onSuccess: (user: User) => void;
  onError: (error: string) => void;
}

export default function AuthCard({ onSuccess, onError }: AuthCardProps) {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body: Record<string, string> = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (!isLogin) {
      body.name = formData.get("name") as string;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(data.user);
      } else {
        onError(data.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth request failed:", error);
      onError(error instanceof Error ? error.message : "Network error");
    }
  };

  return (
    <div className="glass-strong border border-cyan-500/20 rounded-2xl p-8 glow-cyan">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>
        <p className="text-sm text-gray-400">
          {isLogin
            ? "Sign in to continue to Governance Engine"
            : "Get started with Governance Engine"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          className={`transition-all duration-300 ease-in-out ${isLogin ? "h-0 opacity-0 -mb-5" : "h-auto opacity-100"}`}
        >
          {!isLogin && (
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-200"
              >
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Peter Parker"
                className="h-12 bg-black/40 border-cyan-500/30 focus:border-cyan-400 text-white placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-cyan-400/20"
                required
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-200">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value="samrat.damodaran@zeb.co" // TODO: Remove this
            placeholder="you@company.com"
            className="h-12 bg-black/40 border-cyan-500/30 focus:border-cyan-400 text-white placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-cyan-400/20"
            required
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-200"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value="samrat2003" // TODO: Remove this
            placeholder={
              isLogin ? "Enter your password" : "Minimum 8 characters"
            }
            minLength={isLogin ? undefined : 8}
            className="h-12 bg-black/40 border-cyan-500/30 focus:border-cyan-400 text-white placeholder:text-gray-500 transition-all focus:ring-2 focus:ring-cyan-400/20"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-semibold text-base shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLogin ? "Sign in" : "Create account"}
        </Button>
      </form>

      {/* Toggle */}
      <div className="mt-6 pt-6 border-t border-cyan-500/20 text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-400 transition-colors"
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="text-cyan-400 font-semibold hover:text-cyan-600 cursor-pointer">
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </button>
      </div>
    </div>
  );
}

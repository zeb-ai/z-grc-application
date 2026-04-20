"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthCard from "@/components/AuthCard";
import type { User } from "@/types/auth";

export default function Home() {
  const router = useRouter();

  const handleSuccess = (userData: User) => {
    toast.success(`Welcome back, ${userData.name}!`);
    router.push("/home");
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="h-screen bg-magnetic overflow-hidden">
      <div className="relative z-10 h-full flex items-center px-4 lg:px-12 py-8">
        <div className="w-full max-w-7xl mx-auto -mt-18">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <section className="opacity-0 animate-slide-in-left self-start">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold tracking-tight pb-2">
                  <span className="block text-white">
                    Governance{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-teal-400 to-cyan-500">
                      Engine
                    </span>
                  </span>
                </h1>

                <p className="text-lg lg:text-xl text-gray-300 max-w-xl leading-relaxed">
                  Enterprise policy management with real-time telemetry,
                  intelligent quota tracking, and distributed observability
                </p>
              </div>
            </section>

            {/* Right Section - Auth Form */}
            <section className="opacity-0 animate-slide-in-right delay-200">
              <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
                <AuthCard onSuccess={handleSuccess} onError={handleError} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

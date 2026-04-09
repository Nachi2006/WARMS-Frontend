"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  ranger: "/ranger/dashboard",
  user: "/visitor/dashboard",
};

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();
    if (role) {
      router.replace(ROLE_HOME[role] ?? "/login");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div className="spinner" />
    </div>
  );
}

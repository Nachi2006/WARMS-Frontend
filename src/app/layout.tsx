import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/shared/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "WARMS — Wildlife Administration & Reserve Management System",
  description:
    "A unified platform for wildlife reserve management, visitor bookings, ranger operations, and administrative control.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}

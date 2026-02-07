import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Setu | AI-Driven Cross-Chain Bridge",
  description: "Bridge USDC and earn yield with Setu on Base Sepolia & Ethereum Sepolia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans">
        <Providers>
          {children}
          <Toaster
            theme="light"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#ffffff",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                color: "#0a0a0f",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

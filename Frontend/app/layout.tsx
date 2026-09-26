import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "RETINASCOPE | Explainable AI Diabetic Retinopathy Screening Platform",
  description: "Detect Earlier | Explain Clearly | Refer Smarter. State-of-the-art clinical screening and explainable AI for diabetic retinopathy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-[#F6F9F8] text-slate-900">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}

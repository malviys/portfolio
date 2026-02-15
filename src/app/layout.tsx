import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Footer from "@/app/shared/footer";
import Header from "@/app/shared/header";
import ConfigProvider from "@/components/system/config-provider";
import { ThemeProvider } from "@/components/system/theme-provider";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sourabh Malviya — Software Engineer",
  description:
    "Portfolio of Sourabh Malviya — Senior Software Engineer building products from mobile apps to scalable platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen overflow-x-hidden ${inter.className}`}>
        <ConfigProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Footer from "@/app/shared/footer";
import Header from "@/app/shared/header";
import ConfigProvider from "@/components/system/config-provider";
import { ThemeProvider } from "@/components/system/theme-provider";
import { ConsoleWarning } from "@/components/ui/warning";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Malviya Sourabh",
  description: "Created by master🙏 itself",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen overflow-x-hidden ${inter.className}`}>
        <ConfigProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </ConfigProvider>
      </body>
      <ConsoleWarning message="!!This Portfolio is in development!!" />
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Footer from "@/app/shared/footer";
import Header from "@/app/shared/header";
import ConfigProvider from "@/components/system/config-provider";
import { ThemeProvider } from "@/components/system/theme-provider";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = "https://malviys.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Sourabh Malviya — Software Engineer",
    template: "%s | Sourabh Malviya",
  },
  description:
    "Portfolio of Sourabh Malviya — Senior Software Engineer building products from mobile apps to scalable platforms.",
  keywords: [
    "Sourabh Malviya",
    "Software Engineer",
    "React Native",
    "Full Stack Developer",
    "TypeScript",
    "Node.js",
    "iOS",
    "Android",
  ],
  authors: [{ name: "Sourabh Malviya", url: BASE_URL }],
  creator: "Sourabh Malviya",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Sourabh Malviya",
    title: "Sourabh Malviya — Software Engineer",
    description:
      "Building products that people love — from mobile apps to scalable platforms.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sourabh Malviya — Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sourabh Malviya — Software Engineer",
    description:
      "Building products that people love — from mobile apps to scalable platforms.",
    images: ["/og-image.png"],
    creator: "@malviys",
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sourabh Malviya",
  url: BASE_URL,
  jobTitle: "Senior Software Engineer",
  sameAs: [
    "https://github.com/malviys",
    "https://www.linkedin.com/in/malviys",
    "https://www.instagram.com/ma1viys?igsh=MTBuenViejl5MmxsMA==",
  ],
  email: "saurabhmalvia997@gmail.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`min-h-screen overflow-x-hidden ${inter.className}`}>
        <ConfigProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </ConfigProvider>
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}


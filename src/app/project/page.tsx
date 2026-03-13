import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A showcase of projects built by Sourabh Malviya — from React Native mobile apps to scalable full-stack platforms.",
  alternates: { canonical: "https://malviys.com/project" },
  openGraph: {
    type: "website",
    url: "https://malviys.com/project",
    title: "Projects | Sourabh Malviya",
    description:
      "A showcase of projects built by Sourabh Malviya — from React Native mobile apps to scalable full-stack platforms.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Sourabh Malviya",
    creator: "@malviys",
  },
};

export default function Project() {
  return <main></main>;
}
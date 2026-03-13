import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Sourabh Malviya, a Senior Software Engineer specialising in React Native, TypeScript, and scalable full-stack platforms.",
  alternates: { canonical: "https://malviys.com/about" },
  openGraph: {
    type: "profile",
    url: "https://malviys.com/about",
    title: "About | Sourabh Malviya",
    description:
      "Learn more about Sourabh Malviya, a Senior Software Engineer specialising in React Native, TypeScript, and scalable full-stack platforms.",
  },
  twitter: {
    card: "summary",
    title: "About | Sourabh Malviya",
    creator: "@malviys",
  },
};

export default function About() {
  return <main></main>;
}
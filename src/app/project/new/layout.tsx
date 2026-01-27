import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Website",
  description:
    "Start building your website with AI. Describe what you want in plain English and see it come to life instantly.",
  openGraph: {
    title: "Create Your Website with AI - Pennysite",
    description:
      "Start building your website with AI. Describe what you want and see it instantly.",
  },
};

export default function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

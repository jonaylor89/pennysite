import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Project",
  description: "Edit and refine your AI-generated website.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

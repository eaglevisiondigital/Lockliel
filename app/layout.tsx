import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lockliel — Reach. Teach. Train. Disciple.",
  description:
    "Discover the vision for Lockliel, a global Christian technology platform being built to equip believers, reach people, and make disciples.",
  icons: {
    icon: "/lockliel-mark.png",
    shortcut: "/lockliel-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CHEETAH Learn — Adaptive Literacy Platform",
  description: "CHEETAH's interactive speech-powered literacy platform for children",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

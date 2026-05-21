import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decoded Housing",
  description:
    "A trauma-informed housing navigation, prevention, and housing intelligence platform for Washington families and navigators."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aurora — Zero-Knowledge Student Attendance on Midnight",
  description:
    "Privacy-preserving zero-knowledge student attendance platform built on Midnight Network using Compact smart contracts. Prove presence without disclosing identities or student IDs on-chain.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased text-[#dae2fd] bg-[#0b1326] selection:bg-[#7E22CE] selection:text-white">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Hating Kapatid",
  description: "Ambagan made easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} min-h-screen flex flex-col`}>

        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 min-h-0 pb-10">
          {children}
        </main>

        {/* Footer */}
        <Footer />

      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/Toast";
import { InlineScript } from "@/components/InlineScript";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <InlineScript
          html={`(function(){try{var t=localStorage.getItem("hk-theme");if(t==="dark"){document.documentElement.classList.add("dark");}else if(t==="light"){document.documentElement.classList.remove("dark");}}catch(e){}})();`}
        />
      </head>

      <body className="min-h-screen bg-hk-background text-hk-text">
        {children}

        <ToastProvider />
      </body>
    </html>
  );
}
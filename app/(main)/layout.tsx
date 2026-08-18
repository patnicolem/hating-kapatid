import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireUser } from "@/lib/queries";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}

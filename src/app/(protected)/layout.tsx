import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Layout หน้าที่ต้อง login
export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { DotGothic16, Noto_Sans_Thai } from "next/font/google";
import "@/styles/globals.css";

const sans = Noto_Sans_Thai({
  variable: "--font-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const dot = DotGothic16({
  variable: "--font-dot",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Stock Portfolio",
  description: "บันทึกการซื้อขายหุ้นของคุณเอง",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${sans.variable} ${dot.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

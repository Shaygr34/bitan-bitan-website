import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "ביטן את ביטן — רואי חשבון",
  description:
    "משרד רואי חשבון ביטן את ביטן — ייעוץ מס, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי. דור שני של רואי חשבון בתל אביב.",
  openGraph: {
    title: "ביטן את ביטן — רואי חשבון",
    description:
      "משרד רואי חשבון ביטן את ביטן — ייעוץ מס, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי.",
    locale: "he_IL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-heebo min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

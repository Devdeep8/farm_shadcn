import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "@/provider/SessionProvider";
import {auth} from "@/auth"
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Farm Pro",
  description: "Deva",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const session = await auth();

  return (
    <html lang="en">

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
              <SessionProvider session={session}>
        {children}
        <Toaster richColors position="bottom-center" closeButton/>
                </SessionProvider>

      </body>
    </html>
  );
}

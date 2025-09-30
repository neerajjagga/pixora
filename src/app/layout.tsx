import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Provider from "./providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "400"
})

export const metadata: Metadata = {
  title: "Pixora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
      >
        <Provider>
          <Navbar />

          <main>
            {children}
            <Toaster
              toastOptions={{
                style: {
                  background: '#0b0e13',
                  color: '#f8fafc',
                },
              }}
            />
          </main>
        </Provider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tabernaHeading = localFont({
  src: [
    {
      path: "../public/fonts/Taberna/TabernaSerif-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-taberna-heading",
  display: "swap",
});

const tabernaExtras = localFont({
  src: [
    {
      path: "../public/fonts/Taberna/Taberna-Extras.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-taberna-extras",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barao das Bebidas | Pedidos",
  description: "Sistema de cadastro e acompanhamento de pedidos",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${tabernaHeading.variable} ${tabernaExtras.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

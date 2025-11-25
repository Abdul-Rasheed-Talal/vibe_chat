import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Vibe Chat | Real-time Messaging",
    template: "%s | Vibe Chat"
  },
  description: "Experience the next generation of messaging with Vibe Chat. Real-time, secure, and aesthetically pleasing.",
  keywords: ["chat", "messaging", "real-time", "nextjs", "supabase", "neon", "vibe"],
  authors: [{ name: "Vibe Team" }],
  creator: "Vibe Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vibe-chat.vercel.app",
    title: "Vibe Chat | Real-time Messaging",
    description: "Experience the next generation of messaging with Vibe Chat.",
    siteName: "Vibe Chat",
    images: [
      {
        url: "/og-image.png", // We need to create this or assume it exists
        width: 1200,
        height: 630,
        alt: "Vibe Chat Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Chat | Real-time Messaging",
    description: "Experience the next generation of messaging with Vibe Chat.",
    images: ["/og-image.png"],
    creator: "@vibechat",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

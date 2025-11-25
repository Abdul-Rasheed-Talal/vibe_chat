import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@/app/verify/analytics";
import { Toaster } from "@/app/verify/sonner";

// Modern fonts that appeal to Gen-Z
const geistSans = GeistSans;

const geistMono = GeistMono;

export const metadata: Metadata = {
  title: {
    default: "Vibe Chat 💬 | Next-gen Messaging",
    template: "%s | Vibe Chat 💬"
  },
  description: "Level up your conversations with Vibe Chat. Real-time messaging, custom themes, and vibe-based interactions. Join the future of chat today! 🚀",
  keywords: ["chat app", "real-time messaging", "gen-z", "vibe", "emoji", "themes", "secure chat", "group chat", "modern messaging"],
  authors: [{ name: "Vibe Team", url: "https://vibe-chat.vercel.app" }],
  creator: "Vibe Team",
  publisher: "Vibe Chat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://vibe-chat.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vibe-chat.vercel.app",
    siteName: "Vibe Chat",
    title: "Vibe Chat 💬 | Next-gen Messaging",
    description: "Level up your conversations with Vibe Chat. Real-time messaging, custom themes, and vibe-based interactions.",
    images: [
      {
        url: "/og-banner.png", // You should create this
        width: 1200,
        height: 630,
        alt: "Vibe Chat - Modern messaging experience with custom themes and real-time features",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Chat 💬 | Next-gen Messaging",
    description: "Level up your conversations with Vibe Chat. Real-time messaging, custom themes, and vibe-based interactions. 🚀",
    images: ["/og-banner.png"],
    creator: "@vibechat",
    site: "@vibechat",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification tokens here
    // google: "your-google-verification",
    // yandex: "your-yandex-verification",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#06b6d4",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "social",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/api/hello"
          as="fetch"
          crossOrigin="anonymous"
        />

        {/* Dynamic OG image for social sharing */}
        <meta property="og:image:alt" content="Vibe Chat - Modern messaging experience with beautiful gradients and custom themes" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Additional meta tags for better SEO */}
        <meta name="application-name" content="Vibe Chat" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vibe Chat" />

        {/* MS Application config */}
        <meta name="msapplication-TileColor" content="#06b6d4" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`font-sans antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey="vibe-chat-theme"
        >
          {/* Background Animation Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(222.2 84% 4.9%)',
                color: 'white',
                border: '1px solid hsl(217.2 32.6% 17.5%)',
              },
            }}
          />

          {/* Analytics - Optional */}
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
        </ThemeProvider>

        {/* Performance Monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Simple performance monitoring
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log('Vibe Chat loaded in', loadTime, 'ms 🚀');
                  }, 0);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
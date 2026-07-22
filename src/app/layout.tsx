import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getPublicBrandingSettings } from "@/app/actions/settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getPublicBrandingSettings();
  return {
    title: "TekSkillUp — e-Learning Centre",
    description: "TekSkillUp learning management dashboard",
    // favicon.ico lives in public/ (not app/, Next's auto-detected special
    // file) specifically so there's always exactly one <link rel="icon">
    // tag — a custom upload plus the file-convention default rendered both
    // at once left it up to each browser's own tie-breaking to pick one.
    icons: { icon: branding.faviconLogo || "/favicon.ico" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        <script
          // Apply saved theme before paint to avoid a flash of the wrong theme.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tsu:theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body className="min-h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Link Circle | Ajah → Eleko",
    template: "%s · Link Circle",
  },
  description:
    "Link Circle is more than a community. It's a movement. Connect, network, grow, and belong along Ajah → Eleko.",
  icons: {
    icon: [{ url: "/brand/logo-circle.png", type: "image/png" }],
    apple: [{ url: "/brand/logo-circle.png", type: "image/png" }],
    shortcut: "/brand/logo-circle.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Syne:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}

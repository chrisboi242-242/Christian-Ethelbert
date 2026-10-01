import "./globals.css";

export const metadata = {
title: "Christian Ethelbert | Full-Stack Developer",

description:
  "Christian Ethelbert is a full-stack developer building scalable web applications, secure APIs, and practical digital solutions using React, Next.js, Python, and FastAPI.",

robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600&family=Caveat:wght@600&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}

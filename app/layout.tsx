import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp Clone",
  description: "A full-featured WhatsApp clone built with Next.js, MongoDB, and Cloudinary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1f2c34",
              color: "#e9edef",
              borderRadius: "8px",
            },
            success: {
              iconTheme: { primary: "#00a884", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}

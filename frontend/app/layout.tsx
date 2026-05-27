// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { BranchProvider } from "@/context/BranchContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Luminous — Salon Management",
  description: "Multi-branch salon management platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={inter.className}
        style={{ background: "#0A0B0F", color: "#F8FAFC" }}
      >
        <BranchProvider>{children}</BranchProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}

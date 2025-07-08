import type { Metadata } from "next"
import { Inter, Bebas_Neue } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const bebasNeue = Bebas_Neue({ 
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue"
})

export const metadata: Metadata = {
  title: "BitAgora POS | Professional Point of Sale System",
  description: "Modern point-of-sale system with cryptocurrency payments, dark UI, and comprehensive business management tools.",
  keywords: ["POS", "Point of Sale", "Bitcoin", "Cryptocurrency", "Business Management"],
  authors: [{ name: "BitAgora Team" }],
  openGraph: {
    title: "BitAgora POS | Professional Point of Sale System",
    description: "Modern point-of-sale system with cryptocurrency payments, dark UI, and comprehensive business management tools.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BitAgora POS | Professional Point of Sale System",
    description: "Modern point-of-sale system with cryptocurrency payments, dark UI, and comprehensive business management tools.",
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
    google: "your-google-site-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${bebasNeue.variable}`}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // BitAgora POS Development Environment
                if (typeof window !== 'undefined') {
                  console.log('🔧 BitAgora POS - Development Mode');
                  console.log('📊 API endpoints available at /api/*');
                  console.log('🎯 Dashboard: /dashboard | POS: /pos | Admin: /admin');
                  console.log('💾 Data persists in .bitagora-data/ directory');
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  )
} 
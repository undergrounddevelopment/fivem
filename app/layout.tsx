import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AuthProvider } from "@/components/auth-provider"
import { ModernLayout } from "@/components/modern-layout"
import { AppWrapper } from "@/components/app-wrapper"
import { SpinWinNotifications } from "@/components/spin-win-notifications"
import { ToastContainer } from "@/components/modern-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { ModernParticles } from "@/components/modern-particles"
import { HolidayBanner } from "@/components/holiday-banner"
import { SeasonalWrapper } from "@/components/seasonal-wrapper"
import { LanguageProvider } from "@/components/language-provider"

import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, SITE_LOGO, SEO_KEYWORDS } from "@/lib/constants"
import Script from "next/script"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist-mono",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-manrope",
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - FiveM Scripts, MLO, Vehicles, Decrypt CFX, Upvotes Free`,
    template: `%s | ${SITE_NAME} - FiveM Resources`,
  },
  description: `${SITE_DESCRIPTION} #FiveMRoles #FiveMPopulation #FiveMServer #FiveMCommunity #FiveMRanking #ServerBoost #FiveMAdvertise #FiveMTools #FiveMUpvotes #FiveMScripts #FiveMResources #FiveMCustomization #GTARP #FiveM #GTAV #GrandTheftAuto #GTAOnline #GamingCommunity`,
  keywords: `${SEO_KEYWORDS}, FiveM Roles, FiveM Population, FiveM Server, FiveM Community, FiveM Ranking, Server Boost, FiveM Advertise, FiveM Tools, FiveM Upvotes, FiveM Scripts, FiveM Resources, FiveM Customization, GTA RP, FiveM, GTA V, Grand Theft Auto, GTA Online, Gaming Community`,
  authors: [{ name: "FiveM Tools Team", url: SITE_URL }],
  creator: "FiveM Tools V7",
  publisher: "FiveM Tools",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": SITE_URL,
      "id-ID": `${SITE_URL}/id`,
      "es-ES": `${SITE_URL}/es`,
      "pt-BR": `${SITE_URL}/pt`,
      "de-DE": `${SITE_URL}/de`,
      "fr-FR": `${SITE_URL}/fr`,
      "ru-RU": `${SITE_URL}/ru`,
      "zh-CN": `${SITE_URL}/zh`,
      "ja-JP": `${SITE_URL}/ja`,
      "ko-KR": `${SITE_URL}/ko`,
      "tr-TR": `${SITE_URL}/tr`,
      "ar-SA": `${SITE_URL}/ar`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["id_ID"],
    url: SITE_URL,
    title: `${SITE_NAME} - #1 FiveM Resource Hub | Scripts, MLO, Decrypt, Upvotes #FiveMTools #GTARP`,
    description:
      "Download Free FiveM Scripts, MLO Maps, Vehicles, EUP Clothing. Decrypt CFX V7, FiveM Upvotes Bot, Leak Scripts. QBCore, ESX, QBox Framework Resources. #FiveMScripts #FiveMServer #FiveMCommunity #GTAV #GTAOnline",
    siteName: SITE_NAME,
    images: [
      {
        url: SITE_LOGO,
        width: 512,
        height: 512,
        alt: "FiveM Tools V7 - Premium FiveM Resource Hub",
        type: "image/png",
      },
      {
        url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/fivembanner.gif",
        width: 1200,
        height: 630,
        alt: "FiveM Tools V7 Banner - Scripts, MLO, Decrypt, Upvotes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - FiveM Scripts, MLO, Decrypt CFX, Upvotes #FiveMTools #GTARP`,
    description:
      "Free FiveM Resources: Scripts, MLO, Vehicles, EUP, Decrypt CFX V7, Upvotes Bot. QBCore, ESX, QBox. #FiveMCommunity #GTAOnline",
    images: [SITE_LOGO],
    creator: "@fivemtools",
    site: "@fivemtools",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: SITE_LOGO,
    shortcut: SITE_LOGO,
    apple: SITE_LOGO,
    other: {
      rel: "apple-touch-icon-precomposed",
      url: SITE_LOGO,
    },
  },
  verification: {
    google: "1C9OLiOYFZjjSl2iE84XV83Ga4pT7ScpQxcUnKETTj0",
  },
  category: "Gaming",
  classification: "FiveM Resources, GTA V Mods, Gaming Tools",
  generator: "Next.js",
  applicationName: SITE_NAME,
  referrer: "no-referrer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#0d1117",
    "msapplication-TileColor": "#0d1117",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${geistMono.variable} ${manrope.variable}`}>
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-N3GV4T4M');
              } catch(e) { console.error('GTM error:', e); }
            `,
          }}
        />

        <Script
          id="google-consent-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'regions': ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO', 'CH']
              });
              
              gtag('consent', 'default', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
              });
            `,
          }}
        />

        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-30YPXMETSE" strategy="afterInteractive" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-30YPXMETSE', {
                  page_path: window.location.pathname,
                  cookie_flags: 'SameSite=None;Secure',
                  anonymize_ip: true,
                  allow_google_signals: true,
                  send_page_view: true
                });
              } catch(e) { console.error('Analytics error:', e); }
            `,
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              alternateName: ["FiveM Tools", "FiveMTools", "FiveM Resources Hub"],
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              publisher: {
                "@type": "Organization",
                name: SITE_NAME,
                logo: {
                  "@type": "ImageObject",
                  url: SITE_LOGO,
                },
              },
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
              sameAs: ["https://discord.gg/fivemtools"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: SITE_NAME,
              applicationCategory: "GameApplication",
              operatingSystem: "Windows",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "2500",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: SITE_LOGO,
              description: SITE_DESCRIPTION,
              sameAs: ["https://discord.gg/fivemtools"],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Support",
                availableLanguage: ["English", "Indonesian", "Spanish", "Portuguese"],
              },
            }),
          }}
        />
        <meta name="google-site-verification" content="1C9OLiOYFZjjSl2iE84XV83Ga4pT7ScpQxcUnKETTj0" />
        <link rel="dns-prefetch" href="https://cdn.discordapp.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://r2.fivemanage.com" />
        <link rel="dns-prefetch" href="https://assets.codepen.io" />
        <link rel="preconnect" href="https://cdn.discordapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://r2.fivemanage.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const cookies = document.cookie.split(';');
                  for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'csrf-token') {
                      window.__CSRF_TOKEN__ = decodeURIComponent(value);
                      break;
                    }
                  }
                } catch(e) { console.error('CSRF token error:', e); }
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function removeV0Branding() {
                    const selectors = [
                      '[data-v0]', '[data-v0-branding]', 'a[href*="v0.dev"]', 
                      'a[href*="v0.app"]', '[class*="v0-"]'
                    ];
                    
                    selectors.forEach(sel => {
                      document.querySelectorAll(sel).forEach(el => {
                        el.style.display = 'none';
                        el.remove();
                      });
                    });
                    
                    document.querySelectorAll('body > div').forEach(el => {
                      const style = getComputedStyle(el);
                      const isFixed = style.position === 'fixed' && parseInt(style.bottom) < 100;
                      const hasV0 = el.querySelector('a[href*="v0"]') || 
                                    (el.textContent && el.textContent.toLowerCase().includes('v0'));
                      
                      if (isFixed && hasV0 && el.offsetHeight < 100) {
                        el.style.display = 'none';
                        el.remove();
                      }
                    });
                  }
                  
                  removeV0Branding();
                  window.addEventListener('load', removeV0Branding);
                  
                  const observer = new MutationObserver(() => {
                    clearTimeout(window.__v0Timer);
                    window.__v0Timer = setTimeout(removeV0Branding, 100);
                  });
                  
                  if (document.body) {
                    observer.observe(document.body, { childList: true, subtree: true });
                  }
                } catch(e) { console.error('V0 removal error:', e); }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased scrollbar-thin">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N3GV4T4M"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>

        <AuthProvider>
          <LanguageProvider>
            <ErrorBoundary>
              <SeasonalWrapper>
                <HolidayBanner />
                <ModernLayout>
                  <AppWrapper>
                    {children}
                    <SpinWinNotifications />
                    <ToastContainer />
                  </AppWrapper>
                </ModernLayout>
              </SeasonalWrapper>
            </ErrorBoundary>
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
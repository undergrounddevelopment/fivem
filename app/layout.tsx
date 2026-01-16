import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Manrope } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import { ModernLayout } from "@/components/modern-layout"
import { AppWrapper } from "@/components/app-wrapper"
import { FloatingReviewNotifications } from "@/components/floating-review-notifications"
import { FloatingReviews } from "@/components/floating-reviews"
// import { SpinWinNotifications } from "@/components/spin-win-notifications" // Event sudah berakhir
import { ToastContainer } from "@/components/modern-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { HolidayBanner } from "@/components/holiday-banner"
import { SeasonalWrapper } from "@/components/seasonal-wrapper"
import { LanguageProvider } from "@/components/language-provider"
import { AnalyticsWrapper } from "@/components/analytics-wrapper"
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, SITE_LOGO, SEO_KEYWORDS } from "@/lib/constants"
import { ClientSessionProvider } from "@/components/client-session-provider"
import { LinkvertiseScript } from "@/components/linkvertise-script"
import { OptimizedLayout } from "@/components/optimized-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { AchievementContainer } from "@/components/achievement-toast"
import "@/lib/performance-init" // Initialize performance optimizations
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-geist-mono",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-manrope",
  weight: ["400", "700"],
})

export async function generateMetadata(): Promise<Metadata> {
  const { getSiteSettings } = await import("@/lib/settings")
  const settings = await getSiteSettings()

  const siteName = settings.site_info.name || SITE_NAME
  const siteDescription = settings.site_info.description || SITE_DESCRIPTION
  const siteLogo = settings.site_info.logo || SITE_LOGO

  return {
    title: {
      default: `${siteName} - #1 FiveM Automatic Leaks, Scripts, MLO, Decrypt CFX, Free Resources`,
      template: `%s | ${siteName} - #1 FiveM Leaks & Resources`,
    },
    description: `${siteDescription} #1 Source for FiveM Automatic Leaks, Free Scripts, MLO Maps, Exclusive Vehicles, CFX Decrypter. Auto-updated leaks, QBCore, ESX, QBox. Global access, daily updates. #FiveMLeaks #FiveMFree #GTARP #FiveMTools`,
    keywords: `${SEO_KEYWORDS}, FiveM Leaks, FiveM Automatic Leak, Free FiveM Scripts, FiveM MLO Leak, FiveM Decrypt, CFX Decrypter, FiveM Cheats, FiveM Mods, FiveM Resources, QBCore Leaks, ESX Scripts Free, FiveM Server Dump, GTA V RP Leaks, FiveM Global`,
    authors: [{ name: "FiveM Tools Global", url: SITE_URL }],
    creator: `${siteName} Global`,
    publisher: "FiveM Tools Network",
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: SITE_URL,
      languages: {
        "en-US": SITE_URL,
        "x-default": SITE_URL,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["en_GB", "es_ES", "fr_FR", "de_DE", "pt_BR", "ru_RU", "id_ID"],
      url: SITE_URL,
      title: `${siteName} - #1 FiveM Automatic Leaks & Scripts | Global Hub`,
      description:
        "The World's #1 FiveM Leaks Community. Download premium Scripts, MLOs, Vehicles, and EUP for Free. Automatic updates, instant access. Unlock QBCore & ESX resources now.",
      siteName: siteName,
      images: [
        {
          url: siteLogo,
          width: 512,
          height: 512,
          alt: `${siteName} - #1 Global Leaks Hub`,
          type: "image/png",
        },
        {
          url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/fivembanner.gif",
          width: 1200,
          height: 630,
          alt: `${siteName} Banner - Automatic Leaks & Scripts`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - #1 FiveM Automatic Leaks & Free Resources`,
      description:
        "Access the largest collection of FiveM Leaks, Scripts, and MLOs. Global daily updates. #FiveMLeaks #FiveMScripts",
      images: ["https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/fivembanner.gif"],
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
      icon: siteLogo,
      shortcut: siteLogo,
      apple: siteLogo,
      other: {
        rel: "apple-touch-icon-precomposed",
        url: siteLogo,
      },
    },
    verification: {
      google: "1C9OLiOYFZjjSl2iE84XV83Ga4pT7ScpQxcUnKETTj0",
    },
    category: "Gaming",
    classification: "FiveM Leaks, Gaming Resources, GTA V Mods",
    generator: "Next.js",
    applicationName: siteName,
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
      "dmca-site-verification": "V08rdkpZaW9DUDBKNFNuNnV5N1BsdkpVclNBKzlheVhQQ09sbVVtcldhOD01",
    },
  }
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
    <html lang="en" suppressHydrationWarning className={`dark ${geist.variable} ${geistMono.variable} ${manrope.variable}`}>
      <head suppressHydrationWarning>
        <script
          id="gtm-script"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: "try{(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-N3GV4T4M');}catch(e){console.error('GTM error:',e);}"
          }}
        />

        <script
          id="google-consent-mode"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: "(function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','regions':['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','GB','IS','LI','NO','CH']});gtag('consent','default',{'ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted','analytics_storage':'granted'});})();"
          }}
        />

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-30YPXMETSE"
          suppressHydrationWarning
        />
        <script
          id="google-analytics"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: "try{window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-30YPXMETSE',{page_path:window.location.pathname,cookie_flags:'SameSite=None;Secure',anonymize_ip:true,allow_google_signals:true,send_page_view:true});}catch(e){console.error('Analytics error:',e);}"
          }}
        />

        <script
          type="application/ld+json"
          suppressHydrationWarning
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
          suppressHydrationWarning
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
          suppressHydrationWarning
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

        <link rel="alternate" hrefLang="en" href="https://www.fivemtools.net/en" />
        <link rel="alternate" hrefLang="en-US" href="https://www.fivemtools.net/en" />
        <link rel="alternate" hrefLang="en-GB" href="https://www.fivemtools.net/en" />
        <link rel="alternate" hrefLang="id" href="https://www.fivemtools.net/id" />
        <link rel="alternate" hrefLang="es" href="https://www.fivemtools.net/es" />
        <link rel="alternate" hrefLang="pt" href="https://www.fivemtools.net/pt" />
        <link rel="alternate" hrefLang="de" href="https://www.fivemtools.net/de" />
        <link rel="alternate" hrefLang="fr" href="https://www.fivemtools.net/fr" />
        <link rel="alternate" hrefLang="ru" href="https://www.fivemtools.net/ru" />
        <link rel="alternate" hrefLang="zh" href="https://www.fivemtools.net/zh" />
        <link rel="alternate" hrefLang="ja" href="https://www.fivemtools.net/ja" />
        <link rel="alternate" hrefLang="ko" href="https://www.fivemtools.net/ko" />
        <link rel="alternate" hrefLang="tr" href="https://www.fivemtools.net/tr" />
        <link rel="alternate" hrefLang="ar" href="https://www.fivemtools.net/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://www.fivemtools.net" />

        <link rel="dns-prefetch" href="https://cdn.discordapp.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://r2.fivemanage.com" />
        <link rel="dns-prefetch" href="https://assets.codepen.io" />
        <link rel="preconnect" href="https://cdn.discordapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://r2.fivemanage.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Fix cookie domain issues
                  const fixCookies = () => {
                    document.cookie.split(';').forEach(cookie => {
                      const [name] = cookie.trim().split('=');
                      if (name === '__cf_bm' || name.startsWith('_vercel')) {
                        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
                      }
                    });
                  };
                  
                  const cookies = document.cookie.split(';');
                  for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'csrf-token') {
                      window.__CSRF_TOKEN__ = decodeURIComponent(value);
                      break;
                    }
                  }
                  
                  fixCookies();
                } catch(e) { console.error('Cookie setup error:', e); }
              })();
            `,
          }}
        />
        <script
          suppressHydrationWarning
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
      <body className="font-sans antialiased scrollbar-thin" suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N3GV4T4M"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>

        <LinkvertiseScript />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClientSessionProvider>
            <AuthProvider>
              <LanguageProvider>
                <ErrorBoundary>
                  <SeasonalWrapper>
                    <HolidayBanner />
                    <ModernLayout>
                      <AppWrapper>
                        <OptimizedLayout pageName="root">
                          {children}
                        </OptimizedLayout>
                        <FloatingReviewNotifications />
                        <FloatingReviews />
                        {/* SpinWinNotifications disabled - event ended */}
                        <ToastContainer />
                        <AchievementContainer />
                      </AppWrapper>
                    </ModernLayout>
                  </SeasonalWrapper>
                </ErrorBoundary>
              </LanguageProvider>
            </AuthProvider>
          </ClientSessionProvider>
        </ThemeProvider>
        <AnalyticsWrapper />
      </body>
    </html>
  )
}

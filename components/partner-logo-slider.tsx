"use client"

import { useEffect, useMemo, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

type PartnerLogo = {
  name: string
  image: string
  href?: string
}

export function PartnerLogoSlider({ className }: { className?: string }) {
  const logos = useMemo<PartnerLogo[]>(
    () => [
      {
        name: "KZQLTY",
        image: "https://img.kzqlty.com/images/2025/06/11/b60ad327d017ab7e590b54ae16a76e03.png",
        href: "https://img.kzqlty.com/",
      },
      {
        name: "17Movement",
        image: "https://17movement.net/_next/static/media/Logo.0b8be03a.svg",
        href: "https://17movement.net/",
      },
      {
        name: "JG Scripts",
        image: "https://jgscripts.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fjg-scripts-logo.4d8a9a1c.png&w=3840&q=75",
        href: "https://jgscripts.com/",
      },
      {
        name: "LB Scripts",
        image: "https://lbscripts.com/assets/whitelogo.webp",
        href: "https://lbscripts.com/",
      },
      {
        name: "Wasabi Scripts",
        image: "https://www.wasabiscripts.com/w-logo.png",
        href: "https://www.wasabiscripts.com/",
      },
      {
        name: "Fiverr",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Fiverr_Logo_09.2020.svg/2560px-Fiverr_Logo_09.2020.svg.png",
        href: "https://www.fiverr.com/",
      },
      {
        name: "SHG",
        image: "https://i.shgcdn.com/35d8f74a-2dc5-4c9d-982f-068a2d050a10/-/format/auto/-/preview/3000x3000/-/quality/lighter/",
      },
      {
        name: "Rainmad",
        image: "https://rainmad.com/images/logo.png",
        href: "https://rainmad.com/",
      },
      {
        name: "FiveM Store",
        image: "https://s3-eu-west-1.amazonaws.com/tpd/logos/61c0e7b1d89fdd8ab773975e/0x0.png",
        href: "https://fivem-store.com/",
      },
      {
        name: "FiveMTurk",
        image: "https://www.fivemturk.net/data/assets/xgtSv9/logo.png",
        href: "https://www.fivemturk.net/",
      },
      {
        name: "ImageDelivery",
        image: "https://imagedelivery.net/HL_Fwm__tlvUGLZF2p74xw/d6871bb1-ca09-4abb-7870-15f51225cb00/public",
      },
    ],
    [],
  )

  const [repeatCount, setRepeatCount] = useState(2)

  useEffect(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1200
    setRepeatCount(width >= 1280 ? 3 : width >= 768 ? 2 : 1)
  }, [])

  const slides = useMemo(() => {
    const repeated: PartnerLogo[] = []
    for (let i = 0; i < repeatCount; i++) {
      repeated.push(...logos)
    }
    return repeated
  }, [logos, repeatCount])

  const [api, setApi] = useState<CarouselApi | null>(null)

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [api])

  return (
    <div className={cn("rounded-2xl border border-border glass p-4 md:p-6", className)}>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">Trusted by</div>
          <div className="text-lg font-semibold text-foreground truncate">Partners & Brands</div>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">Auto slider</div>
      </div>

      <Carousel
        setApi={(nextApi) => setApi(nextApi)}
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {slides.map((logo, idx) => {
            const Tag = logo.href ? "a" : "div"
            const tagProps = logo.href
              ? ({ href: logo.href, target: "_blank", rel: "noopener noreferrer" } as const)
              : ({} as const)

            return (
              <CarouselItem
                key={`${logo.name}-${idx}`}
                className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Tag
                  {...tagProps}
                  className="group flex h-16 items-center justify-center rounded-xl border border-border/50 bg-secondary/20 px-4 transition-colors hover:bg-secondary/30"
                >
                  <img
                    src={logo.image}
                    alt={logo.name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="max-h-10 w-auto max-w-full object-contain opacity-90 transition-opacity group-hover:opacity-100"
                    onError={(e) => {
                      const el = e.currentTarget
                      el.style.opacity = "0.35"
                    }}
                  />
                </Tag>
              </CarouselItem>
            )}
          )}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

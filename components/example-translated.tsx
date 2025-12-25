"use client"

import { useTranslation } from "@/hooks/use-translation"
import { Button } from "@/components/ui/button"

export function ExampleTranslatedComponent() {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h1>{t("nav.home")}</h1>
      <p>{t("common.search")}</p>
      <Button>{t("common.download")}</Button>
    </div>
  )
}

// Usage in any component:
// import { useTranslation } from "@/hooks/use-translation"
// const { t } = useTranslation()
// <h1>{t("nav.home")}</h1>

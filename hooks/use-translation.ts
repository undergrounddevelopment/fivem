"use client"

import { useLanguage } from "@/components/language-provider"
import { t as translate } from "@/lib/i18n"

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key: string) => translate(key, language)

  return { t, language }
}

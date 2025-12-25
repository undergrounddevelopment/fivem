"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type Language, getLanguageName, getLanguageFlag, getAllLanguages } from "@/lib/i18n"
import { useLanguage } from "@/components/language-provider"

const languages = getAllLanguages()

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <span className="text-lg">{getLanguageFlag(language)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border max-h-80 overflow-y-auto scrollbar-thin">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={language === lang ? "bg-primary/10" : ""}
          >
            <span className="mr-2">{getLanguageFlag(lang)}</span>
            {getLanguageName(lang)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * V0 Branding Removal Script
 * Ultra-aggressive removal dengan 6 strategi berbeda
 */

;(() => {
  function removeV0BrandingUltra() {
    // Strategy 1: Attribute-based removal
    const attributeSelectors = [
      "[data-v0]",
      "[data-v0-*]",
      "[data-v0-branding]",
      '[data-testid*="v0"]',
      '[class*="v0-"]',
      '[class*="_v0"]',
      '[class*="v0_"]',
      '[id*="v0-"]',
      '[id*="_v0"]',
      '[id*="v0_"]',
      'a[href*="v0.dev"]',
      'a[href*="v0.app"]',
      'a[href*="v0.ai"]',
      'div[aria-label*="v0"]',
      'button[aria-label*="v0"]',
      "[data-branding]",
      "[data-badge]",
      '[class*="branding"]',
    ]

    attributeSelectors.forEach((selector) => {
      try {
        document.querySelectorAll(selector).forEach((el) => {
          el.style.cssText =
            "display:none!important;visibility:hidden!important;opacity:0!important;position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;pointer-events:none!important;"
          setTimeout(() => el.remove(), 0)
        })
      } catch (e) {
        console.warn("[v0-removal] Error with selector:", selector)
      }
    })

    // Strategy 2: Text content matching
    const textPatterns = ["Built with v0", "Built with", "Powered by v0", "v0.dev", "v0.app"]
    document.querySelectorAll("*").forEach((el) => {
      if (el.children.length === 0 && el.textContent) {
        const text = el.textContent.trim()
        if (textPatterns.some((pattern) => text.toLowerCase().includes(pattern.toLowerCase()))) {
          let parent = el
          let depth = 0
          while (parent && parent !== document.body && depth < 5) {
            if (parent.tagName === "DIV" || parent.tagName === "A" || parent.tagName === "BUTTON") {
              parent.style.cssText = "display:none!important;visibility:hidden!important;"
              setTimeout(() => parent.remove(), 0)
              break
            }
            parent = parent.parentElement
            depth++
          }
        }
      }
    })

    // Strategy 3: Bottom-fixed elements
    document.querySelectorAll("body > div, body > aside, body > section").forEach((el) => {
      const style = window.getComputedStyle(el)
      const isBottomFixed =
        (style.position === "fixed" || style.position === "absolute") &&
        (style.bottom === "0px" || Number.parseInt(style.bottom) < 100)

      if (isBottomFixed) {
        const hasLink = el.querySelector('a[href*="v0"]')
        const hasBrandingText =
          el.textContent &&
          (el.textContent.toLowerCase().includes("built") ||
            el.textContent.toLowerCase().includes("v0") ||
            el.textContent.toLowerCase().includes("powered"))
        const hasSmallSize = el.offsetHeight < 100 && el.offsetWidth < 200

        if ((hasLink || hasBrandingText) && hasSmallSize) {
          el.style.cssText = "display:none!important;visibility:hidden!important;"
          setTimeout(() => el.remove(), 0)
        }
      }
    })

    // Strategy 4: iframe removal
    document.querySelectorAll("iframe").forEach((iframe) => {
      const src = iframe.src || iframe.getAttribute("src") || ""
      if (src.includes("v0.dev") || src.includes("v0.app") || src.includes("v0.ai")) {
        iframe.style.cssText = "display:none!important;"
        setTimeout(() => iframe.remove(), 0)
      }
    })

    // Strategy 5: High z-index elements at bottom
    document.querySelectorAll('[style*="z-index"]').forEach((el) => {
      const style = window.getComputedStyle(el)
      const zIndex = Number.parseInt(style.zIndex)
      const isBottom = style.position === "fixed" && (style.bottom === "0px" || Number.parseInt(style.bottom) < 50)

      if (zIndex > 9000 && isBottom) {
        const hasV0Link = el.querySelector('a[href*="v0"]')
        const hasV0Text = el.textContent && el.textContent.toLowerCase().includes("v0")

        if (hasV0Link || hasV0Text) {
          el.style.cssText = "display:none!important;visibility:hidden!important;"
          setTimeout(() => el.remove(), 0)
        }
      }
    })

    // Strategy 6: Small bottom-right positioned elements
    document.querySelectorAll("body > *").forEach((el) => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      const isBottomRight = rect.bottom > window.innerHeight - 100 && rect.right > window.innerWidth - 200
      const isSmall = rect.width < 200 && rect.height < 100
      const isFixed = style.position === "fixed" || style.position === "absolute"

      if (isBottomRight && isSmall && isFixed) {
        const text = el.textContent?.toLowerCase() || ""
        if (text.includes("built") || text.includes("v0") || text.includes("powered") || el.querySelector("a")) {
          el.style.cssText = "display:none!important;visibility:hidden!important;"
          setTimeout(() => el.remove(), 0)
        }
      }
    })

    console.log("[v0-removal] Cleanup completed")
  }

  // Initial run
  removeV0BrandingUltra()

  // Run on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeV0BrandingUltra)
  } else {
    setTimeout(removeV0BrandingUltra, 0)
  }

  // Run on page load with multiple delays
  window.addEventListener("load", () => {
    removeV0BrandingUltra()
    setTimeout(removeV0BrandingUltra, 100)
    setTimeout(removeV0BrandingUltra, 300)
    setTimeout(removeV0BrandingUltra, 500)
    setTimeout(removeV0BrandingUltra, 1000)
    setTimeout(removeV0BrandingUltra, 2000)
  })

  // MutationObserver for dynamic content
  const observer = new MutationObserver((mutations) => {
    let shouldRun = false
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const el = node
            const tag = el.tagName?.toLowerCase()
            if (["div", "a", "button", "iframe", "aside", "section"].includes(tag)) {
              shouldRun = true
            }
          }
        })
      } else if (mutation.type === "attributes") {
        shouldRun = true
      }
    })
    if (shouldRun) {
      setTimeout(removeV0BrandingUltra, 0)
    }
  })

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "id", "data-v0", "href"],
    })
  }

  // Periodic cleanup every second
  setInterval(removeV0BrandingUltra, 1000)

  console.log("[v0-removal] Script initialized with MutationObserver and periodic cleanup")
})()

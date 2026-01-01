const https = require("https")

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://fivemtools.net"
const ENDPOINTS = ["/", "/api/health", "/api/user/profile", "/api/spin/check"]

const measure = (url) => {
  return new Promise((resolve) => {
    const start = Date.now()
    const req = https.request(url, (res) => {
      res.on("data", () => {})
      res.on("end", () => {
        resolve({
          url,
          time: Date.now() - start,
          status: res.statusCode,
        })
      })
    })
    req.on("error", () => resolve({ url, time: -1, status: 0 }))
    req.setTimeout(5000, () => {
      req.destroy()
      resolve({ url, time: -1, status: 0 })
    })
    req.end()
  })
}

async function monitor() {
  console.log(`\n⚡ Performance Monitor: ${DOMAIN}\n`)

  const results = await Promise.all(ENDPOINTS.map((path) => measure(`${DOMAIN}${path}`)))

  console.log("Endpoint".padEnd(30), "Time".padEnd(10), "Status")
  console.log("=".repeat(50))

  let totalTime = 0
  let successCount = 0

  results.forEach((r) => {
    const status = r.status === 200 ? "✅" : r.status === 0 ? "❌" : "⚠️"
    const time = r.time === -1 ? "TIMEOUT" : `${r.time}ms`
    console.log(r.url.padEnd(30), time.padEnd(10), `${status} ${r.status}`)

    if (r.time > 0) {
      totalTime += r.time
      successCount++
    }
  })

  console.log("=".repeat(50))
  if (successCount > 0) {
    console.log(`\n📊 Average: ${Math.round(totalTime / successCount)}ms`)
  }
  console.log(`✅ Success: ${successCount}/${results.length}\n`)
}

monitor()

import fs from 'fs'
import path from 'path'

export function logErrorToHTML(error: any, context: string) {
  if (typeof window !== 'undefined') return // Only run on server

  try {
    const logDir = path.join(process.cwd(), 'logs')
    const logFile = path.join(logDir, 'errors.html')

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const timestamp = new Date().toISOString()
    const errorLog = `
    <div style="border: 2px solid red; padding: 15px; margin: 10px 0; background: #fff5f5; border-radius: 8px;">
      <h3 style="color: red; margin: 0 0 10px 0;">❌ Error - ${timestamp}</h3>
      <p><strong>Context:</strong> ${context}</p>
      <p><strong>Message:</strong> ${error?.message || String(error)}</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${error?.stack || 'No stack trace'}</pre>
    </div>
    `

    let htmlContent = ''
    if (fs.existsSync(logFile)) {
      htmlContent = fs.readFileSync(logFile, 'utf-8')
      htmlContent = htmlContent.replace('</body>', errorLog + '</body>')
    } else {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error Logs</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>🔴 Error Logs</h1>
  ${errorLog}
</body>
</html>
      `
    }

    fs.writeFileSync(logFile, htmlContent)
  } catch (e) {
    console.error('Failed to log error:', e)
  }
}

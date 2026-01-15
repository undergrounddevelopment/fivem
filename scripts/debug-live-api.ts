
import { createClient } from "@supabase/supabase-js"

const SITE_URL = "https://www.fivemtools.net";
const THREAD_ID = "6b497541-cca3-45e0-b070-c8f80bb9a4f3";
const SCRIPT_ID = "some-script-id"; // We will try to find one or just check the listing

async function checkUrl(url: string) {
    console.log(`Checking ${url}...`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (!res.ok) {
            const text = await res.text();
            console.log(`Body snippet: ${text.substring(0, 500)}`);
        } else {
            // If JSON, try parsing
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const json = await res.json();
                console.log("JSON Response OK");
            } else {
                console.log("HTML/Text Response OK");
            }
        }
    } catch (e: any) {
        console.error(`Fetch failed: ${e.message}`);
    }
    console.log("---");
}

async function main() {
    console.log("=== DIAGNOSTICS ===");
    
    // Check Forum Thread API
    await checkUrl(`${SITE_URL}/api/forum/threads/${THREAD_ID}`);
    
    // Check Thread Page (Client perspective)
    await checkUrl(`${SITE_URL}/forum/thread/${THREAD_ID}`);
    
    // Check Assets API (Scripts)
    await checkUrl(`${SITE_URL}/api/assets?category=scripts`);
    
}

main();

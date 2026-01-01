import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = [
  // spin_history -> spin_wheel_history
  { from: /from\(['"]spin_history['"]\)/g, to: 'from("spin_wheel_history")' },
  { from: /coins_won/g, to: 'prize_value' },
  
  // public_notifications -> notifications
  { from: /from\(['"]public_notifications['"]\)/g, to: 'from("notifications")' },
  
  // asset_reviews -> testimonials
  { from: /from\(['"]asset_reviews['"]\)/g, to: 'from("testimonials")' },
  
  // Remove spin_wheel_eligible_users, spin_wheel_force_wins, spin_wheel_settings
  // These will be handled manually
  
  // daily_claims -> use spin_wheel_tickets
  { from: /from\(['"]daily_claims['"]\)/g, to: 'from("spin_wheel_tickets")' },
  
  // site_settings -> remove (use hardcode)
  // forum_ranks -> remove (use hardcode)
  // likes -> remove (use column in tables)
];

const filesToFix = [
  'app/api/admin/notifications/route.ts',
  'app/api/upload/asset/route.ts',
  'app/api/assets/[id]/reviews/route.ts',
  'app/api/spin-wheel/claim-daily/route.ts',
  'app/api/spin-wheel/daily-status/route.ts',
  'app/api/spin-wheel/eligibility/route.ts',
  'app/api/notifications/public/route.ts',
];

console.log('🔧 Fixing table names...\n');

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skip: ${file} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`⏭️  Skip: ${file} (no changes)`);
  }
});

console.log('\n✅ Done!');
